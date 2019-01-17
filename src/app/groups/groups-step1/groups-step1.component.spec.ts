import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep1Component } from './groups-step1.component';

describe('GroupsStep1Component', () => {
  let component: GroupsStep1Component;
  let fixture: ComponentFixture<GroupsStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
