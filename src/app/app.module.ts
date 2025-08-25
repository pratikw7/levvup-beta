import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { ReactiveFormsModule } from '@angular/forms';

import { FcmService } from './services/fcm.service';

import { NgCalendarModule } from 'ionic2-calendar';

import { ConsecutiveLoginPageModule } from './consecutive-login/consecutive-login.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        ConsecutiveLoginPageModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        NgCalendarModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        FcmService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
