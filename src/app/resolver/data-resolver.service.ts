import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DataResolverService  {

  constructor() { }

  resolve(route: ActivatedRouteSnapshot) {
    const friendEmail = route.paramMap.get('email');
    return friendEmail;
  }
}
