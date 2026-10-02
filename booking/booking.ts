import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { BookingStatus, RentalStore, rentalDateOffset } from '../../data/rental-store';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-booking',
  styleUrl: './booking.css',
  templateUrl: './booking.html',
})
export class Booking {
  private readonly store = inject(RentalStore);
  protected readonly bookings = this.store.bookings;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('All statuses');
  protected readonly showForm = signal(false);
  protected readonly formError = signal('');
  protected readonly loadError = this.store.loadError;
  protected readonly loading = this.store.loading;
  protected readonly saving = signal(false);
  protected readonly today = rentalDateOffset(0);
  protected readonly startDate = signal(rentalDateOffset(1));
  protected readonly endDate = signal(rentalDateOffset(3));
  protected readonly vehicleOptions = computed(() =>
    this.store.vehicles().map((vehicle) => ({
      ...vehicle,
      available: this.store.isVehicleAvailable(vehicle.id, this.startDate(), this.endDate()),
    })),
  );
  protected readonly filteredBookings = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.bookings().filter((booking) => {
      const vehicle = this.store.vehicleFor(booking.vehicleId);
      const matchesQuery = `${booking.id} ${booking.customerName} ${booking.customerEmail} ${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`
        .toLowerCase().includes(query);
      return matchesQuery && (this.statusFilter() === 'All statuses' || booking.status === this.statusFilter());
    });
  });
  protected readonly estimatedTotal = computed(() => {
    const vehicle = this.store.vehicles().find((item) => item.id === this.selectedVehicleId());
    const days = Math.max(1, Math.ceil((Date.parse(this.endDate()) - Date.parse(this.startDate())) / 86_400_000));
    return vehicle ? days * vehicle.dailyRate : 0;
  });

  private readonly selectedVehicleId = signal('');

  protected setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  protected setStartDate(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
    if (this.endDate() < this.startDate()) this.endDate.set(this.startDate());
  }

  protected setEndDate(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  protected setVehicle(event: Event): void {
    this.selectedVehicleId.set((event.target as HTMLSelectElement).value);
  }

  protected vehicleName(vehicleId: string): string {
    const vehicle = this.store.vehicleFor(vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle removed';
  }

  protected async updateStatus(id: string, status: BookingStatus): Promise<void> {
    const error = await this.store.updateBookingStatus(id, status);
    if (error) this.formError.set(error);
  }

  protected async createBooking(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    this.saving.set(true);
    const error = await this.store.addBooking({
      vehicleId: String(values.get('vehicleId')),
      customerName: String(values.get('customerName')).trim(),
      customerEmail: String(values.get('customerEmail')).trim(),
      startDate: String(values.get('startDate')),
      endDate: String(values.get('endDate')),
    });
    if (error) {
      this.formError.set(error);
      this.saving.set(false);
      return;
    }
    form.reset();
    this.startDate.set(rentalDateOffset(1));
    this.endDate.set(rentalDateOffset(3));
    this.selectedVehicleId.set('');
    this.formError.set('');
    this.showForm.set(false);
    this.saving.set(false);
  }
}
