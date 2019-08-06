import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoomInFolderComponent } from './edit-room-in-folder.component';

describe('EditRoomInFolderComponent', () => {
  let component: EditRoomInFolderComponent;
  let fixture: ComponentFixture<EditRoomInFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRoomInFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRoomInFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
