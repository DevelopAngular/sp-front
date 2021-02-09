import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddAccountPopupComponent} from './add-account-popup.component';

describe('AddAccountPopupComponent', () => {
  let component: AddAccountPopupComponent;
  let fixture: ComponentFixture<AddAccountPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAccountPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccountPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
