import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePassButtonComponent } from './create-pass-button.component';

describe('CreatePassButtonComponent', () => {
  let component: CreatePassButtonComponent;
  let fixture: ComponentFixture<CreatePassButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePassButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePassButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
