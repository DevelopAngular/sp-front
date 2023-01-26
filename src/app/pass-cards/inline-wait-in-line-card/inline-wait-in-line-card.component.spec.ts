import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineWaitInLineCardComponent } from './inline-wait-in-line-card.component';

describe('InlineWaitInLineCardComponent', () => {
  let component: InlineWaitInLineCardComponent;
  let fixture: ComponentFixture<InlineWaitInLineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineWaitInLineCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineWaitInLineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
