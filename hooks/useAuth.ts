import { useState, useEffect, useCallback } from 'react';
import { db, User } from '@/services/mockDatabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for stored user on mount
    const storedUserId = localStorage.getItem('upskill_user_id');
    if (storedUserId) {
      db.getUser(storedUserId).then(user => {
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string): Promise<User | null> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    let user = await db.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      user = await db.createUser({
        email,
        name: email.split('@')[0],
        role: 'user',
        onboarding_data: {
          tech_status: null,
          languages: [],
          interests: [],
          style: null,
        },
      });
    }

    localStorage.setItem('upskill_user_id', user.id);
    setState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });

    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('upskill_user_id');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const updateOnboarding = useCallback(async (
    data: Partial<User['onboarding_data']>
  ): Promise<User | null> => {
    if (!state.user) return null;

    const updatedUser = await db.updateUser(state.user.id, {
      onboarding_data: {
        ...state.user.onboarding_data,
        ...data,
      },
    });

    if (updatedUser) {
      setState(prev => ({ ...prev, user: updatedUser }));
    }

    return updatedUser;
  }, [state.user]);

  const switchRole = useCallback(async (role: 'user' | 'creator'): Promise<User | null> => {
    if (!state.user) return null;

    const updatedUser = await db.updateUser(state.user.id, { role });

    if (updatedUser) {
      setState(prev => ({ ...prev, user: updatedUser }));
    }

    return updatedUser;
  }, [state.user]);

  const needsOnboarding = state.user && !state.user.onboarding_data.tech_status;

  return {
    ...state,
    login,
    logout,
    updateOnboarding,
    switchRole,
    needsOnboarding,
  };
}
