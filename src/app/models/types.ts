export type Role = 'admin' | 'viewer';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface ViewerUser extends User {
  role: 'viewer';
}

export interface TimeshareVenue {
  id: string;
  name: string;
  location: string;
  availableDates: string[];
  link: string; 
  description: string; 
}

export interface TimeshareSlotApplication {
  id: string;
  userId: string;
  venueId: string;
  date: string;
  status: 'pending' | 'approved' | 'denied';
}