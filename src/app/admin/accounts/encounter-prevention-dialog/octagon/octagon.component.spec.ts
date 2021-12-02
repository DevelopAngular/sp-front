import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OctagonComponent} from './octagon.component';

describe('OctagonComponent', () => {
  let component: OctagonComponent;
  let fixture: ComponentFixture<OctagonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OctagonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OctagonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
