import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminAPI } from "@/services/adminAPI";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  isActive: boolean;
  createdAt: string;
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  storeName?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const user = users.find(u => u._id === id);
      if (!user) return;

      await adminAPI.updateUser(id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => 
        u._id === id ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success("User status updated");
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Users Management</h1>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.storeName || '-'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                  {u.role === 'seller' && u.sellerStatus && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      u.sellerStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      u.sellerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.sellerStatus}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button 
                    size="sm" 
                    variant={u.isActive ? "destructive" : "default"}
                    onClick={() => toggleStatus(u._id)}
                  >
                    {u.isActive ? "Suspend" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
