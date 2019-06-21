import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsSetupComponent } from './accounts-setup.component';

describe('AccountsSetupComponent', () => {
  let component: AccountsSetupComponent;
  let fixture: ComponentFixture<AccountsSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
