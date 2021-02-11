import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  myemail: string;

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  resetPassword() {
    const message = 'Please open the link within the email to reset your password.';
    this.authService.resetPassword(this.myemail);
    this.showAlert(message, this.myemail);
  }

  private showAlert(mymessage: string, email: string) {
    this.alertCtrl
      .create({
        header: `Reset link sent to ${email}!`,
        message: mymessage,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
