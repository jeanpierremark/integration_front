import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChercheurComponent } from './chercheur.component';

describe('ChercheurComponent', () => {
  let component: ChercheurComponent;
  let fixture: ComponentFixture<ChercheurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChercheurComponent]
    });
    fixture = TestBed.createComponent(ChercheurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
