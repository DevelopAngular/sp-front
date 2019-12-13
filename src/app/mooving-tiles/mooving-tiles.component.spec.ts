import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoovingTilesComponent } from './mooving-tiles.component';

describe('MoovingTilesComponent', () => {
  let component: MoovingTilesComponent;
  let fixture: ComponentFixture<MoovingTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoovingTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoovingTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
