import { UserRole } from './types';

export const APP_NAME = "GuestNama";

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
export const BACKEND_URL = "https://script.google.com/macros/s/AKfycbx1ZCGSGG4bmzbio-7BHJJ_7UCc6LZiDH3ZqooB3B2zIBoOnLcv1N6bu5FFqqQTlj3zzQ/exec";

export const INITIAL_STORAGE_KEY = "guestnama_db_v1";

export const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@guestnama.com',
  name: 'System Administrator',
  role: UserRole.ADMIN,
  passwordHash: 'YWRtaW4xMjM=', // b64 of 'admin123'
  createdAt: new Date('2024-01-01').toISOString()
};

export const GUEST_GROUPS = ['Family', 'Friends', 'Colleagues', 'Other'] as const;
export const RSVP_STATUSES = ['Pending', 'Confirmed', 'Declined'] as const;