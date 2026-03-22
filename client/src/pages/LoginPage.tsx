import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required";
    if (!password.trim() || password.length < 4) e.password = "Password too short";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) handleLogin();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold" style={{ lineHeight: 1.1 }}>Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Marktora account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Email Address</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-lg border ${errors.email ? "border-destructive" : "border-input"} bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all`}
                />
              </div>
              {errors.email && <p className="mt-0.5 text-[11px] text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${errors.password ? "border-destructive" : "border-input"} bg-background py-2.5 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-0.5 text-[11px] text-destructive">{errors.password}</p>}
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full rounded-xl transition-all active:scale-[0.97]" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">or sign in as demo user</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
