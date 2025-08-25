import { Routes } from '@angular/router';
import { DummyGuardService } from './guards/dummy-guard.service';
import { DataResolverService } from './resolver/data-resolver.service';
import { TutResolverService } from './resolver/tut-resolver.service';

export const routes: Routes = [
  // prev settings
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  //landing page settings
  // { path: '', redirectTo: 'beta', pathMatch: 'full' },
  { path: 'home',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  { path: 'auth', loadComponent: () => import('./auth/auth.page').then(m => m.AuthPage) },
  {
    path: 'signin',
    loadComponent: () => import('./auth/signin/signin.page').then( m => m.SigninPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'friends',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./friends/friends.page').then( m => m.FriendsPage)
  },
  {
    path: 'achievements',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./achievements/achievements.page').then( m => m.AchievementsPage)
  },
  {
    path: 'add-task',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./add-task/add-task.page').then( m => m.AddTaskPage)
  },
  {
    path: 'add-task/:id',
    canLoad: [DummyGuardService],
    resolve: {
      tutID: TutResolverService
    },
    loadComponent: () => import('./add-task/add-task.page').then( m => m.AddTaskPage)
  },
  { path: 'home/:id',
    canLoad: [DummyGuardService],
    resolve: {
      tutID: TutResolverService
    },
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'history',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'help',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./help/help.page').then( m => m.HelpPage)
  },
  {
    path: 'groups',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./groups/groups.page').then( m => m.GroupsPage)
  },
  {
    path: 'settings',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'group-page',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./group-page/group-page.page').then( m => m.GroupPagePage)
  },
  {
    path: 'tutorial',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./tutorial/tutorial.page').then( m => m.TutorialPage)
  },
  {
    path: 'friend-profile',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./friend-profile/friend-profile.page').then( m => m.FriendProfilePage)
  },
  {
    path: 'friend-profile/:email',
    canLoad: [DummyGuardService],
    resolve: {
      friendEmail: DataResolverService
    },
    loadComponent: () => import('./friend-profile/friend-profile.page').then( m => m.FriendProfilePage)
  },
  {
    path: 'notifications',
    canLoad: [DummyGuardService],
    loadComponent: () => import('./notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'consecutive-login',
    loadComponent: () => import('./consecutive-login/consecutive-login.page').then( m => m.ConsecutiveLoginPage)
  },
  {
    path: 'beta',
    loadComponent: () => import('./landing/landing.page').then( m => m.LandingPage)
  },
];
