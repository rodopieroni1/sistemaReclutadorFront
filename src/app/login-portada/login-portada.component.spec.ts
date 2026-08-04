import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPortadaComponent } from './login-portada.component';

describe('LoginPortadaComponent', () => {
  let component: LoginPortadaComponent;
  let fixture: ComponentFixture<LoginPortadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPortadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPortadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
