import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput, IonList, IonItem, IonSelect, IonSelectOption, IonLabel } from '@ionic/angular/standalone';
import { TimeshareService } from '../services/timeshare.service';
import { TimeshareVenue, AdminUser } from '../models/types';

@Component({
  selector: 'app-manage-venues',
  templateUrl: './manage-venues.page.html',
  styleUrls: ['./manage-venues.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput, IonList, IonItem, IonSelect, IonSelectOption, IonLabel]
})
export class ManageVenuesPage implements OnInit {
  venues: TimeshareVenue[] = [];
  selectedVenueId: string = '';
  newVenueName: string = '';
  newVenueLocation: string = '';
  newDates: string = ''; // Comma-separated dates (e.g., "2025-08-12,2025-08-13")
  private mockAdmin: AdminUser = { id: 'admin1', name: 'John', surname: 'Doe', email: 'admin@example.com', role: 'admin' }; // Mock for testing

  constructor(private timeshareService: TimeshareService) {}

  ngOnInit() {
    this.venues = this.timeshareService.getVenues();
  }

  addVenue() {
    if (this.newVenueName && this.newVenueLocation) {
      this.timeshareService.addVenue(this.mockAdmin, { name: this.newVenueName, location: this.newVenueLocation, availableDates: [] });
      this.venues = this.timeshareService.getVenues();
      this.newVenueName = '';
      this.newVenueLocation = '';
    }
  }

  deleteVenue(venueId: string) {
    this.timeshareService.deleteVenue(this.mockAdmin, venueId);
    this.venues = this.timeshareService.getVenues();
  }

  updateDates() {
    if (this.selectedVenueId && this.newDates) {
      const dates = this.newDates.split(',').map(date => new Date(date.trim())).filter(date => !isNaN(date.getTime()));
      this.timeshareService.updateAvailableDates(this.mockAdmin, this.selectedVenueId, dates);
      this.venues = this.timeshareService.getVenues();
      this.newDates = '';
    }
  }
}
