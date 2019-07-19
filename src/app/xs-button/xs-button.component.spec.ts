import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XsButtonComponent } from './xs-button.component';

describe('XsButtonComponent', () => {
  let component: XsButtonComponent;
  let fixture: ComponentFixture<XsButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XsButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
