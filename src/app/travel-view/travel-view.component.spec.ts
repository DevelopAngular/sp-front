import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelViewComponent } from './travel-view.component';

describe('TravelViewComponent', () => {
  let component: TravelViewComponent;
  let fixture: ComponentFixture<TravelViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
