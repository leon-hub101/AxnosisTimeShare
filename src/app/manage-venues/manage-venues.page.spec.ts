import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageVenuesPage } from './manage-venues.page';

describe('ManageVenuesPage', () => {
  let component: ManageVenuesPage;
  let fixture: ComponentFixture<ManageVenuesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageVenuesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
