import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';

import { AuthService } from './auth.service';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private allService: AllService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.isLoading || !this.form.valid) {
      return;
    }
    const email = this.form.value.email;
    const password = this.form.value.password;
    let authObs: Promise<any>;

    if (this.isLogin) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    this.isLoading = true;
    const loadingEl = await this.loadingCtrl.create({
      message: this.isLogin ? 'Logging in...' : 'Creating account...'
    });
    await loadingEl.present();

    try {
      const user = await authObs;
      if (user) {
        localStorage.setItem('userEmail', email);
        if (this.isLogin) {
          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('/tutorial');
        }
      }
    } catch (error) {
      let message = 'Could not authenticate you. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'User not found. Please check your email or sign up.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use. Please use a different email or sign in.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.';
      }
      
      this.showAlert(message);
    } finally {
      this.isLoading = false;
      await loadingEl.dismiss();
    }
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
