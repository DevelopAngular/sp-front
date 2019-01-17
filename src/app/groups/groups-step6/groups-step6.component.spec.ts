import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep6Component } from './groups-step6.component';

describe('GroupsStep6Component', () => {
  let component: GroupsStep6Component;
  let fixture: ComponentFixture<GroupsStep6Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep6Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
