import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFactorContainerComponent } from './form-factor-container.component';

describe('FormFactorContainerComponent', () => {
  let component: FormFactorContainerComponent;
  let fixture: ComponentFixture<FormFactorContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFactorContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFactorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
