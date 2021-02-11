import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private friendsEmail: string;

  constructor() { }

  setData(friendsEmail) {
    this.friendsEmail = friendsEmail;
  }

  getData() {
    return this.friendsEmail;
  }
}
