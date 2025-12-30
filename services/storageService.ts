import { User, Guest, UserRole } from '../types';
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
  }
};