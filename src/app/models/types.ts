export type Role = 'admin' | 'viewer';

export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: Role;
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
    availableDates: Date[];
}

export interface TimeshareSlotApplication {
    id: string;
    venueId: string;
    userId: string;
    date: Date;
    status: 'pending' | 'approved' | 'denied';
}