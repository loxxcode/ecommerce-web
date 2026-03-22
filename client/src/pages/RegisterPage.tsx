import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/services/api";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "seller" ? "seller" : "buyer";
  const [role, setRole] = useState<"buyer" | "seller">(defaultRole);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", storeName: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (role === "seller" && !form.storeName.trim()) e.storeName = "Required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      const response = await authAPI.register(name, form.email, form.password, role, form.storeName);
      
      toast.success("Account created successfully!");
      
      // After successful registration, login automatically
      await login(form.email, form.password);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold" style={{ lineHeight: 1.1 }}>Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join Marktora and start {role === "seller" ? "selling" : "shopping"}</p>
        </div>

        <form onSubmit={handleRegister} className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          {/* Role Toggle */}
          <div className="flex rounded-xl border border-input p-1 mb-5">
            {(["buyer", "seller"] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${role === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "buyer" ? "Buyer" : "Seller"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {[{ label: "First Name", field: "firstName", ph: "John" }, { label: "Last Name", field: "lastName", ph: "Doe" }].map(f => (
                <div key={f.field}>
                  <label className="text-xs font-medium">{f.label}</label>
                  <input value={(form as any)[f.field]} onChange={e => updateField(f.field, e.target.value)} placeholder={f.ph} className={`mt-1 w-full rounded-lg border ${errors[f.field] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30`} />
                  {errors[f.field] && <p className="mt-0.5 text-[11px] text-destructive">{errors[f.field]}</p>}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium">Email</label>
              <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="you@example.com" className={`mt-1 w-full rounded-lg border ${errors.email ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30`} />
              {errors.email && <p className="mt-0.5 text-[11px] text-destructive">{errors.email}</p>}
            </div>
            {role === "seller" && (
              <div>
                <label className="text-xs font-medium">Store Name</label>
                <input value={form.storeName} onChange={e => updateField("storeName", e.target.value)} placeholder="My Awesome Store" className={`mt-1 w-full rounded-lg border ${errors.storeName ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30`} />
                {errors.storeName && <p className="mt-0.5 text-[11px] text-destructive">{errors.storeName}</p>}
              </div>
            )}
            <div>
              <label className="text-xs font-medium">Password</label>
              <div className="relative mt-1">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => updateField("password", e.target.value)} placeholder="Min 6 characters" className={`w-full rounded-lg border ${errors.password ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring/30`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {errors.password && <p className="mt-0.5 text-[11px] text-destructive">{errors.password}</p>}
            </div>
            <div>
              <label className="text-xs font-medium">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => updateField("confirm", e.target.value)} placeholder="••••••••" className={`mt-1 w-full rounded-lg border ${errors.confirm ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30`} />
              {errors.confirm && <p className="mt-0.5 text-[11px] text-destructive">{errors.confirm}</p>}
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full rounded-xl transition-all active:scale-[0.97]" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
