import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallPassListComponent } from './hall-pass-list.component';

describe('HallPassListComponent', () => {
  let component: HallPassListComponent;
  let fixture: ComponentFixture<HallPassListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallPassListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallPassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
