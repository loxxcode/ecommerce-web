import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SellerProfile = () => {
  const [form, setForm] = useState({ storeName: "TechStore Pro", description: "Premium tech products and accessories.", email: "tech@store.com", phone: "+1 555 123 456" });

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Store Profile</h1>
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-base font-semibold">Store Information</h2>
        <div className="mt-4 space-y-3">
          <div><label className="text-xs font-medium">Store Name</label><input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div><label className="text-xs font-medium">Description</label><textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium">Email</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div><label className="text-xs font-medium">Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
          </div>
          <Button className="rounded-xl" onClick={() => toast.success("Store profile updated")}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
