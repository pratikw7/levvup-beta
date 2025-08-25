import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, getDoc, orderBy, limit, startAfter, FieldValue, arrayUnion, arrayRemove, addDoc, deleteDoc, onSnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, set } from 'firebase/database';
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FcmService } from './fcm.service';
import { auth, firestore, messaging, functions, database } from '../firebase.config';

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

  private allUsersCollection = collection(firestore, 'allUsers');
  private allUsers: Observable<NewUser[]>;
  private usersCollection: any;
  private users: Observable<Tasks[]>;
  private usersNotifs: Observable<any[]>;
  private refusersCollection: any;
  private refusers: Observable<Tasks[]>;
  private fusersCollection: any;
  private fusers: Observable<Tasks[]>;
  // messaging is imported from firebase.config
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
    this.dbObj = firestore;
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

  // Helper function to migrate user data from old structure to new structure
  async migrateUserData(email: string) {
    console.log('🔄 Attempting to migrate user data from old to new structure for:', email);
    
    try {
      const sanitizedEmail = email.replace(/\./g, '_');
      
      // Check if data exists in old structure
      const oldMetaDataDoc = await getDoc(doc(firestore, sanitizedEmail, 'metaData'));
      
      if (oldMetaDataDoc.exists()) {
        console.log('📁 Found data in old structure, migrating...');
        const oldData = oldMetaDataDoc.data();
        
        // Create new structure documents
        await setDoc(doc(firestore, 'users', email, 'data', 'metaData'), oldData);
        console.log('✅ MetaData migrated successfully');
        
        // Migrate other documents if they exist
        const oldTutorialDoc = await getDoc(doc(firestore, sanitizedEmail, 'tutorial'));
        if (oldTutorialDoc.exists()) {
          await setDoc(doc(firestore, 'users', email, 'data', 'tutorial'), oldTutorialDoc.data());
          console.log('✅ Tutorial data migrated successfully');
        }
        
        return true;
      } else {
        console.log('📭 No data found in old structure for migration');
        return false;
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
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
    return getToken(messaging).then(token => {
      console.log('asd: '+token);
      this.updateToken(token);
      return token;
    });
  }

  updateToken(token: string) {
    // Update token in Firestore
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setDoc(doc(firestore, userEmail, 'metaData'), { devices: token }, { merge: true });
    }
  }

  receiveMessage() {
    console.log("sss")
    onMessage(messaging, (payload) => {
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
    
    // Add initial task - fix collection reference
    addDoc(collection(firestore, 'users', email, 'tasks'), {title: "I'm a task! Try deleting me!", createdAt: new Date().getTime(), completed: false});
    
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
      this.usersCollection = collection(firestore, 'users', email, 'data');
      setDoc(doc(firestore, 'users', email, 'data', 'metaData'), data);
      setDoc(doc(firestore, 'users', email, 'data', 'boosts'), {gp: 0, xpBonus: 1});
      setDoc(doc(firestore, 'users', email, 'data', 'friends'), {created: true});
      setDoc(doc(firestore, 'users', email, 'data', 'profile'), {uname: email, email: email});
      setDoc(doc(firestore, 'users', email, 'data', 'tutorial'), tutData);
      setDoc(doc(firestore, 'users', email, 'data', 'consecutiveLogin'), {data2});
    }, 3000);
  }

  updatePhoto(filePath: string, email: string) {
    const data = {
      photo: filePath
    };
    return updateDoc(doc(firestore, 'users', email, 'data', 'metaData'), data);
  }

  getNotifs(email: string) {
    this.usersNotifs = new Observable(observer => {
      // Try new structure first: users/email/notifications
      const unsubscribeNew = onSnapshot(collection(firestore, 'users', email, 'notifications'), (snapshot) => {
        if (!snapshot.empty) {
          const notifs: any[] = [];
          snapshot.forEach((doc) => {
            notifs.push({ ...doc.data(), id: doc.id });
          });
          console.log('✅ Notifications loaded from NEW structure:', notifs.length, 'notifications');
          observer.next(notifs);
        } else {
          // Try old structure: legacy-users/sanitized-email/notifDoc/notifs (fallback for existing users)
          console.log('🔄 New notification structure empty, trying old structure...');
          const sanitizedEmail = email.replace(/\./g, '_');
          const unsubscribeOld = onSnapshot(collection(firestore, 'legacy-users', sanitizedEmail, 'notifDoc', 'notifs'), (snapshot) => {
            const notifs: any[] = [];
            snapshot.forEach((doc) => {
              notifs.push({ ...doc.data(), id: doc.id });
            });
            console.log('✅ Notifications loaded from OLD structure:', notifs.length, 'notifications');
            observer.next(notifs);
          }, (error) => {
            console.error('❌ Error loading notifications from old structure:', error);
            observer.next([]);
          });
        }
      }, (error) => {
        console.error('❌ Error loading notifications from new structure:', error);
        // Try old structure as fallback
        console.log('🔄 Trying old notification structure as fallback...');
        const sanitizedEmail = email.replace(/\./g, '_');
        const unsubscribeOld = onSnapshot(collection(firestore, 'legacy-users', sanitizedEmail, 'notifDoc', 'notifs'), (snapshot) => {
          const notifs: any[] = [];
          snapshot.forEach((doc) => {
            notifs.push({ ...doc.data(), id: doc.id });
          });
          console.log('✅ Notifications loaded from OLD structure (fallback):', notifs.length, 'notifications');
          observer.next(notifs);
        }, (fallbackError) => {
          console.error('❌ Error loading notifications from old structure (fallback):', fallbackError);
          observer.next([]);
        });
      });
    });
    return this.usersNotifs;
  }

  getUserDB(email: string) {
    this.users = new Observable<Tasks[]>(observer => {
      // Try new structure first: users/email/tasks
      const unsubscribeNew = onSnapshot(collection(firestore, 'users', email, 'tasks'), (snapshot) => {
        if (!snapshot.empty) {
          const tasks: Tasks[] = [];
          snapshot.forEach((doc) => {
            tasks.push({ ...doc.data() as Tasks, id: doc.id });
          });
          console.log('✅ Tasks loaded from NEW structure:', tasks.length, 'tasks');
          observer.next(tasks);
        } else {
          // Try old structure: legacy-users/sanitized-email/tasks (fallback for existing users)
          console.log('🔄 New structure empty, trying old structure...');
          const sanitizedEmail = email.replace(/\./g, '_');
          const unsubscribeOld = onSnapshot(collection(firestore, 'legacy-users', sanitizedEmail, 'tasks'), (snapshot) => {
            const tasks: Tasks[] = [];
            snapshot.forEach((doc) => {
              tasks.push({ ...doc.data() as Tasks, id: doc.id });
            });
            console.log('✅ Tasks loaded from OLD structure:', tasks.length, 'tasks');
            observer.next(tasks);
          }, (error) => {
            console.error('❌ Error loading tasks from old structure:', error);
            observer.next([]);
          });
        }
      }, (error) => {
        console.error('❌ Error loading tasks from new structure:', error);
        // Try old structure as fallback
        console.log('🔄 Trying old structure as fallback...');
        const sanitizedEmail = email.replace(/\./g, '_');
        const unsubscribeOld = onSnapshot(collection(firestore, 'legacy-users', sanitizedEmail, 'tasks'), (snapshot) => {
          const tasks: Tasks[] = [];
          snapshot.forEach((doc) => {
            tasks.push({ ...doc.data() as Tasks, id: doc.id });
          });
          console.log('✅ Tasks loaded from OLD structure (fallback):', tasks.length, 'tasks');
          observer.next(tasks);
        }, (fallbackError) => {
          console.error('❌ Error loading tasks from old structure (fallback):', fallbackError);
          observer.next([]);
        });
      });
    });
    return this.users;
  }

  getFriends(email: string) {
    const friends = new Observable(observer => {
      onSnapshot(doc(firestore, 'users', email, 'data', 'friends'), (doc) => {
        if (doc.exists()) {
          observer.next(doc.data());
        }
      });
    });
    return friends;
  }

  async getTutStatus(email: string) {
    const showTutorial: any = await getDoc(doc(firestore, 'users', email, 'data', 'tutorial')).then(docSnap => {
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    });
    return showTutorial;
  }

  setTutStatus(status: boolean, email: string) {
    return updateDoc(doc(firestore, 'users', email, 'data', 'tutorial'), {tutorialStatus: status});
  }

  addFriend(sendersEmail: string, receiversEmail: string) {
    const docRef = doc(firestore, 'users', sendersEmail, 'data', 'friends');
    return updateDoc(docRef, {
      emails: arrayUnion(receiversEmail)
    }).then( () => {
      return updateDoc(docRef, {
        requests: arrayRemove(receiversEmail)
      });
    }).then(() => {
      const f = doc(firestore, 'users', receiversEmail, 'data', 'friends');
      return updateDoc(f, {
        emails: arrayUnion(sendersEmail)
      }).then(() => {
        const friendAcceptNotif = httpsCallable(functions, 'friendAcceptNotif');
        friendAcceptNotif({email: receiversEmail, fireObj: this.dbObj}).then(result => {
          if (result && result.data) {
            console.log(result.data);
          }
        });
      });
    });
  }

  sendFriendRequest(sendersEmail: string, receiversEmail: string) {
    const req = doc(firestore, 'users', receiversEmail, 'data', 'friends');
    
    //get senders dtls
    getDocs(collection(firestore, 'users', receiversEmail, 'data')).then( metaData => {
      const metaData2: any = metaData.docs[0]?.data(); 
      const notifCollection = collection(firestore, 'users', receiversEmail, 'notifications');
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
    const userEmail = localStorage.getItem('userEmail') || '';
    const docRef = doc(firestore, 'users', userEmail, 'data', 'friends');
    return updateDoc(docRef, {
      requests: arrayRemove(email)
    });
  }

  delFriend(sendersEmail: string, receiversEmail: string) {
    const docRef = doc(firestore, 'users', sendersEmail, 'data', 'friends');
    return updateDoc(docRef, {
      emails: arrayRemove(receiversEmail)
    }).then( () => {
      const doc2 = doc(firestore, 'users', receiversEmail, 'data', 'friends');
      return updateDoc(doc2, {
        emails: arrayRemove(sendersEmail)
      });
    });
  }

  addUserToRealtimeDB(email: string) {
    set(ref(database, email + '/'), {
      username: email,
      title: 'Task title',
      completed: false,
      createdAt: new Date().getTime()
    });
  }

  getFriendsRequests(email: string) {
    const friends = new Observable(observer => {
      onSnapshot(doc(firestore, 'users', email, 'data', 'friends'), (doc) => {
        if (doc.exists()) {
          observer.next(doc.data());
        }
      });
    });
    return friends;
  }

  getFriendDB(email: string) {
    this.fusers = new Observable<Tasks[]>(observer => {
      onSnapshot(collection(firestore, 'users', email, 'tasks'), (snapshot) => {
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
      const flist = await getDocs(collection(firestore, 'users', myemail, 'friends')).then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      });
      
      if (flist && flist.emails && flist.emails.length > 0) {
        console.log('fcm b');
        this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
      }
      return addDoc(collection(firestore, 'users', myemail, 'tasks'), task as any);
    } else {
      return addDoc(collection(firestore, 'users', myemail, 'tasks'), task as any);
    }
  }

  async updateTask(task: Tasks, id: string, myemail: string) {
    const x = await getDocs(collection(firestore, 'users', myemail, 'tasks')).then(snapshot => {
      const doc = snapshot.docs.find(d => d.id === id);
      return doc ? doc.data() : null;
    });
    
    if (x && x.broadcasted === false && task.completed === true) {
      const flist = await getDocs(collection(firestore, 'users', myemail, 'friends')).then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      });
      
      if (flist && flist.emails && flist.emails.length > 0) {
        console.log('fcm b');
        this.fcmService.broadcastToAll(flist.emails, task.title, myemail);
      }
      return updateDoc(doc(firestore, 'users', myemail, 'tasks', id), task as any);
    } else {
      return updateDoc(doc(firestore, 'users', myemail, 'tasks', id), task as any);
    }
  }

  async updateMetaData(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      console.log('🔄 UpdateMetaData: Starting update for email:', userEmail);
      
      try {
        // First try to ensure the document exists in the new structure by using setDoc with merge
        await setDoc(doc(firestore, 'users', userEmail, 'data', 'metaData'), data, { merge: true });
        console.log('✅ UpdateMetaData: New structure update successful');
        return;
      } catch (error) {
        console.log('🔄 UpdateMetaData: New structure failed, attempting migration...');
        console.error('New structure error:', error);
        
        try {
          // Try to migrate data from old structure
          const migrated = await this.migrateUserData(userEmail);
          
          if (migrated) {
            // Try updating new structure again after migration
            await setDoc(doc(firestore, 'users', userEmail, 'data', 'metaData'), data, { merge: true });
            console.log('✅ UpdateMetaData: New structure update successful after migration');
            return;
          } else {
            // No migration possible, fallback to old structure
            const sanitizedEmail = userEmail.replace(/\./g, '_');
            await setDoc(doc(firestore, sanitizedEmail, 'metaData'), data, { merge: true });
            console.log('✅ UpdateMetaData: Old structure update successful');
            return;
          }
        } catch (migrationError) {
          console.error('❌ UpdateMetaData: Migration and fallback failed');
          console.error('Migration error:', migrationError);
          throw migrationError;
        }
      }
    } else {
      console.error('❌ UpdateMetaData: No userEmail found in localStorage');
      throw new Error('No user email found');
    }
  }

  updateTutorial(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      console.log('🔄 UpdateTutorial: Starting update for email:', userEmail);
      
      // First try to ensure the document exists in the new structure by using setDoc with merge
      return setDoc(doc(firestore, 'users', userEmail, 'data', 'tutorial'), data, { merge: true })
        .then(() => {
          console.log('✅ UpdateTutorial: New structure update successful');
        })
        .catch(error => {
          console.log('🔄 UpdateTutorial: New structure failed, trying old structure...');
          console.error('New structure error:', error);
          
          // Fallback to old structure
          const sanitizedEmail = userEmail.replace(/\./g, '_');
          return setDoc(doc(firestore, sanitizedEmail, 'tutorial'), data, { merge: true })
            .then(() => {
              console.log('✅ UpdateTutorial: Old structure update successful');
            })
            .catch(oldError => {
              console.error('❌ UpdateTutorial: Both structures failed');
              console.error('Old structure error:', oldError);
              throw oldError;
            });
        });
    } else {
      console.error('❌ UpdateTutorial: No userEmail found in localStorage');
      return Promise.reject(new Error('No user email found'));
    }
  }

  updateBoosts(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return setDoc(doc(firestore, 'users', userEmail, 'data', 'boosts'), data, { merge: true });
    }
  }

  updateConsecutiveLogin(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return setDoc(doc(firestore, 'users', userEmail, 'data', 'consecutiveLogin'), data, { merge: true });
    }
  }

  updateUname(data: any) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return setDoc(doc(firestore, 'users', userEmail, 'data', 'profile'), data, { merge: true });
    }
  }

  removeTask(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return deleteDoc(doc(firestore, 'users', userEmail, 'tasks', id));
    }
  }

  removeNotif(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return deleteDoc(doc(firestore, 'users', userEmail, 'notifications', id));
    }
  }

  updateNotif(notif: any, id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return updateDoc(doc(firestore, 'users', userEmail, 'notifications', id), notif);
    }
  }

  getUser(id: string) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return new Observable(observer => {
        onSnapshot(doc(firestore, 'users', userEmail, 'tasks', id), (doc) => {
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
    return updateDoc(doc(firestore, email, 'metaData'), data);
  }
}
