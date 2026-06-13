import { create } from 'zustand';
import { Email, Contact, Task, Template, EmailStatus, EmailIntent, ApprovalStatus, ApprovalRecord } from '@/types';
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
  getTasksForEmail: (emailId: string) => Task[];
  
  updateEmailStatus: (id: string, status: EmailStatus) => void;
  updateEmailApprovalStatus: (id: string, status: ApprovalStatus, rejectReason?: string) => void;
  submitForApproval: (id: string, content: string) => void;
  
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  updateTaskDeadline: (id: string, deadline: string) => void;
  
  filterEmails: (status?: EmailStatus, intent?: EmailIntent, approvalStatus?: ApprovalStatus) => Email[];
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

const currentUser = {
  id: 'user-1',
  name: '张三',
};

const mockReviewers = [
  { id: 'user-2', name: '李经理' },
  { id: 'user-3', name: '王总监' },
];

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
    
    getTasksForEmail: (emailId) => {
      return get().tasks.filter(t => t.emailId === emailId);
    },
    
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
    
    updateEmailApprovalStatus: (id, status, rejectReason) => set(state => {
      const updatedEmails: Email[] = state.emails.map(e => {
        if (e.id !== id) return e;
        
        const reviewer = mockReviewers[Math.floor(Math.random() * mockReviewers.length)];
        
        if (status === 'rejected') {
          const newRecord: ApprovalRecord = {
            id: `approval-${Date.now()}`,
            emailId: id,
            submitterId: currentUser.id,
            submitterName: currentUser.name,
            status: 'rejected',
            submittedAt: e.approvalHistory.length > 0 
              ? e.approvalHistory[e.approvalHistory.length - 1].submittedAt 
              : new Date().toISOString(),
            reviewedAt: new Date().toISOString(),
            reviewerId: reviewer.id,
            reviewerName: reviewer.name,
            rejectReason: rejectReason || '内容需要修改',
          };
          
          return {
            ...e,
            approvalStatus: 'rejected' as ApprovalStatus,
            approvalHistory: [...e.approvalHistory, newRecord],
          };
        }
        
        if (status === 'approved') {
          const lastRecord = e.approvalHistory.length > 0 
            ? e.approvalHistory[e.approvalHistory.length - 1]
            : null;
          
          const newRecord: ApprovalRecord = {
            id: `approval-${Date.now()}`,
            emailId: id,
            submitterId: currentUser.id,
            submitterName: currentUser.name,
            status: 'approved',
            submittedAt: lastRecord?.submittedAt || new Date().toISOString(),
            reviewedAt: new Date().toISOString(),
            reviewerId: reviewer.id,
            reviewerName: reviewer.name,
          };
          
          return {
            ...e,
            approvalStatus: 'approved' as ApprovalStatus,
            approvalHistory: [...e.approvalHistory, newRecord],
          };
        }
        
        return { ...e, approvalStatus: status };
      });
      
      saveEmailsToStorage(updatedEmails);
      return { emails: updatedEmails };
    }),
    
    submitForApproval: (id, content) => set(state => {
      const updatedEmails: Email[] = state.emails.map(e => {
        if (e.id !== id) return e;
        
        const newRecord: ApprovalRecord = {
          id: `approval-${Date.now()}`,
          emailId: id,
          submitterId: currentUser.id,
          submitterName: currentUser.name,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          content,
        };
        
        return {
          ...e,
          approvalStatus: 'pending' as ApprovalStatus,
          approvalHistory: [...e.approvalHistory, newRecord],
        };
      });
      
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
    
    updateTaskDeadline: (id, deadline) => set(state => {
      const updatedTasks = state.tasks.map(t => 
        t.id === id ? { ...t, deadline, reminderAt: deadline } : t
      );
      saveTasksToStorage(updatedTasks);
      return { tasks: updatedTasks };
    }),
    
    filterEmails: (status, intent, approvalStatus) => {
      const { emails } = get();
      return emails.filter(email => {
        if (status && email.status !== status) return false;
        if (intent && email.intent !== intent) return false;
        if (approvalStatus && email.approvalStatus !== approvalStatus) return false;
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
