import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExistingRoomComponent } from './add-existing-room.component';

describe('AddExistingRoomComponent', () => {
  let component: AddExistingRoomComponent;
  let fixture: ComponentFixture<AddExistingRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExistingRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExistingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
