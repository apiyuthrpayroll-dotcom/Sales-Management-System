import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';

interface UserContextType {
  userId: string;
  role: UserRole;
  fullName: string;
  email: string;
  updateSession: (userId: string, role: UserRole, fullName: string, email: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>(() => {
    const storedId = localStorage.getItem('crm_active_user_id') || localStorage.getItem('crm_user_id') || '657229df-fb36-4978-bf94-4a52e04f7ae0';
    if (storedId === '00000000-0000-0000-0000-000000000000' || storedId === 'u-fallback' || storedId === '3') {
        return '657229df-fb36-4978-bf94-4a52e04f7ae0';
    }
    return storedId;
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('crm_active_role') as UserRole) || (localStorage.getItem('crm_user_role') as UserRole) || 'System Administrator';
  });
  const [fullName, setFullName] = useState<string>(() => localStorage.getItem('crm_user_fullname') || 'Unknown');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('crm_user_email') || '');

  const updateSession = (newUserId: string, newRole: UserRole, newFullName: string, newEmail: string) => {
    setUserId(newUserId);
    setRole(newRole);
    setFullName(newFullName);
    setEmail(newEmail);
    localStorage.setItem('crm_active_user_id', newUserId);
    localStorage.setItem('crm_active_role', newRole);
    localStorage.setItem('crm_user_role', newRole);
    localStorage.setItem('crm_user_id', newUserId);
    localStorage.setItem('crm_user_fullname', newFullName);
    localStorage.setItem('crm_user_email', newEmail);
  };

  return (
    <UserContext.Provider value={{ userId, role, fullName, email, updateSession }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
