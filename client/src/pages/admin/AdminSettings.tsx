import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const initialCategories = [
  { id: "1", name: "Electronics", subcategories: ["Phones", "Laptops", "Audio"], commission: 10 },
  { id: "2", name: "Fashion", subcategories: ["Men", "Women", "Kids"], commission: 12 },
  { id: "3", name: "Home & Garden", subcategories: ["Furniture", "Decor", "Garden"], commission: 8 },
  { id: "4", name: "Sports", subcategories: ["Footwear", "Equipment"], commission: 10 },
  { id: "5", name: "Books", subcategories: ["Fiction", "Non-fiction", "Academic"], commission: 6 },
  { id: "6", name: "Beauty", subcategories: ["Skincare", "Makeup", "Fragrance"], commission: 14 },
];

const AdminSettings = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [platformName, setPlatformName] = useState("Marktora");
  const [defaultCommission, setDefaultCommission] = useState("10");
  const [newCat, setNewCat] = useState("");

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success("Category deleted");
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCat, subcategories: [], commission: parseInt(defaultCommission) }]);
    setNewCat("");
    toast.success("Category added");
  };

  const handleUpdateCommission = (id: string, val: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, commission: val } : c));
  };

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-heading text-base font-semibold">Categories & Commissions</h2>
          <div className="flex gap-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30 w-40" />
            <Button size="sm" className="gap-1.5 rounded-lg" onClick={handleAddCategory}><Plus size={14} /> Add</Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-3">Category</th><th className="pb-3">Subcategories</th><th className="pb-3">Commission %</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 text-xs text-muted-foreground">{c.subcategories.join(", ") || "—"}</td>
                  <td className="py-3">
                    <input type="number" value={c.commission} onChange={e => handleUpdateCommission(c.id, parseInt(e.target.value) || 0)} className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm" />
                  </td>
                  <td className="py-3">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCategory(c.id)}><Trash2 size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-base font-semibold">Platform Settings</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><label className="text-xs font-medium">Platform Name</label><input value={platformName} onChange={e => setPlatformName(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div><label className="text-xs font-medium">Default Commission (%)</label><input value={defaultCommission} onChange={e => setDefaultCommission(e.target.value)} type="number" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></div>
        </div>
        <Button className="mt-4 gap-2 rounded-xl" onClick={() => toast.success("Settings saved")}><Save size={14} /> Save Settings</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
