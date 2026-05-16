import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdenCompra, Proveedor } from '../models';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private base = `${environment.apiUrl}/compras`;
  constructor(private http: HttpClient) {}

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.base}/proveedores`);
  }
  getOrdenes(estado?: string): Observable<OrdenCompra[]> {
    const url = estado ? `${this.base}/ordenes?estado=${estado}` : `${this.base}/ordenes`;
    return this.http.get<OrdenCompra[]>(url);
  }
  crearOrden(data: any): Observable<OrdenCompra> {
    return this.http.post<OrdenCompra>(`${this.base}/ordenes`, data);
  }
  actualizarEstado(id: number, estado: string): Observable<OrdenCompra> {
    return this.http.patch<OrdenCompra>(`${this.base}/ordenes/${id}/estado`, { estado });
  }
}
