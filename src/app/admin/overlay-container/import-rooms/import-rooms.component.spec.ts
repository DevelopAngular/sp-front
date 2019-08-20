import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportRoomsComponent } from './import-rooms.component';

describe('ImportRoomsComponent', () => {
  let component: ImportRoomsComponent;
  let fixture: ComponentFixture<ImportRoomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportRoomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
