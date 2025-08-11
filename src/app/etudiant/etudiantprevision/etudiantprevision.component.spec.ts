import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantprevisionComponent } from './etudiantprevision.component';

describe('EtudiantprevisionComponent', () => {
  let component: EtudiantprevisionComponent;
  let fixture: ComponentFixture<EtudiantprevisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtudiantprevisionComponent]
    });
    fixture = TestBed.createComponent(EtudiantprevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
