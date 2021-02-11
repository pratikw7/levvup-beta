import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { Tasks, AllService } from '../services/all.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { CalendarComponent } from 'ionic2-calendar';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
})
export class AddTaskPage implements OnInit {

  task: Tasks = {
    title: 'Enter task here',
    completed: false,
    createdAt: new Date().getTime(),
    broadcasted: false
  };
  tasks: Tasks[] = [];
  tasksTemp: Tasks[];

  taskid = null;
  collapseCard = false;
  myemail: string;
  addFirstTaskShownFlag: boolean;

  event = {
    title: '',
    desc: '',
    startTime: '',
    endTime: '',
    completed: false,
    streak: false,
    taskType: 'other'
  };

  minDate = new Date().toISOString();

  eventSource = [];
  eventSource2 = [];

  calendar = {
    mode: 'month',
    currentDate: new Date()
  };

  taskType: string;

  viewTitle = '';

  @ViewChild(CalendarComponent, {static: false}) myCal: CalendarComponent;
  isDisabled: boolean;

  constructor(private nav: NavController,
              private router: Router,
              private allService: AllService,
              private route: ActivatedRoute,
              private loadingController: LoadingController,
              private alertCtrl: AlertController,
              @Inject(LOCALE_ID)private locale: string) { }

  async ngOnInit() {
    this.addFirstTaskShownFlag = false;
    this.isDisabled = false;
    // tslint:disable-next-line: no-string-literal
    this.taskType = 'other';
    this.eventSource = [];
    this.taskid = this.route.snapshot.params.id;
    if (this.taskid) {
      this.loadTask();
    }
    this.task.title = '';
    // this.resetEvent();

    this.myemail = localStorage.getItem('userEmail');
    if (this.myemail !== 'empty') {
      await this.allService.getUserDB(this.myemail).subscribe(res2 => {
        this.tasks = [];
        this.tasksTemp = res2;
        this.tasksTemp.forEach(task => {
          if (task.id !== 'friends' && task.id !== 'metaData' && task.id !== '111') {
            this.tasks.push(task);
            if (task.isEventType) {
              this.addToEventSource(task);
            }
          }
        });
      });
    }
    this.resetEvent();
    this.myCal.loadEvents();
    if (this.allService.getTdata(1) === 'toAddTask') {
      this.allService.setTdata(1, 'toAddTaskDone');
      // tslint:disable-next-line: max-line-length
      this.showAlert('Add your first task!', 'Add a task which you will do today. Have you peformed the task already? if yes, mark it as completed. Is it a recurring task? if yes, enable the streak :D');
      this.isDisabled = true;
     }
  }

  private showAlert(header1: string, message1: string) {
    this.alertCtrl
      .create({
        header: header1,
        message: message1,
        buttons: [{
          text: 'Doing it now :)',
          handler: (anyValue) => {
            this.addFirstTaskShownFlag = true;
            this.isDisabled = false;
            this.allService.setTdata(2, 'toHomePage');
          }
        }],
      })
      .then(alertEl => {
        alertEl.present();
        alertEl.backdropDismiss = false;
        this.allService.updateTutorial({addFirstTaskShown: true});
      });
  }

  addToEventSource(task: any) {
    // console.log(task.title);
    const eventCopy = {
      title: task.title,
      startTime: task.startTime.toDate(),
      endTime: task.endTime.toDate(),
      description: task.description,
      completed: task.completed,
    };
    this.eventSource.push(eventCopy);
    // console.log(eventCopy.startTime.getTime());
    this.myCal.loadEvents();
  }

  changeMode(mode) {
    this.calendar.mode = mode;
  }

  next() {
    // var swiper = document.querySelector('.swiper-container')['swiper'];
    // tslint:disable-next-line: no-string-literal
    const swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slideNext();
  }

  back() {
    // var swiper = document.querySelector('.swiper-container')['swiper'];
    // tslint:disable-next-line: no-string-literal
    const swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slidePrev();
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  resetEvent() {
    this.event = {
      title: '',
      desc: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      completed: false,
      streak: false,
      taskType: 'other'
    };
  }

  taskTitleCheck() {
    this.event.title = this.event.title.trim();
    if (this.event.title === '' || this.event.title === undefined) {
      return true;
    } else {
      return false;
    }
  }

  async addEvent() {
    // let now = new Date();
    const eventCopy = {
      title: this.event.title,
      startTime: new Date(this.event.startTime),
      endTime: new Date(this.event.endTime),
      description: this.event.desc,
      completed: this.event.completed,
      streak: this.event.streak,
      taskType: this.event.taskType
    };

    // if (eventCopy.allDay) {
    //   // let addedTasks = false;
    //   const start = eventCopy.startTime;
    //   const end = eventCopy.endTime;
    //   eventCopy.startTime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    //   eventCopy.endTime = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
    //   // eventCopy.endTime.setUTCDate(eventCopy.startTime.getUTCDate() + 1);
    // }

    // this.myCal.loadEvents();

///
    const loading = await this.loadingController.create({
      message: 'Adding task..'
    });
    await loading.present();
    this.task = {
        title: 'Enter task here',
        completed: false,
        createdAt: new Date().getTime(),
        broadcasted: false
    };
    this.task.title = eventCopy.title;
    console.log(this.task.title);
    this.task.description = eventCopy.description;
    this.task.startTime = eventCopy.startTime;
    this.task.endTime = eventCopy.endTime;
    this.task.completed = eventCopy.completed;
    this.task.isStreaky = eventCopy.streak;
    this.task.createdAt = new Date().getTime();
    this.task.broadcasted = false;
    this.task.isEventType = true;
    this.task.lastUpdatedOn = new Date();
    this.task.taskType = eventCopy.taskType;

    if (this.task.isStreaky === true) {
      if (this.task.completed === true) {
        this.task.streak = 1;
        this.task.longestStreak = 1;
      } else {
        this.task.streak = 0;
        this.task.longestStreak = 0;
      }
    }
    this.allService.addTask(this.task, this.myemail).then(() => {
        console.log('Added a task');
        if (this.task.isStreaky === true) {
          console.log('it was streaky');
        }
        loading.dismiss();
        if (this.addFirstTaskShownFlag === true) {
          this.allService.setTdata(2, 'addedFirstTask');
          this.router.navigate(['home/1']);
        } else {
          this.nav.back();
        }
    });
    // this.myCal.loadEvents();
    this.resetEvent();
  }

  async  onEventSelected(event) {
    // Use Angular date pipe for conversion
    const start = formatDate(event.startTime, 'medium', this.locale);
    const end = formatDate(event.endTime, 'medium', this.locale);
    const alert = await this.alertCtrl.create({
      header: event.title,
      subHeader: event.desc,
      message: 'From: ' + start + '<br><br>To: ' + end,
      buttons: ['OK']
    });
    alert.present();
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onCurrentDateChanged(event: Date) {
    console.log('current date changed: ' + event);
  }

  onRangeChanged(ev) {
    console.log('Range changed: start time: ' + ev.startTime + ', end time: ' + ev.endTime);
  }

  onTimeSelected(ev) {
    const selected = new Date(ev.selectedTime);
    this.event.startTime = selected.toISOString();
    selected.setHours(selected.getHours() + 1);
    this.event.endTime = (selected.toISOString());
    console.log('Selected time: ' + ev.selectedTime);
  }

  async loadTask() {
    const loading = await this.loadingController.create({
      message: 'Loading Task..'
    });
    await loading.present();

    this.allService.getUser(this.taskid).subscribe(res => {
      loading.dismiss();
      this.task = res;
    });
  }

  async addTask() {
    const loading = await this.loadingController.create({
      message: 'Adding task..'
    });
    await loading.present();
    this.allService.addTask(this.task, this.myemail).then(() => {
        loading.dismiss();
    });
    // if (this.taskid) {
    //   this.allService.updateTask(this.task, this.taskid).then(() => {
    //     loading.dismiss();
    //     this.nav.back();
    //   });
    // } else {
    //   this.allService.addTask(this.task).then(() => {
    //     loading.dismiss();
    //     this.nav.back();
    //   });
    // }
  }

}
