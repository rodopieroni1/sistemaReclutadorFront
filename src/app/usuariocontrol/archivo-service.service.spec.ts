import { TestBed } from '@angular/core/testing';

import { ArchivoServiceService } from './archivo-service.service';

describe('ArchivoServiceService', () => {
  let service: ArchivoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
