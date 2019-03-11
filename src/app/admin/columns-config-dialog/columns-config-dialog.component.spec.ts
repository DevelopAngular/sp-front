import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsConfigDialogComponent } from './columns-config-dialog.component';

describe('ColumnsConfigDialogComponent', () => {
  let component: ColumnsConfigDialogComponent;
  let fixture: ComponentFixture<ColumnsConfigDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnsConfigDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
