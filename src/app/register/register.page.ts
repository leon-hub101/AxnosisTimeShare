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
  IonButton,
  IonImg,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { User } from '../models/types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonImg,
    IonInput,
  ],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    await this.loadUsers();
  }

  async loadUsers(): Promise<User[]> {
    const { value } = await Preferences.get({ key: 'users' });
    return value ? JSON.parse(value) : [];
  }

  async saveUsers(users: User[]): Promise<void> {
    await Preferences.set({ key: 'users', value: JSON.stringify(users) });
    this.registerForm.reset();
    return;
  }

  async register() {
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')!.value;
      const users = await this.loadUsers();

      if (users.find(user => user.email === email)) {
        await this.presentToast('Email already registered.');
        this.registerForm.reset();
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: this.registerForm.get('name')!.value,
        surname: this.registerForm.get('surname')!.value,
        email: email,
        role: 'admin'
      };

      users.push(newUser);
      await this.saveUsers(users);
      await this.presentToast('Registration successful! Please log in.');
      await this.router.navigateByUrl('/login');
    } else {
      this.registerForm.markAllAsTouched();
      await this.presentToast('Please fill in all fields correctly.');
    }
  }

  async cancel() {
    this.registerForm.reset();
    await this.router.navigateByUrl('/login');
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
