import { Link } from "wouter";
import { motion } from "framer-motion";
import { Droplet, TrendingUp, Shield, Activity, Upload, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Droplet className="w-10 h-10 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              WaterWatch
            </span>
          </motion.div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
              Contact
            </Link>
            <Link href="/hospital-portal">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Hospital Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Droplet className="w-16 h-16 text-blue-400" />
                <TrendingUp className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Water-Borne Spike Detector
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Advanced ML-powered detection system for identifying disease spikes in 
                water quality data. Upload your CSV data and get instant, accurate predictions.
              </p>
              <div className="flex gap-4">
                <Link href="/hospital-portal">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-blue-400 text-blue-400 hover:bg-blue-950">
                    View Demo
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="p-8 bg-gradient-to-br from-blue-950/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Step 1: Upload Data</h3>
                </div>
                <p className="text-gray-300">
                  Upload your CSV file containing water quality parameters. Our system accepts 
                  data with Disease, Location, Cases, Temperature, Precipitation, and LAI values.
                </p>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-cyan-950/50 to-slate-900/50 border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-cyan-600/20 rounded-lg">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Step 2: AI Analysis</h3>
                </div>
                <p className="text-gray-300">
                  Our machine learning models analyze patterns in your data, detecting anomalies 
                  and predicting disease outbreak spikes with high accuracy.
                </p>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-purple-950/50 to-slate-900/50 border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Step 3: Get Report</h3>
                </div>
                <p className="text-gray-300">
                  Receive detailed reports with visualizations, heatmaps, and actionable insights 
                  for immediate response and prevention measures.
                </p>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: statsVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <StatsCard number={15000} label="Data Points Analyzed" delay={0.5} />
            <StatsCard number={98.5} label="Accuracy Rate" suffix="%" delay={0.7} />
            <StatsCard number={47} label="Hospitals Connected" delay={0.9} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-32"
          >
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Why Choose WaterWatch?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Shield className="w-12 h-12 text-blue-400" />}
                title="Secure & Reliable"
                description="Enterprise-grade security with encrypted data storage and HIPAA-compliant infrastructure."
              />
              <FeatureCard
                icon={<Activity className="w-12 h-12 text-cyan-400" />}
                title="Real-time Detection"
                description="Get instant alerts when disease spikes are detected, enabling rapid response."
              />
              <FeatureCard
                icon={<Users className="w-12 h-12 text-purple-400" />}
                title="Collaborative Platform"
                description="Share insights across hospitals and municipal authorities for coordinated action."
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#0F172A"/>
        </svg>
      </div>
    </div>
  );
}

function StatsCard({ number, label, suffix = "", delay }: { number: number; label: string; suffix?: string; delay: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = number / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        setCount(number);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-10 text-center"
    >
      <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 text-lg">{label}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}
