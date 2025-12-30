
import { StorageSchema, User, Guest, UserRole } from '../types';
import { INITIAL_STORAGE_KEY, DEFAULT_ADMIN } from '../constants';

const initializeStorage = (): StorageSchema => {
  const stored = localStorage.getItem(INITIAL_STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  const initial: StorageSchema = {
    users: [DEFAULT_ADMIN],
    guests: [
      {
        id: 'g1',
        userId: 'admin-001',
        name: 'John Doe',
        email: 'john@example.com',
        rsvpStatus: 'Confirmed',
        eventDate: '2024-12-25',
        group: 'Friends'
      }
    ]
  };
  localStorage.setItem(INITIAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const getDB = (): StorageSchema => initializeStorage();

export const saveDB = (db: StorageSchema) => {
  localStorage.setItem(INITIAL_STORAGE_KEY, JSON.stringify(db));
};

export const StorageService = {
  getUsers: () => getDB().users,
  
  addUser: (user: User & { passwordHash: string }) => {
    const db = getDB();
    db.users.push(user);
    saveDB(db);
  },

  getGuests: (userId: string, role: UserRole) => {
    const db = getDB();
    if (role === UserRole.ADMIN) return db.guests;
    return db.guests.filter(g => g.userId === userId);
  },

  addGuest: (guest: Guest) => {
    const db = getDB();
    db.guests.push(guest);
    saveDB(db);
  },

  deleteGuest: (guestId: string, userId: string, role: UserRole) => {
    const db = getDB();
    db.guests = db.guests.filter(g => {
      if (role === UserRole.ADMIN) return g.id !== guestId;
      return g.id !== guestId || g.userId !== userId;
    });
    saveDB(db);
  },

  updateGuestStatus: (guestId: string, status: Guest['rsvpStatus']) => {
    const db = getDB();
    const guest = db.guests.find(g => g.id === guestId);
    if (guest) {
      guest.rsvpStatus = status;
      saveDB(db);
    }
  }
};
