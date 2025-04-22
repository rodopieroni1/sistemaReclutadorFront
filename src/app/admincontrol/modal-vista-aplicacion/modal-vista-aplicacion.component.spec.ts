import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVistaAplicacionComponent } from './modal-vista-aplicacion.component';

describe('ModalVistaAplicacionComponent', () => {
  let component: ModalVistaAplicacionComponent;
  let fixture: ComponentFixture<ModalVistaAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVistaAplicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVistaAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
