import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsSyncComponent } from './accounts-sync.component';

describe('AccountsSyncComponent', () => {
  let component: AccountsSyncComponent;
  let fixture: ComponentFixture<AccountsSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountsSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
