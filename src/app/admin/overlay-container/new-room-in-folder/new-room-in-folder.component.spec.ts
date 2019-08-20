import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRoomInFolderComponent } from './new-room-in-folder.component';

describe('NewRoomInFolderComponent', () => {
  let component: NewRoomInFolderComponent;
  let fixture: ComponentFixture<NewRoomInFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRoomInFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRoomInFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
