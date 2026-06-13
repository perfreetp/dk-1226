import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useMailStore } from '@/store/mailStore';
import { Task, TaskStatus } from '@/types';
import { ClipboardList, Clock, Calendar, CheckCircle, PlayCircle, PauseCircle, Trash2, Plus, X, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const statusOptions: { value: TaskStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: 'pending', label: '待跟进', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { value: 'in_progress', label: '进行中', icon: PlayCircle, color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: '已完成', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
];

type ViewMode = 'all' | 'today' | 'overdue' | 'completed_today';
type TaskSubView = 'list' | 'overdue_list' | 'completed_list' | null;

export function TasksPage() {
  const { tasks, updateTaskStatus, addTask, updateTaskDeadline, setSelectedEmail, getEmailById } = useMailStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [taskSubView, setTaskSubView] = useState<TaskSubView>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const selectedTaskId = location.state?.selectedTaskId;
    if (selectedTaskId) {
      setHighlightedTaskId(selectedTaskId);
      setTimeout(() => setHighlightedTaskId(null), 3000);
    }
  }, [location.state]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  }, []);

  const todayStart = useMemo(() => {
    const date = new Date(today);
    return date;
  }, [today]);

  const todayEnd = useMemo(() => {
    const date = new Date(today);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [today]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline < todayStart && t.status !== 'completed';
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, todayStart]);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline >= todayStart && deadline <= todayEnd && t.status !== 'completed';
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, todayStart, todayEnd]);

  const completedTodayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.completedAt) return false;
      const completed = new Date(t.completedAt);
      return completed >= todayStart && completed <= todayEnd;
    }).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [tasks, todayStart, todayEnd]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    if (viewMode === 'today') {
      filtered = filtered.filter(t => {
        const deadline = new Date(t.deadline);
        return deadline >= todayStart && deadline <= todayEnd && t.status !== 'completed';
      });
    }
    
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    return filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, statusFilter, viewMode, todayStart, todayEnd]);

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (deadline: string, status: TaskStatus) => {
    const deadlineDate = new Date(deadline);
    return deadlineDate < todayStart && status !== 'completed';
  };

  const isToday = (deadline: string) => {
    return deadline.slice(0, 10) === today;
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        userId: 'user-1',
        emailId: 'email-new',
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        deadline: newTask.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reminderAt: newTask.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      });
      setNewTask({ title: '', description: '', deadline: '' });
      setShowAddTask(false);
    }
  };

  const handleExtendDeadline = (taskId: string, days: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newDeadline = new Date(task.deadline);
      newDeadline.setDate(newDeadline.getDate() + days);
      updateTaskDeadline(taskId, newDeadline.toISOString());
    }
  };

  const handleViewEmail = (emailId: string) => {
    if (emailId && emailId !== 'email-new') {
      setSelectedEmail(emailId);
      navigate('/');
    }
  };

  const renderTaskCard = (task: Task) => {
    const StatusIcon = statusOptions.find(s => s.value === task.status)?.icon || Clock;
    const statusColor = statusOptions.find(s => s.value === task.status)?.color || 'bg-gray-100 text-gray-600';
    const overdue = isOverdue(task.deadline, task.status);
    const today = isToday(task.deadline);
    const isHighlighted = highlightedTaskId === task.id;

    return (
      <div
        key={task.id}
        id={`task-${task.id}`}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md ${
          overdue ? 'border-l-4 border-red-500' : today ? 'border-l-4 border-amber-500' : ''
        } ${isHighlighted ? 'ring-4 ring-blue-500 bg-blue-50' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium text-gray-900">{task.title}</h4>
              {overdue && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  <AlertCircle className="w-3 h-3" />
                  已逾期
                </span>
              )}
              {today && !overdue && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                  <Clock className="w-3 h-3" />
                  今日
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">{task.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                截止: {formatDeadline(task.deadline)}
              </span>
              {task.emailId && task.emailId !== 'email-new' && (
                <button
                  onClick={() => handleViewEmail(task.emailId)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Mail className="w-4 h-4" />
                  查看关联邮件
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {task.status !== 'completed' && (
              <>
                <button
                  onClick={() => updateTaskStatus(task.id, 'completed')}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                  title="标记完成"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
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
              </>
            )}
            {task.status !== 'completed' && (
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-10 min-w-[140px]">
                  <button
                    onClick={() => handleExtendDeadline(task.id, 1)}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    延期到明天
                  </button>
                  <button
                    onClick={() => handleExtendDeadline(task.id, 7)}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    延期到下周
                  </button>
                </div>
              </div>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900">视图切换</span>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => { setViewMode('all'); setTaskSubView(null); }}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    viewMode === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5" />
                    <span>全部任务</span>
                    <span className="ml-auto text-sm opacity-60">{tasks.length}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setViewMode('today'); setTaskSubView('list'); }}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    viewMode === 'today' && taskSubView === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span>今日提醒</span>
                    {todayTasks.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {todayTasks.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setViewMode('overdue'); setTaskSubView('overdue_list'); }}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    taskSubView === 'overdue_list' ? 'bg-red-50 border-2 border-red-500' : 'bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">已逾期</span>
                    <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
                  </div>
                  {overdueTasks.length > 0 && (
                    <p className="text-xs text-red-600 truncate">{overdueTasks[0]?.title}</p>
                  )}
                </button>

                <button
                  onClick={() => { setViewMode('completed_today'); setTaskSubView('completed_list'); }}
                  className={`w-full rounded-lg p-3 transition-all duration-200 ${
                    taskSubView === 'completed_list' ? 'bg-green-50 border-2 border-green-500' : 'bg-green-50 hover:bg-green-100'
                  }`}
                >
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">今日完成</span>
                    <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{completedTodayTasks.length}</span>
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <p className="font-medium text-gray-900 mb-4">任务状态</p>
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
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  {taskSubView === 'overdue_list' ? '已逾期任务' : 
                   taskSubView === 'completed_list' ? '今日已完成' :
                   viewMode === 'today' ? '今日提醒' : '任务列表'}
                </h3>
                <span className="text-sm text-gray-500">
                  {taskSubView === 'overdue_list' ? overdueTasks.length :
                   taskSubView === 'completed_list' ? completedTodayTasks.length :
                   viewMode === 'today' ? todayTasks.length :
                   filteredTasks.length} 个任务
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {taskSubView === 'overdue_list' && overdueTasks.map(task => renderTaskCard(task))}
              {taskSubView === 'completed_list' && completedTodayTasks.map(task => renderTaskCard(task))}
              {taskSubView === 'list' && todayTasks.map(task => renderTaskCard(task))}
              {!taskSubView && filteredTasks.map(task => renderTaskCard(task))}

              {((taskSubView === 'overdue_list' && overdueTasks.length === 0) ||
                (taskSubView === 'completed_list' && completedTodayTasks.length === 0) ||
                (taskSubView === 'list' && todayTasks.length === 0) ||
                (!taskSubView && filteredTasks.length === 0)) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {taskSubView === 'overdue_list' ? '暂无逾期任务' :
                     taskSubView === 'completed_list' ? '今日暂无完成的任务' :
                     viewMode === 'today' ? '今日暂无待处理任务' : '暂无任务'}
                  </p>
                  {viewMode === 'all' && (
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="btn-primary mt-4"
                    >
                      创建第一个任务
                    </button>
                  )}
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
