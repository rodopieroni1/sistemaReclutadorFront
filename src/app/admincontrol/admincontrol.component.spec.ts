import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmincontrolComponent } from './admincontrol.component';

describe('AdmincontrolComponent', () => {
  let component: AdmincontrolComponent;
  let fixture: ComponentFixture<AdmincontrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmincontrolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmincontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
