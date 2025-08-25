import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AllService } from '../services/all.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class GroupsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  searchGroup() {
    console.log('Searching...')
  }
}
