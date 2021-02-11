import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsecutiveLoginPageRoutingModule } from './consecutive-login-routing.module';

import { ConsecutiveLoginPage } from './consecutive-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsecutiveLoginPageRoutingModule
  ],
  declarations: [ConsecutiveLoginPage]
})
export class ConsecutiveLoginPageModule {}
