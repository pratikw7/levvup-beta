import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GroupPagePage } from './group-page.page';

describe('GroupPagePage', () => {
  let component: GroupPagePage;
  let fixture: ComponentFixture<GroupPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
