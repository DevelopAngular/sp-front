import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DateButtonComponent} from './date-button.component';

describe('DateButtonComponent', () => {
  let component: DateButtonComponent;
  let fixture: ComponentFixture<DateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
