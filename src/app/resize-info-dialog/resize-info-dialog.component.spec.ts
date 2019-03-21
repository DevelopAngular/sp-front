import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizeInfoDialogComponent } from './resize-info-dialog.component';

describe('ResizeInfoDialogComponent', () => {
  let component: ResizeInfoDialogComponent;
  let fixture: ComponentFixture<ResizeInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResizeInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizeInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
