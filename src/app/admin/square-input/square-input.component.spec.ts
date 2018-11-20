import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareInputComponent } from './square-input.component';

describe('SquareInputComponent', () => {
  let component: SquareInputComponent;
  let fixture: ComponentFixture<SquareInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
