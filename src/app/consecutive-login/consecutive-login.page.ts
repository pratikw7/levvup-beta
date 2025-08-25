import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-consecutive-login',
  templateUrl: './consecutive-login.page.html',
  styleUrls: ['./consecutive-login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class ConsecutiveLoginPage implements OnInit {

  days: boolean[] = [];
  claimedStatus: boolean[] = [];

  constructor(private alertCtrl: AlertController, private allService: AllService) { }

  ngOnInit() {
    let dayNumber = Number(localStorage.getItem('day'));
    let claimedStatus = localStorage.getItem('claimedStatus');
    for (let index = 1; index <= 7; index++) {
      if (index !== dayNumber) {
        this.days[index] = true;
      } else {
        this.days[index] = false;
      }
      if (index < dayNumber) {
        this.claimedStatus[index] = true;
      } else if (index > dayNumber) {
        this.claimedStatus[index] = false;
      } else if (index === dayNumber) {
        if (claimedStatus === 'true') {
          this.claimedStatus[index] = true;
        } else {
          this.claimedStatus[index] = false;
        }
      }
    }
  }

  closePopover() {
    // this.popover.dismiss(); // This line was removed as per the edit hint
  }

  claim(xpBonus: number, index: number, ev?) {
    this.allService.updateBoosts({'xpBonus': xpBonus});
    const x: number = index - 1;
    this.claimedStatus[x] = true;
    ev.target.innerHTML = 'CLAIMED';
    console.log('this.claimedStatus[x]: ' + this.claimedStatus[x]);
    console.log(ev);
  }
}
