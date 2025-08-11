import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseavanceComponent } from './analyseavance.component';

describe('AnalyseavanceComponent', () => {
  let component: AnalyseavanceComponent;
  let fixture: ComponentFixture<AnalyseavanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyseavanceComponent]
    });
    fixture = TestBed.createComponent(AnalyseavanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
