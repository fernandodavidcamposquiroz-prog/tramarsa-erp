import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KpisCobranza, Pago, ExtractoBancario } from '../models';

@Injectable({ providedIn: 'root' })
export class CobranzaService {
  private baseF = `${environment.apiUrl}/finanzas`;
  private baseC = `${environment.apiUrl}/cobranza`;
  constructor(private http: HttpClient) {}

  getKpis(): Observable<{ resumen: KpisCobranza; por_estado: any[]; tendencia: any[] }> {
    return this.http.get<any>(`${this.baseF}/kpis`);
  }
  getCuentasPorCobrar(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseF}/cuentas-por-cobrar`);
  }
  getReporteMorosidad(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseF}/reporte-morosidad`);
  }
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseC}/pagos`);
  }
  registrarPago(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseC}/pagos`, data);
  }
  validarDetraccion(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseC}/validar-detraccion`, data);
  }
  getExtractos(): Observable<ExtractoBancario[]> {
    return this.http.get<ExtractoBancario[]>(`${this.baseC}/extractos`);
  }
  cargarExtracto(fecha: string): Observable<any> {
    return this.http.post<any>(`${this.baseC}/extractos/cargar`, { fecha });
  }
  emparejarExtracto(id: number, factura_id: number, tipo: string): Observable<any> {
    return this.http.post<any>(`${this.baseC}/extractos/${id}/emparejar`, { factura_id, tipo });
  }
}
