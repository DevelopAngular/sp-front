import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolButtonComponent } from './school-button.component';

describe('SchoolButtonComponent', () => {
  let component: SchoolButtonComponent;
  let fixture: ComponentFixture<SchoolButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
