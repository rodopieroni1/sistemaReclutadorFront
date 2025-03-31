import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevaOfertaComponent } from './modal-nueva-oferta.component';

describe('ModalNuevaOfertaComponent', () => {
  let component: ModalNuevaOfertaComponent;
  let fixture: ComponentFixture<ModalNuevaOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNuevaOfertaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNuevaOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
