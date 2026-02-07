import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      
      updateUser: (userData) => {
        set({ user: userData });
        localStorage.setItem('user', JSON.stringify(userData));
      },
      
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'super_admin' || user?.role === 'admin';
      },
      
      isShopOwner: () => {
        const { user } = get();
        return user?.role === 'shop_owner';
      },
      
      isShopUser: () => {
        const { user } = get();
        return user?.role && ['shop_owner', 'optometrist', 'assistant', 'receptionist'].includes(user.role);
      },
      
      hasPermission: (permission) => {
        const { user } = get();
        if (!user?.permissions) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);