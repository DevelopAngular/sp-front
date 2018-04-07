import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatePassComponent } from './activate-pass.component';

describe('ActivatePassComponent', () => {
  let component: ActivatePassComponent;
  let fixture: ComponentFixture<ActivatePassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivatePassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
