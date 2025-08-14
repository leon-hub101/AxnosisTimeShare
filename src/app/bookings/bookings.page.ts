import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonImg, IonButton, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, TimeshareSlotApplication, User, ViewerUser } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonImg,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonDatetime,
  ],
})
export class BookingsPage implements OnInit {
  bookingForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  bookings: TimeshareSlotApplication[] = [];
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private timeshareService: TimeshareService
  ) {}

  async ngOnInit() {
    this.bookingForm = new FormGroup({
      venueId: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
    });

    await this.loadCurrentUser();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login');
      return;
    }

    await this.loadVenues();
    await this.loadBookings();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['venueId'] && params['date']) {
        this.bookingForm.patchValue({
          venueId: params['venueId'],
          date: params['date'],
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
      this.venues = await this.timeshareService.getVenues(); // Fix TS2740: Await Promise
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async loadBookings(): Promise<void> {
    try {
      const bookings = await this.timeshareService.getPendingApplications();
      this.bookings = bookings.filter(b => b.userId === this.currentUser?.id);
    } catch (error) {
      await this.presentToast('Error loading bookings.');
    }
  }

  getVenueName(venueId: string): string {
    const venue = this.venues.find(v => v.id === venueId);
    return venue ? `${venue.name} - ${venue.location}` : 'Unknown Venue';
  }

  async createBooking() {
    if (!this.currentUser) {
      await this.presentToast('Please log in to create a booking.');
      await this.router.navigateByUrl('/login');
      return;
    }

    if (this.bookingForm.valid) {
      const venueId = this.bookingForm.get('venueId')!.value;
      const date = this.bookingForm.get('date')!.value;
      const venue = this.venues.find(v => v.id === venueId);

      if (!venue) {
        await this.presentToast('Invalid venue selected.');
        return;
      }

      const formattedDate = date.split('T')[0];
      if (!venue.availableDates.includes(formattedDate)) {
        await this.presentToast('Selected date is not available.');
        return;
      }

      try {
        const newBooking = await this.timeshareService.applyForSlot(this.currentUser as ViewerUser, venueId, new Date(formattedDate)); // Fix TS2345: Await Promise
        this.bookings.push(newBooking);
        await this.presentToast('Booking created successfully!');
        this.bookingForm.reset();
      } catch (error) {
        await this.presentToast('Error creating booking.');
      }
    } else {
      this.bookingForm.markAllAsTouched();
      await this.presentToast('Please select a venue and date.');
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