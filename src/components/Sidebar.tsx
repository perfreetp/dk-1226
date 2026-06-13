import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Users, FileEdit, ClipboardList, BarChart3, Sparkles } from 'lucide-react';

const menuItems = [
  { icon: Mail, path: '/', label: '收件箱分析' },
  { icon: Users, path: '/contacts', label: '联系人' },
  { icon: FileEdit, path: '/compose', label: '智能写信' },
  { icon: ClipboardList, path: '/tasks', label: '跟进任务' },
  { icon: BarChart3, path: '/statistics', label: '统计概览' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">AI邮件助手</h1>
            <p className="text-xs text-gray-500">智能高效处理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900">AI助手已就绪</p>
          <p className="text-xs text-gray-500 mt-1">支持智能分析和自动回复</p>
        </div>
      </div>
    </aside>
  );
}
