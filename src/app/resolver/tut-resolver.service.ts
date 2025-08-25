import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TutResolverService {

  constructor() { }

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    return id;
  }
}
