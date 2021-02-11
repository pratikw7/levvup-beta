import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupPagePageRoutingModule } from './group-page-routing.module';

import { GroupPagePage } from './group-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupPagePageRoutingModule
  ],
  declarations: [GroupPagePage]
})
export class GroupPagePageModule {}
