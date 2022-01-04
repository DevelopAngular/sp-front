import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddSchoolPopupComponent} from './add-school-popup.component';

describe('AddSchoolPopupComponent', () => {
  let component: AddSchoolPopupComponent;
  let fixture: ComponentFixture<AddSchoolPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSchoolPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSchoolPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
