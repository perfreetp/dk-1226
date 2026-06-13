import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email, Contact, Task, Template, EmailStatus, EmailIntent } from '@/types';
import { mockEmails, mockContacts, mockTasks, mockTemplates } from '@/data/mockData';

interface MailStore {
  emails: Email[];
  contacts: Contact[];
  tasks: Task[];
  templates: Template[];
  selectedEmailId: string | null;
  selectedContactId: string | null;
  
  setSelectedEmail: (id: string | null) => void;
  setSelectedContact: (id: string | null) => void;
  
  getEmailById: (id: string) => Email | undefined;
  getContactById: (id: string) => Contact | undefined;
  getTasksByEmailId: (emailId: string) => Task[];
  
  updateEmailStatus: (id: string, status: EmailStatus) => void;
  
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  
  filterEmails: (status?: EmailStatus, intent?: EmailIntent) => Email[];
  searchEmails: (query: string) => Email[];
}

const loadPersistedData = () => {
  try {
    const storedEmails = localStorage.getItem('mailbox_emails');
    const storedTasks = localStorage.getItem('mailbox_tasks');
    
    const emails = storedEmails ? JSON.parse(storedEmails) : mockEmails;
    const tasks = storedTasks ? JSON.parse(storedTasks) : mockTasks;
    
    return { emails, tasks };
  } catch {
    return { emails: mockEmails, tasks: mockTasks };
  }
};

const saveEmailsToStorage = (emails: Email[]) => {
  try {
    localStorage.setItem('mailbox_emails', JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save emails:', e);
  }
};

const saveTasksToStorage = (tasks: Task[]) => {
  try {
    localStorage.setItem('mailbox_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
};

export const useMailStore = create<MailStore>((set, get) => {
  const initialData = loadPersistedData();
  
  return {
    emails: initialData.emails,
    contacts: mockContacts,
    tasks: initialData.tasks,
    templates: mockTemplates,
    selectedEmailId: null,
    selectedContactId: null,
    
    setSelectedEmail: (id) => set({ selectedEmailId: id }),
    setSelectedContact: (id) => set({ selectedContactId: id }),
    
    getEmailById: (id) => get().emails.find(e => e.id === id),
    getContactById: (id) => get().contacts.find(c => c.id === id),
    getTasksByEmailId: (emailId) => get().tasks.filter(t => t.emailId === emailId),
    
    updateEmailStatus: (id, status) => set(state => {
      const updatedEmails = state.emails.map(e => 
        e.id === id ? { 
          ...e, 
          status, 
          repliedAt: status === 'replied' ? new Date().toISOString() : e.repliedAt 
        } : e
      );
      saveEmailsToStorage(updatedEmails);
      return { emails: updatedEmails };
    }),
    
    addTask: (task) => set(state => {
      const newTask = { ...task, id: `task-${Date.now()}` };
      const updatedTasks = [...state.tasks, newTask];
      saveTasksToStorage(updatedTasks);
      return { tasks: updatedTasks };
    }),
    
    updateTaskStatus: (id, status) => set(state => {
      const updatedTasks = state.tasks.map(t => 
        t.id === id ? { 
          ...t, 
          status, 
          completedAt: status === 'completed' ? new Date().toISOString() : undefined 
        } : t
      );
      saveTasksToStorage(updatedTasks);
      return { tasks: updatedTasks };
    }),
    
    filterEmails: (status, intent) => {
      const { emails } = get();
      return emails.filter(email => {
        if (status && email.status !== status) return false;
        if (intent && email.intent !== intent) return false;
        return true;
      });
    },
    
    searchEmails: (query) => {
      const { emails, contacts } = get();
      const lowerQuery = query.toLowerCase();
      return emails.filter(email => {
        const contact = contacts.find(c => c.id === email.contactId);
        return (
          email.subject.toLowerCase().includes(lowerQuery) ||
          email.content.toLowerCase().includes(lowerQuery) ||
          contact?.name.toLowerCase().includes(lowerQuery) ||
          contact?.company.toLowerCase().includes(lowerQuery)
        );
      });
    },
  };
});
