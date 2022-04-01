import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NuxUniversalComponent} from './nux-universal.component';

describe('NuxUniversalComponent', () => {
  let component: NuxUniversalComponent;
  let fixture: ComponentFixture<NuxUniversalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuxUniversalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuxUniversalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
