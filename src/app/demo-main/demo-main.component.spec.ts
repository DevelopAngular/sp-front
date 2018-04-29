import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoMainComponent } from './demo-main.component';

describe('DemoMainComponent', () => {
  let component: DemoMainComponent;
  let fixture: ComponentFixture<DemoMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemoMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
