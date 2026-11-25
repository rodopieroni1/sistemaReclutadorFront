import { TestBed } from '@angular/core/testing';

import { CarinaAiService } from './carina-ai.service';

describe('CarinaAiService', () => {
  let service: CarinaAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarinaAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
