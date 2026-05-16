import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CobranzaService } from '../../core/services/cobranza.service';
import { Pago, ExtractoBancario, Factura } from '../../core/models';

@Component({
  selector: 'app-cobranza',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cobranza.component.html',
  styleUrl: './cobranza.component.scss'
})
export class CobranzaComponent implements OnInit {
  private cobranzaService = inject(CobranzaService);
  private fb = inject(FormBuilder);

  activeTab: 'cuentas' | 'pagos' | 'extracto' | 'detraccion' = 'cuentas';

  cuentasPorCobrar: any[] = [];
  pagos: Pago[] = [];
  extractos: ExtractoBancario[] = [];

  loading = true;
  loadingExtracto = false;

  showPagoForm = false;
  selectedFactura: any = null;
  pagoSuccess = false;
  pagoError = '';

  detraccionResult: any = null;
  detraccionError = '';
  loadingDetraccion = false;

  emparejarFacturaId: Record<number, number> = {};

  registrarPagoForm: FormGroup = this.fb.group({
    factura_id: [null],
    fecha_pago: [new Date().toISOString().split('T')[0], Validators.required],
    monto: [null, [Validators.required, Validators.min(1)]],
    tipo: ['completo', Validators.required],
    referencia: ['', Validators.required]
  });

  detraccionForm: FormGroup = this.fb.group({
    ruc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    monto: [null, [Validators.required, Validators.min(1)]],
    tipo_servicio: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.cobranzaService.getCuentasPorCobrar().subscribe({
      next: (data) => { this.cuentasPorCobrar = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.cobranzaService.getPagos().subscribe({
      next: (data) => { this.pagos = data; },
      error: () => {}
    });
    this.cobranzaService.getExtractos().subscribe({
      next: (data) => { this.extractos = data; },
      error: () => {}
    });
  }

  setTab(tab: 'cuentas' | 'pagos' | 'extracto' | 'detraccion'): void {
    this.activeTab = tab;
  }

  openPagoForm(factura: any): void {
    this.selectedFactura = factura;
    this.showPagoForm = true;
    this.pagoSuccess = false;
    this.pagoError = '';
    this.registrarPagoForm.patchValue({
      factura_id: factura.id,
      monto: factura.total
    });
  }

  closePagoForm(): void {
    this.showPagoForm = false;
    this.selectedFactura = null;
  }

  registrarPago(): void {
    if (this.registrarPagoForm.invalid) return;
    this.cobranzaService.registrarPago(this.registrarPagoForm.value).subscribe({
      next: () => {
        this.pagoSuccess = true;
        this.showPagoForm = false;
        this.loadAll();
      },
      error: (err) => {
        this.pagoError = err?.error?.detail || 'Error al registrar el pago.';
      }
    });
  }

  cargarExtractoBanco(): void {
    this.loadingExtracto = true;
    const fecha = new Date().toISOString().split('T')[0];
    this.cobranzaService.cargarExtracto(fecha).subscribe({
      next: () => {
        this.cobranzaService.getExtractos().subscribe({
          next: (data) => { this.extractos = data; this.loadingExtracto = false; },
          error: () => { this.loadingExtracto = false; }
        });
      },
      error: () => { this.loadingExtracto = false; }
    });
  }

  emparejarPago(extractoId: number): void {
    const facturaId = this.emparejarFacturaId[extractoId];
    if (!facturaId) return;
    this.cobranzaService.emparejarExtracto(extractoId, facturaId, 'completo').subscribe({
      next: () => {
        const idx = this.extractos.findIndex(e => e.id === extractoId);
        if (idx !== -1) this.extractos[idx].estado = 'emparejado';
      },
      error: (err) => console.error('Error al emparejar', err)
    });
  }

  validarDetraccion(): void {
    if (this.detraccionForm.invalid) return;
    this.loadingDetraccion = true;
    this.detraccionResult = null;
    this.detraccionError = '';
    this.cobranzaService.validarDetraccion(this.detraccionForm.value).subscribe({
      next: (data) => { this.detraccionResult = data; this.loadingDetraccion = false; },
      error: (err) => {
        this.detraccionError = err?.error?.detail || 'Error al validar con SUNAT.';
        this.loadingDetraccion = false;
      }
    });
  }

  get totalPendiente(): number {
    return this.cuentasPorCobrar.reduce((sum, c) => sum + (c.total || 0), 0);
  }

  get countVencidas(): number {
    return this.cuentasPorCobrar.filter(c => c.estado === 'vencida').length;
  }
}
