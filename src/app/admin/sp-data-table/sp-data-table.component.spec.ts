import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SpDataTableComponent} from './sp-data-table.component';

describe('SpDataTableComponent', () => {
  let component: SpDataTableComponent;
  let fixture: ComponentFixture<SpDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
