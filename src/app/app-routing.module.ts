import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { DummyGuardService } from './guards/dummy-guard.service';
import { DataResolverService } from './resolver/data-resolver.service';
import { TutResolverService } from './resolver/tut-resolver.service';

const routes: Routes = [
  // prev settings
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  //landing page settings
  // { path: '', redirectTo: 'beta', pathMatch: 'full' },
  { path: 'home',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule) },
  {
    path: 'signin',
    loadChildren: () => import('./auth/signin/signin.module').then( m => m.SigninPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./auth/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./auth/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'friends',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./friends/friends.module').then( m => m.FriendsPageModule)
  },
  {
    path: 'achievements',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./achievements/achievements.module').then( m => m.AchievementsPageModule)
  },
  {
    path: 'add-task',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./add-task/add-task.module').then( m => m.AddTaskPageModule)
  },
  {
    path: 'add-task/:id',
    canLoad: [DummyGuardService],
    resolve: {
      tutID: TutResolverService
    },
    loadChildren: () => import('./add-task/add-task.module').then( m => m.AddTaskPageModule)
  },
  { path: 'home/:id',
    canLoad: [DummyGuardService],
    resolve: {
      tutID: TutResolverService
    },
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'history',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./history/history.module').then( m => m.HistoryPageModule)
  },
  {
    path: 'help',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'groups',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./groups/groups.module').then( m => m.GroupsPageModule)
  },
  {
    path: 'settings',
    canLoad: [DummyGuardService],

    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'group-page',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./group-page/group-page.module').then( m => m.GroupPagePageModule)
  },
  {
    path: 'tutorial',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'friend-profile',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./friend-profile/friend-profile.module').then( m => m.FriendProfilePageModule)
  },
  {
    path: 'friend-profile/:email',
    canLoad: [DummyGuardService],
    resolve: {
      friendEmail: DataResolverService
    },
    loadChildren: () => import('./friend-profile/friend-profile.module').then( m => m.FriendProfilePageModule)
  },
  {
    path: 'notifications',
    canLoad: [DummyGuardService],
    loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'consecutive-login',
    loadChildren: () => import('./consecutive-login/consecutive-login.module').then( m => m.ConsecutiveLoginPageModule)
  },
  {
    path: 'beta',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
