import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonContent,
  IonButton,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { TimeshareVenue, User } from '../models/types';
import { TimeshareService } from '../services/timeshare.service';
import { Subscription } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonContent,
    IonButton,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  venues: TimeshareVenue[] = [];
  currentUser: User | null = null;
  private venuesSubscription!: Subscription;

  constructor(private timeshareService: TimeshareService) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadVenues();
    this.venuesSubscription = this.timeshareService.getVenuesChanged().subscribe(() => {
      this.loadVenues();
    });
  }

  ngOnDestroy() {
    if (this.venuesSubscription) {
      this.venuesSubscription.unsubscribe();
    }
  }

  async loadCurrentUser(): Promise<void> {
    const { value } = await Preferences.get({ key: 'currentUser' });
    this.currentUser = value ? JSON.parse(value) : null;
  }

  async loadVenues(): Promise<void> {
    try {
      this.venues = await this.timeshareService.getVenues();
    } catch (error) {
      console.error('Error loading venues:', error);
    }
  }
}