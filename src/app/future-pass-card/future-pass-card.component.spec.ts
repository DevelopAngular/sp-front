import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuturePassCardComponent } from './future-pass-card.component';

describe('FuturePassCardComponent', () => {
  let component: FuturePassCardComponent;
  let fixture: ComponentFixture<FuturePassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuturePassCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuturePassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
