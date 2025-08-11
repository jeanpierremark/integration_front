import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantheaderComponent } from './etudiantheader.component';

describe('EtudiantheaderComponent', () => {
  let component: EtudiantheaderComponent;
  let fixture: ComponentFixture<EtudiantheaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtudiantheaderComponent]
    });
    fixture = TestBed.createComponent(EtudiantheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
