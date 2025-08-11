import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareSlotApplication, TimeshareVenue, User, AdminUser } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.page.html',
  styleUrls: ['./approvals.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class ApprovalsPage implements OnInit {
  pendingApplications: TimeshareSlotApplication[] = [];
  venues: TimeshareVenue[] = [];
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private timeshareService: TimeshareService
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Access restricted to admins.');
      await this.router.navigateByUrl('/home');
      return;
    }

    await this.loadVenues();
    await this.loadPendingApplications();
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'venues' });
      this.venues = value ? JSON.parse(value) : this.timeshareService.getVenues();
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async loadPendingApplications(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'bookings' });
      const bookings = value ? JSON.parse(value) : this.timeshareService.getPendingApplications();
      this.pendingApplications = bookings.filter((app: TimeshareSlotApplication) => app.status === 'pending');
    } catch (error) {
      await this.presentToast('Error loading applications.');
    }
  }

  async saveBookings(): Promise<void> {
    try {
      await Preferences.set({ key: 'bookings', value: JSON.stringify(this.pendingApplications) });
    } catch (error) {
      await this.presentToast('Error saving applications.');
    }
  }

  async approveApplication(applicationId: string) {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can approve applications.');
      return;
    }

    try {
      const adminUser = this.currentUser as AdminUser;
      this.timeshareService.updateApplicationStatus(adminUser, applicationId, 'approved');
      this.pendingApplications = this.pendingApplications.map(app =>
        app.id === applicationId ? { ...app, status: 'approved' } : app
      );
      await this.saveBookings();
      await this.presentToast('Application approved successfully!');
    } catch (error) {
      await this.presentToast('Error approving application.');
    }
  }

  async denyApplication(applicationId: string) {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can deny applications.');
      return;
    }

    try {
      const adminUser = this.currentUser as AdminUser;
      this.timeshareService.updateApplicationStatus(adminUser, applicationId, 'denied');
      this.pendingApplications = this.pendingApplications.map(app =>
        app.id === applicationId ? { ...app, status: 'denied' } : app
      );
      await this.saveBookings();
      await this.presentToast('Application denied successfully!');
    } catch (error) {
      await this.presentToast('Error denying application.');
    }
  }

  getVenueName(venueId: string): string {
    return this.venues.find(v => v.id === venueId)?.name || 'Unknown';
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
