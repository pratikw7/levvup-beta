import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DataResolverService implements Resolve<any> {

  constructor() { }

  resolve(route: ActivatedRouteSnapshot) {
    const friendEmail = route.paramMap.get('email');
    return friendEmail;
  }
}
