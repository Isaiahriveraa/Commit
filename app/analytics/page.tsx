"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, AlertTriangle } from "lucide-react";

export default function Analytics() {
  // Workload data per team member
  const workloadData = [
    { name: "Sarah C.", tasks: 8, hours: 32, label: "Sarah Chen" },
    { name: "Mike R.", tasks: 12, hours: 45, label: "Mike Ross" },
    { name: "Emma W.", tasks: 6, hours: 24, label: "Emma Wilson" },
    { name: "Alex K.", tasks: 10, hours: 38, label: "Alex Kim" },
    { name: "Jordan L.", tasks: 5, hours: 20, label: "Jordan Lee" },
    { name: "Taylor M.", tasks: 9, hours: 35, label: "Taylor Martinez" },
    { name: "Casey B.", tasks: 7, hours: 28, label: "Casey Brown" },
    { name: "Morgan D.", tasks: 11, hours: 42, label: "Morgan Davis" },
  ];

  // Task distribution by status
  const taskStatusData = [
    { name: "Completed", value: 34, color: "#10b981" },
    { name: "In Progress", value: 28, color: "#3b82f6" },
    { name: "Blocked", value: 8, color: "#ef4444" },
    { name: "Not Started", value: 18, color: "#6b7280" },
  ];

  // Weekly workload trend
  const weeklyTrend = [
    { week: "Week 1", hours: 180, tasks: 42 },
    { week: "Week 2", hours: 220, tasks: 56 },
    { week: "Week 3", hours: 265, tasks: 68 },
    { week: "Week 4", hours: 240, tasks: 62 },
  ];

  const stats = [
    { label: "Avg Hours/Person", value: "33.5", icon: Clock, color: "bg-blue-500", trend: "+5.2%" },
    { label: "Total Active Tasks", value: "88", icon: TrendingUp, color: "bg-green-500", trend: "+12%" },
    { label: "Team Members", value: "8", icon: Users, color: "bg-purple-500", trend: "0%" },
    { label: "At Risk Tasks", value: "8", icon: AlertTriangle, color: "bg-red-500", trend: "-3%" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workload Analytics</h1>
        <p className="text-gray-600 mt-2">Team capacity and task distribution insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.trend.startsWith("+") ? "text-green-600" : stat.trend.startsWith("-") ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Workload Histogram */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Workload Distribution (Hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Hours Allocated" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Count per Person */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Task Count by Team Member</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workloadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tasks" fill="#10b981" name="Active Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Workload Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Total Hours" />
            <Bar yAxisId="right" dataKey="tasks" fill="#8b5cf6" name="Total Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Member Details Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Team Workload Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Team Member</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Active Tasks</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Hours Allocated</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Capacity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((member, idx) => {
                const capacity = (member.hours / 40) * 100;
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{member.label}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{member.tasks}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{member.hours}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              capacity > 100 ? "bg-red-600" : capacity > 80 ? "bg-yellow-600" : "bg-green-600"
                            }`}
                            style={{ width: `${Math.min(capacity, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{capacity.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          capacity > 100
                            ? "bg-red-100 text-red-800"
                            : capacity > 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {capacity > 100 ? "Overloaded" : capacity > 80 ? "Near Capacity" : "Available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
