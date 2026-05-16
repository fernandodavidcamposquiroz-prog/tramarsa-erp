import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprasService } from '../../core/services/compras.service';
import { OrdenCompra, Proveedor } from '../../core/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss'
})
export class ComprasComponent implements OnInit {
  private comprasService = inject(ComprasService);

  ordenes: OrdenCompra[] = [];
  proveedores: Proveedor[] = [];
  activeTab: 'ordenes' | 'proveedores' = 'ordenes';
  loading = true;

  ngOnInit(): void {
    this.comprasService.getOrdenes().subscribe({
      next: (data) => { this.ordenes = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.comprasService.getProveedores().subscribe({
      next: (data) => { this.proveedores = data; },
      error: () => {}
    });
  }

  setTab(tab: 'ordenes' | 'proveedores'): void {
    this.activeTab = tab;
  }

  actualizarEstado(id: number, estado: string): void {
    this.comprasService.actualizarEstado(id, estado).subscribe({
      next: (updated) => {
        const idx = this.ordenes.findIndex(o => o.id === id);
        if (idx !== -1) this.ordenes[idx] = updated;
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }

  getNextEstado(orden: OrdenCompra): { label: string; value: string } | null {
    const transitions: Record<string, { label: string; value: string }> = {
      pendiente: { label: 'Aprobar', value: 'aprobada' },
      aprobada:  { label: 'Marcar Recibida', value: 'recibida' },
    };
    return transitions[orden.estado] ?? null;
  }
}
