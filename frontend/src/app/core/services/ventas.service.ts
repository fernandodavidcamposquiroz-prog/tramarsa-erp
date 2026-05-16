import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura, Cliente } from '../models';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private base = `${environment.apiUrl}/ventas`;
  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.base}/clientes`);
  }
  crearCliente(data: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.base}/clientes`, data);
  }
  getFacturas(estado?: string): Observable<Factura[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<Factura[]>(`${this.base}/facturas`, { params });
  }
  getFactura(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.base}/facturas/${id}`);
  }
  crearFactura(data: any): Observable<Factura> {
    return this.http.post<Factura>(`${this.base}/facturas`, data);
  }
}
