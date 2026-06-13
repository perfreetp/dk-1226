import { useState } from 'react';
import { Header } from '@/components/Header';
import { useMailStore } from '@/store/mailStore';
import { Task, TaskStatus } from '@/types';
import { ClipboardList, Clock, Calendar, CheckCircle, PlayCircle, PauseCircle, Trash2, Plus, X, AlertCircle } from 'lucide-react';

const statusOptions: { value: TaskStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: 'pending', label: '待跟进', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { value: 'in_progress', label: '进行中', icon: PlayCircle, color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: '已完成', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
];

export function TasksPage() {
  const { tasks, updateTaskStatus, addTask } = useMailStore();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });

  const filteredTasks = tasks.filter(task => {
    if (statusFilter && task.status !== statusFilter) return false;
    return true;
  });

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        userId: 'user-1',
        emailId: 'email-1',
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        deadline: newTask.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reminderAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setNewTask({ title: '', description: '', deadline: '' });
      setShowAddTask(false);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="跟进任务" />
      
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-xs text-gray-500">待跟进</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                <p className="text-xs text-gray-500">进行中</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900">任务状态</span>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增
                </button>
              </div>

              <div className="space-y-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = statusFilter === option.value;
                  const count = tasks.filter(t => t.status === option.value).length;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(isActive ? null : option.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${option.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{option.label}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  任务列表
                </h3>
                <span className="text-sm text-gray-500">{filteredTasks.length} 个任务</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const StatusIcon = statusOptions.find(s => s.value === task.status)?.icon || Clock;
                const statusColor = statusOptions.find(s => s.value === task.status)?.color || 'bg-gray-100 text-gray-600';

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md ${
                      isOverdue(task.deadline) && task.status !== 'completed' ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          {isOverdue(task.deadline) && task.status !== 'completed' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                              <AlertCircle className="w-3 h-3" />
                              已逾期
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{task.description}</p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            截止: {formatDeadline(task.deadline)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="标记完成"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="开始处理"
                          >
                            <PlayCircle className="w-5 h-5" />
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'pending')}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="暂停处理"
                          >
                            <PauseCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusOptions.find(s => s.value === task.status)?.label}
                      </div>
                      <span className="text-xs text-gray-400">
                        创建于 {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无任务</p>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="btn-primary mt-4"
                  >
                    创建第一个任务
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">新建任务</h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                  placeholder="输入任务标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="输入任务描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
