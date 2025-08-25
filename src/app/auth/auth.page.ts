import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// Import specific Ionic v8 standalone components
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { LoadingController, AlertController } from '@ionic/angular';

import { AuthService } from './auth.service';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonSpinner
  ]
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  form: UntypedFormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private allService: AllService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Firebase connection test
    console.log('🔍 AuthPage: Checking Firebase connection...');
    this.testFirebaseConnection();
  }
  
  testFirebaseConnection() {
    try {
      console.log('🔍 AuthService available:', !!this.authService);
      console.log('🔍 Router available:', !!this.router);
      console.log('🔍 LoadingController available:', !!this.loadingCtrl);
      console.log('🔍 AlertController available:', !!this.alertCtrl);
    } catch (error) {
      console.error('🔍 Service injection error:', error);
    }
  }
  
  // Debug method - you can call this in browser console
  async testFirebaseDirectly() {
    console.log('🧪 Testing Firebase directly...');
    try {
      // Test with a simple email/password
      const testEmail = 'test@test.com';
      const testPassword = 'test123';
      
      console.log('🧪 Attempting direct Firebase auth...');
      const result = await this.authService.signup(testEmail, testPassword);
      console.log('🧪 Direct Firebase test result:', result);
      return result;
    } catch (error) {
      console.error('🧪 Direct Firebase test failed:', error);
      throw error;
    }
  }

  async onSubmit() {
    console.log('🔍 AuthPage: onSubmit called');
    console.log('🔍 Form valid:', this.form.valid);
    console.log('🔍 Is loading:', this.isLoading);
    console.log('🔍 Form values:', this.form.value);
    
    if (this.isLoading || !this.form.valid) {
      console.log('❌ Early return - form invalid or loading');
      return;
    }

    const email = this.form.value.email;
    const password = this.form.value.password;
    console.log('🔍 Attempting auth for:', email, this.isLogin ? 'LOGIN' : 'SIGNUP');

    let authObs: Promise<any>;

    if (this.isLogin) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    this.isLoading = true;
    console.log('⏳ Loading set to true');
    
    const loadingEl = await this.loadingCtrl.create({
      message: this.isLogin ? 'Logging in...' : 'Creating account...'
    });
    await loadingEl.present();
    console.log('⏳ Loading spinner shown');

    try {
      console.log('🔥 Starting Firebase auth...');
      const user = await authObs;
      console.log('✅ Firebase auth completed:', user);
      
      if (user) {
        localStorage.setItem('userEmail', email);
        console.log('💾 Email stored in localStorage');
        
        // Dismiss loading first
        await loadingEl.dismiss();
        this.isLoading = false;
        console.log('✅ Loading dismissed, about to navigate');
        
        // Then navigate
        if (this.isLogin) {
          console.log('🏠 Navigating to /home');
          await this.router.navigateByUrl('/home');
        } else {
          console.log('📚 Navigating to /tutorial');
          await this.router.navigateByUrl('/tutorial');
        }
        console.log('✅ Navigation completed');
      } else {
        console.error('❌ User object is null/undefined');
        throw new Error('Authentication returned no user');
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      let message = 'Could not authenticate you. Please try again.';
      if (error?.code === 'auth/user-not-found') {
        message = 'User not found. Please check your email or sign up.';
      } else if (error?.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error?.code === 'auth/email-already-in-use') {
        message = 'Email already in use. Please use a different email or sign in.';
      } else if (error?.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Invalid email address. Please check your email format.';
      } else if (error?.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (error?.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error?.code === 'auth/invalid-credential') {
        message = 'Invalid credentials. Please check your email and password.';
      }
      
      // Always dismiss loading and reset state, even on error
      try {
        await loadingEl.dismiss();
        console.log('✅ Loading dismissed after error');
      } catch (dismissError) {
        console.warn('⚠️ Error dismissing loading:', dismissError);
      }
      
      this.isLoading = false;
      console.log('✅ isLoading reset to false');
      this.showAlert(message);
    }
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  async resetPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Password',
      message: 'Enter your email address to receive a password reset link.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.authService.resetPassword(data.email);
                this.showAlert('Password reset email sent!');
              } catch (error) {
                this.showAlert('Failed to send reset email. Please try again.');
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message,
        buttons: [
          {
            text: 'Okay',
            handler: () => {
              // Reset form on error so user can retry
              this.form.reset();
            }
          }
        ]
      })
      .then(alertEl => alertEl.present());
  }
}
