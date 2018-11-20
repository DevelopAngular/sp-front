import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundInputComponent } from './round-input.component';

describe('RoundInputComponent', () => {
  let component: RoundInputComponent;
  let fixture: ComponentFixture<RoundInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
