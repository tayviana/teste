import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioDetalhePage } from './usuario-detalhe.page';

describe('UsuarioDetalhePage', () => {
  let component: UsuarioDetalhePage;
  let fixture: ComponentFixture<UsuarioDetalhePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioDetalhePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
