import { SlidersHorizontal, Mail, MailOpen, Send, Clock } from 'lucide-react';
import { EmailStatus, EmailIntent } from '@/types';

interface FilterProps {
  status: EmailStatus | null;
  intent: EmailIntent | null;
  onStatusChange: (status: EmailStatus | null) => void;
  onIntentChange: (intent: EmailIntent | null) => void;
}

const statusOptions: { value: EmailStatus | null; label: string; icon: typeof Mail }[] = [
  { value: null, label: '全部', icon: Mail },
  { value: 'unread', label: '未读', icon: MailOpen },
  { value: 'read', label: '已读', icon: Mail },
  { value: 'replied', label: '已回复', icon: Send },
  { value: 'pending', label: '待跟进', icon: Clock },
];

const intentOptions: (EmailIntent | null)[] = [null, '咨询', '投诉', '报价', '催办', '其他'];

export function Filter({ status, intent, onStatusChange, onIntentChange }: FilterProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-700">筛选</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">状态</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = status === option.value;
              return (
                <button
                  key={option.value ?? 'all'}
                  onClick={() => onStatusChange(option.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">意图类型</p>
          <div className="flex flex-wrap gap-2">
            {intentOptions.map((option) => {
              const isActive = intent === option;
              const intentColors: Record<EmailIntent, string> = {
                咨询: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                投诉: 'bg-red-100 text-red-700 hover:bg-red-200',
                报价: 'bg-green-100 text-green-700 hover:bg-green-200',
                催办: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
                其他: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              };
              return (
                <button
                  key={option ?? 'all'}
                  onClick={() => onIntentChange(option)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : option
                      ? intentColors[option]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option || '全部'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
