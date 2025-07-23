import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudianthomeComponent } from './etudianthome.component';

describe('EtudianthomeComponent', () => {
  let component: EtudianthomeComponent;
  let fixture: ComponentFixture<EtudianthomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtudianthomeComponent]
    });
    fixture = TestBed.createComponent(EtudianthomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
