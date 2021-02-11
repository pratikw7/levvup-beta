import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-consecutive-login',
  templateUrl: './consecutive-login.page.html',
  styleUrls: ['./consecutive-login.page.scss'],
})
export class ConsecutiveLoginPage implements OnInit {

  days: boolean[] = [];
  claimedStatus: boolean[] = [];

  constructor(private popover: PopoverController, private allService: AllService) { }

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
    this.popover.dismiss();
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
