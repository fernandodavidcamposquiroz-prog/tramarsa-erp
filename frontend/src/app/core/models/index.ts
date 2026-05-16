export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'agente' | 'gerente';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Cliente {
  id: number;
  ruc: string;
  razon_social: string;
  email: string;
  telefono: string;
  tipo: string;
}

export interface Proveedor {
  id: number;
  ruc: string;
  razon_social: string;
  email: string;
  tipo: string;
}

export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_unitario: number;
  unidad: string;
  stock: number;
}

export interface Factura {
  id: number;
  numero: string;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_ruc?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'pendiente' | 'parcial' | 'pagada' | 'vencida';
  observacion?: string;
}

export interface OrdenCompra {
  id: number;
  numero: string;
  proveedor_id: number;
  proveedor_nombre?: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'aprobada' | 'recibida' | 'cancelada';
  descripcion: string;
}

export interface Pago {
  id: number;
  factura_id: number;
  factura_numero?: string;
  cliente_nombre?: string;
  fecha_pago: string;
  monto: number;
  tipo: 'completo' | 'parcial' | 'anticipo';
  referencia: string;
  estado_detraccion: string;
  monto_detraccion: number;
  validado_sunat: boolean;
}

export interface ExtractoBancario {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  referencia: string;
  estado: 'no_identificado' | 'emparejado';
  pago_id?: number;
}

export interface KpisCobranza {
  facturas_pendientes: number;
  facturas_vencidas: number;
  facturas_pagadas: number;
  monto_por_cobrar: number;
  monto_cobrado: number;
  dso_promedio_dias: number;
}
