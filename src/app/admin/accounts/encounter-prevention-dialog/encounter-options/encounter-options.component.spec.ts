import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EncounterOptionsComponent} from './encounter-options.component';

describe('EncounterOptionsComponent', () => {
  let component: EncounterOptionsComponent;
  let fixture: ComponentFixture<EncounterOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncounterOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncounterOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
