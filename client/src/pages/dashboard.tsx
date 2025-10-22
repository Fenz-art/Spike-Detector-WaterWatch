import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, FileText, AlertTriangle, TrendingUp, 
  Droplet, LogOut, BarChart, Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  hospitalName?: string;
  location?: string;
}

interface Record {
  _id: string;
  fileName: string;
  location: string;
  diseaseType: string;
  casesCount: number;
  uploadedAt: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState({ totalRecords: 0, activeAlerts: 0 });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchRecords();
    fetchStats();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setLocation("/hospital-portal");
      }
    } catch (error) {
      setLocation("/hospital-portal");
    }
  };

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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Droplet className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold text-white">WaterWatch Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user.username}</span>
            <Button variant="outline" onClick={handleLogout} className="border-blue-500/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            {user.hospitalName || "Hospital"} Dashboard
          </h1>
          <p className="text-gray-400">{user.location}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<FileText className="w-8 h-8 text-blue-400" />}
            title="Total Uploads"
            value={records.length}
            color="blue"
          />
          <StatsCard
            icon={<AlertTriangle className="w-8 h-8 text-yellow-400" />}
            title="Active Alerts"
            value={stats.activeAlerts}
            color="yellow"
          />
          <StatsCard
            icon={<TrendingUp className="w-8 h-8 text-green-400" />}
            title="Total Cases"
            value={records.reduce((sum, r) => sum + r.casesCount, 0)}
            color="green"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/upload")}
                className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-3" />
                Upload New Data
              </Button>
              <Button
                onClick={() => setLocation("/reports")}
                className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
                size="lg"
              >
                <BarChart className="w-5 h-5 mr-3" />
                View Reports
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Uploads</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {records.slice(0, 5).map((record) => (
                <div
                  key={record._id}
                  className="p-3 bg-slate-800/50 rounded-lg border border-blue-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{record.fileName}</p>
                      <p className="text-sm text-gray-400">
                        {record.diseaseType} - {record.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-semibold">{record.casesCount}</p>
                      <p className="text-xs text-gray-500">cases</p>
                    </div>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <p className="text-gray-400 text-center py-8">No uploads yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  color: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 bg-${color}-600/20 rounded-lg`}>
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
