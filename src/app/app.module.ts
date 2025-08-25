import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { ReactiveFormsModule } from '@angular/forms';

import { FcmService } from './services/fcm.service';

import { ConsecutiveLoginPageModule } from './consecutive-login/consecutive-login.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(),
        ConsecutiveLoginPageModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        FcmService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
