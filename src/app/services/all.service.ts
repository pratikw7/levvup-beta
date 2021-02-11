import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { FcmService } from './fcm.service';

export interface Tasks {
  broadcasted?: boolean;
  xp?: number;
  currLevel?: number;
  nextLevel?: number;
  photo?: string;
  border?: string;
  uname?: string;
  id?: string;
  streak?: number;
  isStreaky?: boolean;
  emoji?: any;
  title: string;
  completed: boolean;
  createdAt: number;
  startTime?: Date;
  endTime?: Date;
  allDay?: boolean;
  description?: string;
  isEventType?: boolean;
  username?: string;
  dayOff?: boolean;
  email?: string;
  lastUpdatedOn?: Date;
  displayLastUpdatedOn?: any;
  displayStartTime?: number;
  longestStreak?: number;
  taskType?: string;
  tenacity?: number;
  tenacityLastUpdatedOn?: number;
  tenacityCanUpdateFlag?: boolean;
  claimedStatus?: boolean;
  xpBonus?: number;
  applyBonus?: number;
  walkthroughShown?: boolean;
  journeyBeginsShown?: boolean;
  addFirstTaskShown?: boolean;
  saveFirstTaskShown?: boolean;
}

export interface MetaData {
  border: string;
  currLevel: number;
  nextLevel: number;
  photo: string;
  xp: number;
}

export interface Friends {
  email: string;
}

export interface NewUser {
  email: string;
}


@Injectable({
  providedIn: 'root'
})
export class AllService {

  private allUsersCollection: AngularFirestoreCollection<NewUser>;
  private allUsers: Observable<NewUser[]>;
  public usersCollection: AngularFirestoreCollection<Tasks>;
  private users: Observable<Tasks[]>;
  private usersNotifs: Observable<any[]>;
  public refusersCollection: AngularFirestoreCollection<Tasks>;
  private refusers: Observable<Tasks[]>;
  private fusersCollection: AngularFirestoreCollection<Tasks>;
  private fusers: Observable<Tasks[]>;
  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);
  private friends: any[] = [];
  private tasksTemp: Tasks[] = [];
  private myemail: string;
  private tData = [];

  private userDB: NewUser;
  newUser: NewUser = {
    email: 'none'
  };


  dbObj: AngularFirestore;

  // changes in constr
  // tslint:disable-next-line: max-line-length
  constructor(private fcmService: FcmService, private afAuth: AngularFireAuth, dbFriends: AngularFirestore, dbNew: AngularFirestore) {
    this.dbObj = dbNew;
    this.allUsersCollection = dbFriends.collection('allUsers');
    this.allUsers = this.allUsersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  setTdata(id, tData) {
    this.tData[id] = tData;
  }

  getTdata(id) {
    return this.tData[id];
  }

  //changes here
  private updateToken(token) {
    this.afAuth.authState.pipe(
      take(1)
    ).subscribe(user => {
      if (!user) {
        return;
      }
      const data = {
        [user.uid]: token
      };
      this.usersCollection.doc('fcmTokens').update(data);
    });
  }

  getPermission() {
    this.messaging.requestPermission().then(() => {
      console.log('Notification permission granted.');
      return this.messaging.getToken();
    }).then(token => {
      console.log('asd: '+token);
      this.updateToken(token);
    }).catch((err) => {
      console.log('Unable to get notification permission');
    });
  }

  receiveMessage() {
    console.log("sss")
    this.messaging.onMessage((payload) => {
      console.log("sss333")
      //console.log('Message received. ', payload);
      this.currentMessage.next(payload);
    });
  }

  async sendDailyNotifs() {
    const ulist: string[] = [];
    this.allUsersCollection.ref.get().then(allDocs => {
      return allDocs.docs.forEach(doc => {
        ulist.push(doc.data().email);
        console.log(ulist.length);
      });
    }).then(() => {
      console.log(ulist[1]);
      this.fcmService.sendDailyNotifs(ulist);
    });
  }

  addUserToDB(email: string) {
    this.newUser.email = email;
    this.allUsersCollection.add(this.newUser);
    // tslint:disable-next-line: quotemark
    this.dbObj.collection(email).add({title: "I'm a task! Try deleting me!", createdAt: new Date().getTime(), completed: false});
    const data = {
      // tslint:disable-next-line: max-line-length
      border : ' ',
      // tslint:disable-next-line: max-line-length
      photo : 'https://firebasestorage.googleapis.com/v0/b/ionic-gamify.appspot.com/o/defPhoto.png?alt=media&token=6816ee63-1187-4b63-9522-ab280fb01bbf',
      currLevel : 1,
      nextLevel : 2,
      xp : 0,
      streak: 0,
      tenacity: 0,
      tenacityCanUpdateFlag: true,
      tenacityLastUpdatedOn: new Date().getDay()
    };
    const data2 = {
      streak: 0,
      lastUpdatedOn: new Date()
    };
    const tutData = {
      tutorialStatus: true,
      journeyBeginsShown: false,
      addFirstTaskShown: false,
      addFirstFriendShown: false,
      walkthroughShown: false,
      saveFirstTaskShown: false
    };
    setTimeout(() => {
      this.usersCollection = this.dbObj.collection(localStorage.getItem('userEmail'));
      this.usersCollection.doc('metaData').set(data);
      this.usersCollection.doc('boosts').set({gp: 0, xpBonus: 1});
      this.usersCollection.doc('friends').set({created: true});
      this.usersCollection.doc('111').set({uname: localStorage.getItem('userEmail'), email: localStorage.getItem('userEmail')});
      this.usersCollection.doc('tutorial').set(tutData);
      this.usersCollection.doc('consecutiveLogin').set({data2});
    }, 3000);
  }

  changePhoto(filePath) {
    const data = {
      photo: filePath
    };
    return this.usersCollection.doc('metaData').update(data);
  }

  getNotifs(email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    this.usersNotifs = this.usersCollection.doc('notifDoc').collection('notifs').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.usersNotifs;
  }

  getUserDB(email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.users;
  }

  getFriends(email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    const friends = this.usersCollection.doc('friends').snapshotChanges().pipe(
      map(actions => {
        return actions.payload.data();
      })
    );

    return friends;
  }

  async getTutStatus(email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    const showTutorial: any = await this.usersCollection.doc('tutorial').ref.get().then(doc => {
      return doc.data();
    });
    console.log(showTutorial.tutorialStatus);
    return showTutorial.tutorialStatus;
    // .then(() => {
    //   const tutStatus: boolean = showTutorial.tutorial;
    //   console.log(tutStatus);
    //   return tutStatus;
    // });
  }

  setTutStatus(status: boolean, email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    return this.usersCollection.doc('tutorial').update({tutorialStatus: status});
  }

  addFriend(sendersEmail: string, receiversEmail: string) {
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const doc = this.usersCollection.doc('/friends');
    return doc.update({
      emails: arrayUnion(receiversEmail)
    }).then( () => {
      const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
      return doc.update({
      requests: arrayRemove(receiversEmail)
      });
    }).then(() => {
      const f = this.dbObj.collection(receiversEmail).doc('/friends');
      return f.update({
      emails: arrayUnion(sendersEmail)
      }).then(() => {
        const friendAcceptNotif = firebase.functions().httpsCallable('friendAcceptNotif');
        friendAcceptNotif({email: receiversEmail, fireObj: this.dbObj}).then(result => {
          console.log(result.data());
          return true;
        });
      });
    });
  }

  sendFriendRequest(sendersEmail: string, receiversEmail: string) {
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const req = this.dbObj.collection(receiversEmail).doc('/friends');
    //get senders dtls
    this.dbObj.collection(receiversEmail).doc('metaData').ref.get().then( metaData => {
      const metaData2: any = metaData.data(); 
      this.dbObj.collection(receiversEmail).doc('notifDoc').collection('notifs')
     .add({sender:'New friend request!' , senderDp: metaData2.photo, title: 'from ' + sendersEmail}).catch(error => {
      console.log(error);
    });
    });
    

    //
    if (req !== null || req !== undefined) {
      this.fcmService.freq(sendersEmail, receiversEmail);
      return req.update({
        requests: arrayUnion(sendersEmail)
      });
    } else {
      alert('User not found.');
    }

  }

  deleteFriendRequest(email: string) {
    const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
    const doc = this.usersCollection.doc('/friends');
    return doc.update({
      requests: arrayRemove(email)
    });
  }

  delFriend(sendersEmail: string, receiversEmail: string) {
    const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
    const doc = this.usersCollection.doc('/friends');
    return doc.update({
      emails: arrayRemove(receiversEmail)
    }).then( () => {
      const doc2 = this.dbObj.collection(receiversEmail).doc('/friends');
      return doc2.update({
      emails: arrayRemove(sendersEmail)
      });
    });
  }

  initDB(email: string) {
    // this.newUser.email = email;
    // this.allUsersCollection.add(this.newUser);
    firebase.database().ref('' + email + '/').set({
      username: email,
      title: 'Task title',
      completed: true,
    });
  }

  getAllUsers() {
    return this.allUsers;
  }

  getFriendsRequests(email: string) {
    this.usersCollection = this.dbObj.collection(email);
    this.refusersCollection = this.dbObj.collection(email);

    const friends = this.usersCollection.doc('friends').snapshotChanges().pipe(
      map(actions => {
        return actions.payload.data();
      })
    );

    return friends;
  }

  getFriendDB(email: string) {
    this.fusersCollection = this.dbObj.collection(email);

    this.fusers = this.fusersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );

    return this.fusers;
  }

  getUsers() {
    return this.users;
  }

  async addTask(task: Tasks, myemail: string) {
    if (task.completed === true) {
      const flist = await this.usersCollection.doc('friends').ref.get().then(doc => {
      return doc.data();
    });
      if (!task.isStreaky) {
        task.broadcasted = true;
      }
      console.log('fcm b');
      this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
      return this.usersCollection.add(task);
    } else {
      return this.usersCollection.add(task);
    }
  }
// check here if notif for the task was broadcasted or not! if it was Bt'd then don;t send else send to all Friends
// update this to a func which sends F's tokens & task title as i/p to the FCM func

  // updateTask(task: Tasks, id: string) {
  //   return this.usersCollection.doc(id).update(task);
  // }

  async updateTask(task: Tasks, id: string, myemail: string) {
      const x = await this.usersCollection.doc(id).ref.get().then(doc => {
      return doc.data();
    });
      if (x.broadcasted === false && task.completed === true) {
        const flist = await this.usersCollection.doc('friends').ref.get().then(doc => {
        return doc.data();
      });
        if (!task.isStreaky) {
          task.broadcasted = true;
        }
        console.log('fcm b');
        this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
        return this.usersCollection.doc(id).update(task);
    } else {
      return this.usersCollection.doc(id).update(task);
    }
  }

  updateMetaData(data: any) {
    return this.usersCollection.doc('metaData').update(data);
  }

  updateTutorial(data: any) {
    return this.usersCollection.doc('tutorial').update(data);
  }

  updateBoosts(data: any) {
    return this.usersCollection.doc('boosts').update(data);
  }

  updateConsecutiveLogin(data: any) {
    return this.usersCollection.doc('consecutiveLogin').update(data);
  }

  updateUname(data: any) {
    return this.usersCollection.doc('111').update(data);
  }

  removeTask(id) {
      return this.usersCollection.doc(id).delete();
  }

  removeNotif(id) {
    return this.usersCollection.doc('notifDoc').collection('notifs').doc(id).delete();
  }

  updateNotif(notif, id: string) {
    return this.usersCollection.doc('notifDoc').collection('notifs').doc(id).update(notif);
  }

  getUser(id) {
    return this.usersCollection.doc<Tasks>(id).valueChanges();
  }
}
