import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CobranzaService } from '../../core/services/cobranza.service';
import { KpisCobranza } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private cobranzaService = inject(CobranzaService);

  kpis: KpisCobranza | null = null;
  porEstado: any[] = [];
  tendencia: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.cobranzaService.getKpis().subscribe({
      next: (data) => {
        this.kpis = data.resumen;
        this.porEstado = data.por_estado ?? [];
        this.tendencia = data.tendencia ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
