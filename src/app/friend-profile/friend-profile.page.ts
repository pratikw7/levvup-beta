import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllService, Tasks } from '../services/all.service';

@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.page.html',
  styleUrls: ['./friend-profile.page.scss'],
})
export class FriendProfilePage implements OnInit {

  friendEmail: string;
  tasks: Tasks[] = [];
  tasksTemp: Tasks[] = [];
  photoURL: string;
  borderURL: string;
  currLevel: number;
  nextLevel: number;
  xp: number;
  streak: number;
  username: string;
  prg = 0.0;
  prg2 = 0.0;
  prgLvl = 0.0;
  prgLvl2 = 0.0;
  xpPerLvl: Map<number, number>;
  allUsers;

  constructor(private route: ActivatedRoute, private allService: AllService) {
    this.xpPerLvl = new Map();
    let k = 0;
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
   }

  ngOnInit() {
    if (this.route.snapshot.data.friendEmail) {
      this.friendEmail = this.route.snapshot.data.friendEmail;
      if (this.friendEmail !== 'empty') {
        this.allService.getFriendDB(this.friendEmail).subscribe(res2 => {
        this.tasks = [];
        this.tasksTemp = res2;
        this.tasksTemp.forEach(task => {
          if (task.id === 'metaData') {
            this.photoURL = task.photo;
            this.borderURL = task.border;
            this.currLevel = task.currLevel;
            this.nextLevel = task.nextLevel;
            this.xp = task.xp;
            this.streak = task.streak;
            if (task.username !== undefined) {
              this.username = task.username;
            }
          }
          // tslint:disable-next-line: max-line-length
          if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
            console.log('ran t');
            this.tasks.push(task);
          }
        });

        // start calc XP()
        // this.allService.getUserDB(this.friendEmail).subscribe(res2 => {
        this.xp = 0;
        res2.forEach(task => {
            if (task.completed === true && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
              this.xp += 10;
            } else if (task.completed === false && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
              this.xp -= 5;
            }
          });
        // });
        setTimeout(() => {
        let cl = 1;
        let reqXP = 0;
        reqXP = this.xpPerLvl.get(cl);
        while (reqXP <= this.xp) {
            ++cl;
            reqXP = this.xpPerLvl.get(cl);
        }
        this.currLevel = --cl;
        this.nextLevel = this.currLevel + 1;
      }, 2000);
      // end calc XP()
        setTimeout(() => {
          this.pgBar();
          this.pgBarLvl();
      }, 3000);
      });
    }

    }
  }
  pgBar() {
    let j = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    for (j = 0; j < this.tasks.length; j++) {
      if (this.tasks[j].completed === true) {
        completedTasks++;
      }
      totalTasks++;
    }
    this.prg = completedTasks / totalTasks ;
    this.prg2 = this.prg * 100;
    if (this.prg2.valueOf().toString() === 'NaN') {
      this.prg2 = 0;
      this.prg = 0;
    }
 }

  pgBarLvl() {
    let reqXP = 0;
    let cTask = 0;
    let tTask = 1;
    let flag = false;
    reqXP = this.xpPerLvl.get(this.currLevel);
    while (reqXP <= this.xp) {
        ++cTask;
        reqXP += 10;
        flag = true;
    }
    if (flag) {
      --cTask;
    }
    if (this.currLevel === 1) {
      tTask = 1;
    } else if (this.currLevel === 2 || this.currLevel === 3) {
      tTask = 2;
    } else if (this.currLevel >= 4 && this.currLevel <= 10) {
      tTask = 3;
    } else if (this.currLevel >= 11 && this.currLevel <= 21) {
      tTask = 4;
    } else if (this.currLevel >= 22 && this.currLevel <= 31) {
      tTask = 5;
    } else if (this.currLevel >= 32 && this.currLevel <= 41) {
      tTask = 6;
    } else if (this.currLevel >= 42 && this.currLevel <= 100) {
      tTask = 7;
    }
    this.prgLvl = cTask / tTask ;
    this.prgLvl2 = this.prgLvl * 100;
    if (this.prgLvl2.valueOf().toString() === 'NaN') {
      this.prgLvl2 = 0;
    }
 }
 

}
