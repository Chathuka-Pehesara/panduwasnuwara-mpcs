'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type MembershipModalType = 'members' | 'voters' | 'apply' | null;

export interface AuthUser {
  id?: number;
  username?: string;
  fullName?: string;
  nic?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
}

interface MembershipContextType {
  activeModal: MembershipModalType;
  openModal: (type: MembershipModalType) => void;
  closeModal: () => void;
  auth: AuthState;
  refreshAuth: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<MembershipModalType>(null);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    user: null
  });

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.isAuthenticated) {
        setAuth({
          isAuthenticated: true,
          isAdmin: Boolean(data.isAdmin),
          user: data.user
        });
      } else {
        setAuth({ isAuthenticated: false, isAdmin: false, user: null });
      }
    } catch {
      setAuth({ isAuthenticated: false, isAdmin: false, user: null });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const openModal = useCallback((type: MembershipModalType) => {
    setActiveModal(type);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  return (
    <MembershipContext.Provider
      value={{
        activeModal,
        openModal,
        closeModal,
        auth,
        refreshAuth
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
