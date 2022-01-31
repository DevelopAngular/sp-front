import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SmartpassSearchComponent} from './smartpass-search.component';

describe('StudentSearchComponent', () => {
  let component: SmartpassSearchComponent;
  let fixture: ComponentFixture<SmartpassSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartpassSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartpassSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
