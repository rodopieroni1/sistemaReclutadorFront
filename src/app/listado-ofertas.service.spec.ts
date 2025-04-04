import { TestBed } from '@angular/core/testing';

import { ListadoOfertasService } from './listado-ofertas.service';

describe('ListadoOfertasService', () => {
  let service: ListadoOfertasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListadoOfertasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
