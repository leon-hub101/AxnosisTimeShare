import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.page.html',
  styleUrls: ['./availability.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg]
})
export class AvailabilityPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
