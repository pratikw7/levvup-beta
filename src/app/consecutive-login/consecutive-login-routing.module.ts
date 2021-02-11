import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsecutiveLoginPage } from './consecutive-login.page';

const routes: Routes = [
  {
    path: '',
    component: ConsecutiveLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsecutiveLoginPageRoutingModule {}
