import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastConnectionComponent } from './toast-connection.component';

describe('ToastConnectionComponent', () => {
  let component: ToastConnectionComponent;
  let fixture: ComponentFixture<ToastConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToastConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
