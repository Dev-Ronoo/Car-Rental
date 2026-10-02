import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RentalStore, rentalDateOffset, VehicleCategory } from '../../data/rental-store';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-vehicle-master',
  styleUrl: './vehicle-master.css',
  templateUrl: './vehicle-master.html',
})
export class VehicleMaster {
  private readonly store = inject(RentalStore);
  protected readonly categories: VehicleCategory[] = ['Compact', 'Sedan', 'SUV', 'Electric', 'Van'];
  protected readonly vehicles = this.store.vehicles;
  protected readonly searchTerm = signal('');
  protected readonly categoryFilter = signal('All categories');
  protected readonly availabilityFilter = signal('All vehicles');
  protected readonly showForm = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly loadError = this.store.loadError;
  protected readonly loading = this.store.loading;
  protected readonly saving = signal(false);
  protected readonly today = rentalDateOffset(0);
  protected readonly availableCount = computed(() =>
    this.vehicles().filter((vehicle) => this.isAvailable(vehicle.id)).length,
  );
  protected readonly filteredVehicles = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.vehicles().filter((vehicle) => {
      const matchesQuery = `${vehicle.make} ${vehicle.model} ${vehicle.plate} ${vehicle.id}`.toLowerCase().includes(query);
      const matchesCategory = this.categoryFilter() === 'All categories' || vehicle.category === this.categoryFilter();
      const available = this.isAvailable(vehicle.id);
      const matchesAvailability = this.availabilityFilter() === 'All vehicles' ||
        (this.availabilityFilter() === 'Available' ? available : !available);
      return matchesQuery && matchesCategory && matchesAvailability;
    });
  });

  protected isAvailable(vehicleId: string): boolean {
    return this.store.isVehicleAvailable(vehicleId, this.today, this.today);
  }

  protected setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setCategory(event: Event): void {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  protected setAvailability(event: Event): void {
    this.availabilityFilter.set((event.target as HTMLSelectElement).value);
  }

  protected async addVehicle(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    this.saving.set(true);
    const error = await this.store.addVehicle({
      make: String(values.get('make')).trim(),
      model: String(values.get('model')).trim(),
      year: Number(values.get('year')),
      plate: String(values.get('plate')).trim(),
      category: String(values.get('category')) as VehicleCategory,
      dailyRate: Number(values.get('dailyRate')),
      color: String(values.get('color')).trim(),
    });
    if (error) {
      this.errorMessage.set(error);
      this.saving.set(false);
      return;
    }
    form.reset();
    this.errorMessage.set('');
    this.showForm.set(false);
    this.saving.set(false);
  }
}
