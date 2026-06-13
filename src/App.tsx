import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { InboxPage } from '@/pages/InboxPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { ComposePage } from '@/pages/ComposePage';
import { TasksPage } from '@/pages/TasksPage';
import { StatisticsPage } from '@/pages/StatisticsPage';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<InboxPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactsPage />} />
            <Route path="/compose" element={<ComposePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
