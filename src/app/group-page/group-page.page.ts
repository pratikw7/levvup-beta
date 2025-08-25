import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-group-page',
  templateUrl: './group-page.page.html',
  styleUrls: ['./group-page.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class GroupPagePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
