import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  toBeta() {
    window.open("https://forms.gle/Q7UFv5HHibNU4Ybh9");
  }

}
