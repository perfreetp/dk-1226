import { useState } from 'react';
import { Header } from '@/components/Header';
import { mockStatistics } from '@/data/mockData';
import { BarChart3, Mail, Clock, TrendingUp, Target, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const totalEmails = mockStatistics.reduce((sum, stat) => sum + stat.totalEmails, 0);
  const repliedEmails = mockStatistics.reduce((sum, stat) => sum + stat.repliedEmails, 0);
  const avgResponseTime = Math.round(mockStatistics.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / mockStatistics.length * 10) / 10;
  const convertedLeads = mockStatistics.reduce((sum, stat) => sum + stat.convertedLeads, 0);
  const responseRate = Math.round((repliedEmails / totalEmails) * 100);

  const chartData = mockStatistics.map((stat) => ({
    date: stat.date.slice(5),
    total: stat.totalEmails,
    replied: stat.repliedEmails,
    pending: stat.pendingEmails,
    responseTime: stat.avgResponseTime,
    leads: stat.convertedLeads,
  }));

  const intentDistribution = [
    { name: '咨询', value: 45, color: '#3b82f6' },
    { name: '报价', value: 30, color: '#22c55e' },
    { name: '投诉', value: 15, color: '#ef4444' },
    { name: '催办', value: 25, color: '#f97316' },
    { name: '其他', value: 10, color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="统计概览" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              数据分析
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeRange === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeRange === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              本月
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalEmails}</p>
              <p className="text-sm text-gray-500 mt-1">总邮件数</p>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +8%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{responseRate}%</p>
              <p className="text-sm text-gray-500 mt-1">响应率</p>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  -5%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{avgResponseTime}h</p>
              <p className="text-sm text-gray-500 mt-1">平均响应时长</p>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +15%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{convertedLeads}</p>
              <p className="text-sm text-gray-500 mt-1">成交线索</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                邮件数量趋势
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="总邮件" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="replied" name="已回复" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" name="待处理" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-6">意图分布</h3>
              <div className="space-y-4">
                {intentDistribution.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-6">响应时长统计</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="responseTime" name="平均响应时长(h)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-6">成交线索趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="leads" name="成交线索" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
