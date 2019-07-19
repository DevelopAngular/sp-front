import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsSetUpComponent } from './rooms-set-up.component';

describe('RoomsSetUpComponent', () => {
  let component: RoomsSetUpComponent;
  let fixture: ComponentFixture<RoomsSetUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomsSetUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomsSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
