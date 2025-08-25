import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Import Ionic v8 standalone components
import { IonApp, IonButton, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';

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
  imports: [
    CommonModule,
    IonApp,
    IonButton,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
  ) {
    console.log('AppComponent constructor called');
    this.initializeApp();
  }

  initializeApp() {
    console.log('initializeApp called');
    this.platform.ready().then(() => {
      console.log('Platform ready');
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit called');
    
    // Try auto-login first
    this.authService.autoLogin().subscribe(user => {
      console.log('AppComponent: Auto-login result:', user ? 'success' : 'failed');
      console.log('AppComponent: Current URL:', this.router.url);
      
      if (user) {
        // User is logged in, redirect away from auth page
        if (this.router.url.includes('/auth')) {
          console.log('AppComponent: User logged in, redirecting to home');
          this.router.navigateByUrl('/home');
        }
      } else {
        // Only navigate to auth if not currently on auth page
        if (!this.router.url.includes('/auth')) {
          console.log('AppComponent: Navigating to auth page');
          this.router.navigateByUrl('/auth');
        }
      }
    });
    
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      console.log('AppComponent: Auth state changed:', isAuth);
      console.log('AppComponent: Current URL:', this.router.url);
      
      if (isAuth && this.router.url.includes('/auth')) {
        // User just logged in and we're on auth page, redirect to home
        console.log('AppComponent: User authenticated, redirecting to home');
        this.router.navigateByUrl('/home');
      } else if (!isAuth && this.previousAuthState !== isAuth) {
        // Only navigate to auth if not currently on auth page
        if (!this.router.url.includes('/auth')) {
          console.log('AppComponent: User logged out, navigating to auth');
          this.router.navigateByUrl('/auth');
        }
      }
      this.previousAuthState = isAuth;
    });
    
    App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );

    console.log('AppComponent: Initializing push notifications');

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
    console.log('onLogout called');
    this.authService.logout();
    localStorage.setItem('userEmail', 'empty');
  }

  navigateTo(path: string) {
    console.log('Navigating to:', path);
    this.router.navigate([path]);
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
