import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSettingDialogComponent } from './school-setting-dialog.component';

describe('SchoolSettingDialogComponent', () => {
  let component: SchoolSettingDialogComponent;
  let fixture: ComponentFixture<SchoolSettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolSettingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
