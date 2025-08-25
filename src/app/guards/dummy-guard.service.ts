import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DummyGuardService  {

  constructor(private alertController: AlertController, private router: Router) { }

  canLoad() {
    const userEmail = localStorage.getItem('userEmail');
    console.log('🛡️ Guard: Checking auth, userEmail in localStorage:', userEmail);
    
    if (userEmail === 'empty' || userEmail === null || userEmail === undefined) {
      console.log('🛡️ Guard: No valid user email, blocking access');
      this.alertController.create({
        header: 'Sorry!',
        subHeader: 'Please login to continue',
        buttons: ['OK']
      }).then(alert => alert.present());
      this.router.navigate(['/auth']);
      return false;
    } else {
      console.log('🛡️ Guard: Valid user email found, allowing access');
      return true;
    }
  }
}
// export class DummyGuardService implements CanActivate {

//   constructor(private alertController: AlertController, private router: Router) { }

//   canActivate() {
//     if (localStorage.getItem('userEmail') === 'empty') {
//       this.alertController.create({
//         header: 'Sorry!',
//         subHeader: 'Please login to continue',
//         buttons: ['OK']
//       }).then(alert => alert.present());
//       this.router.navigate(['/auth']);
//       return false;
//     } else {
//       return true;
//     }
//   }
// }
