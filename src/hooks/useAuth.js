import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, isShopUser } = useAuthStore();

  useEffect(() => {
    // Check for stored auth on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser && !isAuthenticated) {
      useAuthStore.setState({
        user: JSON.parse(storedUser),
        token,
        isAuthenticated: true,
      });
    }
  }, []);

  const requireAuth = (role = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    
    if (role === 'admin' && !isAdmin()) {
      navigate('/shop/dashboard');
      return false;
    }
    
    if (role === 'shop' && !isShopUser()) {
      navigate('/admin/dashboard');
      return false;
    }
    
    return true;
  };

  return {
    isAuthenticated,
    user,
    isAdmin,
    isShopUser,
    requireAuth,
  };
};