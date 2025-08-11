import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonButton, IonInput, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonDatetime, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, User, AdminUser } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';

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
    try {
      this.venues = this.timeshareService.getVenues();
    } catch (error) {
      await this.presentToast('Error loading venues.');
    }
  }

  async addVenue() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can add venues.');
      return;
    }

    if (this.venueForm.valid) {
      const dates = this.venueForm.get('availableDates')!.value.split(',').map((date: string) => date.trim());
      if (dates.every((date: string) => !isNaN(Date.parse(date)))) {
        try {
          const adminUser = this.currentUser as AdminUser;
          const newVenue = this.timeshareService.addVenue(adminUser, {
            name: this.venueForm.get('name')!.value,
            location: this.venueForm.get('location')!.value,
            availableDates: dates
          });
          this.venues = this.timeshareService.getVenues();
          await this.presentToast('Venue added successfully!');
          this.venueForm.reset();
        } catch (error) {
          await this.presentToast('Error adding venue.');
        }
      } else {
        await this.presentToast('Invalid date format. Use YYYY-MM-DD, separated by commas.');
      }
    } else {
      this.venueForm.markAllAsTouched();
      await this.presentToast('Please fill in all fields correctly.');
    }
  }

  async updateDates() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can update dates.');
      return;
    }

    if (this.updateForm.valid) {
      const selectedVenueId = this.updateForm.get('selectedVenueId')!.value;
      const newDates = this.updateForm.get('newDates')!.value.split(',').map((date: string) => date.trim());
      if (newDates.every((date: string) => !isNaN(Date.parse(date)))) {
        try {
          const adminUser = this.currentUser as AdminUser;
          this.timeshareService.updateAvailableDates(adminUser, selectedVenueId, newDates.map((date: string) => new Date(date)));
          this.venues = this.timeshareService.getVenues();
          await this.presentToast('Dates updated successfully!');
          this.updateForm.reset();
        } catch (error) {
          await this.presentToast('Error updating dates.');
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
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      await this.presentToast('Only admins can delete venues.');
      return;
    }

    try {
      const adminUser = this.currentUser as AdminUser;
      this.timeshareService.deleteVenue(adminUser, venueId);
      this.venues = this.timeshareService.getVenues();
      await this.presentToast('Venue deleted successfully!');
    } catch (error) {
      await this.presentToast('Error deleting venue.');
    }
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
