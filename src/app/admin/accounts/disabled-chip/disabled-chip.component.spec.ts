import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledChipComponent } from './disabled-chip.component';

describe('DisabledChipComponent', () => {
  let component: DisabledChipComponent;
  let fixture: ComponentFixture<DisabledChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledChipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
