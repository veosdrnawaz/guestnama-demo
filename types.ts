export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Guest {
  id: string;
  userId: string;
  name: string;
  email: string;
  rsvpStatus: 'Pending' | 'Confirmed' | 'Declined';
  checkedIn: boolean;
  eventDate: string;
  group: 'Family' | 'Friends' | 'Colleagues' | 'Other';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface StorageSchema {
  users: (User & { passwordHash: string })[];
  guests: Guest[];
}