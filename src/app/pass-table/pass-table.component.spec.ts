import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassTableComponent } from './pass-table.component';

describe('PassTableComponent', () => {
  let component: PassTableComponent;
  let fixture: ComponentFixture<PassTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
