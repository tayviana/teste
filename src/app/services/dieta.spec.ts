import { TestBed } from '@angular/core/testing';

import { Dieta } from './dieta';

describe('Dieta', () => {
  let service: Dieta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dieta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
