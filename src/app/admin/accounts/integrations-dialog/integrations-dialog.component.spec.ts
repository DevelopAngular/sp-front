import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationsDialogComponent } from './integrations-dialog.component';

describe('IntegrationsDialogComponent', () => {
  let component: IntegrationsDialogComponent;
  let fixture: ComponentFixture<IntegrationsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
