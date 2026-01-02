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
        <h1 className="text-3xl font-bold text-[#E4E6EB]">Workload Analytics</h1>
        <p className="text-[#9BA3AF] mt-2">Team capacity and task distribution insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.trend.startsWith("+") ? "text-green-400" : stat.trend.startsWith("-") ? "text-red-400" : "text-[#9BA3AF]"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm text-[#9BA3AF]">{stat.label}</p>
              <p className="text-3xl font-bold text-[#E4E6EB] mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Workload Histogram */}
        <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all">
          <h2 className="text-xl font-bold text-[#E4E6EB] mb-6">Workload Distribution (Hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242938" />
              <XAxis dataKey="name" stroke="#9BA3AF" />
              <YAxis stroke="#9BA3AF" />
              <Tooltip cursor={{ fill: '#242938', opacity: 0.4 }} contentStyle={{ backgroundColor: '#141824', border: '1px solid #242938', borderRadius: '8px', color: '#E4E6EB' }} labelStyle={{ color: '#E4E6EB' }} itemStyle={{ color: '#9BA3AF' }} />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Hours Allocated" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all">
          <h2 className="text-xl font-bold text-[#E4E6EB] mb-6">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#141824', border: '1px solid #242938', borderRadius: '8px', color: '#E4E6EB' }} labelStyle={{ color: '#E4E6EB' }} itemStyle={{ color: '#9BA3AF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Count per Person */}
      <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 mb-6 hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all">
        <h2 className="text-xl font-bold text-[#E4E6EB] mb-6">Task Count by Team Member</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workloadData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242938" />
            <XAxis dataKey="name" stroke="#9BA3AF" />
            <YAxis stroke="#9BA3AF" />
            <Tooltip cursor={{ fill: '#242938', opacity: 0.4 }} contentStyle={{ backgroundColor: '#141824', border: '1px solid #242938', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="tasks" fill="#10b981" name="Active Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend */}
      <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] transition-all">
        <h2 className="text-xl font-bold text-[#E4E6EB] mb-6">Weekly Workload Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242938" />
            <XAxis dataKey="week" stroke="#9BA3AF" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
            <Tooltip cursor={{ fill: '#242938', opacity: 0.4 }} contentStyle={{ backgroundColor: '#141824', border: '1px solid #242938', borderRadius: '8px' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Total Hours" />
            <Bar yAxisId="right" dataKey="tasks" fill="#8b5cf6" name="Total Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Member Details Table */}
      <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 mt-6 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all">
        <h2 className="text-xl font-bold text-[#E4E6EB] mb-4">Team Workload Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#242938]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#E4E6EB]">Team Member</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#E4E6EB]">Active Tasks</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#E4E6EB]">Hours Allocated</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#E4E6EB]">Capacity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#E4E6EB]">Status</th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((member, idx) => {
                const capacity = (member.hours / 40) * 100;
                return (
                  <tr key={idx} className="border-b border-[#242938] hover:bg-[#1A1F2E] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#E4E6EB]">{member.label}</td>
                    <td className="py-3 px-4 text-sm text-[#9BA3AF]">{member.tasks}</td>
                    <td className="py-3 px-4 text-sm text-[#9BA3AF]">{member.hours}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#1A1F2E] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              capacity > 100 ? "bg-red-500" : capacity > 80 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(capacity, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#9BA3AF]">{capacity.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          capacity > 100
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : capacity > 80
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
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
