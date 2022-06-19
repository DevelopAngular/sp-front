import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLimitsDialogComponent } from './pass-limits-dialog.component';

describe('PassLimitsDialogComponent', () => {
  let component: PassLimitsDialogComponent;
  let fixture: ComponentFixture<PassLimitsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassLimitsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLimitsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
