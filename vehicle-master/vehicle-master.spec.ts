import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RentalStore } from '../../data/rental-store';
import { VehicleMaster } from './vehicle-master';

describe('VehicleMaster', () => {
  let component: VehicleMaster;
  let fixture: ComponentFixture<VehicleMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleMaster],
      providers: [{ provide: RentalStore, useValue: {
        vehicles: signal([]), bookings: signal([]), loadError: signal(''), loading: signal(false),
        isVehicleAvailable: () => true, addVehicle: async () => null,
      } }],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleMaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
