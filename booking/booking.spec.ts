import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RentalStore } from '../../data/rental-store';
import { Booking } from './booking';

describe('Booking', () => {
  let component: Booking;
  let fixture: ComponentFixture<Booking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [{ provide: RentalStore, useValue: {
        vehicles: signal([]), bookings: signal([]), loadError: signal(''), loading: signal(false),
        isVehicleAvailable: () => true, vehicleFor: () => undefined,
        addBooking: async () => null, updateBookingStatus: async () => null,
      } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
