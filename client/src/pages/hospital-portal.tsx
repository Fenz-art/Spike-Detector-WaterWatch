import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, Building2, User, Mail, Lock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HospitalPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    location: "",
    role: "hospital",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back to WaterWatch!",
        });
        setLocation("/dashboard");
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        toast({
          title: "Signup Successful",
          description: "Your account has been created!",
        });
        setLocation("/dashboard");
      } else {
        const error = await response.json();
        toast({
          title: "Signup Failed",
          description: error.message || "Unable to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Droplet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            Hospital Portal
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Sign in to access your dashboard" : "Create your hospital account"}
          </p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-blue-500/20 backdrop-blur-sm">
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-gray-300">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-username" className="text-gray-300">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </Label>
                <Input
                  id="signup-username"
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="hospital-name" className="text-gray-300">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Hospital Name
                </Label>
                <Input
                  id="hospital-name"
                  type="text"
                  value={signupData.hospitalName}
                  onChange={(e) => setSignupData({ ...signupData, hospitalName: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-gray-300">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={signupData.location}
                  onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-gray-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-gray-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="mt-2 bg-slate-900/50 border-blue-500/20 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-400 hover:text-blue-400 transition-colors">
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
