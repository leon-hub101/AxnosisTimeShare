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
    this.init();
  }

  private async init() {
    await Promise.all([this.loadVenues(), this.loadApplications()]);
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

  async addVenue(user: AdminUser, venue: Omit<TimeshareVenue, 'id'>): Promise<TimeshareVenue> {
    this.restrictToAdmin(user);
    const newVenue: TimeshareVenue = {
      id: `venue-${Date.now()}`,
      ...venue
    };
    this.venues.push(newVenue);
    await this.saveVenues();
    return newVenue;
  }

  async deleteVenue(user: AdminUser, venueId: string): Promise<void> {
    this.restrictToAdmin(user);
    this.venues = this.venues.filter(venue => venue.id !== venueId);
    await this.saveVenues();
  }

  async addAvailableDates(user: AdminUser, venueId: string, dates: string[]): Promise<void> {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = [...(venue.availableDates || []), ...dates];
      await this.saveVenues();
    } else {
      throw new Error('Venue not found');
    }
  }

  async updateAvailableDates(user: AdminUser, venueId: string, dates: string[]): Promise<void> {
    this.restrictToAdmin(user);
    const venue = this.venues.find(v => v.id === venueId);
    if (venue) {
      venue.availableDates = dates;
      await this.saveVenues();
    } else {
      throw new Error('Venue not found');
    }
  }

  async getVenues(): Promise<TimeshareVenue[]> {
    await this.loadVenues();
    return [...this.venues];
  }

  async applyForSlot(user: ViewerUser, venueId: string, date: Date): Promise<TimeshareSlotApplication> {
    const application: TimeshareSlotApplication = {
      id: `app-${Date.now()}`,
      userId: user.id,
      venueId,
      date: date.toISOString().split('T')[0],
      status: 'pending'
    };
    this.applications.push(application);
    await this.saveApplications();
    return application;
  }

  async updateApplicationStatus(user: AdminUser, applicationId: string, status: 'approved' | 'denied'): Promise<void> {
    this.restrictToAdmin(user);
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
      await this.saveApplications();
    } else {
      throw new Error('Application not found');
    }
  }

  async getPendingApplications(): Promise<TimeshareSlotApplication[]> {
    await this.loadApplications();
    return this.applications.filter(app => app.status === 'pending');
  }
}