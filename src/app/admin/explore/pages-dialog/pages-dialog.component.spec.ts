import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesDialogComponent } from './pages-dialog.component';

describe('PagesDialogComponent', () => {
  let component: PagesDialogComponent;
  let fixture: ComponentFixture<PagesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
