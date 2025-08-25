import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, updateDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  token: string | null = null;
  private messaging = getMessaging();
  private dbObj = getFirestore();
  private myEmail: string;

  constructor(
    private toastController: ToastController
  ) {
    this.myEmail = localStorage.getItem('userEmail') || '';
   }

  async makeToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      // buttons: 'Ok'
    });
    toast.present();
  }

  getPermission() {
    console.log('Permission requested');
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      return getToken(this.messaging).then(token => {
        this.token = token;
        updateDoc(doc(this.dbObj, userEmail, 'metaData'), {
          devices: token
        });
        return token;
      });
    }
    return Promise.resolve(null);
  }

  showMessages() {
    return new Observable(observer => {
      onMessage(this.messaging, (payload) => {
        const body: any = payload.notification?.body;
        if (body) {
          this.makeToast(body);
          observer.next(body);
        }
      });
    });
  }

  async sendDailyNotifs(flist: string[]) {
    let x: any;
    let y2: string[] = [];
    
    for (const element of flist) {
      console.log(element);
      try {
        const docRef = doc(this.dbObj, element, 'metaData');
        const docSnap = await getDocs(collection(this.dbObj, element));
        if (!docSnap.empty) {
          const metaDoc = docSnap.docs.find(d => d.id === 'metaData');
          if (metaDoc) {
            x = metaDoc.data();
            if (x.devices) {
              y2.push(...x.devices);
            }
          }
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    }

    if (y2.length > 0) {
      try {
        const dailyNotifs = httpsCallable(getFunctions(), 'dailyNotifs');
        const result = await dailyNotifs({token: y2});
        this.makeToast('Daily reminders sent!');
        return result;
      } catch (error) {
        console.error('Error sending daily notifications:', error);
      }
    }

    return Promise.resolve();
  }

  async sendDailyNotifs2(flist: string[]) {
    let x;
    let y2: string[] = [];
    return new Promise((resolve, reject) => {
      resolve(flist.forEach(async element => {
        console.log('element: ' + element);
        x = await this.myCollection.collection(element).doc('metaData').ref.get().then(doc => {
          console.log(doc.data());
          return doc.data();
        });
        //
        if (x !== undefined && x.devices !== undefined) {
            y2.push(x.devices);
            console.log('y33: ' + y2);
            this.fun.httpsCallable('dailyNotifs')({token: y2})
            .pipe(tap(_ => this.makeToast('Daily reminders sent!')))
            .subscribe();
        }
        console.log('outif');
        //
      })
      );
    }).then(() => {
      setTimeout(() => {
      console.log('x: ' + x);
      if (x !== undefined && x.devices !== undefined) {
          y2.push(x.devices);
          console.log('y2: ' + y2);
          this.fun.httpsCallable('dailyNotifs')({token: y2})
          .pipe(tap(_ => this.makeToast('Daily reminders sent!')))
          .subscribe();
      }
      console.log('exited');
      }, 5000);
    });
  }


  async broadcastToAll(flist: string[], taskTitle: string, myemail: string) {
    let x;
    let y2: string[] = [];
    console.log('fcm b in');
    // change myemail to uname even in index.ts
    if (flist !== undefined) {
      flist.forEach(elem => {
      this.myCollection.collection(myemail).doc('metaData').ref.get().then( metaData => {
        const metaData2: any = metaData.data();
        console.log(metaData2.photo);
        const mytimestamp = new Date().getTime();
        if (metaData2.username === undefined) {
          this.myCollection.collection(elem).doc('notifDoc').collection('notifs')
        .add({sender: myemail, senderDp: metaData2.photo, title: taskTitle, timestamp: mytimestamp}).catch(error => {
          console.log(error);
        });
        } else {
          this.myCollection.collection(elem).doc('notifDoc').collection('notifs')
          .add({sender: metaData2.username, senderDp: metaData2.photo, title: taskTitle, timestamp: mytimestamp}).catch(error => {
            console.log(error);
          });
        }
        });
      });
      return new Promise((resolve, reject) => {
      resolve(flist.forEach(async elem => {
        x = await this.myCollection.collection(elem).doc('metaData').ref.get().then(doc => {
          console.log(doc.data());
          return doc.data();
        });
      })
      );
    }).then(() => {
      setTimeout(() => {
      console.log('x: ' + x);
      if (x.devices !== undefined) {
        // x.devices.forEach(e => {
        //   y2.push(e);
        // });
          y2.push(x.devices);
      }
      console.log('y2: ' + y2);
      console.log('TT :' + taskTitle + ' ' + myemail);
      this.fun.httpsCallable('broadcastToAll')({taskTitle, token: y2, myemail})
    .pipe(tap(_ => this.makeToast(`All friends notified about ${taskTitle}`)))
    .subscribe();
  }, 5000);
    });
  }
  }

  freq(sendersEmail: string, receiversEmail: string) {
    // Implementation for friend request notifications
    console.log('Friend request notification sent from', sendersEmail, 'to', receiversEmail);
  }

  sub(topic: string) {
    // tslint:disable-next-line: max-line-length
    this.token = 'eelro_VQFCkoa_T5xjzAfg:APA91bFPuqh2uIqR9MCpiAhcqLycH8dan4uNiglHGXgXN1PbeDTutourXvizfwxUD9K6Dlz7B8D_xvDQUgiaG_se5rQtACuibNNxINhZ2dKudzDYeUlArwQCSQPRQR2vEOuPM7piTjZ8';
    const subscribeToTopic = httpsCallable(getFunctions(), 'subscribeToTopic');
    subscribeToTopic({ topic, token: this.token})
    .pipe(tap(_ => this.makeToast(`subscribed to ${topic}`)))
    .subscribe();
  }

  unsub(topic: string) {
    const unsubscribeToTopic = httpsCallable(getFunctions(), 'unsubscribeToTopic');
    unsubscribeToTopic({ topic, token: this.token})
    .pipe(tap(_ => this.makeToast(`unsubscribed from ${topic}`)))
    .subscribe();
  }

  // async getToken() {
  //   let token;
  //   if (this.platform.is('android')) {
  //     token = await this.firebaseNative.getToken();
  //   }

  //   if (this.platform.is('ios')) {
  //     token = await this.firebaseNative.getToken();
  //     const perm = await this.firebaseNative.grantPermission();
  //   }

  //   // is not cordova = web PWA
  //   if (!this.platform.is('cordova')) {
  //     // check Ionic Native Push Notifications + Firebase Cloud Messaging @ 4:00
  //       this.messaging.requestPermission().then(() => {
  //         console.log('Notification permission granted.');
  //         return this.messaging.getToken();
  //       })
  //       .then(token2 => {
  //         console.log(token2);
  //         token = token2;
  //       })
  //       .catch((err) => {
  //         console.log('Unable to get permission to notify.', err);
  //       });
  //   }
  //   return this.saveTokenToFirestore(token);
  // }

  // private saveTokenToFirestore(token) {
  //   if (!token) {
  //     return;
  //   }
  //   const devicesRef = this.afs.collection('devices');

  //   const docData = {
  //     token,
  //     userId: 'testUser'
  //   };

  //   return devicesRef.doc(token).set(docData);
  // }

  // listenToNotifications() {
  //   return this.firebaseNative.onNotificationOpen();
  // }
}
