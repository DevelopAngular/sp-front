import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateChipComponent } from './date-chip.component';

describe('DateChipComponent', () => {
  let component: DateChipComponent;
  let fixture: ComponentFixture<DateChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateChipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
