import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallpassCardComponent } from './hallpass-card.component';

describe('HallpassCardComponent', () => {
  let component: HallpassCardComponent;
  let fixture: ComponentFixture<HallpassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HallpassCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallpassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
