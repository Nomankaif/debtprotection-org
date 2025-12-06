import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ icon, title, value, growth, color }) => (
  <motion.div 
    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      {growth !== null && (
        <span className={`text-sm font-semibold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {growth >= 0 ? '+' : ''}{growth}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-gray-500 font-medium mt-1">{title}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, salesRes, activitiesRes, authorsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/sales-over-time'),
        axios.get('/api/admin/recent-activities'),
        axios.get('/api/admin/top-performing')
      ]);

      setStats(statsRes.data);
      setSalesData(salesRes.data);
      setRecentActivities(activitiesRes.data);
      setTopAuthors(authorsRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back! Here's a snapshot of your platform's performance.</p>
            </div>
            <button 
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<DocumentTextIcon className="h-7 w-7" />}
              title="Published Articles"
              value={stats?.publishedArticles || 0}
              growth={stats?.completionRate || 0}
              color="purple"
            />
            <StatCard 
              icon={<UsersIcon className="h-7 w-7" />}
              title="Total Users"
              value={stats?.totalUsers || 0}
              growth={stats?.engagementRate || 0}
              color="blue"
            />
            <StatCard 
              icon={<UserGroupIcon className="h-7 w-7" />}
              title="Authors"
              value={stats?.authorCount || 0}
              growth={null}
              color="green"
            />
            <StatCard 
              icon={<BanknotesIcon className="h-7 w-7" />}
              title="Funding Secured"
              value={`$${(stats?.fundingSecured || 0).toLocaleString()}`}
              growth={null}
              color="pink"
            />
          </div>

          {/* Sales Chart and Top Authors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contributions Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(5px)',
                      borderRadius: '1rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="contributions" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="approvals" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Authors</h2>
              <div className="space-y-4">
                {topAuthors.map(author => (
                  <div key={author.id} className="flex items-center space-x-4">
                    <img src={`https://ui-avatars.com/api/?name=${author.name.replace(' ', '+')}&background=random`} alt={author.name} className="h-12 w-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-800">{author.name}</p>
                      <p className="text-sm text-gray-500">{author.published} articles published</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            {activity.type === 'Published' ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <ClockIcon className="h-5 w-5 text-yellow-500" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.title}{' '}
                              <span className="font-medium text-gray-900">{activity.actor}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;