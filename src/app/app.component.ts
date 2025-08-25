import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthService } from './auth/auth.service';
import { AllService } from './services/all.service';

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
    
    App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );

    console.log('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: any) => {
        alert('Push registration success, token: ' + token.value);
        console.log('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: any) => {
        console.log('Push received: ', notification);

        // Use Haptics for notification feedback
        Haptics.impact({ style: ImpactStyle.Medium });
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: any) => {
        alert('Push action performed: ' + JSON.stringify(notification));
        console.log('Push action performed: ', notification);
      }
    );
  }


  onLogout() {
    this.authService.logout();
    localStorage.setItem('userEmail', 'empty');
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    // Plugins.App.removeListener('appStateChange', this.checkAuthOnResume);
  }

  private checkAuthOnResume(state: any) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
