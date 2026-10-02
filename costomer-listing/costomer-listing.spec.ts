import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiClient } from '../../data/api-client';
import { CostomerListing } from './costomer-listing';

describe('CostomerListing', () => {
  let component: CostomerListing;
  let fixture: ComponentFixture<CostomerListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostomerListing],
      providers: [{ provide: ApiClient, useValue: {
        getCustomers: async () => [], getLedger: async () => null, recordPayment: async () => null,
      } }],
    }).compileComponents();

    fixture = TestBed.createComponent(CostomerListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
