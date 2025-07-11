import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevaEmpresaComponent } from './modal-nueva-empresa.component';

describe('ModalNuevaEmpresaComponent', () => {
  let component: ModalNuevaEmpresaComponent;
  let fixture: ComponentFixture<ModalNuevaEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNuevaEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNuevaEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
