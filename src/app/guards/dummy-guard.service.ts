import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DummyGuardService  {

  constructor(private alertController: AlertController, private router: Router) { }

  canLoad() {
    if (localStorage.getItem('userEmail') === 'empty') {
      this.alertController.create({
        header: 'Sorry!',
        subHeader: 'Please login to continue',
        buttons: ['OK']
      }).then(alert => alert.present());
      this.router.navigate(['/auth']);
      return false;
    } else {
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
