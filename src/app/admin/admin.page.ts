import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonIcon, IonToolbar, IonImg, IonButton, IonList, IonItem, IonLabel, IonInput, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, User, AdminUser, TimeshareSlotApplication } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonIcon,
    IonToolbar,
    IonImg,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
  ],
})
export class AdminPage implements OnInit, OnDestroy {
  venueForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  applications: TimeshareSlotApplication[] = [];
  currentUser: User | null = null;
  private venuesSubscription!: Subscription;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private timeshareService: TimeshareService
  ) {}

  async ngOnInit() {
    this.venueForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      availableDates: new FormControl([], [Validators.required]),
      link: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
      description: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    });

    await this.loadCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can access this page.');
      await this.router.navigateByUrl('/login');
      return;
    }

    await this.loadVenues();
    await this.loadApplications();
    this.venuesSubscription = this.timeshareService.getVenuesChanged().subscribe(() => {
      this.loadVenues();
    });
  }

  ngOnDestroy() {
    if (this.venuesSubscription) {
      this.venuesSubscription.unsubscribe();
    }
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    try {
      this.venues = await this.timeshareService.getVenues();
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async loadApplications(): Promise<void> {
    try {
      this.applications = await this.timeshareService.getPendingApplications();
    } catch (error) {
      await this.presentToast('Error loading applications.');
    }
  }

  getVenueName(venueId: string): string {
    const venue = this.venues.find(v => v.id === venueId);
    return venue ? `${venue.name} - ${venue.location}` : 'Unknown Venue';
  }

  async addVenue() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can add venues.');
      await this.router.navigateByUrl('/login');
      return;
    }

    if (this.venueForm.valid) {
      const { name, location, availableDates, link, description } = this.venueForm.value;
      const formattedDates = Array.isArray(availableDates)
        ? availableDates.map((d: string) => d.split('T')[0])
        : [];

      try {
        const newVenue = await this.timeshareService.addVenue(this.currentUser as AdminUser, {
          name,
          location,
          availableDates: formattedDates,
          link,
          description,
        });
        this.venues.push(newVenue);
        await this.presentToast('Venue added successfully.');
        this.venueForm.reset();
      } catch (error: any) {
        await this.presentToast(error.message || 'Error adding venue.');
      }
    } else {
      this.venueForm.markAllAsTouched();
      await this.presentToast('Please fill all required fields correctly.');
    }
  }

  async deleteVenue(venueId: string) {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can delete venues.');
      await this.router.navigateByUrl('/login');
      return;
    }

    try {
      await this.timeshareService.deleteVenue(this.currentUser as AdminUser, venueId);
      this.venues = this.venues.filter(venue => venue.id !== venueId);
      await this.presentToast('Venue deleted successfully.');
    } catch (error: any) {
      await this.presentToast(error.message || 'Error deleting venue.');
    }
  }

  async updateApplicationStatus(applicationId: string, status: 'approved' | 'denied') {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can update applications.');
      await this.router.navigateByUrl('/login');
      return;
    }

    try {
      await this.timeshareService.updateApplicationStatus(this.currentUser as AdminUser, applicationId, status);
      this.applications = this.applications.filter(app => app.id !== applicationId);
      await this.presentToast(`Application ${status} successfully.`);
    } catch (error: any) {
      await this.presentToast(error.message || 'Error updating application.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}