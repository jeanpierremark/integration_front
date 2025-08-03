import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChercheurheaderComponent } from './chercheurheader.component';

describe('ChercheurheaderComponent', () => {
  let component: ChercheurheaderComponent;
  let fixture: ComponentFixture<ChercheurheaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChercheurheaderComponent]
    });
    fixture = TestBed.createComponent(ChercheurheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
