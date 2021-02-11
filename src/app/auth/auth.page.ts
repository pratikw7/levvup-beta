import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private allService: AllService
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    let tutFlag = false;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          tutFlag = false;
          authObs = this.authService.login(email, password);
        } else {
          tutFlag = true;
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          async resData => {
            localStorage.setItem( 'userEmail', resData.email);
            this.isLoading = false;
            loadingEl.dismiss();
            // this.router.navigateByUrl('/places/tabs/discover');
            // if (await this.allService.getTutStatus(resData.email) === false) {
            if (tutFlag === false) {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/tutorial']);
            }
          },
          errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address already exists!';
            } else if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
              message = 'E-mail ID or password is incorrect!';
            }
            this.showAlert(message);
          }
        );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  resetPassword() {
    this.router.navigate(['/reset-password']);
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }
}
