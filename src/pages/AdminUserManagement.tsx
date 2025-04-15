
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserProfile {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Unauthorized',
          description: 'You must be logged in to access this page',
          variant: 'destructive'
        });
        return;
      }

      const { data: adminData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!adminData);
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, status');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive'
        });
      } else {
        setUsers(data as UserProfile[]);
      }
    };

    checkAdminStatus();
    fetchUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: 'pending' | 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    } else {
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status } : user
      ));

      toast({
        title: 'User Updated',
        description: `User status updated to ${status}`
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Table>
        <TableCaption>List of registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                {user.status === 'pending' && (
                  <>
                    <Button 
                      variant="default" 
                      className="mr-2"
                      onClick={() => updateUserStatus(user.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserManagement;
