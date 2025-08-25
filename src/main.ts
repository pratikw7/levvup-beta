import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app/app-routing.module';

// Import Ionic icons
import { addIcons } from 'ionicons';
import { 
  home, 
  add, 
  list, 
  people, 
  peopleCircle, 
  trophy, 
  helpCircle, 
  settings, 
  exit,
  notifications,
  notificationsOutline,
  saveOutline,
  menu,
  menuOutline,
  arrowBack,
  arrowForward,
  checkboxOutline,
  checkbox,
  chevronDown
} from 'ionicons/icons';

// Register all the icons
addIcons({
  'home': home,
  'add': add,
  'list': list,
  'people': people,
  'people-circle': peopleCircle,
  'trophy': trophy,
  'help-circle': helpCircle,
  'settings': settings,
  'exit': exit,
  'notifications': notifications,
  'notifications-outline': notificationsOutline,
  'save-outline': saveOutline,
  'menu': menu,
  'menu-outline': menuOutline,
  'arrow-back': arrowBack,
  'arrow-forward': arrowForward,
  'checkbox-outline': checkboxOutline,
  'checkbox': checkbox,
  'chevron-down': chevronDown
});

// Import Firebase configuration - this initializes Firebase
import './app/firebase.config';

if (environment.production) {
  enableProdMode();
}

console.log('Main: Starting Angular application bootstrap');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular({
      mode: 'ios',
      _forceStatusbarPadding: true
    }),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', { enabled: environment.production })
  ]
}).then(() => {
  console.log('Main: Application bootstrap successful');
}).catch(err => {
  console.error('Main: Application bootstrap failed:', err);
});
