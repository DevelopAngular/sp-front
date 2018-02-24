import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePassComponent } from './template-pass.component';

describe('TemplatePassComponent', () => {
  let component: TemplatePassComponent;
  let fixture: ComponentFixture<TemplatePassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplatePassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
