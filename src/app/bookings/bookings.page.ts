import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSelect, IonSelectOption, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareSlotApplication, TimeshareVenue, User } from '../models/types';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSelect, IonSelectOption, IonDatetime]
})
export class BookingsPage implements OnInit {
  bookingForm!: FormGroup;
  bookings: TimeshareSlotApplication[] = [];
  venues: TimeshareVenue[] = [];
  currentUser: User | null = null;

  constructor(private router: Router, private toastController: ToastController) {}

  async ngOnInit() {
    this.bookingForm = new FormGroup({
      venueId: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required])
    });

    await this.loadCurrentUser();
    await this.loadVenues();
    await this.loadBookings();
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    const { value } = await Preferences.get({ key: 'venues' });
    this.venues = value ? JSON.parse(value) : [];
  }

  async loadBookings(): Promise<void> {
    const { value } = await Preferences.get({ key: 'bookings' });
    this.bookings = value ? JSON.parse(value) : [];
    if (this.currentUser) {
      this.bookings = this.bookings.filter(booking => booking.userId === this.currentUser!.id);
    }
  }

  async saveBookings(): Promise<void> {
    await Preferences.set({ key: 'bookings', value: JSON.stringify(this.bookings) });
  }

  async createBooking() {
    if (!this.currentUser) {
      await this.presentToast('Please log in to create a booking.');
      await this.router.navigateByUrl('/login');
      return;
    }

    if (this.bookingForm.valid) {
      const venueId = this.bookingForm.get('venueId')!.value;
      const venue = this.venues.find(v => v.id === venueId);
      const date = this.bookingForm.get('date')!.value;

      if (!venue) {
        await this.presentToast('Invalid venue selected.');
        return;
      }

      if (!venue.availableDates.includes(date)) {
        await this.presentToast('Selected date is not available.');
        return;
      }

      const newBooking: TimeshareSlotApplication = {
        id: `booking-${Date.now()}`,
        venueId,
        userId: this.currentUser.id,
        date: new Date(date),
        status: 'pending'
      };

      this.bookings.push(newBooking);
      await this.saveBookings();
      await this.presentToast('Booking created successfully!');
      this.bookingForm.reset();
    } else {
      this.bookingForm.markAllAsTouched();
      await this.presentToast('Please fill in all fields correctly.');
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
