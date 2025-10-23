import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, File, X, Droplet, ArrowLeft, CheckCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    location: "",
    diseaseType: "",
    dateReported: "",
    latitude: "",
    longitude: "",
  });

  const [analytics, setAnalytics] = useState<{ demoData: any[]; trendData: any[]; alerts: any[] } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("location", formData.location);
    data.append("diseaseType", formData.diseaseType);
    data.append("dateReported", formData.dateReported);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);

    try {
      const response = await fetch("/api/records/upload", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        // ML spike detection logic
        let alerts: { severity: string; location: string; disease: string; cases: number; probability: number }[] = [];
        if (result.is_spike_detected && result.predictions) {
          Object.entries(result.predictions).forEach(([disease, isSpike]) => {
            if (isSpike) {
              alerts.push({
                severity: "high", // You can adjust severity logic as needed
                location: formData.location || "Unknown",
                disease,
                cases: result.max_outbreak_probability ? Math.round(result.max_outbreak_probability * 100) : 0,
                probability: result.max_outbreak_probability || 1,
              });
            }
          });
        }
        toast({
          title: "Upload Successful!",
          description: `File processed successfully. ${alerts.length > 0 ? alerts.map(a => `Spike detected for ${a.disease}`).join(", ") : ''}`,
        });
        setAnalytics({
          demoData: result.demoData || [
            { month: "Jan", cases: 45 },
            { month: "Feb", cases: 52 },
            { month: "Mar", cases: 78 },
            { month: "Apr", cases: 145 },
            { month: "May", cases: 89 },
            { month: "Jun", cases: 67 },
          ],
          trendData: result.trendData || [
            { day: "Mon", probability: 0.3 },
            { day: "Tue", probability: 0.45 },
            { day: "Wed", probability: 0.62 },
            { day: "Thu", probability: 0.78 },
            { day: "Fri", probability: 0.85 },
            { day: "Sat", probability: 0.72 },
            { day: "Sun", probability: 0.55 },
          ],
          alerts: alerts.length > 0 ? alerts : (result.alerts || [
            { severity: "high", location: "East Bay Area", disease: "Cholera", cases: 89, probability: 0.87 },
            { severity: "medium", location: "Downtown District", disease: "Typhoid", cases: 34, probability: 0.65 },
            { severity: "low", location: "North Region", disease: "Hepatitis A", cases: 12, probability: 0.42 },
          ]),
        });
        setLocation("/reports");
      } else {
        const error = await response.json();
        toast({
          title: "Upload Failed",
          description: error.message || "Unable to upload file",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Droplet className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">Upload Data</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
            Upload Water Quality Data
          </h1>
          <p className="text-gray-400 mb-8">
            Upload your CSV or Excel file containing water quality and disease data for analysis
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  dragActive
                    ? "border-blue-400 bg-blue-950/20"
                    : "border-blue-500/20 hover:border-blue-400/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-6 h-6 text-blue-400" />
                      <span className="text-white font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <UploadIcon className="w-16 h-16 text-blue-400 mx-auto" />
                    <div>
                      <p className="text-xl text-white mb-2">
                        Drag and drop your file here
                      </p>
                      <p className="text-gray-400">or</p>
                    </div>
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Browse Files
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="disease-type" className="text-gray-300">Disease Type</Label>
                  <Input
                    id="disease-type"
                    value={formData.diseaseType}
                    onChange={(e) => setFormData({ ...formData, diseaseType: e.target.value })}
                    className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date-reported" className="text-gray-300">Date Reported</Label>
                  <Input
                    id="date-reported"
                    type="date"
                    value={formData.dateReported}
                    onChange={(e) => setFormData({ ...formData, dateReported: e.target.value })}
                    className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="latitude" className="text-gray-300">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-gray-300">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  />
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6"
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload and Analyze"}
            </Button>
          </form>

          {analytics && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid lg:grid-cols-2 gap-8 mb-8 mt-12"
            >
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Monthly Case Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.demoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="cases" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Outbreak Probability Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }} labelStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="probability" stroke="#06b6d4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          )}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm mt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Alerts</h2>
                <div className="space-y-4">
                  {analytics.alerts.map((alert, idx) => (
                    <AlertItem key={idx} {...alert} />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AlertItem({ severity, location, disease, cases, probability }: { severity: string; location: string; disease: string; cases: number; probability: number }) {
  const severityColors = {
    high: "bg-red-500/20 border-red-500 text-red-400",
    medium: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
    low: "bg-blue-500/20 border-blue-500 text-blue-400",
  };
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-blue-500/10">
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[severity as keyof typeof severityColors]}`}>
          {severity.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2 text-white font-medium">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <p className="text-sm text-gray-400">{disease}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-bold">{cases} cases</p>
        <p className="text-sm text-gray-400">{(probability * 100).toFixed(0)}% probability</p>
      </div>
    </div>
  );
}
