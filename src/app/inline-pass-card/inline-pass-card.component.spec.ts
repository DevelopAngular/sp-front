import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlinePassCardComponent } from './inline-pass-card.component';

describe('InlinePassCardComponent', () => {
  let component: InlinePassCardComponent;
  let fixture: ComponentFixture<InlinePassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlinePassCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlinePassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
