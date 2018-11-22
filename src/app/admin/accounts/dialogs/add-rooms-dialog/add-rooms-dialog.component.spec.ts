import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoomsDialogComponent } from './add-rooms-dialog.component';

describe('AddRoomsDialogComponent', () => {
  let component: AddRoomsDialogComponent;
  let fixture: ComponentFixture<AddRoomsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRoomsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoomsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
