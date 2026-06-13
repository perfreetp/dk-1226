import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EmailList } from '@/components/EmailList';
import { EmailDetail } from '@/components/EmailDetail';
import { Filter } from '@/components/Filter';
import { useMailStore } from '@/store/mailStore';
import { Email, EmailStatus, EmailIntent, ApprovalStatus } from '@/types';
import { Mail, AlertCircle, Clock } from 'lucide-react';

export function InboxPage() {
  const { emails, setSelectedEmail, selectedEmailId, getEmailById, updateEmailStatus } = useMailStore();
  const [statusFilter, setStatusFilter] = useState<EmailStatus | null>(null);
  const [intentFilter, setIntentFilter] = useState<EmailIntent | null>(null);
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | null>(null);
  const [selectedEmail, setSelectedEmailLocal] = useState<Email | null>(null);

  const filteredEmails = emails.filter(email => {
    if (statusFilter && email.status !== statusFilter) return false;
    if (intentFilter && email.intent !== intentFilter) return false;
    if (approvalFilter && email.approvalStatus !== approvalFilter) return false;
    return true;
  });

  useEffect(() => {
    if (selectedEmailId) {
      const email = getEmailById(selectedEmailId);
      if (email) {
        setSelectedEmailLocal(email);
        if (email.status === 'unread') {
          updateEmailStatus(email.id, 'read');
        }
      }
    } else {
      setSelectedEmailLocal(null);
    }
  }, [selectedEmailId, getEmailById, updateEmailStatus]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email.id);
  };

  const unreadCount = emails.filter(e => e.status === 'unread').length;
  const pendingCount = emails.filter(e => e.status === 'pending').length;
  const pendingApprovalCount = emails.filter(e => e.approvalStatus === 'pending').length;
  const rejectedCount = emails.filter(e => e.approvalStatus === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="收件箱分析" />
      
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
                    <p className="text-xs text-gray-500">总邮件</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                    <p className="text-xs text-gray-500">待跟进</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">审批状态</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setApprovalFilter(approvalFilter === 'pending' ? null : 'pending')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    approvalFilter === 'pending' ? 'bg-amber-50 border-2 border-amber-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">待审批</span>
                  </div>
                  <span className={`text-sm font-medium ${approvalFilter === 'pending' ? 'text-amber-700' : 'text-gray-600'}`}>{pendingApprovalCount}</span>
                </button>
                <button
                  onClick={() => setApprovalFilter(approvalFilter === 'rejected' ? null : 'rejected')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    approvalFilter === 'rejected' ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">已驳回</span>
                  </div>
                  <span className={`text-sm font-medium ${approvalFilter === 'rejected' ? 'text-red-700' : 'text-gray-600'}`}>{rejectedCount}</span>
                </button>
                <button
                  onClick={() => setApprovalFilter(approvalFilter === 'approved' ? null : 'approved')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    approvalFilter === 'approved' ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">已通过</span>
                  </div>
                  <span className={`text-sm font-medium ${approvalFilter === 'approved' ? 'text-green-700' : 'text-gray-600'}`}>
                    {emails.filter(e => e.approvalStatus === 'approved').length}
                  </span>
                </button>
              </div>
            </div>

            <Filter
              status={statusFilter}
              intent={intentFilter}
              onStatusChange={setStatusFilter}
              onIntentChange={setIntentFilter}
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  邮件列表
                  {approvalFilter && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {approvalFilter === 'pending' ? '待审批' : approvalFilter === 'rejected' ? '已驳回' : '已通过'}
                    </span>
                  )}
                </h3>
                <span className="text-sm text-gray-500">{filteredEmails.length} 封邮件</span>
              </div>
            </div>

            <div className="max-h-[calc(100vh-320px)] overflow-auto scrollbar-thin pr-2">
              <EmailList
                emails={filteredEmails}
                onSelect={handleSelectEmail}
                selectedId={selectedEmailId}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            {selectedEmail ? (
              <div className="h-[calc(100vh-200px)]">
                <EmailDetail email={selectedEmail} />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-gray-400">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="text-lg">请选择一封邮件查看详情</p>
                {unreadCount > 0 && (
                  <p className="text-sm mt-2">您有 {unreadCount} 封未读邮件</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
