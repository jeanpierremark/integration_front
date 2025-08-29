import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoguserComponent } from './loguser.component';

describe('LoguserComponent', () => {
  let component: LoguserComponent;
  let fixture: ComponentFixture<LoguserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoguserComponent]
    });
    fixture = TestBed.createComponent(LoguserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
