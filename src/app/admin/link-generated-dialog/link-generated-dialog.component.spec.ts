import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkGeneratedDialogComponent } from './link-generated-dialog.component';

describe('LinkGeneratedDialogComponent', () => {
  let component: LinkGeneratedDialogComponent;
  let fixture: ComponentFixture<LinkGeneratedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkGeneratedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkGeneratedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
