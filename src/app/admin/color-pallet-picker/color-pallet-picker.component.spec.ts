import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPalletPickerComponent } from './color-pallet-picker.component';

describe('ColorPalletPickerComponent', () => {
  let component: ColorPalletPickerComponent;
  let fixture: ComponentFixture<ColorPalletPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPalletPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPalletPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
