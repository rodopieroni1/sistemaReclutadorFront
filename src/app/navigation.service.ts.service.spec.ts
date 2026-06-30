import { TestBed } from '@angular/core/testing';

import { NavigationServiceTsService } from './navigation.service.ts.service';

describe('NavigationServiceTsService', () => {
  let service: NavigationServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
