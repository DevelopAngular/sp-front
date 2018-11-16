import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglePickerComponent } from './toggle-picker.component';

describe('TogglePickerComponent', () => {
  let component: TogglePickerComponent;
  let fixture: ComponentFixture<TogglePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TogglePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
