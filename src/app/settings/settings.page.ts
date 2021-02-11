import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AllService } from '../services/all.service';
import { FcmService } from '../services/fcm.service';
import { AuthService } from '../auth/auth.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
// import * as firebase from 'firebase';
// import * as functions from 'firebase/functions';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

//   constructor(private storage: AngularFireStorage) { }

// // check fierbase cmd if error enable storage

//   ngOnInit() {
//     const x = this.storage.ref('gs://ionic-gamify.appspot.com');
//   }

imgSrc: string;
selectedImage: any = null;
isSubmitted: boolean;
uname: string;
pwd1: string;
pwd2: string;
oldpwd: string;

formTemplate = new FormGroup({
  imageUrl: new FormControl('', Validators.required)
});

constructor(private authService: AuthService,
            private alertCtrl: AlertController,
            private router: Router,
            private fcmService: FcmService, private storage: AngularFireStorage, private allService: AllService) { }

ngOnInit() {
  this.resetForm();
  if (this.allService.getTdata(3) === 'toSettings') {
    // tslint:disable-next-line: max-line-length
    this.showAlert('The settings page', 'You can update your profile picture, username & password here.', 'OK!');
    // tslint:disable-next-line: max-line-length
  }
}

tutDone() {
  this.showAlert('Hurray! Tutorial completed :D', 'Nice work! Now lets get back to the homepage to add new tasks for the day and complete them.', 'Sure!');
}

showAlert(header1: string, message1: string, btnName: string) {
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
          if (header1 === 'Hurray! Tutorial completed :D') {
            this.allService.setTdata(3, 'toSettingsFinished');
            this.allService.updateTutorial({walkthroughShown: true});
            this.router.navigate(['/home']);
          }
          if (header1 === 'The settings page') {
            this.tutDone();
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


updatePassword() {
  if (this.pwd1 === this.pwd2) {
    this.authService.updatePassword(this.pwd1, this.oldpwd);
    const message = ' Password changed successfully! Remember to change passwords after every 30 days';
    this.showAlert2(message);
  }
}

showAlert2(mymessage: string) {
  this.alertCtrl
    .create({
      header: `Update success!`,
      message: mymessage,
      buttons: ['Okay']
    })
    .then(alertEl => alertEl.present());
}

updateUname() {
  this.allService.updateMetaData({username: this.uname});
  this.allService.updateUname({uname: this.uname}).then(() => {
    this.showAlert2('Username changed successfully.');
  });
}

ssub() {
  this.fcmService.sub('discounts');
}

showPreview(event: any) {
  // const x = firebase.functions().httpsCallable('s');
  // x().then()
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e: any) => this.imgSrc = e.target.result;
    reader.readAsDataURL(event.target.files[0]);
    this.selectedImage = event.target.files[0];
  } else {
    this.imgSrc = '/assets/img/image_placeholder.jpg';
    this.selectedImage = null;
  }
}

onSubmit(formValue) {
  this.isSubmitted = true;
  if (this.formTemplate.valid) {
    // const filePath = `${formValue}/${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
    const filePath = `${formValue}/${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          formValue.imageUrl = url;
          this.allService.changePhoto(formValue.imageUrl).then(() => {
            alert('Profile photo changed successfully.');
          });
          this.resetForm();
        });
      })
    ).subscribe();
  }
}

get formControls() {
  return this.formTemplate.controls;
}

resetForm() {
  this.formTemplate.reset();
  this.formTemplate.setValue({
    imageUrl: '',
  });
  this.imgSrc = '/assets/img/image_placeholder.jpg';
  this.selectedImage = null;
  this.isSubmitted = false;
}
}
