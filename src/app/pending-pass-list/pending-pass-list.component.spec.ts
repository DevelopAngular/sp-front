import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPassListComponent } from './pending-pass-list.component';

describe('PendingPassListComponent', () => {
  let component: PendingPassListComponent;
  let fixture: ComponentFixture<PendingPassListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingPassListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
