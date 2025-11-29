import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DietaPage } from './dieta.page';

describe('DietaPage', () => {
  let component: DietaPage;
  let fixture: ComponentFixture<DietaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DietaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
