import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStepComponent } from './groups-step.component';

describe('GroupsStepComponent', () => {
  let component: GroupsStepComponent;
  let fixture: ComponentFixture<GroupsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
