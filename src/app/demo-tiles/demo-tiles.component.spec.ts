import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoTilesComponent } from './demo-tiles.component';

describe('DemoTilesComponent', () => {
  let component: DemoTilesComponent;
  let fixture: ComponentFixture<DemoTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
