import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpDialogBoxComponent } from './sp-dialog-box.component';

describe('SpDialogBoxComponent', () => {
  let component: SpDialogBoxComponent;
  let fixture: ComponentFixture<SpDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
