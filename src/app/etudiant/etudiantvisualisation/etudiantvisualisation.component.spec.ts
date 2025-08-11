import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantvisualisationComponent } from './etudiantvisualisation.component';

describe('EtudiantvisualisationComponent', () => {
  let component: EtudiantvisualisationComponent;
  let fixture: ComponentFixture<EtudiantvisualisationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtudiantvisualisationComponent]
    });
    fixture = TestBed.createComponent(EtudiantvisualisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
