import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, TrendingUp, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const demoData = [
  { month: "Jan", cases: 45 },
  { month: "Feb", cases: 52 },
  { month: "Mar", cases: 78 },
  { month: "Apr", cases: 145 },
  { month: "May", cases: 89 },
  { month: "Jun", cases: 67 },
];

const trendData = [
  { day: "Mon", probability: 0.3 },
  { day: "Tue", probability: 0.45 },
  { day: "Wed", probability: 0.62 },
  { day: "Thu", probability: 0.78 },
  { day: "Fri", probability: 0.85 },
  { day: "Sat", probability: 0.72 },
  { day: "Sun", probability: 0.55 },
];

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <Droplet className="w-10 h-10 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                WaterWatch
              </span>
            </div>
          </Link>
          <Link href="/">
            <a className="text-gray-300 hover:text-blue-400 transition-colors">← Back to Home</a>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
              Live Demo
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore WaterWatch's capabilities with sample data showing waterborne disease detection and analytics
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <DemoStatCard
              title="Detection Accuracy"
              value="98.5%"
              icon={<CheckCircle className="w-8 h-8 text-green-400" />}
              color="green"
            />
            <DemoStatCard
              title="Active Alerts"
              value="3"
              icon={<AlertTriangle className="w-8 h-8 text-yellow-400" />}
              color="yellow"
            />
            <DemoStatCard
              title="Cases Analyzed"
              value="476"
              icon={<TrendingUp className="w-8 h-8 text-blue-400" />}
              color="blue"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Monthly Case Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="cases" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Outbreak Probability Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="probability" stroke="#06b6d4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Alerts</h2>
              <div className="space-y-4">
                <AlertItem
                  severity="high"
                  location="East Bay Area"
                  disease="Cholera"
                  cases={89}
                  probability={0.87}
                />
                <AlertItem
                  severity="medium"
                  location="Downtown District"
                  disease="Typhoid"
                  cases={34}
                  probability={0.65}
                />
                <AlertItem
                  severity="low"
                  location="North Region"
                  disease="Hepatitis A"
                  cases={12}
                  probability={0.42}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 mb-6">
              This is demo data for illustration purposes. Sign up to analyze your own datasets.
            </p>
            <Link href="/hospital-portal">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-6 text-lg">
                Get Started with Real Data
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DemoStatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-600/20 rounded-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function AlertItem({ severity, location, disease, cases, probability }: { 
  severity: string; 
  location: string; 
  disease: string; 
  cases: number; 
  probability: number 
}) {
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
