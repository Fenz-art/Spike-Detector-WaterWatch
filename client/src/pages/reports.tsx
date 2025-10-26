import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, ArrowLeft, FileText, MapPin, Calendar, AlertTriangle, Download, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Record {
  _id: string;
  fileName: string;
  location: string;
  casesCount: number;
  uploadedAt: string;
  latitude?: number;
  longitude?: number;
}

export default function Reports() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [analytics, setAnalytics] = useState<{ demoData: any[]; trendData: any[]; alerts: any[] } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      fetchAnalytics(selectedRecord._id);
    }
  }, [selectedRecord]);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records");
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

  const fetchAnalytics = async (recordId: string) => {
    try {
      const response = await fetch(`/api/records/analytics/${recordId}`);
      if (response.ok) {
        const result = await response.json();
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
          alerts: result.alerts || [
            { severity: "high", location: "East Bay Area", cases: 89, probability: 0.87 },
            { severity: "medium", location: "Downtown District", cases: 34, probability: 0.65 },
            { severity: "low", location: "North Region", cases: 12, probability: 0.42 },
          ],
        });
      } else {
        setAnalytics(null);
      }
    } catch {
      setAnalytics(null);
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
          <span className="text-xl font-bold text-white">Past Reports</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
            Historical Reports
          </h1>
          <p className="text-gray-400 mb-8">
            View and analyze your past water quality data uploads and spike detection results
          </p>

          {records.length === 0 ? (
            <Card className="p-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">No reports yet</p>
              <Button onClick={() => setLocation("/upload")} className="bg-blue-600 hover:bg-blue-700">
                Upload Your First Dataset
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {records.map((record) => (
                  <motion.div
                    key={record._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        selectedRecord?._id === record._id
                          ? "bg-blue-900/40 border-blue-400"
                          : "bg-slate-800/50 border-blue-500/20 hover:border-blue-400/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium text-sm">{record.fileName}</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{record.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(record.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-500/20">
                        <span className="text-blue-400 font-semibold">{record.casesCount} cases</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedRecord ? (
                  <>
                    <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Report Details</h2>
                        <Button variant="outline" className="border-blue-500/20">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <InfoCard title="File Name" value={selectedRecord.fileName} />
                          <InfoCard title="Location" value={selectedRecord.location} />
                          <InfoCard title="Total Cases" value={selectedRecord.casesCount.toString()} />
                          <InfoCard 
                            title="Upload Date" 
                            value={new Date(selectedRecord.uploadedAt).toLocaleString()} 
                          />
                          {selectedRecord.latitude && selectedRecord.longitude && (
                            <InfoCard 
                              title="Coordinates" 
                              value={`${selectedRecord.latitude.toFixed(4)}, ${selectedRecord.longitude.toFixed(4)}`} 
                            />
                          )}
                        </div>

                        <div className="p-6 bg-blue-950/20 rounded-lg border border-blue-500/20">
                          <h3 className="text-lg font-semibold text-white mb-3">Analysis Summary</h3>
                          <p className="text-gray-300 leading-relaxed">
                            This report contains data for {selectedRecord.casesCount} cases in {selectedRecord.location}. The data was uploaded on{' '}
                            {new Date(selectedRecord.uploadedAt).toLocaleDateString()} and has been processed 
                            through our ML-powered spike detection system.
                          </p>
                          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-blue-400 mb-2">Key Findings:</p>
                            <ul className="text-sm text-gray-300 space-y-1">
                              <li>• Cases analyzed and categorized by location and time period</li>
                              <li>• Environmental factors correlated with disease patterns</li>
                              <li>• Outbreak probability calculated using ML algorithms</li>
                              <li>• Heatmap data generated for geographic visualization</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>

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
                  </>
                ) : (
                  <Card className="p-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-400">
                      Select a report to view details
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-500/10">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

function AlertItem({ severity, location, cases, probability }: { severity: string; location: string; cases: number; probability: number }) {
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
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-bold">{cases} cases</p>
        <p className="text-sm text-gray-400">{(probability * 100).toFixed(0)}% probability</p>
      </div>
    </div>
  );
}
