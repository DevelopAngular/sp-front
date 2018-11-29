import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputHelperDialogComponent } from './input-helper-dialog.component';

describe('InputHelperDialogComponent', () => {
  let component: InputHelperDialogComponent;
  let fixture: ComponentFixture<InputHelperDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputHelperDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputHelperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
