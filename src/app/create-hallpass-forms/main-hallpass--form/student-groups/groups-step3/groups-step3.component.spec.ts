import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep3Component } from './groups-step3.component';

describe('GroupsStep3Component', () => {
  let component: GroupsStep3Component;
  let fixture: ComponentFixture<GroupsStep3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
