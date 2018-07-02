import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCardTemplateComponent } from './pass-card-template.component';

describe('PassCardTemplateComponent', () => {
  let component: PassCardTemplateComponent;
  let fixture: ComponentFixture<PassCardTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCardTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCardTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
