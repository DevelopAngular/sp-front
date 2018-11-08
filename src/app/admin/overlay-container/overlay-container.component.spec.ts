import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayContainerComponent } from './overlay-container.component';

describe('OverlayContainerComponent', () => {
  let component: OverlayContainerComponent;
  let fixture: ComponentFixture<OverlayContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
