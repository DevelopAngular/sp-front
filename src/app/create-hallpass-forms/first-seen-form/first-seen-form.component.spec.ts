import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstSeenFormComponent } from './first-seen-form.component';

describe('FirstSeenFormComponent', () => {
  let component: FirstSeenFormComponent;
  let fixture: ComponentFixture<FirstSeenFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FirstSeenFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstSeenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
