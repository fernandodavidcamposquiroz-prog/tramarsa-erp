import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VentasService } from '../../core/services/ventas.service';
import { Factura, Cliente } from '../../core/models';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  private ventasService = inject(VentasService);

  facturas: Factura[] = [];
  filteredFacturas: Factura[] = [];
  clientes: Cliente[] = [];
  activeTab: 'facturas' | 'clientes' = 'facturas';
  filtroEstado = '';
  loading = true;

  ngOnInit(): void {
    this.ventasService.getFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        this.filteredFacturas = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.ventasService.getClientes().subscribe({
      next: (data) => { this.clientes = data; },
      error: () => {}
    });
  }

  filterFacturas(): void {
    this.filteredFacturas = this.filtroEstado
      ? this.facturas.filter(f => f.estado === this.filtroEstado)
      : this.facturas;
  }

  setTab(tab: 'facturas' | 'clientes'): void {
    this.activeTab = tab;
  }

  setFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.filterFacturas();
  }
}
