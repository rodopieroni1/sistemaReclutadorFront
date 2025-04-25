import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariocontrolComponent } from './usuariocontrol.component';

describe('UsuariocontrolComponent', () => {
  let component: UsuariocontrolComponent;
  let fixture: ComponentFixture<UsuariocontrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariocontrolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariocontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
