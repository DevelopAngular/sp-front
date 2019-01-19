import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimeContainerComponent } from './date-time-container.component';

describe('DateTimeContainerComponent', () => {
  let component: DateTimeContainerComponent;
  let fixture: ComponentFixture<DateTimeContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateTimeContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
