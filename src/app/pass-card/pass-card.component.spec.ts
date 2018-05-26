import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCardComponent } from './pass-card.component';

describe('PassCardComponent', () => {
  let component: PassCardComponent;
  let fixture: ComponentFixture<PassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
