import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsStep5Component } from './groups-step5.component';

describe('GroupsStep5Component', () => {
  let component: GroupsStep5Component;
  let fixture: ComponentFixture<GroupsStep5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsStep5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsStep5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
