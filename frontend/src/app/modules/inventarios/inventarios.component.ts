import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventariosService } from '../../core/services/inventarios.service';
import { Servicio } from '../../core/models';

@Component({
  selector: 'app-inventarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventarios.component.html',
  styleUrl: './inventarios.component.scss'
})
export class InventariosComponent implements OnInit {
  private inventariosService = inject(InventariosService);

  servicios: Servicio[] = [];
  filteredServicios: Servicio[] = [];
  categorias: string[] = [];
  selectedCategoria = '';
  loading = true;

  ngOnInit(): void {
    this.inventariosService.getServicios().subscribe({
      next: (data) => {
        this.servicios = data;
        this.filteredServicios = data;
        this.categorias = [...new Set(data.map(s => s.categoria))];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterByCategoria(cat: string): void {
    this.selectedCategoria = cat;
    this.filteredServicios = cat
      ? this.servicios.filter(s => s.categoria === cat)
      : this.servicios;
  }
}
