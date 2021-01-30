import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredemoComponent } from './predemo.component';

describe('PredemoComponent', () => {
  let component: PredemoComponent;
  let fixture: ComponentFixture<PredemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredemoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
