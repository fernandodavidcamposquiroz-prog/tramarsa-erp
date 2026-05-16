import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio } from '../models';

@Injectable({ providedIn: 'root' })
export class InventariosService {
  private base = `${environment.apiUrl}/inventarios`;
  constructor(private http: HttpClient) {}

  getServicios(categoria?: string): Observable<Servicio[]> {
    const url = categoria ? `${this.base}/servicios?categoria=${categoria}` : `${this.base}/servicios`;
    return this.http.get<Servicio[]>(url);
  }
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/categorias`);
  }
  crearServicio(data: Partial<Servicio>): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.base}/servicios`, data);
  }
  actualizarServicio(id: number, data: Partial<Servicio>): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.base}/servicios/${id}`, data);
  }
}
