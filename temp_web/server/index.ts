import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import MemoryStore from "memorystore";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { connectDatabase } from "./database";
import { log } from "./vite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session configuration with MongoDB fallback to memory store
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
let sessionStore;

if (mongoUrl) {
  try {
    sessionStore = MongoStore.create({
      mongoUrl,
      ttl: 24 * 60 * 60, // 1 day
    });
    log("Using MongoDB session store");
  } catch (error) {
    log("MongoDB session store failed, falling back to memory store");
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({
      checkPeriod: 86400000, // 24 hours
    });
  }
} else {
  log("No MongoDB URI provided, using memory session store");
  const MemStore = MemoryStore(session);
  sessionStore = new MemStore({
    checkPeriod: 86400000, // 24 hours
  });
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "waterborne-disease-spike-detector-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Serve static files from public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const urlPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (urlPath.startsWith("/api")) {
      let logLine = `${req.method} ${urlPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB (optional - will use in-memory if not available)
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    log("⚠️  Running in DEMO mode with in-memory storage");
    log("💡 Set MONGODB_URI environment variable to enable persistence");
  }

  // Initialize storage layer
  const { initializeStorage } = await import("./storage/index.js");
  initializeStorage(dbConnected);
  log(`Storage initialized: ${dbConnected ? 'MongoDB' : 'In-Memory'}`);

  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${message}`);
    res.status(status).json({ message });
  });

  // Serve HTML files for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    }
  });

  const port = parseInt(process.env.PORT || "7000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0"
      // removed reusePort for Windows compatibility
    },
    () => {
      log(`🚀 Server running on port ${port}`);
      if (dbConnected) {
        log(`📊 MongoDB connected - Data will persist`);
      } else {
        log(`💾 Using in-memory storage - Data will not persist between restarts`);
      }
      log(`🌐 Visit http://localhost:${port}`);
    }
  );
})();
