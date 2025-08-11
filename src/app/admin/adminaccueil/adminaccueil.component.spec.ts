import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminaccueilComponent } from './adminaccueil.component';

describe('AdminaccueilComponent', () => {
  let component: AdminaccueilComponent;
  let fixture: ComponentFixture<AdminaccueilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminaccueilComponent]
    });
    fixture = TestBed.createComponent(AdminaccueilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
