import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditRoomsInFolderComponent } from './bulk-edit-rooms-in-folder.component';

describe('BulkEditRoomsInFolderComponent', () => {
  let component: BulkEditRoomsInFolderComponent;
  let fixture: ComponentFixture<BulkEditRoomsInFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkEditRoomsInFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditRoomsInFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
