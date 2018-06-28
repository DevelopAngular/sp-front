import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraveltypePickerComponent } from './traveltype-picker.component';

describe('TraveltypePickerComponent', () => {
  let component: TraveltypePickerComponent;
  let fixture: ComponentFixture<TraveltypePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraveltypePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraveltypePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
