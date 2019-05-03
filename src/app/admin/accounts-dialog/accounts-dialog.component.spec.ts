import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsDialogComponent } from './accounts-dialog.component';

describe('EditRestrictionsDialogComponent', () => {
  let component: AccountsDialogComponent;
  let fixture: ComponentFixture<AccountsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
