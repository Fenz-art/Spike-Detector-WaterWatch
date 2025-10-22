import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, ArrowLeft, FileText, MapPin, Calendar, AlertTriangle, Download } from "lucide-react";

interface Record {
  _id: string;
  fileName: string;
  location: string;
  diseaseType: string;
  casesCount: number;
  uploadedAt: string;
  latitude?: number;
  longitude?: number;
}

export default function Reports() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchRecords();
  }, []);

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
                          <AlertTriangle className="w-3 h-3" />
                          <span>{record.diseaseType}</span>
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
                        <InfoCard title="Disease Type" value={selectedRecord.diseaseType} />
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
                          This report contains data for {selectedRecord.casesCount} cases of {selectedRecord.diseaseType} 
                          {' '}in {selectedRecord.location}. The data was uploaded on{' '}
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
