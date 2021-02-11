import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TutResolverService implements Resolve<any>{

  constructor() { }

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    return id;
  }
}
