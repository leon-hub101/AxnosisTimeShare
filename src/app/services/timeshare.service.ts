import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AdminUser, ViewerUser, TimeshareVenue, TimeshareSlotApplication, User } from '../models/types';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeshareService {
  private venues: TimeshareVenue[] = [];
  private applications: TimeshareSlotApplication[] = [];
  private venuesChanged = new Subject<void>(); // Subject to notify venue changes

  constructor() {
    this.init();
  }

  // Observable for components to subscribe to venue changes
  getVenuesChanged() {
    return this.venuesChanged.asObservable();
  }

  private async init() {
    await Promise.all([this.loadVenues(), this.loadApplications()]);
  }

  private async loadVenues() {
    const { value } = await Preferences.get({ key: 'venues' });
    this.venues = value ? JSON.parse(value) : [];
  }

  private async saveVenues() {
    await Preferences.set({ key: 'venues', value: JSON.stringify(this.venues) });
    this.venuesChanged.next(); // Notify subscribers of venue change
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
      ...venue,
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

  async validateBooking(user: User, venueId: string, dates: string[]): Promise<void> {
    await this.loadApplications();
    const userBookings = this.applications.filter(app => app.userId === user.id);
    
    // Check for same date on different properties
    const conflictingBookings = userBookings.filter(app => 
      dates.includes(app.date) && app.venueId !== venueId
    );
    if (conflictingBookings.length > 0) {
      throw new Error(`Cannot book dates already booked on other properties: ${conflictingBookings.map(b => b.date).join(', ')}`);
    }

    // Check for same date on same property
    const duplicateBookings = userBookings.filter(app => 
      dates.includes(app.date) && app.venueId === venueId
    );
    if (duplicateBookings.length > 0) {
      throw new Error(`Cannot book same dates twice on this property: ${duplicateBookings.map(b => b.date).join(', ')}`);
    }
  }

  async applyForSlot(user: User, venueId: string, dates: string[]): Promise<TimeshareSlotApplication[]> {
    const formattedDates = Array.isArray(dates) ? dates.map(d => d.split('T')[0]) : [];
    await this.validateBooking(user, venueId, formattedDates);
    
    const newApplications: TimeshareSlotApplication[] = formattedDates.map(date => ({
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: user.id,
      venueId,
      date,
      status: 'pending'
    }));

    this.applications.push(...newApplications);
    await this.saveApplications();
    return newApplications;
  }

  async cancelBooking(user: User, applicationId: string): Promise<void> {
    await this.loadApplications();
    const applicationIndex = this.applications.findIndex(app => app.id === applicationId && app.userId === user.id);
    if (applicationIndex === -1) {
      throw new Error('Booking not found or not owned by user');
    }
    const application = this.applications[applicationIndex];
    if (application.status !== 'pending') {
      throw new Error('Only pending bookings can be cancelled');
    }
    this.applications.splice(applicationIndex, 1);
    await this.saveApplications();
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