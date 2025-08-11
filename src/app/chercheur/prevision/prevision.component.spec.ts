import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevisionComponent } from './prevision.component';

describe('PrevisionComponent', () => {
  let component: PrevisionComponent;
  let fixture: ComponentFixture<PrevisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrevisionComponent]
    });
    fixture = TestBed.createComponent(PrevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
