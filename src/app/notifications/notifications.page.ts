import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class NotificationsPage implements OnInit {

  notif: boolean;
  myemail: string;
  userNotifs: any[] = [];
  userNotifsCount: number;

  constructor(
    private router: Router,
    private allService: AllService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.notif = false;
    this.myemail = localStorage.getItem('userEmail');
    if (this.myemail !== 'empty') {
      this.allService.getNotifs(this.myemail).subscribe(resN => {
        let cnt = 0;
        this.userNotifs = resN;
        this.userNotifs.sort((a, b) => {
         return (b.timestamp - a.timestamp);
        });
        if (this.userNotifs !== undefined) {
          this.userNotifs.forEach(elem => {
            cnt += 1;
            this.userNotifsCount = cnt;
          });
        }
      });
    }
  }

  notifRead(notif) {
    notif.read = true;
    console.log('NOTIF ID: ' + notif.id);
    this.allService.updateNotif(notif, notif.id);
  }

  removeNotif(notif) {
    this.allService.removeNotif(notif.id);
  }

  showNotif() {
    this.makeToast('You are already on the notifications page :)');
  }

  async makeToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      // buttons: 'Ok'
    });
    toast.present();
  }
}
