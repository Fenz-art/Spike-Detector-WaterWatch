import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Droplet, Users, Target, Award, TrendingUp, Shield } from "lucide-react";

export default function About() {
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
              About WaterWatch
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Pioneering the future of waterborne disease detection through advanced machine learning 
              and collaborative health monitoring
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
                <Target className="w-12 h-12 text-blue-400 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  To protect public health by providing hospitals and municipalities with cutting-edge 
                  tools for early detection and prevention of waterborne disease outbreaks.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We believe that by combining advanced AI with collaborative data sharing, we can 
                  save lives and prevent epidemics before they spread.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
                <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  A world where waterborne diseases are detected and contained before they become 
                  public health emergencies, through seamless integration of data, AI, and human expertise.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We envision a global network of connected health systems working together to 
                  protect communities from water-related health threats.
                </p>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <ValueCard
                icon={<Shield className="w-10 h-10 text-blue-400" />}
                title="AI-Powered Detection"
                description="Our machine learning models analyze complex patterns in water quality data to predict disease spikes with 98.5% accuracy."
              />
              <ValueCard
                icon={<Users className="w-10 h-10 text-cyan-400" />}
                title="Collaborative Platform"
                description="Connect hospitals, labs, and municipal authorities on a single platform for coordinated response."
              />
              <ValueCard
                icon={<Award className="w-10 h-10 text-purple-400" />}
                title="Real-Time Alerts"
                description="Get instant notifications when our system detects anomalies, enabling rapid intervention."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20 p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join the growing network of hospitals and health authorities using WaterWatch to 
              protect their communities
            </p>
            <Link href="/hospital-portal">
              <a className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-all">
                Create Your Account
              </a>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </Card>
    </motion.div>
  );
}
