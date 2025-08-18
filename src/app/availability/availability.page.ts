import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, User } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.page.html',
  styleUrls: ['./availability.page.scss'],
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
    IonImg,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem,
    IonLabel,
    IonDatetime,
  ],
})
export class AvailabilityPage implements OnInit {
  availabilityForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private timeshareService: TimeshareService
  ) {}

  async ngOnInit() {
    this.availabilityForm = new FormGroup({
      venueId: new FormControl('', [Validators.required]),
      dates: new FormControl([], [Validators.required]),
    });

    await this.loadCurrentUser();
    await this.loadVenues();
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

  async bookSelectedDates() {
    if (!this.currentUser) {
      await this.presentToast('Please log in to book dates.');
      await this.router.navigateByUrl('/login');
      return;
    }

    if (this.availabilityForm.valid) {
      const venueId = this.availabilityForm.get('venueId')!.value;
      const dates = this.availabilityForm.get('dates')!.value;
      const venue = this.venues.find((v) => v.id === venueId);

      if (!venue) {
        await this.presentToast('Invalid venue selected.');
        return;
      }

      const formattedDates = Array.isArray(dates) ? dates.map((d: string) => d.split('T')[0]) : [];
      const unavailableDates = formattedDates.filter((d: string) => !venue.availableDates.includes(d));
      if (unavailableDates.length > 0) {
        await this.presentToast(`Selected dates are not available: ${unavailableDates.join(', ')}`);
        return;
      }

      try {
        await this.timeshareService.validateBooking(this.currentUser, venueId, formattedDates);
        await this.router.navigate(['/bookings'], {
          queryParams: { venueId, dates: JSON.stringify(formattedDates) },
        });
        this.availabilityForm.reset();
      } catch (error: any) {
        await this.presentToast(error.message || 'Error validating booking.');
      }
    } else {
      this.availabilityForm.markAllAsTouched();
      await this.presentToast('Please select a venue and at least one date.');
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