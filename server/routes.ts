import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import XLSX from "xlsx";
import Papa from "papaparse";
import fs from "fs";
import { getStorage } from "./storage/index.js";
import { requireAuth, requireRole } from "./middleware/auth";
import { createAlertIfSpike } from "./utils/spikeDetector";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and Excel files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = getStorage();

  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password, role, hospitalName, location } = req.body;

      // Validation
      if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!["hospital", "municipal"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Check if user already exists
      const existingByUsername = await storage.findUserByUsername(username);
      const existingByEmail = await storage.findUserByEmail(email);

      if (existingByUsername || existingByEmail) {
        return res.status(400).json({
          message: "User with this username or email already exists",
        });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password,
        role,
        hospitalName: role === "hospital" ? hospitalName : undefined,
        location,
      });

      // Create session
      req.session.userId = user._id!;
      req.session.role = user.role;

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          hospitalName: user.hospitalName,
          location: user.location,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.findUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await storage.comparePassword(user, password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user._id!;
      req.session.role = user.role;

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          hospitalName: user.hospitalName,
          location: user.location,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.findUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Medical Records Routes
  app.post(
    "/api/records/upload",
    requireAuth,
    requireRole("hospital"),
    upload.single("file"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const { location, diseaseType, dateReported, latitude, longitude } = req.body;

        if (!location || !diseaseType || !dateReported) {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            message: "Location, disease type, and date are required",
          });
        }

        // Parse the file
        let parsedData: any[] = [];
        const fileExtension = req.file.originalname.split(".").pop()?.toLowerCase();

        if (fileExtension === "csv") {
          const fileContent = fs.readFileSync(req.file.path, "utf8");
          const result = Papa.parse(fileContent, { header: true });
          parsedData = result.data;
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
          const workbook = XLSX.readFile(req.file.path);
          const sheetName = workbook.SheetNames[0];
          parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Count cases for selected diseaseType only
      // ...existing code...

// When processing the uploaded file and calculating casesCount:
const casesCount = parsedData
  .filter(row => row.Disease === diseaseType)
  .reduce((sum, row) => sum + Number(row.Cases), 0);

// ...existing code...

        // Create medical record
        const record = await storage.createRecord({
          uploadedBy: req.session.userId!,
          fileName: req.file.originalname,
          location,
          diseaseType,
          dateReported: new Date(dateReported),
          casesCount,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        });

        // Check for spike and create alert if necessary
        const alert = await createAlertIfSpike(
          location,
          diseaseType,
          casesCount,
          record._id!,
          latitude ? parseFloat(latitude) : undefined,
          longitude ? parseFloat(longitude) : undefined
        );

        res.status(201).json({
          message: "File uploaded successfully",
          record: {
            id: record._id,
            fileName: record.fileName,
            location: record.location,
            diseaseType: record.diseaseType,
            casesCount: record.casesCount,
            uploadedAt: record.uploadedAt,
          },
          alert: alert
            ? {
                id: alert._id,
                severity: alert.severity,
                message: alert.message,
              }
            : null,
        });
      } catch (error: any) {
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.get("/api/records", requireAuth, async (req, res) => {
    try {
      const { location, diseaseType } = req.query;
      
      const query: any = {};
      
      if (location) query.location = location;
      if (diseaseType) query.diseaseType = diseaseType;

      // If hospital user, only show their own records
      if (req.session.role === "hospital") {
        query.uploadedBy = req.session.userId;
      }

      const records = await storage.findRecords(query);

      res.json({ records });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alert Routes
  app.get("/api/alerts", requireAuth, async (req, res) => {
    try {
      const { status, severity, location } = req.query;
      
      const query: any = {};
      
      if (status) query.status = status;
      if (severity) query.severity = severity;
      if (location) query.location = location;

      const alerts = await storage.findAlerts(query);

      res.json({ alerts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(
    "/api/alerts/:id/acknowledge",
    requireAuth,
    requireRole("municipal"),
    async (req, res) => {
      try {
        const alert = await storage.updateAlert(req.params.id, {
          status: "acknowledged",
        });

        if (!alert) {
          return res.status(404).json({ message: "Alert not found" });
        }

        res.json({ message: "Alert acknowledged", alert });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.put(
    "/api/alerts/:id/resolve",
    requireAuth,
    requireRole("municipal"),
    async (req, res) => {
      try {
        const alert = await storage.updateAlert(req.params.id, {
          status: "resolved",
        });

        if (!alert) {
          return res.status(404).json({ message: "Alert not found" });
        }

        res.json({ message: "Alert resolved", alert });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // Analytics Routes
  app.get("/api/analytics/trends", requireAuth, async (req, res) => {
    try {
      const { location, diseaseType, days = 30 } = req.query;

      const filters: any = {};
      if (location) filters.location = location;
      if (diseaseType) filters.diseaseType = diseaseType;

      const trends = await storage.getTrendsData(parseInt(days as string), filters);

      res.json({ trends });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/heatmap", requireAuth, async (req, res) => {
    try {
      const { days = 7 } = req.query;

      const heatmapData = await storage.getHeatmapData(parseInt(days as string));

      res.json({ heatmapData });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/stats", requireAuth, async (req, res) => {
    try {
      const totalRecords = await storage.getRecordsCount();
      const activeAlerts = await storage.getActiveAlertsCount();

      const recentAlerts = await storage.findAlerts({ status: "active" });

      res.json({
        stats: {
          totalRecords,
          activeAlerts,
          recentAlerts: recentAlerts.slice(0, 5),
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
