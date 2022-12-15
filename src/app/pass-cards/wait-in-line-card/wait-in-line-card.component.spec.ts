import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitInLineCardComponent } from './wait-in-line-card.component';

describe('WaitInLineCardComponent', () => {
  let component: WaitInLineCardComponent;
  let fixture: ComponentFixture<WaitInLineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitInLineCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitInLineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
