import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditRoomsComponent } from './bulk-edit-rooms.component';

describe('BulkEditRoomsComponent', () => {
  let component: BulkEditRoomsComponent;
  let fixture: ComponentFixture<BulkEditRoomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkEditRoomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
