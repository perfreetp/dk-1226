import { Mail, User, Building2, Phone, MailIcon, Calendar, DollarSign, Package, Tag, Clock, Send, FileEdit, CheckCircle, ChevronRight, AlertTriangle, History } from 'lucide-react';
import { Email, EmailIntent } from '@/types';
import { useMailStore } from '@/store/mailStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface EmailDetailProps {
  email: Email;
}

const intentColors: Record<EmailIntent, string> = {
  咨询: 'bg-blue-100 text-blue-700',
  投诉: 'bg-red-100 text-red-700',
  报价: 'bg-green-100 text-green-700',
  催办: 'bg-orange-100 text-orange-700',
  其他: 'bg-gray-100 text-gray-600',
};

const approvalStatusConfig = {
  none: { label: '无需审批', color: 'bg-gray-100 text-gray-600', icon: null },
  pending: { label: '审批中', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export function EmailDetail({ email }: EmailDetailProps) {
  const { getContactById, updateEmailStatus, addTask, setSelectedContact, getTasksForEmail } = useMailStore();
  const navigate = useNavigate();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  const contact = getContactById(email.contactId);
  const relatedTasks = getTasksForEmail(email.id);
  const approvalConfig = approvalStatusConfig[email.approvalStatus];

  if (!contact) return null;

  const getSuggestedReminderTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 3);
    now.setHours(10, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  };

  const handleMarkAsRead = () => {
    if (email.status === 'unread') {
      updateEmailStatus(email.id, 'read');
    }
  };

  const handleReply = () => {
    navigate('/compose', { state: { email } });
  };

  const handleShowAddTask = () => {
    setTaskTitle(`跟进: ${email.subject}`);
    setTaskDeadline(getSuggestedReminderTime());
    setShowAddTask(true);
  };

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      const deadline = taskDeadline || getSuggestedReminderTime();
      addTask({
        userId: email.userId,
        emailId: email.id,
        title: taskTitle,
        description: `关联邮件: ${email.subject}`,
        status: 'pending',
        deadline: deadline,
        reminderAt: deadline,
        createdAt: new Date().toISOString(),
      });
      setTaskTitle('');
      setTaskDeadline('');
      setShowAddTask(false);
    }
  };

  const handleViewContact = () => {
    setSelectedContact(contact.id);
    navigate('/contacts');
  };

  const handleViewEmail = (emailId: string) => {
    navigate('/');
    setTimeout(() => {
      const emailEl = document.querySelector(`[data-email-id="${emailId}"]`);
      if (emailEl) {
        emailEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleViewTask = (taskId: string) => {
    navigate('/tasks', { state: { selectedTaskId: taskId } });
  };

  const entities = email.entities;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{email.subject}</h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${intentColors[email.intent]}`}>
              {email.intent} ({Math.round(email.confidence * 100)}%)
            </span>
            {email.approvalStatus !== 'none' && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${approvalConfig.color}`}>
                {approvalConfig.icon && <approvalConfig.icon className="w-4 h-4" />}
                {approvalConfig.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span 
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer" 
                onClick={handleViewContact}
              >
                {contact.name}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">{contact.position}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {contact.company}
              </span>
              <span className="flex items-center gap-1">
                <MailIcon className="w-4 h-4" />
                {contact.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {contact.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(email.receivedAt).toLocaleString('zh-CN')}
          </span>
          {email.repliedAt && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              已回复: {new Date(email.repliedAt).toLocaleString('zh-CN')}
            </span>
          )}
        </div>
      </div>

      {email.approvalHistory.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => setShowApprovalHistory(!showApprovalHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <History className="w-4 h-4" />
              <span className="font-medium">审批记录</span>
              <span className="text-sm text-gray-500">共 {email.approvalHistory.length} 条</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showApprovalHistory ? 'rotate-90' : ''}`} />
          </button>

          {showApprovalHistory && (
            <div className="mt-4 space-y-3">
              {email.approvalHistory.map((record, index) => (
                <div key={record.id} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        record.status === 'approved' ? 'bg-green-100 text-green-700' :
                        record.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status === 'approved' ? '已通过' : record.status === 'rejected' ? '已驳回' : '待审批'}
                      </span>
                      <span className="text-sm text-gray-500">
                        第 {email.approvalHistory.length - index} 轮
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(record.submittedAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>提交人: {record.submitterName}</p>
                    {record.reviewerName && <p>审批人: {record.reviewerName}</p>}
                    {record.reviewedAt && <p>审批时间: {new Date(record.reviewedAt).toLocaleString('zh-CN')}</p>}
                    {record.rejectReason && (
                      <p className="text-red-600">驳回原因: {record.rejectReason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {relatedTasks.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            关联跟进任务 ({relatedTasks.length})
          </h3>
          <div className="space-y-2">
            {relatedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleViewTask(task.id)}
                className="bg-white rounded-lg p-3 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status === 'completed' ? '已完成' : task.status === 'in_progress' ? '进行中' : '待跟进'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{task.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(task.deadline).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(entities).some(key => entities[key as keyof typeof entities] !== null) && (
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            AI识别关键信息
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {entities.customerName && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="w-3 h-3" />
                  客户名称
                </div>
                <p className="font-medium text-gray-900">{entities.customerName}</p>
              </div>
            )}
            {entities.product && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Package className="w-3 h-3" />
                  产品
                </div>
                <p className="font-medium text-gray-900">{entities.product}</p>
              </div>
            )}
            {entities.amount && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <DollarSign className="w-3 h-3" />
                  金额
                </div>
                <p className="font-medium text-gray-900">{entities.amount.toLocaleString()} 元</p>
              </div>
            )}
            {entities.deadline && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  截止日期
                </div>
                <p className="font-medium text-gray-900">{entities.deadline}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">{email.content}</pre>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAsRead}
            className="btn-secondary flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            标记已读
          </button>
          <button
            onClick={handleShowAddTask}
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            设置跟进
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReply}
            className="btn-outline flex items-center gap-2"
          >
            <FileEdit className="w-4 h-4" />
            智能回复
          </button>
          <button
            onClick={handleReply}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            立即回复
          </button>
        </div>
      </div>

      {showAddTask && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="input-field"
                placeholder="输入任务标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">提醒时间</label>
              <input
                type="datetime-local"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="input-field"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <button onClick={handleAddTask} className="btn-primary">
              添加
            </button>
            <button onClick={() => {
              setShowAddTask(false);
              setTaskTitle('');
              setTaskDeadline('');
            }} className="btn-secondary">
              取消
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            建议提醒时间：{getSuggestedReminderTime().replace('T', ' ')} (3天后上午10:00)
          </p>
        </div>
      )}
    </div>
  );
}
