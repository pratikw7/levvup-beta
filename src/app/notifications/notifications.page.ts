import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  notif: boolean;
  myemail: string;
  userNotifs: any[] = [];
  userNotifsCount: number;

  constructor( private allService: AllService,
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
