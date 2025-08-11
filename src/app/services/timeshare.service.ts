import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AdminUser, ViewerUser, TimeshareVenue, TimeshareSlotApplication } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TimeshareService {
  private venues: TimeshareVenue[] = [];
  private applications: TimeshareSlotApplication[] = [];

  constructor() {
    this.loadVenues();
    this.loadApplications();
  }

  private async loadVenues() {
    const { value } = await Preferences.get({ key: 'venues' });
    this.venues = value ? JSON.parse(value) : [
      { id: 'venue1', name: 'Beach House', location: 'Cape Town', availableDates: ['2025-08-10', '2025-08-11'] }
    ];
  }

  private async saveVenues() {
    await Preferences.set({ key: 'venues', value: JSON.stringify(this.venues) });
  }

  private async loadApplications() {
    const { value } = await Preferences.get({ key: 'bookings' });
    this.applications = value ? JSON.parse(value) : [];
  }

  private async saveApplications() {
    await Preferences.set({ key: 'bookings', value: JSON.stringify(this.applications) });
  }

  private restrictToAdmin(user: AdminUser | ViewerUser): asserts user is AdminUser {
    if (user.role !== 'admin') {
      throw new Error('Only admins can perform this action');
    }
  }

  addVenue(user: AdminUser, venue: Omit<TimeshareVenue, 'id'>): TimeshareVenue {
    this.restrictToAdmin(user);
    const newVenue: TimeshareVenue = {
      id: `venue-${Date.now()}`,
      ...venue
    };
    this.venues.push(newVenue);
    this.saveVenues();
    return newVenue;
  }

  deleteVenue(user: AdminUser, venueId: string): void {
    this.restrictToAdmin(user);
    this.venues = this.venues.filter(venue => venue.id !== venueId);
    this.saveVenues();
  }

  addAvailableDates(user: AdminUser, venueId: string, dates: Date[]): void {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = [...(venue.availableDates || []), ...dates.map(d => d.toISOString().split('T')[0])];
      this.saveVenues();
    }
  }

  updateAvailableDates(user: AdminUser, venueId: string, dates: Date[]): void {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = dates.map(d => d.toISOString().split('T')[0]);
      this.saveVenues();
    }
  }

  getVenues(): TimeshareVenue[] {
    return this.venues;
  }

  applyForSlot(user: ViewerUser, venueId: string, date: Date): TimeshareSlotApplication {
    const application: TimeshareSlotApplication = {
      id: `app-${Date.now()}`,
      userId: user.id,
      venueId,
      date: date.toISOString().split('T')[0],
      status: 'pending'
    };
    this.applications.push(application);
    this.saveApplications();
    return application;
  }

  updateApplicationStatus(user: AdminUser, applicationId: string, status: 'approved' | 'denied'): void {
    this.restrictToAdmin(user);
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
      this.saveApplications();
    }
  }

  getPendingApplications(): TimeshareSlotApplication[] {
    return this.applications.filter(app => app.status === 'pending');
  }
}