import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassFilterComponent } from './pass-filter.component';

describe('PassFilterComponent', () => {
  let component: PassFilterComponent;
  let fixture: ComponentFixture<PassFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
