import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, User } from '../models/types';

@Component({
  selector: 'app-manage-venues',
  templateUrl: './manage-venues.page.html',
  styleUrls: ['./manage-venues.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonDatetime]
})
export class ManageVenuesPage implements OnInit {
  venueForm!: FormGroup;
  updateForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  currentUser: User | null = null;

  constructor(private router: Router, private toastController: ToastController) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Access restricted to admins.');
      await this.router.navigateByUrl('/home');
      return;
    }

    this.venueForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      availableDates: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})*$/)])
    });

    this.updateForm = new FormGroup({
      selectedVenueId: new FormControl('', [Validators.required]),
      newDates: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})*$/)])
    });

    await this.loadVenues();
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    const { value } = await Preferences.get({ key: 'venues' });
    this.venues = value ? JSON.parse(value) : [];
  }

  async saveVenues(): Promise<void> {
    await Preferences.set({ key: 'venues', value: JSON.stringify(this.venues) });
  }

  async addVenue() {
    if (this.venueForm.valid) {
      const dates = this.venueForm.get('availableDates')!.value.split(',').map((date: string) => date.trim());
      if (dates.every((date: string) => !isNaN(Date.parse(date)))) {
        const newVenue: TimeshareVenue = {
          id: `venue-${Date.now()}`,
          name: this.venueForm.get('name')!.value,
          location: this.venueForm.get('location')!.value,
          availableDates: dates
        };

        this.venues.push(newVenue);
        await this.saveVenues();
        await this.presentToast('Venue added successfully!');
        this.venueForm.reset();
      } else {
        await this.presentToast('Invalid date format. Use YYYY-MM-DD, separated by commas.');
      }
    } else {
      this.venueForm.markAllAsTouched();
      await this.presentToast('Please fill in all fields correctly.');
    }
  }

  async updateDates() {
    if (this.updateForm.valid) {
      const selectedVenueId = this.updateForm.get('selectedVenueId')!.value;
      const newDates = this.updateForm.get('newDates')!.value.split(',').map((date: string) => date.trim());
      if (newDates.every((date: string) => !isNaN(Date.parse(date)))) {
        const venue = this.venues.find(v => v.id === selectedVenueId);
        if (venue) {
          venue.availableDates = newDates;
          await this.saveVenues();
          await this.presentToast('Dates updated successfully!');
          this.updateForm.reset();
        } else {
          await this.presentToast('Venue not found.');
        }
      } else {
        await this.presentToast('Invalid date format. Use YYYY-MM-DD, separated by commas.');
      }
    } else {
      this.updateForm.markAllAsTouched();
      await this.presentToast('Please select a venue and enter valid dates.');
    }
  }

  async deleteVenue(venueId: string) {
    this.venues = this.venues.filter(v => v.id !== venueId);
    await this.saveVenues();
    await this.presentToast('Venue deleted successfully!');
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
