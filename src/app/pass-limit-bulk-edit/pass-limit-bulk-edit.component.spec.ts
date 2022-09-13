import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassLimitBulkEditComponent } from './pass-limit-bulk-edit.component';

describe('PassLimitBulkEditComponent', () => {
  let component: PassLimitBulkEditComponent;
  let fixture: ComponentFixture<PassLimitBulkEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassLimitBulkEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassLimitBulkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
