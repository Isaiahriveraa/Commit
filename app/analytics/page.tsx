"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion, Variants } from "framer-motion";
import { Activity, AlertTriangle, ArrowUpRight, Calendar, Crown, LayoutDashboard, Loader2, TrendingUp } from "lucide-react";
import { getInitials } from "@/lib/utils";

// Avatar color palette - consistent colors based on name
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

/**
 * Generate a consistent color class based on the name
 * Uses a simple hash to always give the same person the same color
 */
function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50 }
  },
};

export default function Analytics() {
  const { metrics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-[var(--color-error)] mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load analytics</h2>
        <p className="text-[var(--color-text-secondary)]">{error || "No data available"}</p>
      </div>
    );
  }

  // Transform daily activity for chart (using last 14 days)
  // dailyActivity is ordered oldest→newest, so slice(-14) gets the most recent 14 days
  const activityTrendData = metrics.dailyActivity
    .slice(-14)
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      updates: d.count
    }));

  // Check if there's any activity data to display
  const hasActivityData = activityTrendData.some(d => d.updates > 0);

  // Calculate total activities from the chart data
  const totalActivities = activityTrendData.reduce((sum, d) => sum + d.updates, 0);

  // Efficiency Data for Radial Bar
  const efficiency = metrics.totalDeliverables > 0 ? Math.round((metrics.completedCount / metrics.totalDeliverables) * 100) : 0;
  const radialData = [
    { name: 'Completed', value: efficiency, fill: 'var(--color-primary)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track your team's performance and activity</p>
      </div>

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Top Row: KPI Cards (Veselty Style - Minimalist) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Total Deliverables</span>
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{metrics.totalDeliverables}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-400 text-xs">Total projects</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Active Tasks</span>
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                <Activity className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{metrics.inProgressCount}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] w-[60%] rounded-full"></div>
              </span>
              <span className="text-gray-400 text-xs whitespace-nowrap">Capacity</span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Updates (Week)</span>
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-orange-50 transition-colors">
                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{metrics.updatesThisWeek}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-400 text-xs">Recent activity</span>
            </div>
          </motion.div>

          {/* Card 4 - Efficiency Pulse */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="flex justify-between items-center h-full">
              <div>
                <span className="text-gray-500 text-sm font-medium block mb-1">Efficiency</span>
                <h3 className="text-3xl font-bold text-gray-900">{efficiency}%</h3>
                <span className="text-xs text-gray-400 mt-1 block">Completion rate</span>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-orange-100 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Chart - Veselty Style */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900">Activity</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">{totalActivities}</span>
                <span className="bg-orange-100 text-[var(--color-primary)] text-xs font-bold px-2 py-0.5 rounded">Total activities</span>
              </div>
            </div>

            <div className="h-[320px] w-full">
              {hasActivityData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      {/* Veselty Style: Diagonal stripes pattern */}
                      <pattern id="orangeStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#F97316" strokeWidth="2" strokeOpacity="0.15" />
                      </pattern>
                      {/* Gradient for depth */}
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const value = payload[0].value as number;
                          return (
                            <div className="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg">
                              <p className="text-gray-400 text-xs mb-1">{label}</p>
                              <p className="text-orange-400 font-bold text-lg">
                                {value} {value === 1 ? 'activity' : 'activities'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Gradient fill layer */}
                    <Area
                      type="monotone"
                      dataKey="updates"
                      stroke="transparent"
                      fillOpacity={1}
                      fill="url(#orangeGradient)"
                    />
                    {/* Stripes overlay + stroke */}
                    <Area
                      type="monotone"
                      dataKey="updates"
                      stroke="#F97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#orangeStripes)"
                      activeDot={{
                        r: 8,
                        strokeWidth: 4,
                        stroke: '#fff',
                        fill: '#F97316',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Activity className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No activity yet</p>
                  <p className="text-gray-400 text-sm mt-1">Updates will appear here as your team logs progress</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Efficiency Radial Chart */}
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Performance</h2>
              <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold">i</div>
            </div>

            <div className="w-full h-[250px] mt-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  barSize={20}
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: '#F3F4F6' }}
                    dataKey="value"
                    cornerRadius={10}
                    fill="var(--color-primary)" // Orange fill
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                <span className="text-4xl font-bold text-gray-900">{efficiency}%</span>
                <span className="text-xs text-gray-400 mt-2">Team Efficiency</span>
              </div>
            </div>

            <div className="w-full mt-auto pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-gray-500">Avg. Daily Output</span>
                <span className="font-bold text-gray-900">12 tasks</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row: Team Workload Reference Style */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Team Workload</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase rounded-l-lg">Team Member</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tasks</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase w-1/3">Capacity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {metrics.memberWorkloads.slice(0, 5).map((member, idx) => {
                  const load = Math.min((member.deliverableCount / 8) * 100, 100);
                  return (
                    <tr key={member.memberId} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full ${getAvatarColor(member.memberName)} flex items-center justify-center text-white font-semibold text-sm`}
                              title={member.memberName}
                            >
                              {getInitials(member.memberName)}
                            </div>
                            {idx === 0 && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border-2 border-white">
                                <Crown className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="font-medium text-gray-900">{member.memberName}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">{member.role}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{member.deliverableCount}</td>
                      <td className="py-4 px-4">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${load}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full rounded-full ${load > 85 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${load > 85 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {load > 85 ? 'Overloaded' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}