import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentInviteCodeDialogComponent } from './parent-invite-code-dialog.component';

describe('ParentInviteCodeDialogComponent', () => {
  let component: ParentInviteCodeDialogComponent;
  let fixture: ComponentFixture<ParentInviteCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentInviteCodeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentInviteCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
