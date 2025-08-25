import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, User } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';
import { Subscription } from 'rxjs';

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
export class AvailabilityPage implements OnInit, OnDestroy {
  availabilityForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  selectedVenue: TimeshareVenue | null = null;
  currentUser: User | null = null;
  today: string = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD
  private venuesSubscription!: Subscription;
  private queryParamsSubscription!: Subscription;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private timeshareService: TimeshareService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.availabilityForm = new FormGroup({
      venueId: new FormControl('', [Validators.required]),
      dates: new FormControl([], [Validators.required]),
    });

    await this.loadCurrentUser();
    await this.loadVenues();

    // Subscribe to venue changes
    this.venuesSubscription = this.timeshareService.getVenuesChanged().subscribe(() => {
      this.loadVenues();
    });

    // Check for venueId query parameter
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const venueId = params['venueId'];
      if (venueId) {
        this.selectVenue(venueId);
      }
    });
  }

  ngOnDestroy() {
    if (this.venuesSubscription) {
      this.venuesSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    try {
      this.venues = await this.timeshareService.getVenues();
      // Update selectedVenue if it still exists
      if (this.selectedVenue) {
        this.selectedVenue = this.venues.find(v => v.id === this.selectedVenue?.id) || null;
        this.availabilityForm.patchValue({ venueId: this.selectedVenue?.id || '' });
      }
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  selectVenue(venueId: string) {
    this.selectedVenue = this.venues.find(v => v.id === venueId) || null;
    this.availabilityForm.patchValue({ venueId: this.selectedVenue?.id || '' });
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