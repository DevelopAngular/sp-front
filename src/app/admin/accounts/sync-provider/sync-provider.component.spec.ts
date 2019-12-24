import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncProviderComponent } from './sync-provider.component';

describe('SyncProviderComponent', () => {
  let component: SyncProviderComponent;
  let fixture: ComponentFixture<SyncProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
