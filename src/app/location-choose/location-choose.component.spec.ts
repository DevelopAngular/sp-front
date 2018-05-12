import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationChooseComponent } from './location-choose.component';

describe('LocationChooseComponent', () => {
  let component: LocationChooseComponent;
  let fixture: ComponentFixture<LocationChooseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationChooseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
