import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RentalStore, rentalDateOffset } from '../../data/rental-store';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, UpperCasePipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly store = inject(RentalStore);
  protected readonly vehicles = this.store.vehicles;
  protected readonly bookings = this.store.bookings;
  protected readonly dashboard = this.store.dashboard;
  protected readonly loadError = this.store.loadError;
  protected readonly loading = this.store.loading;
  protected readonly today = rentalDateOffset(0);
  protected readonly todayBookings = computed(() =>
    (this.dashboard()?.todayBookings ?? this.bookings())
      .filter((booking) => booking.status !== 'Cancelled' && booking.endDate >= this.today)
      .sort((first, second) => first.startDate.localeCompare(second.startDate))
      .slice(0, 5),
  );
  protected readonly activeRentals = computed(() =>
    this.dashboard()?.activeRentals ?? this.bookings().filter((booking) => booking.status === 'Active').length,
  );
  protected readonly upcomingPickups = computed(() =>
    this.dashboard()?.upcomingPickups ?? this.bookings().filter((booking) => booking.status === 'Confirmed' && booking.startDate >= this.today).length,
  );
  protected readonly availableToday = computed(() =>
    this.dashboard()?.availableToday ?? this.vehicles().filter((vehicle) => this.store.isVehicleAvailable(vehicle.id, this.today, this.today)).length,
  );
  protected readonly bookedRevenue = computed(() =>
    this.dashboard()?.bookedRevenue ?? this.bookings()
      .filter((booking) => booking.status !== 'Cancelled')
      .reduce((total, booking) => total + booking.total, 0),
  );

  protected vehicleName(vehicleId: string): string {
    const vehicle = this.store.vehicleFor(vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle removed';
  }
}
