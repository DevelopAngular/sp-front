import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolAutocompleteComponent } from './school-autocomplete.component';

describe('SchoolAutocompleteComponent', () => {
  let component: SchoolAutocompleteComponent;
  let fixture: ComponentFixture<SchoolAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
