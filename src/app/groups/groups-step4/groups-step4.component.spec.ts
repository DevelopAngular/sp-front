import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep4Component } from './groups-step4.component';

describe('GroupsStep4Component', () => {
  let component: GroupsStep4Component;
  let fixture: ComponentFixture<GroupsStep4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
