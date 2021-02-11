import { Component, OnInit } from '@angular/core';
import { Tasks, AllService, NewUser } from '../services/all.service';
import { AlertController, LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { FcmService } from '../services/fcm.service';
import { of } from 'rxjs';
import { GroupPagePage } from '../group-page/group-page.page';
import { AchievementsPage } from '../achievements/achievements.page';
import { ConsecutiveLoginPage } from '../consecutive-login/consecutive-login.page';
import { takeLast } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  streakFlag: boolean;
  notif: boolean;
  userNotifs: any[] = [];
  userNotifsCount: number;
  addTaskTooltip: any;
  tooltip: any;

  tenacity: number;
  xp: number;
  gp: number;
  streak: number;
  longestStreak: number;
  currLevel: number;
  nextLevel: number;
  allUsers: NewUser[];
  photoURL: string;
  borderURL: string;
  currUser: Tasks[];
  tasks: Tasks[] = [];
  tasksTemp: Tasks[];
  tasksBackup: Tasks[] = [];
  tasksBackupTemp: Tasks[];
  prg = 0.0;
  prg2 = 0.0;
  prgLvl = 0.0;
  prgLvl2 = 0.0;
  xpPerLvl: Map<number, number>;
  emojiSet: Map<number, any>;
  message;
  dayOff: boolean;
  canUpdateTenacity: boolean;

  public baseProvider: any;
  error: any;
  public myemail: string;
  taskid: any;
  nav: any;
  username: string;
  boost: number;
  tooltipText: any;
  isVisible: boolean;
  isVisibleTask: boolean;


  constructor(
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    public popoverController: PopoverController,
    private loadingController: LoadingController,
    public toastCtrl: ToastController, private fcm: FcmService, private allService: AllService) {
    this.myemail = localStorage.getItem('userEmail');
    this.streakFlag = false;
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
  }

  createPopover(dayNumber: number, claimedStatus: string) {
    localStorage.setItem('claimedStatus', claimedStatus);
    localStorage.setItem('day', dayNumber.toString());
    this.popoverController.create({
        component: ConsecutiveLoginPage,
        cssClass: 'my-custom-class'
        }).then((popoverElement) => {
          popoverElement.backdropDismiss = false;
          popoverElement.present();
        });
  }

  // async presentPopover(ev: any) {
  //   const popover = await this.popoverController.create({
  //     component: GroupPagePage,
  //     cssClass: 'my-custom-class',
  //     event: ev,
  //     translucent: true,
  //   });
  //   return await popover.present();
  // }

   async ngOnInit() {
    this.canUpdateTenacity = false;
    this.boost = 1;
    this.isVisible = false;
    this.isVisibleTask = false;
    this.addTaskTooltip = {
      'visibility': 'visible'
    };
    this.tooltip = {
      'z-index': 99999,
      'position': 'relative',
      'top.px': -30,
      'left.px': 70,
      'display': 'inline-block',
      'border-bottom.px': 'dotted black',
      'visibility': 'visible'
    };
    this.tooltipText = {
      'visibility': 'visible',
      'width.px': '120',
      'background-color': 'black',
      'color': 'red',
      'text-align': 'center',
      'border-radius': 6,
      'padding.px': '5 0',
      'position': 'absolute',
      'z-index': 1,
      'top.px': -5,
      'left': '110%'
    };
    // await LocalNotifications.requestPermissions();
    this.notif = true;
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
            if (elem.read === false) {
              cnt += 1;
              this.userNotifsCount = cnt;
            }
          });
        }
      });
      this.allService.getUserDB(this.myemail).subscribe(res2 => {
        this.tasks = [];
        this.tasksTemp = res2;
        this.tasksTemp.forEach(task => {
          if (task.id === 'consecutiveLogin') {
            // Popover logic
            console.log('task: ' + task.title);
            if (this.streakMaintained(task)) {
              console.log(141);
              if (task.streak === 0) {
                console.log('143');
                task.streak = 1;
                this.allService.updateConsecutiveLogin({streak: task.streak, lastUpdatedOn: new Date()});
                // display popover of day 1 to be claimed
                const x: any = task;
                this.createPopover(1, 'no');
              } else {
                  console.log(150);
                  const x: any = task;
                  const taskLastUpdatedOn = x.lastUpdatedOn.toDate();
                  const currDate = new Date();
                  if (((taskLastUpdatedOn.getDay() - currDate.getDay()) === -1) ||
                    ((taskLastUpdatedOn.getDay() - currDate.getDay()) === 6)) {
                    console.log(156);
                    let dayNumber = 0;
                    if (!this.isTodaysTask(task)) {
                      console.log(159);
                      task.streak += 1;
                      this.allService.updateConsecutiveLogin({streak: task.streak, lastUpdatedOn: new Date()});
                      if (task.streak > 7) {
                        console.log(163);
                        const n = task.streak % 7;
                        dayNumber = n;
                        if (dayNumber === 0) {
                          console.log(167);
                          dayNumber = 7;
                        }
                      } else {
                        console.log(171);
                        dayNumber = task.streak;
                      }
                      console.log(174);
                      this.createPopover(dayNumber, 'no');
                    } else {
                      console.log(177);
                      this.createPopover(dayNumber, 'yes');
                    }
                  }
                }
            } else {
              console.log(183);
              task.streak = 1;
              this.allService.updateConsecutiveLogin({streak: task.streak, lastUpdatedOn: new Date()});
              // const x: any = task;
              // const taskLastUpdatedOn = x.lastUpdatedOn.toDate();
              this.createPopover(1, 'no');
            }
          }
          if (task.id === 'boosts') {
            this.boost = task.xpBonus;
          }
          if (task.id === 'metaData') {
            this.tenacity = task.tenacity;
            this.photoURL = task.photo;
            this.borderURL = task.border;
            this.currLevel = task.currLevel;
            this.nextLevel = task.nextLevel;
            this.xp = task.xp;
            this.streak = task.streak;
            this.longestStreak = task.longestStreak;
            this.dayOff = false;
            this.canUpdateTenacity = task.tenacityCanUpdateFlag;
            if (task.dayOff !== undefined) {
              this.dayOff = task.dayOff;
            }
            if (task.username !== undefined) {
              this.username = task.username;
            }
          }
          // tslint:disable-next-line: max-line-length
          if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111' && this.isTodaysTask(task)) {
            if (task.isStreaky) {
              if (task.lastUpdatedOn) {
                task.displayLastUpdatedOn = this.getLastUpdatedOn(task);
              }
              if (task.startTime) {
                task.displayStartTime = this.getStartTime(task);
              }
              if (!this.isUpdatedToday(task)) {
                task.completed = false;
                if (!this.streakMaintained(task)) {
                  task.streak = 0;
                }
                // console.log('ngOninit tasks: ' + task.title + ' ' + task.completed + ' ' + task.streak);
                this.tasks.push(task);
              } else {
                // console.log('ngOninit tasks: ' + task.title + ' ' + task.completed + ' ' + task.streak);
                this.tasks.push(task);
              }
            } else {
              // console.log('ngOninit tasks: ' + task.title + ' ' + task.completed + ' ' + task.streak);
              this.tasks.push(task);
            }
          }
          if (task.id === 'tutorial') {
            console.log(192);
            if (task.walkthroughShown === false) {
              console.log(194);
              const tStatus: string = this.allService.getTdata(2);
              const addTaskShown: string = this.allService.getTdata(0);
              if (tStatus !== 'toHomePage' && addTaskShown !== 'addTaskShown') {
                // tslint:disable-next-line: max-line-length
                this.showAlert('Welcome to LEVVUP', 'This is your homepage, you can add,view and save your tasks here. You can also view your current level and obtained boosts. XP & GP increases for every task you complete. GP aka Grit Points is the in-app currency you can use to redeem rewards (Coming Soon!)', 'Ok');
                this.allService.setTdata(0, 'addTaskShown');
              }
              // localStorage.setItem('journeyBeginsShown', 'true');
            }
            // if () {
            //     // tslint:disable-next-line: max-line-length
            //     this.showAlert('Save tasks!', 'Once you have completed the task mark tick the box and click the SAVE icon (Cassette) to save your task. All of your tasks are visible to your friends.', 'Take me there!');
            // }
          }
        });

        // start calc XP()
        // this.allService.getUserDB(this.myemail).subscribe(res2 => {
        this.xp = 0;
        let y = 0;
        res2.forEach(task => {
            y = 0;
            if (task.completed === true && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
              if (task.applyBonus > 1) {
                y = 10 + (10 * (task.applyBonus / 100));
                this.xp += y;
                // console.log('title: ' + task.title + 'xp for it: ' + y);
              } else {
                y = 10;
                this.xp += y;
                // console.log('title: ' + task.title + 'xp for it: ' + y);
              }
            } else if (task.completed === false && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
              this.xp -= 5;
            }
          });
        // });
        this.fcm.getPermission().subscribe((r => {
          console.log('r: ' + r);
        }));
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
          this.tenacityCheck();
          const x2 = this.xp;
          this.gp = x2 * 1.5;
          this.pgBar();
          this.pgBarLvl();
          if (this.tasksIsEmpty(this.tasks)) {
            // send notifs to add tasks 3 times a day (to be added later as cron job)
          }
      }, 3000);
      });
    }
    if (this.route.snapshot.data.tutID === '1') {
      // tslint:disable-next-line: max-line-length
      // this.showAlert('Save task', 'After this walkthrough, complete your task and use the save icon on the bottom right. Now lets add a friend!', 'Take me there :D');
      // tslint:disable-next-line: max-line-length
      this.showAlert('Save task', 'Mark your task as complete and use the save icon on the bottom right to save your progress. After this lets go add new friends!', 'Awesome!😎');
    }
  }

  showNextAlert() {
    // tslint:disable-next-line: max-line-length
    this.showAlert('The journey begins!', 'Let us begin our journey by adding a task which you will do today. Click the + icon on the botton left to add a new task', "I'm ready!");
  }

  setVisibilityFalse() {
    this.isVisible = false;
  }

  private showAlert(header1: string, message1: string, btnName: string) {
    console.log('header1: ' + header1 + 'msg1: ' + message1);
    this.alertCtrl
      .create({
        header: header1,
        message: message1,
        buttons: [{
          text: btnName,
          role: btnName,
          cssClass: 'my-custom',
          handler: (anyValue) => {
            if (header1 === 'The journey begins!') {
              this.allService.setTdata(1, 'toAddTask');
              if (this.allService.getTdata(1) === 'toAddTask') {
                this.isVisible = true;
              }
              // this.router.navigate(['/add-task/1']);
            }
            if (header1 === 'Save task') {
              this.isVisibleTask = true;
              this.allService.setTdata(2, 'toAddFriend');
              // this.router.navigate(['/friends']);
            }
            if (header1 === 'Welcome to LEVVUP') {
              this.showNextAlert();
            }
          }
        }]
      })
      .then(alertEl => {
        alertEl.present();
        alertEl.backdropDismiss = false;
        this.allService.updateTutorial({journeyBeginsShown: true});
      });
  }

  tenacityCheck() {
    const currDay = new Date().getDay();
    this.tasks.forEach(task => {
      if (task.id === 'metaData') {
        const diff = currDay - task.tenacityLastUpdatedOn;
        if (diff !== 0) { // if its a new day then user can update their tenacity
          this.canUpdateTenacity = true;
          this.allService.updateMetaData({tenacityCanUpdateFlag: true});
        }
      }
    });
  }

  // userStreak() {

  // }
  showNotifs() {
    if (this.notif === false) {
      this.notif = true;
    } else {
      this.notif = false;
    }
  }

  dontShowNotifs() {
    this.notif = true;
  }

  getStartTime(task: any) {
    return task.startTime.toDate().getTime();
  }

  toggleDayoff() {
    if (this.dayOff) {
     this.dayOff = false;
    } else {
     this.dayOff = true;
     alert('WARNING! Streaks and tasks if not completed may be lost. Click on it again to get back on track.');
    }
    this.allService.updateMetaData({dayOff: this.dayOff});
  }

  tasksIsEmpty(tasks: any) {
    if (tasks.length < 1) {
      return true;
    } else {
      return false;
    }
  }

  getLastUpdatedOn(task: any) {
    const t = task.lastUpdatedOn.toDate();
    return t.getTime();
  }

  streakMaintained(task: any) {
    // console.log(task.title + ' ' + task.completed);
    if (task.lastUpdatedOn) {
      const taskLastUpdatedOn = task.lastUpdatedOn.toDate();
      const y: number = (((new Date().getTime() - taskLastUpdatedOn.getTime()) / 1000 ) / 60) / 60;
      // console.log(new Date().getUTCDate() + ' == ' + taskLastUpdatedOn.getUTCDate());
      // console.log(taskLastUpdatedOn.getDay());
      // console.log(new Date().getDay());
      if (((new Date().getDay() - taskLastUpdatedOn.getDay()) <= 1) && (y < 48)) {
          console.log('Streak maintained' + task.title);
          return true;
      }
    }
    // console.log('Streak not maintained' + task.title);
    // console.log(task.title + ' ' + task.completed);
    return false;
  }

  isUpdatedToday(task: any) {
    if (task.lastUpdatedOn) {
      const taskLastUpdatedOn = task.lastUpdatedOn.toDate();
      const y: number = (((new Date().getTime() - taskLastUpdatedOn.getTime()) / 1000 ) / 60) / 60;
      // console.log(new Date().getUTCDate() + ' == ' + taskLastUpdatedOn.getUTCDate());
      // console.log(taskLastUpdatedOn.getDay());
      // console.log(new Date().getDay());
      if ((taskLastUpdatedOn.getDay() === new Date().getDay()) && (y < 24)) {
          // console.log('Same day');
          return true;
      }
    }
    return false;
  }

  isTodaysTask(task: any) {
    if (task.isEventType) {
      if (task.isStreaky) {
        return true;
      } else {
        const taskStartTime = task.startTime.toDate();
        const y: number = (((new Date().getTime() - taskStartTime.getTime()) / 1000 ) / 60) / 60;
        // console.log(new Date().getUTCDate() + ' == ' + taskStartTime.getUTCDate());
        if (taskStartTime.getTime() > new Date().getTime()) {
          return false;
        } else {
          if (y > 24) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
    if (task.createdAt !== undefined) {
      // console.log('OLD task code');
      const x: number = (((new Date().getTime() - task.createdAt.valueOf()) / 1000 ) / 60) / 60;
      if (x > 24) {
        return false;
      } else {
        return true;
      }
    }
  }

  sendDailyNotifs() {
    this.allService.sendDailyNotifs();
    // call service fn to send daily notif
  }


  // new notifs
  randomDiscount() {
    const n = 10;
    const headline = `New discount for ${n}% off!`;
    this.allService.updateMetaData({discount: headline});
  }

// OLD notifs
  async ionViewDidEnter() {
    // alert('Please accept notifications to successfuly continue.');
    // this.fcm.getToken();
    // this.fcm.listenToNotifications().pipe(
    //   tap(async msg => {
    //     const toast = await this.toastCtrl.create({
    //       message: msg.body,
    //       duration: 3000
    //     });
    //     toast.present();
    //   })
    // );
  }

  remove(item) {
    this.allService.removeTask(item.id);
  }

  removeNotif(notif) {
    this.allService.removeNotif(notif.id);
  }

  notifRead(notif) {
    notif.read = true;
    console.log('NOTIF ID: ' + notif.id);
    this.allService.updateNotif(notif, notif.id);
  }

  notifUnread(notif) {
    notif.read = false;
    console.log('NOTIF ID: ' + notif.id);
    this.allService.updateNotif(notif, notif.id);
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

//  async test() {
//   await LocalNotifications.schedule({
//     notifications: [
//       {
//         title: 'Time to level up!',
//         body: 'Add a task & get it done!',
//         id: 1,
//         // extra: {
//         //   data: 'Pass data to ur handasd'
//         // },
//       }
//     ]
//   });
//  }

//  calcXP() {
//     this.allService.getUserDB(this.myemail).subscribe(res2 => {
//       this.xp = 0;
//       res2.forEach(task => {
//         if (task.completed === true && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
//           this.xp += 10;
//         } else if (task.completed === false && task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
//           this.xp -= 5;
//         }
//       });
//     });
//     setTimeout(() => {
//     let cl = 1;
//     let reqXP = 0;
//     reqXP = this.xpPerLvl.get(cl);
//     while (reqXP <= this.xp) {
//         ++cl;
//         reqXP = this.xpPerLvl.get(cl);
//     }
//     this.currLevel = --cl;
//     this.nextLevel = this.currLevel + 1;
//   }, 2000);
  // }

  setTenacity() {
    let cnt = 0;
    this.tasks.forEach(task => {
      if (task.completed === false) {
        cnt ++;
      }
    });
    if (cnt === this.tasks.length) {
      if (this.tenacity >= 10) {
        this.tenacity -= 10;
      } else {
        this.tenacity = 0;
      }
      const tlu = new Date().getDay();
      this.allService.updateMetaData({ tenacityLastUpdatedOn: tlu, tenacityCanUpdateFlag: true, tenacity: this.tenacity});
    }
  }

  async updateTask() {

      // this.calcXP();
      const loading = await this.loadingController.create({
        message: 'Updating tasks..'
      });
      await loading.present();

      this.getCurrDb();
      setTimeout(async () => {

      console.log('inupdate1');
      for (let j = 0; j < this.tasks.length; j++) {
          // console.log('tasks: ' + this.tasks[j].title + ' ' + this.tasks[j].completed);
          // console.log('tasksBackup: ' + this.tasksBackup[j].title + ' ' + this.tasksBackup[j].completed);
          if (this.tasks[j].completed !== this.tasksBackup[j].completed) {
            // ADD STREAK UPDATE LOGIC HERE
            this.setTenacity();
            if (this.tasks[j].isStreaky) {
            if (this.streakMaintained(this.tasks[j])) {
              if (this.tasks[j].completed === true) {
                // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                this.tasks[j].streak += 1;
                const x = this.tasks[j].streak;
                if (this.tasks[j].longestStreak === undefined) {
                  this.tasks[j].longestStreak = 0;
                  if (this.tasks[j].longestStreak < x) {
                    this.tasks[j].longestStreak = x;
                    // console.log('longestS: ' + this.tasks[j].title + ' ' + this.tasks[j].longestStreak);
                  }
                }
                console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
              } else {
                if (this.tasks[j].streak > 0) {
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                  this.tasks[j].streak -= 1;
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                }
              }
            } else {
                if (this.tasks[j].completed === false) {
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                  this.tasks[j].streak = 0;
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                  } else {
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                  this.tasks[j].streak = 1;
                  // console.log('Stasks: ' + this.tasks[j].title + ' ' + this.tasks[j].streak);
                  }
              }
          }
            this.tasks[j].lastUpdatedOn = new Date();
            // console.log('*************************');
            //   console.log('*************************');
            //   console.log('*************************');
            // if (this.tasks[j].title === 'WORKOUT REAL') {
            //   console.log(this.tasks[j].longestStreak);
            //   console.log('*************************');
            //   console.log('*************************');
            //   console.log('*************************');
            // }
            this.tasks[j].applyBonus = this.boost;
            this.allService.updateTask(this.tasks[j], this.tasks[j].id, this.myemail);
            if (this.currLevel === 1) {
              if (this.canUpdateTenacity) {
                this.tenacity += 10;
                this.canUpdateTenacity = false;
                const tlu = new Date().getDay();
                // tslint:disable-next-line: max-line-length
                this.allService.updateMetaData({tenacityCanUpdateFlag: false, tenacityLastUpdatedOn: tlu, tenacity: this.tenacity, xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              } else {
                this.allService.updateMetaData({xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              }
            } else if (this.currLevel === 2 || this.currLevel === 3) {
            // tslint:disable-next-line: max-line-length
            if (this.canUpdateTenacity) {
              this.tenacity += 10;
              this.canUpdateTenacity = false;
              const tlu = new Date().getDay();
              // tslint:disable-next-line: max-line-length
              this.allService.updateMetaData({tenacityCanUpdateFlag: false, tenacityLastUpdatedOn: tlu, tenacity: this.tenacity, xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                loading.dismiss();
              });
            } else {
              this.allService.updateMetaData({xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                loading.dismiss();
              });
            }
            } else if (this.currLevel >= 4 && this.currLevel <= 6) {
              // tslint:disable-next-line: max-line-length
              if (this.canUpdateTenacity) {
                this.tenacity += 10;
                this.canUpdateTenacity = false;
                const tlu = new Date().getDay();
                // tslint:disable-next-line: max-line-length
                this.allService.updateMetaData({tenacityCanUpdateFlag: false, tenacityLastUpdatedOn: tlu, tenacity: this.tenacity, xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              } else {
                this.allService.updateMetaData({xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              }
            } else if (this.currLevel >= 7 && this.currLevel <= 10) {
              // tslint:disable-next-line: max-line-length
              if (this.canUpdateTenacity) {
                this.tenacity += 10;
                this.canUpdateTenacity = false;
                const tlu = new Date().getDay();
                // tslint:disable-next-line: max-line-length
                this.allService.updateMetaData({tenacityCanUpdateFlag: false, tenacityLastUpdatedOn: tlu, tenacity: this.tenacity, xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              } else {
                this.allService.updateMetaData({xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              }
            } else if (this.currLevel >= 10 && this.currLevel <= 15) {
              // tslint:disable-next-line: max-line-length
              if (this.canUpdateTenacity) {
                this.tenacity += 10;
                this.canUpdateTenacity = false;
                const tlu = new Date().getDay();
                // tslint:disable-next-line: max-line-length
                this.allService.updateMetaData({tenacityCanUpdateFlag: false, tenacityLastUpdatedOn: tlu, tenacity: this.tenacity, xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              } else {
                this.allService.updateMetaData({xp: this.xp, currLevel: this.currLevel, border: ' '}).then(() => {
                  loading.dismiss();
                });
              }
            }
          } else {
            console.log('Nothing to update.');
            loading.dismiss();
          }
        }
      if (this.allService.getTdata(2) === 'toAddFriend') {
        this.isVisibleTask = false;
        loading.dismiss();
        this.router.navigate(['/friends']);
      }
  }, 2000);

  }

  getCurrDb() {
    this.tasksBackup = [];
    return new Promise((resolve, reject) => {
      resolve(this.allService.getUserDB(this.myemail).subscribe(res => {
        this.tasksBackup = [];
        this.tasksBackupTemp = res;
        this.tasksBackupTemp.forEach(task => {
          // if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111' && this.isTodaysTask(task)) {
          //   this.tasksBackup.push(task);
          // }

          // *****
          if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111' && this.isTodaysTask(task)) {
            if (task.isStreaky) {
              if (task.lastUpdatedOn) {
                task.displayLastUpdatedOn = this.getLastUpdatedOn(task);
              }
              if (task.startTime) {
                task.displayStartTime = this.getStartTime(task);
              }
              if (!this.isUpdatedToday(task)) {
                task.completed = false;
                if (!this.streakMaintained(task)) {
                  task.streak = 0;
                }
                this.tasksBackup.push(task);
              } else {
                this.tasksBackup.push(task);
              }
            } else {
              this.tasksBackup.push(task);
            }
          }
          // *****

        });
      })
      );
    });
  }
}
