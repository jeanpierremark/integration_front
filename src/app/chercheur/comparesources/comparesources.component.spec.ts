import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparesourcesComponent } from './comparesources.component';

describe('ComparesourcesComponent', () => {
  let component: ComparesourcesComponent;
  let fixture: ComponentFixture<ComparesourcesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComparesourcesComponent]
    });
    fixture = TestBed.createComponent(ComparesourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
