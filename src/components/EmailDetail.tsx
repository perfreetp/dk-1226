import { Mail, User, Building2, Phone, MailIcon, Calendar, DollarSign, Package, Tag, Clock, Send, FileEdit, CheckCircle } from 'lucide-react';
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

export function EmailDetail({ email }: EmailDetailProps) {
  const { getContactById, updateEmailStatus, addTask, setSelectedContact } = useMailStore();
  const navigate = useNavigate();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  const contact = getContactById(email.contactId);

  if (!contact) return null;

  const handleMarkAsRead = () => {
    if (email.status === 'unread') {
      updateEmailStatus(email.id, 'read');
      localStorage.setItem(`email_${email.id}_status`, 'read');
    }
  };

  const handleReply = () => {
    navigate('/compose', { state: { email } });
  };

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      const deadline = taskDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
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

  const entities = email.entities;

  const getSuggestedReminderTime = () => {
    const now = new Date();
    const reminderDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return reminderDate.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{email.subject}</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${intentColors[email.intent]}`}>
            {email.intent} ({Math.round(email.confidence * 100)}%)
          </span>
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
            onClick={() => setShowAddTask(true)}
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
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="任务标题"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 input-field"
            />
            <input
              type="datetime-local"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              className="input-field"
              min={new Date().toISOString().slice(0, 16)}
            />
            <button onClick={handleAddTask} className="btn-primary">
              添加
            </button>
            <button onClick={() => {
              setShowAddTask(false);
              setTaskDeadline('');
            }} className="btn-secondary">
              取消
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            建议提醒时间：{getSuggestedReminderTime().replace('T', ' ')} (3天后)
          </p>
        </div>
      )}
    </div>
  );
}
