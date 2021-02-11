import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConsecutiveLoginPage } from './consecutive-login.page';

describe('ConsecutiveLoginPage', () => {
  let component: ConsecutiveLoginPage;
  let fixture: ComponentFixture<ConsecutiveLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsecutiveLoginPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsecutiveLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
