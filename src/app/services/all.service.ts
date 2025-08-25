import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, startAfter, FieldValue, arrayUnion, arrayRemove, addDoc, deleteDoc, onSnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
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
  // Add missing properties for Firebase compatibility
  gp?: number;
  tutorialStatus?: boolean;
  addFirstFriendShown?: boolean;
  emails?: any[];
  requests?: any[];
  data2?: any;
  created?: boolean;
  notifDoc?: any;
  notifs?: any[];
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
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AllService {

  private allUsersCollection = collection(getFirestore(), 'allUsers');
  private allUsers: Observable<NewUser[]>;
  private usersCollection: any;
  private users: Observable<Tasks[]>;
  private usersNotifs: Observable<any[]>;
  private refusersCollection: any;
  private refusers: Observable<Tasks[]>;
  private fusersCollection: any;
  private fusers: Observable<Tasks[]>;
  messaging = getMessaging();
  currentMessage = new BehaviorSubject(null);
  private friends: any[] = [];
  private tasksTemp: Tasks[] = [];
  private myemail: string;
  private tData = [];

  private userDB: NewUser;
  newUser: NewUser = {
    email: 'none'
  };

  dbObj: any;

  constructor(private fcmService: FcmService) {
    this.dbObj = getFirestore();
    this.allUsers = new Observable<NewUser[]>(observer => {
      onSnapshot(this.allUsersCollection, (snapshot) => {
        const users: NewUser[] = [];
        snapshot.forEach((doc) => {
          users.push({ ...doc.data() as NewUser, id: doc.id });
        });
        observer.next(users);
      });
    });
  }

  getAllUsers() {
    return this.allUsers;
  }

  getTdata(index: number) {
    return this.tData[index];
  }

  setTdata(index: number, value: any) {
    this.tData[index] = value;
  }

  getPermission() {
    return getToken(this.messaging).then(token => {
      console.log('asd: '+token);
      this.updateToken(token);
      return token;
    });
  }

  updateToken(token: string) {
    // Update token in Firestore
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setDoc(doc(getFirestore(), userEmail, 'metaData'), { devices: token }, { merge: true });
    }
  }

  receiveMessage() {
    console.log("sss")
    onMessage(this.messaging, (payload) => {
      console.log("sss333")
      //console.log('Message received. ', payload);
      this.currentMessage.next(payload);
    });
  }

  async sendDailyNotifs() {
    const ulist: string[] = [];
    const allDocs = await getDocs(this.allUsersCollection);
    allDocs.forEach(doc => {
      ulist.push(doc.data().email);
      console.log(ulist.length);
    });
    this.fcmService.sendDailyNotifs(ulist);
  }

  addUserToDB(email: string) {
    this.newUser.email = email;
    addDoc(this.allUsersCollection, this.newUser);
    
    // Add initial task
    setDoc(doc(getFirestore(), email, 'tasks'), {title: "I'm a task! Try deleting me!", createdAt: new Date().getTime(), completed: false});
    
    const data = {
      border : ' ',
      photo : ' ',
      currLevel : 1,
      nextLevel : 2,
      xp : 0,
      streak : 0,
      tenacity : 0,
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
      this.usersCollection = collection(getFirestore(), email);
      setDoc(doc(this.usersCollection, 'metaData'), data);
      setDoc(doc(this.usersCollection, 'boosts'), {gp: 0, xpBonus: 1});
      setDoc(doc(this.usersCollection, 'friends'), {created: true});
      setDoc(doc(this.usersCollection, '111'), {uname: email, email: email});
      setDoc(doc(this.usersCollection, 'tutorial'), tutData);
      setDoc(doc(this.usersCollection, 'consecutiveLogin'), {data2});
    }, 3000);
  }

  updatePhoto(filePath: string, email: string) {
    const data = {
      photo: filePath
    };
    return updateDoc(doc(getFirestore(), email, 'metaData'), data);
  }

  getNotifs(email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    this.usersNotifs = new Observable(observer => {
      onSnapshot(collection(doc(this.usersCollection, 'notifDoc'), 'notifs'), (snapshot) => {
        const notifs: any[] = [];
        snapshot.forEach((doc) => {
          notifs.push({ ...doc.data(), id: doc.id });
        });
        observer.next(notifs);
      });
    });
    return this.usersNotifs;
  }

  getUserDB(email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    this.users = new Observable<Tasks[]>(observer => {
      onSnapshot(collection(this.usersCollection, 'tasks'), (snapshot) => {
        const tasks: Tasks[] = [];
        snapshot.forEach((doc) => {
          tasks.push({ ...doc.data() as Tasks, id: doc.id });
        });
        observer.next(tasks);
      });
    });
    return this.users;
  }

  getFriends(email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    const friends = new Observable(observer => {
      onSnapshot(doc(this.usersCollection, 'friends'), (doc) => {
        if (doc.exists()) {
          observer.next(doc.data());
        }
      });
    });
    return friends;
  }

  async getTutStatus(email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    const showTutorial: any = await getDocs(collection(this.usersCollection, 'tutorial')).then(snapshot => {
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    });
    return showTutorial;
  }

  setTutStatus(status: boolean, email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    return updateDoc(doc(this.usersCollection, 'tutorial'), {tutorialStatus: status});
  }

  addFriend(sendersEmail: string, receiversEmail: string) {
    const docRef = doc(collection(getFirestore(), sendersEmail), 'friends');
    return updateDoc(docRef, {
      emails: arrayUnion(receiversEmail)
    }).then( () => {
      return updateDoc(docRef, {
        requests: arrayRemove(receiversEmail)
      });
    }).then(() => {
      const f = doc(collection(getFirestore(), receiversEmail), 'friends');
      return updateDoc(f, {
        emails: arrayUnion(sendersEmail)
      }).then(() => {
        const friendAcceptNotif = httpsCallable(getFunctions(), 'friendAcceptNotif');
        friendAcceptNotif({email: receiversEmail, fireObj: this.dbObj}).then(result => {
          if (result && result.data) {
            console.log(result.data);
          }
        });
      });
    });
  }

  sendFriendRequest(sendersEmail: string, receiversEmail: string) {
    const req = doc(collection(getFirestore(), receiversEmail), 'friends');
    
    //get senders dtls
    getDocs(collection(getFirestore(), receiversEmail)).then( metaData => {
      const metaData2: any = metaData.docs[0]?.data(); 
      const notifCollection = collection(doc(collection(getFirestore(), receiversEmail), 'notifDoc'), 'notifs');
      addDoc(notifCollection, {sender:'New friend request!' , senderDp: metaData2?.photo, title: 'from ' + sendersEmail}).catch(error => {
        console.log(error);
      });
    });

    if (req !== null || req !== undefined) {
      this.fcmService.freq(sendersEmail, receiversEmail);
      return updateDoc(req, {
        requests: arrayUnion(sendersEmail)
      });
    }
  }

  deleteFriendRequest(email: string) {
    const docRef = doc(collection(getFirestore(), localStorage.getItem('userEmail') || ''), 'friends');
    return updateDoc(docRef, {
      requests: arrayRemove(email)
    });
  }

  delFriend(sendersEmail: string, receiversEmail: string) {
    const docRef = doc(collection(getFirestore(), sendersEmail), 'friends');
    return updateDoc(docRef, {
      emails: arrayRemove(receiversEmail)
    }).then( () => {
      const doc2 = doc(collection(getFirestore(), receiversEmail), 'friends');
      return updateDoc(doc2, {
        emails: arrayRemove(sendersEmail)
      });
    });
  }

  addUserToRealtimeDB(email: string) {
    set(ref(getDatabase(), email + '/'), {
      username: email,
      title: 'Task title',
      completed: false,
      createdAt: new Date().getTime()
    });
  }

  getFriendsRequests(email: string) {
    this.usersCollection = collection(getFirestore(), email);
    this.refusersCollection = collection(getFirestore(), email);

    const friends = new Observable(observer => {
      onSnapshot(doc(this.usersCollection, 'friends'), (doc) => {
        if (doc.exists()) {
          observer.next(doc.data());
        }
      });
    });
    return friends;
  }

  getFriendDB(email: string) {
    this.fusersCollection = collection(getFirestore(), email);

    this.fusers = new Observable<Tasks[]>(observer => {
      onSnapshot(collection(this.fusersCollection, 'tasks'), (snapshot) => {
        const tasks: Tasks[] = [];
        snapshot.forEach((doc) => {
          tasks.push({ ...doc.data() as Tasks, id: doc.id });
        });
        observer.next(tasks);
      });
    });
    return this.fusers;
  }

  async addTask(task: Tasks, myemail: string) {
    if (task.completed === true) {
      const flist = await getDocs(collection(collection(getFirestore(), myemail), 'friends')).then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      });
      
      if (flist && flist.emails && flist.emails.length > 0) {
        console.log('fcm b');
        this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
      }
      return addDoc(collection(getFirestore(), myemail, 'tasks'), task as any);
    } else {
      return addDoc(collection(getFirestore(), myemail, 'tasks'), task as any);
    }
  }

  async updateTask(task: Tasks, id: string, myemail: string) {
    const x = await getDocs(collection(collection(getFirestore(), myemail), 'tasks')).then(snapshot => {
      const doc = snapshot.docs.find(d => d.id === id);
      return doc ? doc.data() : null;
    });
    
    if (x && x.broadcasted === false && task.completed === true) {
      const flist = await getDocs(collection(collection(getFirestore(), myemail), 'friends')).then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      });
      
      if (flist && flist.emails && flist.emails.length > 0) {
        console.log('fcm b');
        this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
      }
      return updateDoc(doc(collection(getFirestore(), myemail, 'tasks'), id), task as any);
    } else {
      return updateDoc(doc(collection(getFirestore(), myemail, 'tasks'), id), task as any);
    }
  }

  updateMetaData(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail), 'metaData'), data);
    }
  }

  updateTutorial(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail), 'tutorial'), data);
    }
  }

  updateBoosts(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail), 'boosts'), data);
    }
  }

  updateConsecutiveLogin(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail), 'consecutiveLogin'), data);
    }
  }

  updateUname(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail), '111'), data);
    }
  }

  removeTask(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return deleteDoc(doc(collection(getFirestore(), userEmail, 'tasks'), id));
    }
  }

  removeNotif(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return deleteDoc(doc(collection(getFirestore(), userEmail, 'notifDoc', 'notifs'), id));
    }
  }

  updateNotif(notif: any, id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(collection(getFirestore(), userEmail, 'notifDoc', 'notifs'), id), notif);
    }
  }

  getUser(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return new Observable(observer => {
        onSnapshot(doc(collection(getFirestore(), userEmail, 'tasks'), id), (doc) => {
          if (doc.exists()) {
            observer.next({ ...doc.data() as Tasks, id: doc.id });
          }
        });
      });
    }
  }

  changePhoto(filePath: string, email: string) {
    const data = {
      photo: filePath
    };
    return updateDoc(doc(getFirestore(), email, 'metaData'), data);
  }
}
