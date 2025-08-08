import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonImg, IonInput, ToastController } from '@ionic/angular/standalone';
import { User } from '../models/types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, IonInput]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  mochUsers: User[] = [
    {id: 'admin1', name: 'John', surname: 'Doe', email: 'John.Doe@example.com', role: 'admin'}
  ];

  constructor(private router: Router, private toastController: ToastController) {}

  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }
async register() {
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')!.value;
      if (this.mochUsers.find(user => user.email === email)) {
        await this.presentToast('Email already registered.');
        this.registerForm.reset();
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`, // Simple timestamp-based ID
        name: this.registerForm.get('name')!.value,
        surname: this.registerForm.get('surname')!.value,
        email: email,
        role: 'admin' // Default role
      };

      this.mochUsers.push(newUser);
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
      position: 'bottom'
    });
    await toast.present();
  }
}

