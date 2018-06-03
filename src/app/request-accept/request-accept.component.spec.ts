import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAcceptComponent } from './request-accept.component';

describe('RequestAcceptComponent', () => {
  let component: RequestAcceptComponent;
  let fixture: ComponentFixture<RequestAcceptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestAcceptComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestAcceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
