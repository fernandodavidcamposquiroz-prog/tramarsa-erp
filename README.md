# TRAMARSA ERP — Demo Académico

## Stack
- **Frontend:** Angular 17 → `http://localhost:4200` (local) / Vercel (prod)
- **Backend:** Node.js + Express → `http://localhost:3000` (local) / Railway (prod)
- **Base de datos:** PostgreSQL 16

## Estructura del Proyecto

```
tramarsa-erp/
├── frontend/                  ← Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/       ← ventas, compras, inventarios, finanzas, cobranza
│   │   │   ├── core/          ← guards, interceptors, services globales
│   │   │   └── shared/        ← componentes reutilizables
│   │   └── environments/      ← environment.ts / environment.prod.ts
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                   ← Node.js / Express
│   ├── src/
│   │   ├── config/            ← configuración DB, JWT, etc.
│   │   ├── modules/           ← ventas, compras, inventarios, finanzas, cobranza, auth
│   │   │   └── [modulo]/
│   │   │       ├── routes.js
│   │   │       ├── controller.js
│   │   │       ├── service.js
│   │   │       └── model.js
│   │   ├── middlewares/       ← auth, errorHandler, logger
│   │   ├── utils/             ← helpers, mock SUNAT, mock Banco
│   │   └── routes/            ← index de rutas
│   ├── .env.local
│   ├── .env.production
│   └── Dockerfile
│
├── database/
│   ├── schema/                ← SQLs de creación de tablas (01→05)
│   ├── seeds/                 ← datos de prueba TRAMARSA
│   └── migrations/            ← cambios futuros al esquema
│
├── docker-compose.yml         ← LOCAL (3 contenedores)
├── docker-compose.prod.yml    ← PRODUCCIÓN
└── .env.example               ← plantilla de variables
```

## Módulos del sistema
| Módulo | Descripción |
|--------|-------------|
| **Auth** | Login, roles (admin, agente, gerente) |
| **Ventas** | Clientes, cotizaciones, facturas de servicio |
| **Compras** | Proveedores, órdenes de compra |
| **Inventarios** | Servicios/productos marítimos, stock de insumos |
| **Finanzas** | Cuentas por cobrar, reportes, KPIs |
| **Cobranza** | Pagos, clasificación, mock SUNAT/Banco |

## Comandos rápidos

```bash
# LOCAL con Docker
docker-compose up --build

# LOCAL sin Docker (backend)
cd backend && npm install && npm run dev

# LOCAL sin Docker (frontend)
cd frontend && npm install && ng serve

# PRODUCCIÓN
docker-compose -f docker-compose.prod.yml up -d --build
```

## Entornos
- **Local:** variables en `backend/.env.local`
- **Producción:** variables en `backend/.env.production`
- **Angular:** `src/environments/environment.ts` (local) y `environment.prod.ts` (prod)
