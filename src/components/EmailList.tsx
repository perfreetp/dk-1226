import { Mail, Clock, ChevronRight } from 'lucide-react';
import { Email, EmailStatus, EmailIntent } from '@/types';
import { useMailStore } from '@/store/mailStore';

interface EmailListProps {
  emails: Email[];
  onSelect: (email: Email) => void;
  selectedId: string | null;
}

const intentColors: Record<EmailIntent, string> = {
  咨询: 'bg-blue-100 text-blue-700',
  投诉: 'bg-red-100 text-red-700',
  报价: 'bg-green-100 text-green-700',
  催办: 'bg-orange-100 text-orange-700',
  其他: 'bg-gray-100 text-gray-600',
};

const intentLabels: Record<EmailIntent, string> = {
  咨询: '咨询',
  投诉: '投诉',
  报价: '报价',
  催办: '催办',
  其他: '其他',
};

const statusColors: Record<EmailStatus, string> = {
  unread: 'bg-white border-l-4 border-blue-500',
  read: 'bg-gray-50 border-l-4 border-transparent',
  replied: 'bg-gray-50 border-l-4 border-green-500',
  pending: 'bg-amber-50 border-l-4 border-amber-500',
};

export function EmailList({ emails, onSelect, selectedId }: EmailListProps) {
  const { getContactById } = useMailStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return '昨天';
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-2">
      {emails.map((email) => {
        const contact = getContactById(email.contactId);
        const isSelected = selectedId === email.id;

        return (
          <div
            key={email.id}
            onClick={() => onSelect(email)}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            } ${statusColors[email.status]}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {contact?.name || '未知发件人'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${intentColors[email.intent]}`}>
                    {intentLabels[email.intent]}
                  </span>
                  {email.status === 'unread' && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>

                <h3 className="font-medium text-gray-900 truncate mb-1">
                  {email.subject}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {email.content}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(email.receivedAt)}
                  </span>
                  <span>{contact?.company}</span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        );
      })}

      {emails.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无邮件</p>
        </div>
      )}
    </div>
  );
}
