import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AllService } from '../services/all.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class HistoryPage implements OnInit {

  xp: number;
  currLevel: number;
  nextLevel: number;
  allUsers: any[];
  photoURL: string;
  borderURL: string;
  currUser: any[];
  tasks: any[] = [];
  tasksTemp: any[];
  tasks2: any[];
  tasks3: any[];
  prg = 0.0;
  prg2 = 0.0;
  startTimeTest: number;

  public baseProvider: any;
  error: any;
  public myemail: string;
  taskid: any;
  nav: any;
  constructor(private route: ActivatedRoute, private allService: AllService, private loadingController: LoadingController) {
    this.myemail = localStorage.getItem('userEmail');
  }

  ngOnInit() {
    // this.tasks = [];
    // this.xp = 0;
    // this.currLevel = 0;
    // this.tasksTemp = [];
    this.myemail = localStorage.getItem('userEmail');
    if (this.myemail !== 'empty') {
      this.allService.getUserDB(this.myemail).subscribe(res2 => {
        this.tasks = [];
        this.tasksTemp = res2;
        this.tasksTemp.forEach(task => {
          if (task.id === 'metaData') {
            this.photoURL = task.photo;
            this.borderURL = task.border;
            this.currLevel = task.currLevel;
            this.nextLevel = task.nextLevel;
            this.xp = task.xp;
          }
          if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
            if (task.startTime) {
              task.displayStartTime = this.getStartTime(task);
            }
            if (task.lastUpdatedOn) {
              task.displayLastUpdatedOn = this.getLastUpdatedOn(task);
            }
            this.tasks.push(task);
          }
        });
      });
    }
  }

  getStartTime(task: any) {
   return task.startTime.toDate().getTime();
  }

  getLastUpdatedOn(task: any) {
    return task.lastUpdatedOn.toDate().getTime();
   }

  ionViewDidEnter() {
    setTimeout(() => {
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
    }, 3000);
  }
  remove(item) {
    this.allService.removeTask(item.id);
  }

  // async updateTask() {
  //   let j = 0;
  //   let totalTasks = 0;
  //   let completedTasks = 0;
  //   for (j = 0; j < this.tasks.length; j++) {
  //     if (this.tasks[j].completed === true) {
  //       completedTasks++;
  //     }
  //     totalTasks++;
  //   }
  //   this.prg = completedTasks / totalTasks ;
  //   this.prg2 = this.prg * 100;
  //   this.xp = this.xp + (completedTasks * 10);

  //   this.getCurrDb();
  //   setTimeout(() => {
  //     for (j = 0; j < this.tasks2.length; j++) {
  //     }
  //     for (j = 0; j < this.tasks.length; j++) {
  //         if (this.tasks[j].completed !== this.tasks2[j].completed) {
  //           this.allService.updateTask(this.tasks[j], this.tasks[j].id);
  //           this.allService.updateMetaData({xp: this.xp});
  //         } else {
  //         }
  //       }
  //   }, 2000);
  // }

  getCurrDb() {
    return new Promise((resolve, reject) => {
      resolve(this.allService.getUserDB(this.myemail).subscribe(res => {
        this.tasks2 = res;
      })
      );
    });
  }

}
