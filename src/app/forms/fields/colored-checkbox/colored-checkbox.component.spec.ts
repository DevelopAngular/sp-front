import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ColoredCheckboxComponent} from './colored-checkbox.component';

describe('CheckboxComponent', () => {
  let component: ColoredCheckboxComponent;
  let fixture: ComponentFixture<ColoredCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColoredCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColoredCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
