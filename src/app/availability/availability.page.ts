import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
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
  ToastController,
} from '@ionic/angular/standalone';
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
      date: new FormControl('', [Validators.required]),
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
      this.venues = await this.timeshareService.getVenues(); // Await async call
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async bookSelectedDate() {
    if (!this.currentUser) {
      await this.presentToast('Please log in to book a date.');
      await this.router.navigateByUrl('/login');
      return;
    }

    if (this.availabilityForm.valid) {
      const venueId = this.availabilityForm.get('venueId')!.value;
      const date = this.availabilityForm.get('date')!.value;
      const venue = this.venues.find((v) => v.id === venueId);

      if (!venue) {
        await this.presentToast('Invalid venue selected.');
        return;
      }

      // Ensure date is in YYYY-MM-DD format for comparison
      const formattedDate = date.split('T')[0];
      if (!venue.availableDates.includes(formattedDate)) {
        await this.presentToast('Selected date is not available.');
        return;
      }

      await this.router.navigate(['/bookings'], {
        queryParams: { venueId, date: formattedDate },
      });
      this.availabilityForm.reset();
    } else {
      this.availabilityForm.markAllAsTouched();
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