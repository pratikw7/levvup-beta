import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { AllService } from '../services/all.service';
import { FcmService } from '../services/fcm.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  pwd1: string;
  oldpwd: string;
  pwd2: string;
  myemail: string;
  photoURL: string;
  borderURL: string;
  currLevel: number;
  nextLevel: number;
  xp: number;
  streak: number;
  tenacity: number;
  longestStreak: number;
  xpPerLvl: Map<number, number>;
  prg = 0.0;
  prg2 = 0.0;
  prgLvl = 0.0;
  prgLvl2 = 0.0;
  boost: number;
  xpBonus: number;
  form: UntypedFormGroup;
  uname: string;

  constructor(private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private authService: AuthService,
              private fcmService: FcmService, 
              private allService: AllService,
              private formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      imageUrl: ['', Validators.required]
    });

    this.myemail = localStorage.getItem('userEmail');
    let k = 0;
    this.xpPerLvl = new Map();
    this.xpPerLvl.set(1, k);
    k += 10;
    for (let i = 2; i <= 100; i++) {
      if (i === 2 || i === 3) {
        this.xpPerLvl.set(i, k);
        k += 20;
      } else if (i > 3 && i <= 10 ) {
        this.xpPerLvl.set(i, k);
        k += 30;
      } else if (i > 10 && i <= 20 ) {
        this.xpPerLvl.set(i, k);
        k += 40;
      } else if (i > 20 && i <= 30 ) {
        this.xpPerLvl.set(i, k);
        k += 50;
      } else if (i > 30 && i <= 40 ) {
        this.xpPerLvl.set(i, k);
        k += 60;
      } else if (i > 40 && i <= 100 ) {
        this.xpPerLvl.set(i, k);
        k += 70;
      }
    }

    this.allService.getUserDB(this.myemail).subscribe(user => {
      user.forEach(task => {
        if (task.id === 'metaData') {
          this.photoURL = task.photo;
          this.borderURL = task.border;
          this.currLevel = task.currLevel;
          this.nextLevel = task.nextLevel;
          this.xp = task.xp;
          this.streak = task.streak;
          this.tenacity = task.tenacity;
          this.longestStreak = task.longestStreak;
        } else if (task.id === 'boosts') {
          this.boost = task.gp;
          this.xpBonus = task.xpBonus;
        }
      });
    });

    this.allService.getTutStatus(this.myemail).then(status => {
      if (status && status.tutorialStatus === true) {
        this.allService.setTdata(3, 'toSettingsFinished');
      }
    });
  }

  async changePassword() {
    if (this.pwd1 !== this.pwd2) {
      this.showAlert('Error', 'Passwords do not match!', 'OK');
      return;
    }
    if (this.pwd1.length < 6) {
      this.showAlert('Error', 'Password should be at least 6 characters long!', 'OK');
      return;
    }
    try {
      await this.authService.changePassword(this.pwd1, this.oldpwd);
      this.showAlert('Success', 'Password changed successfully!', 'OK');
    } catch (error) {
      this.showAlert('Error', 'Failed to change password. Please check your old password.', 'OK');
    }
  }

  async uploadImage() {
    if (this.form.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Uploading image...'
      });
      await loading.present();

      try {
        const imageUrl = this.form.get('imageUrl').value;
        await this.allService.changePhoto(imageUrl, this.myemail).then(() => {
          this.showAlert('Success', 'Image uploaded successfully!', 'OK');
          this.photoURL = imageUrl;
        });
      } catch (error) {
        this.showAlert('Error', 'Failed to upload image.', 'OK');
      } finally {
        await loading.dismiss();
      }
    }
  }

  async updateUname() {
    if (this.uname && this.uname.trim()) {
      try {
        await this.allService.updateMetaData({username: this.uname});
        await this.allService.updateUname({uname: this.uname});
        this.showAlert('Success', 'Username changed successfully!', 'OK');
      } catch (error) {
        this.showAlert('Error', 'Failed to update username.', 'OK');
      }
    } else {
      this.showAlert('Error', 'Please enter a valid username.', 'OK');
    }
  }

  async showAlert(header: string, message: string, button: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [button]
    });
    await alert.present();
  }
}
