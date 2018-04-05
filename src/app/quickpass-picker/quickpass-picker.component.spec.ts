import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickpassPickerComponent } from './quickpass-picker.component';

describe('QuickpassPickerComponent', () => {
  let component: QuickpassPickerComponent;
  let fixture: ComponentFixture<QuickpassPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickpassPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickpassPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
