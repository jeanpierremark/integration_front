import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChercheurhomeComponent } from './chercheurhome.component';

describe('ChercheurhomeComponent', () => {
  let component: ChercheurhomeComponent;
  let fixture: ComponentFixture<ChercheurhomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChercheurhomeComponent]
    });
    fixture = TestBed.createComponent(ChercheurhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
