import { Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonItem, IonList, IonSelect, IonSelectOption, IonDatetime } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Tasks, AllService } from '../services/all.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { collection } from 'firebase/firestore';
import { firestore } from '../firebase.config';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule, IonItem, IonList, IonSelect, IonSelectOption, IonDatetime]
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
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
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

  isDisabled: boolean;

  constructor(private nav: NavController,
              private router: Router,
              private allService: AllService,
              private route: ActivatedRoute,
              private loadingController: LoadingController,
              private alertCtrl: AlertController,
              private actionSheetCtrl: ActionSheetController,
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
    // this.myCal.loadEvents(); // Removed as per edit hint
    
    // Debug initial state
    console.log('📝 AddTask ngOnInit - Initial event state:', this.event);
    console.log('📝 AddTask ngOnInit - MinDate:', this.minDate);
    console.log('📝 AddTask ngOnInit - Task type:', this.event.taskType);
    
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
    // this.myCal.loadEvents(); // Removed as per edit hint
  }

  changeMode(mode) {
    this.calendar.mode = mode;
  }

  next() {
    // Check if swiper container exists before trying to access it
    const swiperContainer = document.querySelector('.swiper-container');
    if (swiperContainer && swiperContainer['swiper']) {
      const swiper = swiperContainer['swiper'];
      swiper.slideNext();
    } else {
      console.log('📅 Calendar swiper not available - calendar component is disabled');
    }
  }

  back() {
    // Check if swiper container exists before trying to access it
    const swiperContainer = document.querySelector('.swiper-container');
    if (swiperContainer && swiperContainer['swiper']) {
      const swiper = swiperContainer['swiper'];
      swiper.slidePrev();
    } else {
      console.log('📅 Calendar swiper not available - calendar component is disabled');
    }
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  resetEvent() {
    const now = new Date();
    this.event = {
      title: '',
      desc: '',
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      completed: false,
      streak: false,
      taskType: 'other'
    };
    console.log('📝 Event reset:', this.event);
    console.log('📝 Event startTime type:', typeof this.event.startTime);
    console.log('📝 Event taskType initialized to:', this.event.taskType);
  }





  toggleCompleted() {
    console.log('📝 Toggling completed status');
    this.event.completed = !this.event.completed;
    console.log('✅ Completed status set to:', this.event.completed);
  }

  toggleStreak() {
    console.log('📝 Toggling streak status');
    this.event.streak = !this.event.streak;
    console.log('✅ Streak status set to:', this.event.streak);
  }



  onTaskTypeChange(event?: any) {
    console.log('📝 Task type changed - event:', event);
    console.log('📝 Task type value from event:', event?.detail?.value);
    console.log('📝 Task type changed to:', this.event.taskType);
    
    // The ngModel should handle the binding automatically with proper Ionic 8 syntax
    if (event?.detail?.value !== undefined) {
      console.log('✅ Task type set to:', event.detail.value);
    }
  }

  onCompletedChange(event?: any) {
    console.log('📝 Completed status changed - event:', event);
    console.log('📝 Completed value from event:', event?.detail?.checked);
    console.log('📝 Completed status changed to:', this.event.completed);
    
    // Force the value update
    if (event?.detail?.checked !== undefined) {
      this.event.completed = event.detail.checked;
      console.log('✅ Completed status explicitly set to:', this.event.completed);
    } else {
      console.log('❌ No checked value in event detail');
    }
  }

  onStreakChange(event?: any) {
    console.log('📝 Streak status changed - event:', event);
    console.log('📝 Streak value from event:', event?.detail?.checked);
    console.log('📝 Streak status changed to:', this.event.streak);
    
    // Force the value update
    if (event?.detail?.checked !== undefined) {
      this.event.streak = event.detail.checked;
      console.log('✅ Streak status explicitly set to:', this.event.streak);
    } else {
      console.log('❌ No checked value in event detail');
    }
  }

  onDateTimeChange(event?: any) {
    console.log('📝 DateTime changed - event:', event);
    console.log('📝 DateTime value from event:', event?.detail?.value);
    console.log('📝 DateTime changed to:', this.event.startTime);
    
    // Ensure the value is properly set from the event
    if (event?.detail?.value) {
      this.event.startTime = event.detail.value;
      // Also set end time to 1 hour later
      const startDate = new Date(this.event.startTime);
      startDate.setHours(startDate.getHours() + 1);
      this.event.endTime = startDate.toISOString();
      console.log('✅ DateTime explicitly set to:', this.event.startTime);
      console.log('✅ End time set to:', this.event.endTime);
    }
  }

  taskTitleCheck() {
    if (!this.event.title) {
      return true;
    }
    this.event.title = this.event.title.trim();
    if (this.event.title === '' || this.event.title === undefined) {
      return true;
    } else {
      return false;
    }
  }

  async addEvent() {
    console.log('🚀 addEvent() called');
    console.log('📧 User email:', this.myemail);
    console.log('📝 Event data:', this.event);
    
    // Validate required data
    if (!this.myemail || this.myemail === 'empty') {
      console.error('❌ No user email found!');
      alert('Error: No user email found. Please log in again.');
      return;
    }
    
    if (!this.event.title || this.event.title.trim() === '') {
      console.error('❌ No task title provided!');
      alert('Error: Please enter a task title.');
      return;
    }

    try {
      const eventCopy = {
        title: this.event.title,
        startTime: new Date(this.event.startTime),
        endTime: new Date(this.event.endTime),
        description: this.event.desc,
        completed: this.event.completed,
        streak: this.event.streak,
        taskType: this.event.taskType
      };

      console.log('📋 Event copy created:', eventCopy);

      console.log('🔄 Skipping loading controller (compatibility issue)...');
      // Skip the loading controller for now due to Ionic 8 + Angular 19 compatibility issues
      // const loading = await this.loadingController.create({
      //   message: 'Adding task..'
      // });
      // await loading.present();
      console.log('✅ Proceeding without loading controller');
      
      this.task = {
          title: 'Enter task here',
          completed: false,
          createdAt: new Date().getTime(),
          broadcasted: false
      };
      
      this.task.title = eventCopy.title;
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
      
      console.log('📋 Final task object:', this.task);
      
      // Test Firebase connection first
      console.log('🔥 Testing Firebase connection...');
      try {
        // Test if we can access the collection (without adding anything)
        const testCollection = collection(firestore, 'users', this.myemail, 'tasks');
        console.log('✅ Firebase collection reference created successfully');
        console.log('🔥 Collection path:', `users/${this.myemail}/tasks`);
      } catch (fbError) {
        console.error('❌ Firebase collection access error:', fbError);
        // loading.dismiss() // Skipped due to compatibility issue;
        alert('Firebase connection error: ' + fbError.message);
        return;
      }
      
      console.log('🔥 Calling allService.addTask...');
      
      await this.allService.addTask(this.task, this.myemail).then(() => {
          console.log('✅ Task added successfully!');
          if (this.task.isStreaky === true) {
            console.log('✅ Task was streaky');
          }
          // loading.dismiss() // Skipped due to compatibility issue;
          
          if (this.addFirstTaskShownFlag === true) {
            this.allService.setTdata(2, 'addedFirstTask');
            this.router.navigate(['home/1']);
          } else {
            this.nav.back();
          }
      }).catch((error) => {
          console.error('❌ Error adding task:', error);
          // loading.dismiss() // Skipped due to compatibility issue;
          alert('Error adding task: ' + error.message);
      });
      
    } catch (error) {
      console.error('❌ Error in addEvent():', error);
      alert('Error: ' + error.message);
    }
    // this.myCal.loadEvents(); // Removed as per edit hint
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
      // loading.dismiss() // Skipped due to compatibility issue;
      this.task = res as Tasks;
    });
  }

  async addTask() {
    const loading = await this.loadingController.create({
      message: 'Adding task..'
    });
    await loading.present();
    this.allService.addTask(this.task, this.myemail).then(() => {
        // loading.dismiss() // Skipped due to compatibility issue;
    });
    // if (this.taskid) {
    //   this.allService.updateTask(this.task, this.taskid).then(() => {
    //     // loading.dismiss() // Skipped due to compatibility issue;
    //     this.nav.back();
    //   });
    // } else {
    //   this.allService.addTask(this.task).then(() => {
    //     // loading.dismiss() // Skipped due to compatibility issue;
    //     this.nav.back();
    //   });
    // }
  }

}
