import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosComponentComponent } from './ios-component.component';

describe('IosComponentComponent', () => {
  let component: IosComponentComponent;
  let fixture: ComponentFixture<IosComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
