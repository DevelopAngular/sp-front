import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AccountsHeaderComponent} from './accounts-header.component';

describe('AccountsHeaderComponent', () => {
  let component: AccountsHeaderComponent;
  let fixture: ComponentFixture<AccountsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
