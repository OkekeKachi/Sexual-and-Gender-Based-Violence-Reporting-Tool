import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, AlertCircle, MapPin, Eye, Search, Filter, Download } from 'lucide-react';

// Firebase imports (assuming you've set up Firebase)
// import { db } from './firebase';
// import { collection, getDocs } from 'firebase/firestore';

// Mock data for development (replace with Firebase data in production)
const MOCK_REPORTS = [
    { id: '001', category: 'Physical Abuse', location: 'Central District', timestamp: '2025-05-16T10:23:00', status: 'Pending' },
    { id: '002', category: 'Verbal Abuse', location: 'East Ward', timestamp: '2025-05-16T08:45:00', status: 'Assigned' },
    { id: '003', category: 'Economic Abuse', location: 'South Zone', timestamp: '2025-05-15T16:30:00', status: 'In Progress' },
    { id: '004', category: 'Rape', location: 'North Sector', timestamp: '2025-05-15T14:12:00', status: 'Under Review' },
    { id: '005', category: 'Negligence', location: 'West End', timestamp: '2025-05-15T11:05:00', status: 'Completed' },
    { id: '006', category: 'Physical Abuse', location: 'Downtown', timestamp: '2025-05-14T19:45:00', status: 'Pending' },
    { id: '007', category: 'Verbal Abuse', location: 'Riverside', timestamp: '2025-05-14T15:20:00', status: 'In Progress' },
    { id: '008', category: 'Rape', location: 'Uptown', timestamp: '2025-05-14T09:30:00', status: 'Completed' },
];

const CATEGORIES = ['Physical Abuse', 'Verbal Abuse', 'Economic Abuse', 'Rape', 'Negligence'];
const STATUS_TYPES = ['Pending', 'Assigned', 'In Progress', 'Under Review', 'Completed'];
const LOCATIONS = ['Central District', 'East Ward', 'South Zone', 'North Sector', 'West End', 'Downtown', 'Riverside', 'Uptown'];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function Dashboard() {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTimeFrame, setSelectedTimeFrame] = useState('All');

    // Fetch data from Firebase (mock for now)
    useEffect(() => {
        // In production, replace this with actual Firebase fetching
        // const fetchData = async () => {
        //   const querySnapshot = await getDocs(collection(db, "reports"));
        //   const reportsList = querySnapshot.docs.map(doc => ({
        //     id: doc.id,
        //     ...doc.data()
        //   }));
        //   setReports(reportsList);
        //   setFilteredReports(reportsList);
        //   setLoading(false);
        // };
        // fetchData();

        // Using mock data for development
        setTimeout(() => {
            setReports(MOCK_REPORTS);
            setFilteredReports(MOCK_REPORTS);
            setLoading(false);
        }, 1000);
    }, []);

    // Process data for charts whenever filtered reports change
    useEffect(() => {
        if (filteredReports.length > 0) {
            // Process category data
            const categoryCount = {};
            CATEGORIES.forEach(cat => categoryCount[cat] = 0);

            filteredReports.forEach(report => {
                if (categoryCount.hasOwnProperty(report.category)) {
                    categoryCount[report.category]++;
                }
            });

            const catData = Object.keys(categoryCount).map(key => ({
                name: key,
                value: categoryCount[key]
            }));
            setCategoryData(catData);

            // Process status data
            const statusCount = {};
            STATUS_TYPES.forEach(status => statusCount[status] = 0);

            filteredReports.forEach(report => {
                if (statusCount.hasOwnProperty(report.status)) {
                    statusCount[report.status]++;
                }
            });

            const statData = Object.keys(statusCount).map(key => ({
                name: key,
                value: statusCount[key]
            }));
            setStatusData(statData);

            // Process location data
            const locationCount = {};
            LOCATIONS.forEach(loc => locationCount[loc] = 0);

            filteredReports.forEach(report => {
                if (locationCount.hasOwnProperty(report.location)) {
                    locationCount[report.location]++;
                }
            });

            const locData = Object.keys(locationCount)
                .map(key => ({
                    name: key,
                    count: locationCount[key]
                }))
                .filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count);

            setLocationData(locData);
        }
    }, [filteredReports]);

    // Handle search and filters
    useEffect(() => {
        let filtered = [...reports];

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(report => report.category === selectedCategory);
        }

        // Apply time frame filter
        if (selectedTimeFrame !== 'All') {
            const now = new Date();
            const cutoff = new Date();

            switch (selectedTimeFrame) {
                case 'Today':
                    cutoff.setHours(0, 0, 0, 0);
                    break;
                case 'This Week':
                    cutoff.setDate(now.getDate() - 7);
                    break;
                case 'This Month':
                    cutoff.setMonth(now.getMonth() - 1);
                    break;
                default:
                    break;
            }

            filtered = filtered.filter(report => new Date(report.timestamp) >= cutoff);
        }

        setFilteredReports(filtered);
    }, [searchTerm, selectedCategory, selectedTimeFrame, reports]);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-gray-700">Count: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let bgColor = 'bg-gray-200';
        let textColor = 'text-gray-800';

        switch (status) {
            case 'Pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                break;
            case 'Assigned':
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                break;
            case 'In Progress':
                bgColor = 'bg-purple-100';
                textColor = 'text-purple-800';
                break;
            case 'Under Review':
                bgColor = 'bg-orange-100';
                textColor = 'text-orange-800';
                break;
            case 'Completed':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
            default:
                break;
        }

        return (
            <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full font-medium`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-grey-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center text-blue-600">
                            <AlertCircle className="h-8 w-8 mr-2" />
                            <span className="font-bold text-2xl ">SGBV</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Settings
                            </button>
                            <div className="relative">
                                <img
                                    className="h-8 w-8 rounded-full border-2 border-white"
                                    src="/ananymous.png"
                                    alt="Admin user"
                                />
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500 mt-1">Monitor and manage reported GBV incidents</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                        <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4 mr-2" />
                            Advanced Filters
                        </button>
                        <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-700">Total Reports</h2>
                            <div className="bg-blue-100 p-2 rounded-full">
                                <AlertCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="text-green-500 font-medium">↑ 12%</span>
                            <span className="ml-2">from last month</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-700">Pending Cases</h2>
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {reports.filter(r => r.status === 'Pending').length}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="text-red-500 font-medium">↑ 5%</span>
                            <span className="ml-2">requiring attention</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-700">In Progress</h2>
                            <div className="bg-purple-100 p-2 rounded-full">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {reports.filter(r => r.status === 'In Progress' || r.status === 'Under Review').length}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="text-blue-500 font-medium">⟳ Active</span>
                            <span className="ml-2">being processed</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-700">Resolved Cases</h2>
                            <div className="bg-green-100 p-2 rounded-full">
                                <MapPin className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {reports.filter(r => r.status === 'Completed').length}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="text-green-500 font-medium">↑ 8%</span>
                            <span className="ml-2">resolution rate</span>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reports..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedTimeFrame}
                                onChange={(e) => setSelectedTimeFrame(e.target.value)}
                            >
                                <option value="All">All Time</option>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                            </select>
                        </div>

                        <div>
                            <button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('All');
                                    setSelectedTimeFrame('All');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Incidents by Category */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Incidents by Category</h2>
                        <div className="h-80">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Incidents by Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Status Distribution</h2>
                        <div className="h-80">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={statusData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="value" name="Cases" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Reports Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Recent Reports</h2>
                        <p className="text-gray-500 text-sm mt-1">Showing {filteredReports.length} of {reports.length} total reports</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <AlertCircle className="h-12 w-12 mb-4" />
                            <p className="text-xl font-medium">No reports found</p>
                            <p className="mt-2">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{report.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {report.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {report.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex flex-col">
                                                    <span>{formatDate(report.timestamp)}</span>
                                                    <span className="text-gray-500 text-xs">{formatTime(report.timestamp)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={report.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReports.length}</span> of{' '}
                                    <span className="font-medium">{filteredReports.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        1
                                    </button>
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Analytics */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Geographic Distribution</h2>
                    <div className="h-64">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={locationData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 100,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="count" name="Reports" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 border-t border-gray-200 pt-8 pb-12">
                    <div className="text-center text-gray-500 text-sm">
                        <p>© 2025 GBV Reporting System. All rights reserved.</p>
                        <p className="mt-2">Version 1.0.0</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default Dashboard;