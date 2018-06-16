import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCellComponent } from './pass-cell.component';

describe('PassCellComponent', () => {
  let component: PassCellComponent;
  let fixture: ComponentFixture<PassCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
