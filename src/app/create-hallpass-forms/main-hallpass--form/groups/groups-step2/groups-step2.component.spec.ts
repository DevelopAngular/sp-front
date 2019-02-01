import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep2Component } from './groups-step2.component';

describe('GroupsStep2Component', () => {
  let component: GroupsStep2Component;
  let fixture: ComponentFixture<GroupsStep2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
