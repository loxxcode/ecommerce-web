import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const BuyerProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: user?.name?.split(" ")[0] || "Jane", lastName: user?.name?.split(" ")[1] || "Cooper", email: user?.email || "jane@example.com", phone: "+1 234 567 890" });
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [addresses, setAddresses] = useState([
    { id: "1", label: "Home", address: "123 Main Street, New York, NY 10001", isDefault: true },
    { id: "2", label: "Office", address: "456 Business Ave, Suite 200, NY 10002", isDefault: false },
  ]);

  const handleSaveProfile = () => toast.success("Profile updated");
  const handleUpdatePassword = () => {
    if (pw.newPw.length < 6) { toast.error("Password must be 6+ characters"); return; }
    if (pw.newPw !== pw.confirm) { toast.error("Passwords don't match"); return; }
    toast.success("Password updated");
    setPw({ current: "", newPw: "", confirm: "" });
  };

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">My Profile</h1>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-heading text-base font-semibold">Personal Information</h2>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="text-xs font-medium">First Name</label><input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
              <div><label className="text-xs font-medium">Last Name</label><input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            </div>
            <div><label className="text-xs font-medium">Email</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div><label className="text-xs font-medium">Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <Button className="rounded-xl" onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-heading text-base font-semibold">Change Password</h2>
          <div className="mt-4 space-y-3">
            <div><label className="text-xs font-medium">Current Password</label><input type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div><label className="text-xs font-medium">New Password</label><input type="password" value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div><label className="text-xs font-medium">Confirm Password</label><input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <Button variant="outline" className="rounded-xl" onClick={handleUpdatePassword}>Update Password</Button>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-base font-semibold">Saved Addresses</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map(a => (
            <div key={a.id} className={`rounded-xl border p-4 ${a.isDefault ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{a.label}</span>
                {a.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.address}</p>
              <div className="mt-2 flex gap-2">
                <button className="text-xs text-primary hover:underline">Edit</button>
                {!a.isDefault && <button onClick={() => setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === a.id })))} className="text-xs text-muted-foreground hover:underline">Set as default</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
