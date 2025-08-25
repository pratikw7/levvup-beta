import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class TutorialPage implements OnInit {

  currentSlide = 0;
  totalSlides = 3;

  constructor(
    private router: Router,
    private allService: AllService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    // Initialize tutorial
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  next() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
    }
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
