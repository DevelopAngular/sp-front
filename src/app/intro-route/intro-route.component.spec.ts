import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroRouteComponent } from './intro-route.component';

describe('IntroRouteComponent', () => {
  let component: IntroRouteComponent;
  let fixture: ComponentFixture<IntroRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntroRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
