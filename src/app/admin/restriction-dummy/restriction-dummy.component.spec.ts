import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictionDummyComponent } from './restriction-dummy.component';

describe('RestrictionDummyComponent', () => {
  let component: RestrictionDummyComponent;
  let fixture: ComponentFixture<RestrictionDummyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestrictionDummyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestrictionDummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
