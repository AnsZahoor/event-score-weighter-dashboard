
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { BanIcon, Trash2Icon } from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected' | 'restricted';
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // For demo purposes, check if the user is admin from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user?.role === 'admin');
      
      // Fetch all users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(allUsers);
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const handleApproval = (email: string, approved: boolean) => {
    const updatedUsers = users.map((user) => {
      if (user.email === email) {
        return {
          ...user,
          status: approved ? 'approved' : 'rejected'
        };
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    toast({
      title: approved ? 'User Approved' : 'User Rejected',
      description: `${email} has been ${approved ? 'approved' : 'rejected'}.`
    });
  };

  const handleRestrict = (email: string) => {
    const updatedUsers = users.map((user) => {
      if (user.email === email) {
        return {
          ...user,
          status: user.status === 'restricted' ? 'approved' : 'restricted'
        };
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    const isRestricted = updatedUsers.find(user => user.email === email)?.status === 'restricted';
    
    toast({
      title: isRestricted ? 'User Restricted' : 'User Unrestricted',
      description: `${email} has been ${isRestricted ? 'restricted from' : 'allowed back on'} the platform.`
    });
  };

  const handleDelete = (email: string) => {
    const updatedUsers = users.filter(user => user.email !== email);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    toast({
      title: 'User Deleted',
      description: `${email} has been permanently removed from the system.`,
      variant: 'destructive'
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard - User Management</h1>
      
      {users.length === 0 ? (
        <p className="text-muted-foreground">No users found in the system.</p>
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
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium 
                    ${user.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                    ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${user.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    ${user.status === 'restricted' ? 'bg-orange-100 text-orange-700' : ''}
                  `}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="space-x-2">
                  {user.status === 'pending' && (
                    <>
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
                    </>
                  )}
                  
                  {user.status !== 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant={user.status === 'restricted' ? 'outline' : 'secondary'}
                        onClick={() => handleRestrict(user.email)}
                      >
                        <BanIcon className="mr-1" size={16} />
                        {user.status === 'restricted' ? 'Unrestrict' : 'Restrict'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.email)}
                      >
                        <Trash2Icon className="mr-1" size={16} />
                        Delete
                      </Button>
                    </>
                  )}
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
