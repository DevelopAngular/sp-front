import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsSearchComponent } from './rooms-search.component';

describe('RoomsSearchComponent', () => {
  let component: RoomsSearchComponent;
  let fixture: ComponentFixture<RoomsSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
