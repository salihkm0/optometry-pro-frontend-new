import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Store, 
  Settings,
  LogOut,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar({ isAdmin }) {
  const { logout } = useAuthStore();

  const adminNavItems = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/shops', icon: Store, label: 'Shops' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/records', icon: FileText, label: 'Records' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' }, 
  ];

  const shopNavItems = [
    { to: '/shop/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/shop/customers', icon: Users, label: 'Customers' },
    { to: '/shop/records', icon: FileText, label: 'Records' },
    // { to: '/shop/billing', icon: CreditCard, label: 'Billing' }, 
    // { to: '/shop/settings', icon: Settings, label: 'Settings' }, 
  ];

  const navItems = isAdmin ? adminNavItems : shopNavItems;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-2xl font-bold text-primary-600">Optometry Pro</span>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </p>
                </div>
                <LogOut className="ml-auto h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}