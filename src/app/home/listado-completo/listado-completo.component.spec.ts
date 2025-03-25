import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoCompletoComponent } from './listado-completo.component';

describe('ListadoCompletoComponent', () => {
  let component: ListadoCompletoComponent;
  let fixture: ComponentFixture<ListadoCompletoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoCompletoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoCompletoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
