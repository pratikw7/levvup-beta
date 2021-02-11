import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

// add a new httpsOnCallable func which simply sends notif to data.email
// that's all u need to do! no checking req. since ur calling it while sending friends req :)

// exports.friendAcceptNotif = functions.https.onCall((data, context) => {
//     const email = data.email;
//     let fireObj = data.fireObj;
//     let fuser = fireObj.collection(email);
//     const fdoc = fuser.doc('metaData').get();

//     return `s`;
// });

// exports.fcmSend = functions.firestore.document('/pratikw7@gmail.com/friends').onUpdate(event => {
//     // use event.before and check if requests.length < requests.len for event.after if yes then u have new f req.
//     const data:any = event.after.ref;
//     const dId:string = data.id;
//     if (dId === 'friends') {
//         const x:any = event.after.data();
//         const l:number = x.requests.length;
//         const f:string = x.requests[l-1];
//         // if (f) {send notif!} else no!

//         const payload = {
//             notification: {
//             title: 'New friend request!',
//             body: `${f} has sent you a friend request!`,
//             }
//         };
//         // tslint:disable-next-line: no-floating-promises
//         admin.messaging().sendToDevice('eelro_VQFCkoa_T5xjzAfg:APA91bFPuqh2uIqR9MCpiAhcqLycH8dan4uNiglHGXgXN1PbeDTutourXvizfwxUD9K6Dlz7B8D_xvDQUgiaG_se5rQtACuibNNxINhZ2dKudzDYeUlArwQCSQPRQR2vEOuPM7piTjZ8', payload);
//     } else {
//         const payload2 = {
//             notification: {
//             title: '22New friend request!',
//             body: `from: ${dId}`,
//             }
//         };
//         // tslint:disable-next-line: no-floating-promises
//         admin.messaging().sendToDevice('eelro_VQFCkoa_T5xjzAfg:APA91bFPuqh2uIqR9MCpiAhcqLycH8dan4uNiglHGXgXN1PbeDTutourXvizfwxUD9K6Dlz7B8D_xvDQUgiaG_se5rQtACuibNNxINhZ2dKudzDYeUlArwQCSQPRQR2vEOuPM7piTjZ8', payload2);
//     }
// });

export const dailyNotifs = functions.https.onCall(
    async (data, context) => {
        const notification: admin.messaging.NotificationMessagePayload = {
            title: `Take back the control of your life!🔥`,
            body: `Complete your today's self goal!`
        };
        const payload: admin.messaging.MessagingPayload = {
            notification
        };
        return admin.messaging().sendToDevice(data.token, payload);
    }
)

export const broadcastToAll = functions.https.onCall(
    async (data, context) => {
        const notification: admin.messaging.NotificationMessagePayload = {
            title: `${data.myemail} has completed '${data.taskTitle}'!`,
            body: `Complete your tasks of the day to level up yourself & inspire others to level up!🔥`
        };
        const payload: admin.messaging.MessagingPayload = {
            notification
        };
        return admin.messaging().sendToDevice(data.token, payload);
    }
);

export const friendRequest = functions.https.onCall(
    async (data, context) => {
        const notification: admin.messaging.NotificationMessagePayload = {
            title: 'New friend request!',
            body: `You have a new friend request from ${data.sendersEmail}`
        };
        const payload: admin.messaging.MessagingPayload = {
            notification
        };
        return admin.messaging().sendToDevice(data.token, payload);
    }
);


// export const subscribeToTopic = functions.https.onCall(
//     async (data, context) => {
//         await admin.messaging().subscribeToTopic(data.token, data.topic);
//         return `subscribed to ${data.topic}`;
//     }
// );

// export const unsubscribeToTopic = functions.https.onCall(
//     async (data, context) => {
//         await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
//         return `unsubscribed from ${data.topic}`;
//     }
// );
// export const sendOnFirestoreCreate = functions.firestore.document(
//     'discounts/{discountId}').onCreate(async snapshot => {
//         let d2:any;
//         const discount = snapshot.data();
//         d2 = discount;
        
//         if ('discount' !== undefined) {

//             const notification: admin.messaging.Notification = {
//             title: 'New discount available',
//             body: d2.headline
//             // body: 'body'
//         };

//         const payload: admin.messaging.Message = {
//             notification,
//             webpush: {
//                 notification: {
//                     vibrate: [200, 100, 200],
//                     // icon: '',
//                     actions: [
//                         {
//                             action: 'like',
//                             title: '😊Yaay!'
//                         },
//                         {
//                             action: 'dislike',
//                             title: 'Booo!'
//                         }
//                     ]
//                 }
//             },
//             topic: 'discounts' 
//         };
//         return admin.messaging().send(payload);
//     } else {
//         return 'discount not found'
//     }
// });