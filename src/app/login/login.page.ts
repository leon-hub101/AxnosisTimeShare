import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput, ToastController } from '@ionic/angular/standalone';
import { User } from '../models/types';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  mockUser: User = { id: 'admin1', name: 'John', surname: 'Doe', email: 'John.Doe@example.com', role: 'admin' }; // Mock for testing

  constructor(private router: Router, private toastController: ToastController) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  async login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')!.value;
      if (email === this.mockUser.email) {
        await this.presentToast('Login successful!');
        await this.router.navigateByUrl('/home');
      } else {
        await this.presentToast('Invalid email. Please register.');
        this.loginForm.reset();
      }
    } else {
      this.loginForm.markAllAsTouched();
      await this.presentToast('Please enter a valid email.');
    }
  }

  async register() {
    this.loginForm.reset();
    await this.router.navigateByUrl('/registration');
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
