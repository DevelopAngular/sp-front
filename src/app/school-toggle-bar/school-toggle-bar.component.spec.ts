import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolToggleBarComponent } from './school-toggle-bar.component';

describe('SchoolToggleBarComponent', () => {
  let component: SchoolToggleBarComponent;
  let fixture: ComponentFixture<SchoolToggleBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolToggleBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolToggleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
