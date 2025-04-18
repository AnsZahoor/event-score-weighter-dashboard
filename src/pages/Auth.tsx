
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // Mock login
        console.log("Logging in with:", email);
        
        // For demo purposes only
        if (email === "admin@example.com" && password === "password") {
          // Store auth state in localStorage for persistence
          localStorage.setItem('user', JSON.stringify({ email, role: 'admin', status: 'approved' }));
          
          toast({
            title: 'Login Successful',
            description: 'Welcome back!'
          });
          navigate('/');
        } else {
          // Check if user exists and is approved
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const user = storedUsers.find((u: any) => u.email === email && u.password === password);
          
          if (user) {
            if (user.status === 'approved') {
              localStorage.setItem('user', JSON.stringify({ email, role: 'user', status: 'approved' }));
              toast({
                title: 'Login Successful',
                description: 'Welcome back!'
              });
              navigate('/');
            } else {
              toast({
                title: 'Account Pending',
                description: 'Your account is pending admin approval.',
                variant: 'destructive'
              });
            }
          } else {
            toast({
              title: 'Authentication Error',
              description: 'Invalid email or password',
              variant: 'destructive'
            });
          }
        }
      } else {
        // Mock signup - store new user with pending status
        console.log("Signing up with:", email);
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({
          email,
          password,
          role: 'user',
          status: 'pending'
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        toast({
          title: 'Signup Successful',
          description: 'Your account is pending approval. An admin will review your request.'
        });
        // Don't navigate, stay on auth page
      }
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Demo credentials:</strong><br />
              Email: admin@example.com<br />
              Password: password
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
