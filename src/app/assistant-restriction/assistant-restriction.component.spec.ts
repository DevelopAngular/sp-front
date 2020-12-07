import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AssistantRestrictionComponent} from './assistant-restriction.component';

describe('AssistantRestrictionComponent', () => {
  let component: AssistantRestrictionComponent;
  let fixture: ComponentFixture<AssistantRestrictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssistantRestrictionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistantRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
