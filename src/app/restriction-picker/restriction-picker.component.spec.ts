import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictionPickerComponent } from './restriction-picker.component';

describe('RestrictionPickerComponent', () => {
  let component: RestrictionPickerComponent;
  let fixture: ComponentFixture<RestrictionPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictionPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
