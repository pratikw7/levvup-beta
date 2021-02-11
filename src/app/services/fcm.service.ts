import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';

import * as firebase from 'firebase';
import { tap } from 'rxjs/operators';
import { AllService } from './all.service';
import { element } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  token;
  private messaging = firebase.messaging();
  private myCollection: AngularFirestore;
  private myEmail: string;

  constructor(
    private afMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    private toastController: ToastController,
    dbNew: AngularFirestore
  ) {
    this.myCollection = dbNew;
    this.myEmail = localStorage.getItem('userEmail');
   }

  async makeToast(message) {
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
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    const req = this.myCollection.collection(this.myEmail).doc('metaData');
    return this.afMessaging.requestToken.pipe(
      tap(token => (
          req.update({
             devices: token
            // devices: arrayUnion(token)
          })
      ))
    );
  }

  showMessages() {
    return this.afMessaging.messages.pipe(
      tap(msg => {
        const body: any = (msg as any).notification.body;
        this.makeToast(body);
      })
    );
  }

  async sendDailyNotifs(flist: string[]) {
    let x;
    let y2: string[] = [];
    //----
    flist.forEach(element => {
      console.log(element);
    });
    // flist.forEach(async element => {
    //   x = await this.myCollection.collection(element).doc('metaData').ref.get().then(doc => {
    //     return doc.data();
    //   }).then(() => {
    //     if (x !== undefined) {
    //       if (x.devices !== undefined) {
    //         x.devices.forEach(e => {
    //           y2.push(e);
    //         });
    //         console.log(y2);
    //       }
    //     }
    //   }).then(() => {
    //     this.fun.httpsCallable('dailyNotifs')({token: y2})
    //     .pipe(tap(_ => this.makeToast('Daily reminders sent!')))
    //     .subscribe();
    //   });
    // });

    //----

    return new Promise((resolve, reject) =>  {
      resolve(flist.forEach(async element => {
        console.log('element: ' + element);
        x = await this.myCollection.collection(element).doc('metaData').ref.get().then(doc => {
          console.log(doc.data());
          return doc.data();
        });
        //
        if (x !== undefined && x.devices !== undefined) {
          if (x.devices.length >= 1) {
              y2.push(x.devices);
          }
          // else {
          //   y2.push(x.devices);
          // }
          console.log('y33: ' + y2);
          const uniqueSet = new Set(y2);
          const y3 = [...uniqueSet];
          this.fun.httpsCallable('dailyNotifs')({token: y3})
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

  async freq(sendersEmail: string, receiversEmail: string) {
    const x = await this.myCollection.collection(receiversEmail).doc('metaData').ref.get().then(doc => {
      return doc.data();
    });
    console.log(x.devices);
    const y = x.devices;
    this.fun.httpsCallable('friendRequest')({sendersEmail, token: y})
    .pipe(tap(_ => this.makeToast(`Friend request sent to ${receiversEmail}`)))
    .subscribe();
  }

sub(topic) {
    // tslint:disable-next-line: max-line-length
    this.token = 'eelro_VQFCkoa_T5xjzAfg:APA91bFPuqh2uIqR9MCpiAhcqLycH8dan4uNiglHGXgXN1PbeDTutourXvizfwxUD9K6Dlz7B8D_xvDQUgiaG_se5rQtACuibNNxINhZ2dKudzDYeUlArwQCSQPRQR2vEOuPM7piTjZ8';
    this.fun.httpsCallable('subscribeToTopic')({ topic, token: this.token})
    .pipe(tap(_ => this.makeToast(`subscribed to ${topic}`)))
    .subscribe();
  }

unsub(topic) {
    this.fun.httpsCallable('unsubscribeToTopic')({ topic, token: this.token})
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
