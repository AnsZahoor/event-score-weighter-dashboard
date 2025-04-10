
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEvents } from '@/context/EventContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, handleLogout } = useEvents();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/auth');
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/auth')}
      >
        Login
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block">
        <p className="text-sm font-medium">{user.email}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogoutClick}
      >
        <LogOut className="h-4 w-4 mr-1" />
        <span className="hidden md:inline">Logout</span>
      </Button>
    </div>
  );
};

export default UserProfile;
