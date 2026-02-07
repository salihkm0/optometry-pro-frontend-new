import { useEffect, useState } from 'react';
import { Users, Eye, DollarSign, Store, TrendingUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    totalCustomers: 0,
    totalRecords: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentShops, setRecentShops] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, shopsData] = await Promise.all([
        axiosClient.get(endpoints.dashboardStats),
        axiosClient.get(endpoints.shops + '?limit=5&page=1'),
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (shopsData.success) {
        setRecentShops(shopsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Shops',
      value: stats.totalShops,
      icon: Store,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Shops',
      value: stats.activeShops,
      icon: Store,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%',
    },
    {
      title: 'Total Records',
      value: stats.totalRecords,
      icon: Eye,
      color: 'bg-yellow-500',
      change: '+20%',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your optometry management system</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shops */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shops</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View all
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Shop Name</th>
                <th className="table-header">Owner</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentShops.map((shop) => (
                <tr key={shop._id}>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-sm text-gray-500">{shop.contact?.email}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    {shop.owner?.name}
                  </td>
                  <td className="table-cell">
                    <p>{shop.contact?.phone}</p>
                    <p className="text-sm text-gray-500">{shop.contact?.address?.city}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-700">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary">Add New Shop</button>
            <button className="w-full btn-secondary">View Reports</button>
            <button className="w-full btn-secondary">Manage Users</button>
          </div>
        </div>

        <div className="card md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Server Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Database Performance</span>
                <span className="text-sm font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}