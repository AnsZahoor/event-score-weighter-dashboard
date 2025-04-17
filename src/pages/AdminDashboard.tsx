
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserProfile {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // For demo purposes, check if the user is admin from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user?.role === 'admin');
      
      // Fetch pending users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      setPendingUsers(users.filter((user: any) => user.status === 'pending'));
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const handleApproval = (email: string, approved: boolean) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: any) => {
      if (user.email === email) {
        return {
          ...user,
          status: approved ? 'approved' : 'rejected'
        };
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setPendingUsers(updatedUsers.filter((user: any) => user.status === 'pending'));
    
    toast({
      title: approved ? 'User Approved' : 'User Rejected',
      description: `${email} has been ${approved ? 'approved' : 'rejected'}.`
    });
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard - User Approvals</h1>
      
      {pendingUsers.length === 0 ? (
        <p className="text-muted-foreground">No pending user approvals.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(user.email, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApproval(user.email, false)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminDashboard;
