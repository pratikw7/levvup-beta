import { Component, OnInit } from '@angular/core';
import { AllService, NewUser, Tasks } from '../services/all.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
  tasks: Tasks[] = [];
  tasksTemp: Tasks[] = [];
  tasksTemp2: Tasks[] = [];
  tasksTemp3: Tasks[] = [];
  tasks2: Tasks[];
  tasks3: Tasks[];
  friends: any[] = [];
  frequests: any[] = [];
  friendEmail: string;
  prg = 0.0;
  prg2 = 0.0;
  currLevel: number;
  photoURL: string;
  borderURL: string;
  searchedItem: any[] = [];
  searchedItem2: any[] = [];
  isVisibleFriend: boolean;

  flist: any;
  public findex = 1;

  public baseProvider: any;
  error: any;
  public myemail: string;
  taskid: any;
  nav: any;
  allUsers: NewUser[] = [];
  isDisabled: boolean;
  constructor(private loadingController: LoadingController,
              private allService: AllService,
              private alertCtrl: AlertController,
              private dataService: DataService,
              private router: Router) {
    this.myemail = localStorage.getItem('userEmail');
    this.findex = 1;
  }

  _ionChange(event) {
    const val = event.target.value;
    this.isVisibleFriend = false;

    if (val && val.trim() !== '') {
      this.searchedItem2 = this.searchedItem.filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.searchedItem2 = [];
      this.friendEmail = '';
    }
  }

  setEmail(email: string) {
    this.friendEmail = email;
  }

  async ngOnInit() {
    // await LocalNotifications.requestPermissions();
    // this.friends = null;

    this.isVisibleFriend = false;
    console.log('TEST!' + this.allService.getTdata(2));
    if (this.allService.getTdata(2) === 'toAddFriend') {
      console.log('toAddFriend recvd');
      // tslint:disable-next-line: max-line-length
      this.isDisabled = true;
      this.showAlert('Add your first friend!', 'Try adding a friend by entering their email here. You can view levels, tasks, add/remove and view friends on this page.', 'Okay');
    }
    this.friends = [];
    this.frequests = [];
    this.myemail = localStorage.getItem('userEmail');
    this.allService.getAllUsers().subscribe(res => {
      this.allUsers = res;
      this.allUsers.forEach( e => {
        this.searchedItem.push(e.email);
        // console.log(e.email);
      });
    });

    if (this.myemail !== 'empty') {
      this.allService.getFriends(this.myemail).subscribe(res => {
          // this.friends = null;
          this.friends = [];
          this.frequests = [];
          const x: any = res;
          if (x.requests !== undefined) {
            x.requests.forEach(req => {
              this.frequests.push(req);
              console.log(this.frequests);
            });
          }
          if (x.emails !== undefined) {
          x.emails.forEach(friend => {
              this.friends.push(friend);
          });
          this.nextFriend();
        } else {
          // alert('Add friends to view them');
        }
      });
    }
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
            if (header1 === 'Friend request sent!') {
              this.isVisibleFriend = false;
              this.isDisabled = false;
              this.allService.setTdata(3, 'toSettings');
              this.router.navigate(['/settings']);
            }
            if (header1 === 'Add your first friend!') {
              this.isVisibleFriend = true;
              console.log(this.isVisibleFriend);
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

  nextFriend() {
    this.nextFriend2(this.friends[0]);
  }

  nextFriend2(email: string) {
    this.allService.getFriendDB(email).subscribe(res2 => {
      this.tasksTemp2 = this.tasksTemp2.concat(res2);
      if (this.findex < this.friends.length) {
        this.nextFriend2(this.friends[this.findex++]);
      } else {
          let findLvl = false;
          let k = 0;
          // tslint:disable-next-line: prefer-for-of
          for ( let i = 0; i < this.tasksTemp2.length; i++) {
            if (this.tasksTemp2[i].id !== 'friends') {
              if (this.tasksTemp2[i].id === '111') {
                  this.tasksTemp3.push(this.tasksTemp2[i]);
                  findLvl = true;
                  k = i;
              }
              if (findLvl === false && this.tasksTemp2[i].id !== 'metaData') {
                if (this.tasksTemp2[i].lastUpdatedOn) {
                  this.tasksTemp2[i].displayLastUpdatedOn = this.getLastUpdatedOn(this.tasksTemp2[i]);
                }
                if (this.tasksTemp2[i].startTime) {
                  this.tasksTemp2[i].displayStartTime = this.getStartTime(this.tasksTemp2[i]);
                }
                this.tasksTemp3.push(this.tasksTemp2[i]);
              }
              if (findLvl === true) {
                if (this.tasksTemp2[i].id === 'metaData') {
                  this.tasksTemp3.push(this.tasksTemp2[i]);
                  findLvl = false;
                  i = k;
                }
              }
           }
        }

          this.tasks = [];
          this.tasks = this.tasksTemp3;
          this.findex = 1;
          this.tasksTemp2 = [];
          this.tasksTemp3 = [];
          this.currLevel = 0;
        }
    });
  }

  getStartTime(task: any) {
    return task.startTime.toDate().getTime();
  }

  getLastUpdatedOn(task: any) {
    const t = task.lastUpdatedOn.toDate();
    return t.getTime();
  }

  async sendFriendRequest() {
    const loading = await this.loadingController.create({
      message: 'Sending friend request..'
    });
    await loading.present();
    this.allService.sendFriendRequest(this.myemail, this.friendEmail).then(() => {
    // tslint:disable-next-line: align
    loading.dismiss();
    this.allService.setTdata(2, 'FriendTutCompleted');
    console.log(this.allService.getTdata(2));
    if (this.allService.getTdata(2) === 'FriendTutCompleted') {
      this.allService.setTdata(2, 'Done');
      // tslint:disable-next-line: max-line-length
      this.showAlert('Friend request sent!', 'Congratulations on sending your first friend request! Adding friends helps us be more accountable. Now lets add a username and profile picture of your choice :)', 'Sounds cool!');
    }
    }).catch((error) => {
      alert('User not found.');
      loading.dismiss();
    });
  }

  async addFriend(email: string) {
    const loading = await this.loadingController.create({
      message: 'Adding friend...'
    });
    await loading.present();
    this.allService.addFriend(this.myemail, email).then(() => {
      const n: number = this.frequests.indexOf(email);
      if (n !== -1) {
        this.frequests.splice(n, 1);
      }
      loading.dismiss();
    });
  }

  async delFriend() {
    const loading = await this.loadingController.create({
      message: 'Removing friend...'
    });
    await loading.present();
    this.allService.delFriend(this.myemail, this.friendEmail).then(() => {
          loading.dismiss();
    });
  }

  async deleteFriendRequest(email) {
    const loading = await this.loadingController.create({
      message: 'Deleting friend request..'
    });
    await loading.present();
    this.allService.deleteFriendRequest(email).then(() => {
      const n: number = this.frequests.indexOf(email);
      if (n !== -1) {
        this.frequests.splice(n, 1);
      }
      loading.dismiss();
    });
  }

  openFriendProfile(email: string) {
    this.dataService.setData(email);
    this.router.navigate([`/friend-profile/${email}`]);
  }
}
