import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnableComponent } from './pinnable.component';

describe('PinnableComponent', () => {
  let component: PinnableComponent;
  let fixture: ComponentFixture<PinnableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinnableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
