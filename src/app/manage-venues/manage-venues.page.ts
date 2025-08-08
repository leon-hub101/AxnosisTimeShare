import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TimeshareVenue, AdminUser } from '../models/types';

@Component({
  selector: 'app-manage-venues',
  templateUrl: './manage-venues.page.html',
  styleUrls: ['./manage-venues.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput]
})
export class ManageVenuesPage implements OnInit {
  venueForm!: FormGroup;
  venues: TimeshareVenue[] = [];
  private mockAdmin: AdminUser = { id: 'admin1', name: 'John', surname: 'Doe', email: 'John.Doe@example.com', role: 'admin' };

  constructor(private toastController: ToastController) {}

  async ngOnInit() {
    this.venueForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      availableDates: new FormControl('', [Validators.required])
    });

    await this.loadVenues();
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
      const newVenue: TimeshareVenue = {
        id: `venue-${Date.now()}`,
        name: this.venueForm.get('name')!.value,
        location: this.venueForm.get('location')!.value,
        availableDates: this.venueForm.get('availableDates')!.value.split(',').map((date: string) => date.trim())
      };

      this.venues.push(newVenue);
      await this.saveVenues();
      await this.presentToast('Venue added successfully!');
      this.venueForm.reset();
    } else {
      this.venueForm.markAllAsTouched();
      await this.presentToast('Please fill in all fields correctly.');
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
