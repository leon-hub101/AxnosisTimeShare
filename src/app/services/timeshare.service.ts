import { Injectable } from '@angular/core';
import { AdminUser, ViewerUser, TimeshareVenue, TimeshareSlotApplication } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TimeshareService {
  private venues: TimeshareVenue[] = [];
  private applications: TimeshareSlotApplication[] = [];

  // For testing
  constructor() {
    this.venues = [
      { id: 'venue1', name: 'Beach House', location: 'Cape Town', availableDates: [new Date('2025-08-10'), new Date('2025-08-11')] }
    ];
  }

  private restrictToAdmin(user: AdminUser | ViewerUser): asserts user is AdminUser {
    if (user.role !== 'admin') {
      throw new Error('Only admins can perform this action');
    }
  }

  addVenue(user: AdminUser, venue: Omit<TimeshareVenue, 'id'>): TimeshareVenue {
    this.restrictToAdmin(user);
    const newVenue: TimeshareVenue = {
      id: `venue-${this.venues.length + 1}`,
      ...venue
    };
    this.venues.push(newVenue);
    return newVenue;
  }

  deleteVenue(user: AdminUser, venueId: string): void {
    this.restrictToAdmin(user);
    this.venues = this.venues.filter(venue => venue.id !== venueId);
  }

  addAvailableDates(user: AdminUser, venueId: string, dates: Date[]): void {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = [...(venue.availableDates || []), ...dates];
    }
  }

  updateAvailableDates(user: AdminUser, venueId: string, dates: Date[]): void {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = dates;
    }
  }

  getVenues(): TimeshareVenue[] {
    return this.venues;
  }

  applyForSlot(user: ViewerUser, venueId: string, date: Date): TimeshareSlotApplication {
    const application: TimeshareSlotApplication = {
      id: `app-${this.applications.length + 1}`,
      userId: user.id,
      venueId,
      date,
      status: 'pending'
    };
    this.applications.push(application);
    return application;
  }

  updateApplicationStatus(user: AdminUser, applicationId: string, status: 'approved' | 'denied'): void {
    this.restrictToAdmin(user);
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
    }
  }

  getPendingApplications(): TimeshareSlotApplication[] {
    return this.applications.filter(app => app.status === 'pending');
  }
}
