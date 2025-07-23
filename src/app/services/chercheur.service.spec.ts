import { TestBed } from '@angular/core/testing';

import { ChercheurService } from './chercheur.service';

describe('ChercheurService', () => {
  let service: ChercheurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChercheurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
