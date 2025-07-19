
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};
