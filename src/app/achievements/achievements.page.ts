import { Component, ElementRef, OnInit } from '@angular/core';
import { AllService, Tasks } from '../services/all.service';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.page.html',
  styleUrls: ['./achievements.page.scss'],
})
export class AchievementsPage implements OnInit {

  tenacity: number;
  fitness: number;
  mindfulness: number;
  journaling: number;
  tenacityLvl: number;
  fitnessLvl: number;
  mindfulnessLvl: number;
  journalingLvl: number;
  myemail: string;
  tasks: Tasks[] = [];

  constructor(private allService: AllService) { }

  ngOnInit() {
    this.fitness = 0;
    this.journaling = 0;
    this.mindfulness = 0;
    this.tenacity = 0;
    this.fitnessLvl = 1;
    this.journalingLvl = 1;
    this.mindfulnessLvl = 1;
    this.tenacityLvl = 1;

    this.myemail = localStorage.getItem('userEmail');
    this.allService.getUserDB(this.myemail).subscribe(user => {
      user.forEach(task => {
        if (task.taskType === 'fitness' && task.completed === true) {
          this.fitness += 10;
        } else if (task.taskType === 'mindfulness' && task.completed === true) {
          this.mindfulness += 10;
        } else if (task.taskType === 'journaling' && task.completed === true) {
          this.journaling += 10;
        } else if (task.id === 'metaData') {
          this.tenacity = task.tenacity;
        }
      });
    });
  }

  tenacityF(e) {
    // console.log(e);
    if (this.tenacity > 100 && this.tenacity <= 200) {
      this.tenacityLvl = 2;
    } else if (this.tenacity > 200 && this.tenacity <= 300) {
      this.tenacityLvl = 3;
    } else if (this.tenacity > 300 && this.tenacity <= 400) {
      this.tenacityLvl = 4;
    } else  if (this.tenacity > 400 && this.tenacity <= 500) {
      this.tenacityLvl = 5;
    }
    e.target.style.setProperty('--percentage', this.tenacity);
  }
  fitnessF(e) {
    if (this.fitness > 100 && this.fitness <= 200) {
      this.fitnessLvl = 2;
    } else if (this.fitness > 200 && this.fitness <= 300) {
      this.fitnessLvl = 3;
    } else if (this.fitness > 300 && this.fitness <= 400) {
      this.fitnessLvl = 4;
    } else  if (this.fitness > 400 && this.fitness <= 500) {
      this.fitnessLvl = 5;
    }
    e.target.style.setProperty('--percentage', this.fitness);
  }
  mindfulnessF(e) {
    if (this.mindfulness > 100 && this.mindfulness <= 200) {
      this.mindfulnessLvl = 2;
    } else if (this.mindfulness > 200 && this.mindfulness <= 300) {
      this.mindfulnessLvl = 3;
    } else if (this.mindfulness > 300 && this.mindfulness <= 400) {
      this.mindfulnessLvl = 4;
    } else  if (this.mindfulness > 400 && this.mindfulness <= 500) {
      this.mindfulnessLvl = 5;
    }
    e.target.style.setProperty('--percentage', this.mindfulness);
  }
  journalingF(e) {
    if (this.journaling > 100 && this.journaling <= 200) {
      this.journalingLvl = 2;
    } else if (this.journaling > 200 && this.journaling <= 300) {
      this.journalingLvl = 3;
    } else if (this.journaling > 300 && this.journaling <= 400) {
      this.journalingLvl = 4;
    } else  if (this.journaling > 400 && this.journaling <= 500) {
      this.journalingLvl = 5;
    }
    e.target.style.setProperty('--percentage', this.journaling);
  }
}
