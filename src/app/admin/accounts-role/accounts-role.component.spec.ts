import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsRoleComponent } from './accounts-role.component';

describe('AccountsRoleComponent', () => {
  let component: AccountsRoleComponent;
  let fixture: ComponentFixture<AccountsRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
