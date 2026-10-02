import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient, apiErrorMessage, CustomerLedgerResponse, CustomerRecord, LedgerEntryRecord } from '../../data/api-client';
import { rentalDateOffset } from '../../data/rental-store';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-costomer-listing',
  styleUrl: './costomer-listing.css',
  templateUrl: './costomer-listing.html',
})
export class CostomerListing {
  private readonly api = inject(ApiClient);
  private ledgerRequest = 0;
  protected readonly customers = signal<CustomerRecord[]>([]);
  protected readonly selectedCustomerId = signal('');
  protected readonly ledger = signal<CustomerLedgerResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly savingPayment = signal(false);
  protected readonly loadError = signal('');
  protected readonly searchTerm = signal('');
  protected readonly paymentAmount = signal('');
  protected readonly paymentNote = signal('');
  protected readonly paymentError = signal('');
  protected readonly entries = computed(() => this.ledger()?.entries ?? []);

  protected readonly selectedCustomer = computed(() => this.ledger()?.customer ??
    this.customers().find((customer) => customer.id === this.selectedCustomerId()) ?? null);
  protected readonly customerEntries = this.entries;
  protected readonly ledgerRows = computed(() => {
    let runningBalance = 0;
    return [...this.customerEntries()]
      .reverse()
      .map((entry) => {
        runningBalance += entry.kind === 'Charge' ? entry.amount : -entry.amount;
        return { ...entry, balanceAfter: runningBalance };
      })
      .reverse();
  });
  protected readonly visibleEntries = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.ledgerRows().filter((entry) =>
      `${entry.reference} ${entry.description} ${entry.kind}`.toLowerCase().includes(query),
    );
  });
  protected readonly totalBilled = computed(() => this.ledger()?.totalBilled ?? 0);
  protected readonly totalPaid = computed(() => this.ledger()?.totalPaid ?? 0);
  protected readonly balanceDue = computed(() => this.totalBilled() - this.totalPaid());

  constructor() {
    void this.loadCustomers();
  }

  private async loadCustomers(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const customers = await this.api.getCustomers();
      this.customers.set(customers);
      const initialCustomer = customers[0];
      if (initialCustomer) {
        this.selectedCustomerId.set(initialCustomer.id);
        await this.loadLedger(initialCustomer.email);
      }
    } catch (error) {
      this.loadError.set(apiErrorMessage(error, 'Unable to load customers from the backend.'));
    } finally {
      this.loading.set(false);
    }
  }

  private async loadLedger(email: string): Promise<void> {
    const request = ++this.ledgerRequest;
    this.loading.set(true);
    this.loadError.set('');
    try {
      const ledger = await this.api.getLedger(email);
      if (request === this.ledgerRequest) this.ledger.set(ledger);
    } catch (error) {
      if (request === this.ledgerRequest) this.loadError.set(apiErrorMessage(error, 'Unable to load this customer ledger.'));
    } finally {
      if (request === this.ledgerRequest) this.loading.set(false);
    }
  }

  protected setCustomer(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCustomerId.set(id);
    this.searchTerm.set('');
    this.paymentError.set('');
    const customer = this.customers().find((item) => item.id === id);
    if (customer) void this.loadLedger(customer.email);
  }

  protected setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setPaymentAmount(event: Event): void {
    this.paymentAmount.set((event.target as HTMLInputElement).value);
  }

  protected setPaymentNote(event: Event): void {
    this.paymentNote.set((event.target as HTMLInputElement).value);
  }

  protected async recordPayment(): Promise<void> {
    const amount = Number(this.paymentAmount());
    if (!Number.isFinite(amount) || amount <= 0) {
      this.paymentError.set('Enter a payment amount greater than zero.');
      return;
    }

    const note = this.paymentNote().trim() || 'Manual payment';
    const customer = this.selectedCustomer();
    if (!customer) {
      this.paymentError.set('Select a customer before recording a payment.');
      return;
    }
    this.savingPayment.set(true);
    try {
      await this.api.recordPayment(customer.email, amount, note);
      await this.loadLedger(customer.email);
      this.paymentAmount.set('');
      this.paymentNote.set('');
      this.paymentError.set('');
    } catch (error) {
      this.paymentError.set(apiErrorMessage(error, 'Unable to record payment.'));
    } finally {
      this.savingPayment.set(false);
    }
  }
}
