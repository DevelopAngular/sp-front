import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedOutToastComponent } from './signed-out-toast.component';

describe('SignedOutToastComponent', () => {
  let component: SignedOutToastComponent;
  let fixture: ComponentFixture<SignedOutToastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignedOutToastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignedOutToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
