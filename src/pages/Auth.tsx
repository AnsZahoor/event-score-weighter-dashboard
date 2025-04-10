
import React from 'react';
import AuthForm from '@/components/Auth/AuthForm';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  
  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Event Score Weighter</h1>
          <p className="text-muted-foreground">Login or create an account to continue</p>
        </div>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};

export default Auth;
