import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineRequestCardComponent } from './inline-request-card.component';

describe('InlineRequestCardComponent', () => {
  let component: InlineRequestCardComponent;
  let fixture: ComponentFixture<InlineRequestCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineRequestCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineRequestCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
