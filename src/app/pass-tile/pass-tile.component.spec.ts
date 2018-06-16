import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassTileComponent } from './pass-tile.component';

describe('PassTileComponent', () => {
  let component: PassTileComponent;
  let fixture: ComponentFixture<PassTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
