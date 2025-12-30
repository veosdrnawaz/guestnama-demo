import { User, Guest, UserRole, FinanceEntry, Task } from '../types';
import { BACKEND_URL } from '../constants';

const callBackend = async (action: string, payload: any = {}) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  } catch (error) {
    console.error(`Backend Error (${action}):`, error);
    throw error;
  }
};

export const StorageService = {
  getUsers: async (): Promise<(User & { passwordHash: string })[]> => {
    return await callBackend('getUsers') || [];
  },
  
  addUser: async (user: User & { passwordHash: string }) => {
    await callBackend('signup', user);
  },

  getGuests: async (userId: string, role: UserRole): Promise<Guest[]> => {
    const allGuests: Guest[] = await callBackend('getGuests') || [];
    if (role === UserRole.ADMIN) return allGuests;
    return allGuests.filter(g => g.userId === userId);
  },

  addGuest: async (guest: Guest) => {
    await callBackend('addGuest', guest);
  },

  deleteGuest: async (guestId: string) => {
    await callBackend('deleteGuest', { guestId });
  },

  updateGuestStatus: async (guestId: string, status: Guest['rsvpStatus']) => {
    await callBackend('updateGuestStatus', { guestId, status });
  },

  // Finance Methods
  getFinance: async (userId: string): Promise<FinanceEntry[]> => {
    const allFinance: FinanceEntry[] = await callBackend('getFinance') || [];
    return allFinance.filter(f => f.userId === userId);
  },

  addFinance: async (entry: FinanceEntry) => {
    await callBackend('addFinance', entry);
  },

  deleteFinance: async (financeId: string) => {
    await callBackend('deleteFinance', { financeId });
  },

  // Task Methods
  getTasks: async (userId: string): Promise<Task[]> => {
    const allTasks: Task[] = await callBackend('getTasks') || [];
    return allTasks.filter(t => t.userId === userId);
  },

  addTask: async (task: Task) => {
    await callBackend('addTask', task);
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    await callBackend('updateTask', { taskId, ...updates });
  },

  deleteTask: async (taskId: string) => {
    await callBackend('deleteTask', { taskId });
  }
};