import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput, ToastController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
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
  mockUser: User = { id: 'admin1', name: 'John', surname: 'Doe', email: 'John.Doe@example.com', role: 'admin' };

  constructor(private router: Router, private toastController: ToastController) {}

  async ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    const users = await this.loadUsers();
    if (!users.find(user => user.email === this.mockUser.email)) {
      users.push(this.mockUser);
      await this.saveUsers(users);
    }
  }

  async loadUsers(): Promise<User[]> {
    const { value } = await Preferences.get({ key: 'users' });
    return value ? JSON.parse(value) : [];
  }

  async saveUsers(users: User[]): Promise<void> {
    await Preferences.set({ key: 'users', value: JSON.stringify(users) });
  }

  async login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')!.value;
      const users = await this.loadUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        await Preferences.set({ key: 'currentUser', value: JSON.stringify(user) });
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
    await this.router.navigateByUrl('/register');
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
