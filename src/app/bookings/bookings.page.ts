import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSelect, IonSelectOption, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareSlotApplication, TimeshareVenue, User, ViewerUser } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';

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

  constructor(
    private router: Router,
    private toastController: ToastController,
    private timeshareService: TimeshareService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.bookingForm = new FormGroup({
      venueId: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required])
    });

    await this.loadCurrentUser();
    await this.loadVenues();
    await this.loadBookings();

    // Pre-fill form from query params
    this.route.queryParams.subscribe(params => {
      if (params['venueId'] && params['date']) {
        this.bookingForm.patchValue({
          venueId: params['venueId'],
          date: params['date']
        });
      }
    });
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    try {
      this.venues = this.timeshareService.getVenues();
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async loadBookings(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'bookings' });
      this.bookings = value ? JSON.parse(value) : [];
      if (this.currentUser) {
        this.bookings = this.bookings.filter(booking => booking.userId === this.currentUser!.id);
      }
    } catch (error) {
      await this.presentToast('Error loading bookings.');
    }
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

      try {
        const viewerUser = this.currentUser as ViewerUser;
        const newBooking = this.timeshareService.applyForSlot(viewerUser, venueId, new Date(date));
        this.bookings.push(newBooking);
        await this.presentToast('Booking created successfully!');
        this.bookingForm.reset();
      } catch (error) {
        await this.presentToast('Error creating booking.');
      }
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
