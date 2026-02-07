import { useEffect, useState } from 'react';
import { Users, Eye, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import endpoints from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ShopDashboard() {
  const [stats, setStats] = useState({
    customerCount: 0,
    recordCount: 0,
    todayRecords: 0,
    revenue: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, recordsRes] = await Promise.all([
        axiosClient.get(endpoints.shopStats(user.shop)),
        axiosClient.get(endpoints.records + `?shop=${user.shop}&limit=5&page=1`),
      ]);

      console.log("statsRes : ", statsRes)
      console.log("recordsRes : ", recordsRes)

      if (statsRes.success) {
        setStats(statsRes.data || {});
      }

      if (recordsRes.success) {
        setRecentRecords(recordsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.customerCount,
      icon: Users,
      color: 'bg-blue-500',
      link: '/shop/customers',
    },
    {
      title: 'Total Records',
      value: stats.recordCount,
      icon: Eye,
      color: 'bg-purple-500',
      link: '/shop/records',
    },
    {
      title: "Today's Appointments",
      value: stats.todayRecords || 0,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/shop/records?date=' + new Date().toISOString().split('T')[0],
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/shop/records/new" className="btn-primary">
            + New Record
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link || '#'}
            className={`card hover:shadow-lg transition-shadow ${!stat.link && 'cursor-default'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12%</span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Records */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Records</h2>
          <Link to="/shop/records" className="text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Record ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Examination</th>
                <th className="table-header">Status</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentRecords.map((record) => (
                <tr key={record._id}>
                  <td className="table-cell">
                    {formatDate(record.date)}
                  </td>
                  <td className="table-cell font-mono text-sm">
                    {record.recordId}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{record.customer?.name}</p>
                      <p className="text-sm text-gray-500">{record.customer?.phone}</p>
                    </div>
                  </td>
                  <td className="table-cell capitalize">
                    {record.examinationType?.replace('_', ' ')}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="table-cell font-medium">
                    {formatCurrency(record.billing?.amount)}
                  </td>
                  <td className="table-cell">
                    <Link
                      to={`/shop/records/${record._id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/shop/customers/new"
              className="btn-primary text-center"
            >
              Add Customer
            </Link>
            <Link
              to="/shop/records/new"
              className="btn-primary text-center"
            >
              Add Record
            </Link>
            <Link
              to="/shop/customers"
              className="btn-secondary text-center"
            >
              View Customers
            </Link>
            <Link
              to="/shop/records"
              className="btn-secondary text-center"
            >
              View Records
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {recentRecords.filter(r => r.nextAppointment).slice(0, 3).map((record) => (
              <div key={record._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{record.customer?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(record.nextAppointment, 'MMM dd, hh:mm a')}
                  </p>
                </div>
                <Link
                  to={`/shop/records/${record._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  View
                </Link>
              </div>
            ))}
            {recentRecords.filter(r => r.nextAppointment).length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}