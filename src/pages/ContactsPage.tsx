import { useState } from 'react';
import { Header } from '@/components/Header';
import { useMailStore } from '@/store/mailStore';
import { Contact } from '@/types';
import { Users, Search, User, Building2, MailIcon, Phone, Tag, Mail, Clock, Edit2, Trash2, X } from 'lucide-react';

export function ContactsPage() {
  const { contacts, getEmailById } = useMailStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.company.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery)
    );
  });

  const getContactEmails = (contactId: string) => {
    return useMailStore.getState().emails.filter(e => e.contactId === contactId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="联系人详情" />
      
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">联系人列表</span>
              </div>
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索联系人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-auto scrollbar-thin">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedContact?.id === contact.id
                        ? 'bg-blue-50 ring-2 ring-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                      </div>
                    </div>
                    {contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            {selectedContact ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedContact.name}</h2>
                        <p className="text-gray-500">{selectedContact.position} | {selectedContact.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <MailIcon className="w-4 h-4" />
                      <span className="text-sm">邮箱</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedContact.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">电话</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedContact.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">公司</span>
                    </div>
                    <p className="text-sm text-gray-900">{selectedContact.company}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">标签</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedContact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    往来邮件记录
                  </h3>
                  <div className="space-y-3">
                    {getContactEmails(selectedContact.id).map((email) => {
                      const contact = getEmailById(email.id);
                      return (
                        <div
                          key={email.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{email.subject}</span>
                            <span className="text-xs text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(email.receivedAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{email.content}</p>
                        </div>
                      );
                    })}
                    {getContactEmails(selectedContact.id).length === 0 && (
                      <p className="text-center text-gray-400 py-8">暂无往来邮件</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-gray-400">
                <Users className="w-16 h-16 mb-4" />
                <p className="text-lg">请选择一个联系人查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">确认删除</h3>
                <p className="text-sm text-gray-500">此操作无法撤销</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="ml-auto p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">确定要删除联系人 {selectedContact?.name} 吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
