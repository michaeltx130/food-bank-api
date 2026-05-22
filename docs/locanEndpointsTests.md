# API FoodBank - Endpoints locales 

Documentacion generada desde las rutas Express y controladores actuales del proyecto.

## Variables

```text
baseComondu = http://localhost:3001
baseLapaz   = http://localhost:3002
baseLoreto  = http://localhost:3003
baseMulege  = http://localhost:3004
```

## Headers generales

Para endpoints con body:

```http
Content-Type: application/json
```

## Nodos y prefijos

| Nodo | Base URL | Prefijo CRUD |
|---|---|---|
| Comondu | `http://localhost:3001` | `/api/comondu` |
| La Paz | `http://localhost:3002` | `/api/lapaz` |
| Loreto | `http://localhost:3003` | `/api/loreto` |
| Mulege | `http://localhost:3004` | `/api/mulege` |

## Endpoints globales

Estos endpoints existen en cada nodo, cambiando solo el host/puerto.

### GET /

URL completa:

```http
GET http://localhost:3001/
GET http://localhost:3002/
GET http://localhost:3003/
GET http://localhost:3004/
```

Descripcion:
Devuelve informacion general del nodo y endpoints principales.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "mensaje": "Comondu funcionando",
  "nodo": "http://localhost:3001",
  "endpoints": {
    "estado": "/status",
    "baseDatos": "/status/db",
    "productos": "/api/comondu/productos",
    "categorias": "/api/comondu/categorias",
    "estado_sync": "/api/sync/estado",
    "publicar_eventos_kafka": "/api/sync/push"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### GET /status

URL completa:

```http
GET http://localhost:3001/status
GET http://localhost:3002/status
GET http://localhost:3003/status
GET http://localhost:3004/status
```

Descripcion:
Verifica que el nodo este activo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "banco": "Comondu",
  "nodo": "http://localhost:3001",
  "puerto": "3001",
  "timestamp": "2026-05-21T18:00:00.000Z",
  "estado": "activo"
}
```

Codigos posibles: `200`, `404`, `500`.

### GET /status/db

URL completa:

```http
GET http://localhost:3001/status/db
GET http://localhost:3002/status/db
GET http://localhost:3003/status/db
GET http://localhost:3004/status/db
```

Descripcion:
Verifica conexion a la base de datos del nodo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "estado": "activo",
  "database": "Comondu",
  "banco": "Comondu"
}
```

Codigos posibles: `200`, `503`, `404`, `500`.

## Endpoints compartidos `/api`

Estos endpoints existen en todos los nodos bajo `/api`.

### GET /api/nodos/estado

URL completa:

```http
GET http://localhost:3001/api/nodos/estado
GET http://localhost:3002/api/nodos/estado
GET http://localhost:3003/api/nodos/estado
GET http://localhost:3004/api/nodos/estado
```

Descripcion:
Consulta el estado de los nodos configurados en red.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "timestamp": "2026-05-21T18:00:00.000Z",
  "nodos": [
    {
      "nombre": "lapaz",
      "url": "http://localhost:3002",
      "estado": "activo"
    }
  ]
}
```

Codigos posibles: `200`, `500`.

### GET /api/sync/estado

URL completa:

```http
GET http://localhost:3001/api/sync/estado
GET http://localhost:3002/api/sync/estado
GET http://localhost:3003/api/sync/estado
GET http://localhost:3004/api/sync/estado
```

Descripcion:
Devuelve configuracion y disponibilidad de sincronizacion.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "banco": "Comondu",
  "sync_driver": "kafka",
  "kafka": {
    "disponible": true,
    "brokers": "localhost:9092"
  },
  "rabbitmq": {
    "habilitado": true,
    "url": "amqp://localhost:5672"
  }
}
```

Codigos posibles: `200`, `500`.

### GET /api/productos

URL completa:

```http
GET http://localhost:3001/api/productos
GET http://localhost:3002/api/productos
GET http://localhost:3003/api/productos
GET http://localhost:3004/api/productos
```

Descripcion:
Lista productos locales usando SQL directo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "banco": "Comondu",
  "productos": [
    {
      "id": 1,
      "nombre": "Arroz",
      "categoria_id": 1,
      "cantidad": 100,
      "unit": "pz"
    }
  ]
}
```

Codigos posibles: `200`, `500`.

### GET /api/categorias

URL completa:

```http
GET http://localhost:3001/api/categorias
GET http://localhost:3002/api/categorias
GET http://localhost:3003/api/categorias
GET http://localhost:3004/api/categorias
```

Descripcion:
Lista categorias locales usando SQL directo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "banco": "Comondu",
  "categorias": [
    {
      "id": 1,
      "nombre": "Granos"
    }
  ]
}
```

Codigos posibles: `200`, `500`.

### GET /api/tabla/:nombre

URL completa:

```http
GET http://localhost:3001/api/tabla/productos
GET http://localhost:3002/api/tabla/beneficiarios
GET http://localhost:3003/api/tabla/entregas
GET http://localhost:3004/api/tabla/donaciones
```

Descripcion:
Consulta una tabla local permitida.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "nombre": "productos"
}
```

Valores permitidos para `nombre`:

```text
productos, categorias, movimientos, donaciones, entregas, transferencias, donantes, beneficiarios, familias, sync_events, sync_events_recibidos
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "banco": "Comondu",
  "tabla": "productos",
  "datos": [
    {
      "id": 1,
      "nombre": "Arroz",
      "categoria_id": 1,
      "cantidad": 100,
      "unit": "pz"
    }
  ]
}
```

Codigos posibles: `200`, `400`, `404`, `500`.

### POST /api/agregar_productos

URL completa:

```http
POST http://localhost:3001/api/agregar_productos
POST http://localhost:3002/api/agregar_productos
POST http://localhost:3003/api/agregar_productos
POST http://localhost:3004/api/agregar_productos
```

Descripcion:
Crea un producto o suma cantidad si ya existe por nombre normalizado.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Frijol",
  "categoria_id": 1,
  "cantidad": 10,
  "unit": "kg"
}
```

Response al crear:

```json
{
  "mensaje": "Producto creado",
  "banco": "Comondu",
  "producto": {
    "id": 2,
    "nombre": "Frijol",
    "categoria_id": 1,
    "unit": "kg",
    "cantidad": 10
  }
}
```

Response si ya existe:

```json
{
  "mensaje": "Cantidad actualizada",
  "banco": "Comondu",
  "producto": {
    "id": 2,
    "nombre": "Frijol",
    "categoria_id": 1,
    "unit": "kg",
    "cantidad_anterior": 10,
    "cantidad_sumada": 5,
    "cantidad_actual": 15
  }
}
```

Codigos posibles: `200`, `201`, `400`, `500`.

### POST /api/recibir_productos

URL completa:

```http
POST http://localhost:3001/api/recibir_productos
POST http://localhost:3002/api/recibir_productos
POST http://localhost:3003/api/recibir_productos
POST http://localhost:3004/api/recibir_productos
```

Descripcion:
Recibe productos en el nodo destino; crea o suma inventario.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Aceite",
  "categoria_id": 1,
  "cantidad": 6,
  "unit": "L"
}
```

Response:

```json
{
  "mensaje": "Producto creado",
  "producto": "Aceite",
  "unit": "L",
  "cantidad": 6,
  "transaccion": {
    "estado": "commit",
    "operacion": "crear_en_destino"
  }
}
```

Codigos posibles: `200`, `400`, `500`.

### GET /api/red/productos

URL completa:

```http
GET http://localhost:3001/api/red/productos
GET http://localhost:3002/api/red/productos
GET http://localhost:3003/api/red/productos
GET http://localhost:3004/api/red/productos
```

Descripcion:
Consulta productos en todos los nodos configurados.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "timestamp": "2026-05-21T18:00:00.000Z",
  "red": [
    {
      "banco": "LaPaz",
      "productos": []
    }
  ]
}
```

Codigos posibles: `200`, `500`.

### GET /api/red/tabla/:nombre

URL completa:

```http
GET http://localhost:3001/api/red/tabla/productos
GET http://localhost:3002/api/red/tabla/categorias
GET http://localhost:3003/api/red/tabla/beneficiarios
GET http://localhost:3004/api/red/tabla/entregas
```

Descripcion:
Consulta una tabla en todos los nodos configurados.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "nombre": "productos"
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "timestamp": "2026-05-21T18:00:00.000Z",
  "tabla": "productos",
  "red": [
    {
      "banco": "Comondu",
      "tabla": "productos",
      "datos": []
    }
  ]
}
```

Codigos posibles: `200`, `400`, `404`, `500`.

### POST /api/red/productos/enviar

URL completa:

```http
POST http://localhost:3001/api/red/productos/enviar
POST http://localhost:3002/api/red/productos/enviar
POST http://localhost:3003/api/red/productos/enviar
POST http://localhost:3004/api/red/productos/enviar
```

Descripcion:
Registra una transferencia de producto hacia otro nodo, descuenta inventario local y crea evento Kafka/outbox.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "destino": "lapaz",
  "producto_id": 1,
  "cantidad": 2
}
```

Valores esperados para `destino`:

```text
comondu, lapaz, loreto, mulege
```

Response:

```json
{
  "mensaje": "Transferencia registrada y publicada en Kafka",
  "modo": "kafka",
  "origen": "Comondu",
  "destino": "lapaz",
  "transferencia_id": "trf_00000000-0000-0000-0000-000000000000",
  "evento_id": "evt_00000000-0000-0000-0000-000000000000",
  "producto": "Arroz",
  "unit": "pz",
  "cantidad_transferida": 2,
  "transaccion": {
    "estado": "commit",
    "origen": "100 -> 98",
    "destino": "pendiente_por_evento_kafka"
  },
  "eventosKafka": [],
  "advertencia": "La transferencia quedo en outbox pendiente de publicar: Connection error"
}
```

Codigos posibles: `202`, `400`, `404`, `500`.

### POST /api/sync/push

URL completa:

```http
POST http://localhost:3001/api/sync/push
POST http://localhost:3002/api/sync/push
POST http://localhost:3003/api/sync/push
POST http://localhost:3004/api/sync/push
```

Descripcion:
Publica eventos pendientes de sincronizacion.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params:

```text
limit=10
```

Body RAW:

```json
{
  "limit": 10
}
```

Response:

```json
{
  "banco": "Comondu",
  "modo": "kafka",
  "eventos_procesados": 1,
  "resultados": [
    {
      "evento_id": "evt_00000000-0000-0000-0000-000000000000",
      "topic": "transfer.requested",
      "estado": "enviado"
    }
  ]
}
```

Codigos posibles: `200`, `500`.

## CRUD por nodo

Los siguientes endpoints estan montados bajo el prefijo del nodo activo:

```text
Comondu: http://localhost:3001/api/comondu
La Paz:  http://localhost:3002/api/lapaz
Loreto:  http://localhost:3003/api/loreto
Mulege:  http://localhost:3004/api/mulege
```

No hay endpoints `PATCH` detectados.

## Categorias

Disponibilidad:

```http
http://localhost:3001/api/comondu/categorias
http://localhost:3002/api/lapaz/categorias
http://localhost:3003/api/loreto/categorias
http://localhost:3004/api/mulege/categorias
```

### GET /api/{nodo}/categorias

Descripcion:
Lista categorias del nodo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "nombre": "Granos",
    "productos": []
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/{nodo}/categorias/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/categorias/1
GET http://localhost:3002/api/lapaz/categorias/1
GET http://localhost:3003/api/loreto/categorias/1
GET http://localhost:3004/api/mulege/categorias/1
```

Descripcion:
Obtiene una categoria por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "nombre": "Granos",
  "productos": []
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/{nodo}/categorias

URL completa:

```http
POST http://localhost:3001/api/comondu/categorias
POST http://localhost:3002/api/lapaz/categorias
POST http://localhost:3003/api/loreto/categorias
POST http://localhost:3004/api/mulege/categorias
```

Descripcion:
Crea una categoria.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Granos"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Granos"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/{nodo}/categorias/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/categorias/1
PUT http://localhost:3002/api/lapaz/categorias/1
PUT http://localhost:3003/api/loreto/categorias/1
PUT http://localhost:3004/api/mulege/categorias/1
```

Descripcion:
Actualiza una categoria.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Enlatados"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Enlatados"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/{nodo}/categorias/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/categorias/1
DELETE http://localhost:3002/api/lapaz/categorias/1
DELETE http://localhost:3003/api/loreto/categorias/1
DELETE http://localhost:3004/api/mulege/categorias/1
```

Descripcion:
Elimina una categoria.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Categoria eliminada"
}
```

Codigos posibles: `200`, `500`.

## Productos

Disponibilidad:

```http
http://localhost:3001/api/comondu/productos
http://localhost:3002/api/lapaz/productos
http://localhost:3003/api/loreto/productos
http://localhost:3004/api/mulege/productos
```

Unidades permitidas:

```text
kg, g, L, ml, pz, caja, paquete
```

### GET /api/{nodo}/productos

Descripcion:
Lista productos del nodo con relaciones disponibles.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "nombre": "Arroz",
    "categoria_id": 1,
    "cantidad": 100,
    "unit": "pz",
    "categoria": {
      "id": 1,
      "nombre": "Granos"
    }
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/{nodo}/productos/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/productos/1
GET http://localhost:3002/api/lapaz/productos/1
GET http://localhost:3003/api/loreto/productos/1
GET http://localhost:3004/api/mulege/productos/1
```

Descripcion:
Obtiene un producto por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "nombre": "Arroz",
  "categoria_id": 1,
  "cantidad": 100,
  "unit": "pz",
  "categoria": {
    "id": 1,
    "nombre": "Granos"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/{nodo}/productos

URL completa:

```http
POST http://localhost:3001/api/comondu/productos
POST http://localhost:3002/api/lapaz/productos
POST http://localhost:3003/api/loreto/productos
POST http://localhost:3004/api/mulege/productos
```

Descripcion:
Crea un producto. Si `unit` se omite, usa `pz`.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Leche",
  "categoria_id": 1,
  "cantidad": 25,
  "unit": "L"
}
```

Response:

```json
{
  "id": 2,
  "nombre": "Leche",
  "categoria_id": 1,
  "cantidad": 25,
  "unit": "L"
}
```

Codigos posibles: `201`, `400`, `500`.

### PUT /api/{nodo}/productos/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/productos/1
PUT http://localhost:3002/api/lapaz/productos/1
PUT http://localhost:3003/api/loreto/productos/1
PUT http://localhost:3004/api/mulege/productos/1
```

Descripcion:
Actualiza un producto.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Leche entera",
  "categoria_id": 1,
  "cantidad": 30,
  "unit": "L"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Leche entera",
  "categoria_id": 1,
  "cantidad": 30,
  "unit": "L"
}
```

Codigos posibles: `200`, `400`, `500`.

### DELETE /api/{nodo}/productos/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/productos/1
DELETE http://localhost:3002/api/lapaz/productos/1
DELETE http://localhost:3003/api/loreto/productos/1
DELETE http://localhost:3004/api/mulege/productos/1
```

Descripcion:
Elimina un producto.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Producto eliminado"
}
```

Codigos posibles: `200`, `500`.

## Beneficiarios

Disponibilidad:

```http
http://localhost:3001/api/comondu/beneficiarios
http://localhost:3002/api/lapaz/beneficiarios
http://localhost:3003/api/loreto/beneficiarios
http://localhost:3004/api/mulege/beneficiarios
```

### GET /api/{nodo}/beneficiarios

Descripcion:
Lista beneficiarios del nodo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "nombre": "Maria Lopez",
    "entregas": []
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/{nodo}/beneficiarios/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/beneficiarios/1
GET http://localhost:3002/api/lapaz/beneficiarios/1
GET http://localhost:3003/api/loreto/beneficiarios/1
GET http://localhost:3004/api/mulege/beneficiarios/1
```

Descripcion:
Obtiene un beneficiario por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "nombre": "Maria Lopez",
  "entregas": []
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/{nodo}/beneficiarios

URL completa:

```http
POST http://localhost:3001/api/comondu/beneficiarios
POST http://localhost:3002/api/lapaz/beneficiarios
POST http://localhost:3003/api/loreto/beneficiarios
POST http://localhost:3004/api/mulege/beneficiarios
```

Descripcion:
Crea un beneficiario.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Maria Lopez"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Maria Lopez"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/{nodo}/beneficiarios/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/beneficiarios/1
PUT http://localhost:3002/api/lapaz/beneficiarios/1
PUT http://localhost:3003/api/loreto/beneficiarios/1
PUT http://localhost:3004/api/mulege/beneficiarios/1
```

Descripcion:
Actualiza un beneficiario.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Maria Lopez Garcia"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Maria Lopez Garcia"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/{nodo}/beneficiarios/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/beneficiarios/1
DELETE http://localhost:3002/api/lapaz/beneficiarios/1
DELETE http://localhost:3003/api/loreto/beneficiarios/1
DELETE http://localhost:3004/api/mulege/beneficiarios/1
```

Descripcion:
Elimina un beneficiario.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Beneficiario eliminado"
}
```

Codigos posibles: `200`, `500`.

## Familias

Disponibilidad:

```http
http://localhost:3001/api/comondu/familias
http://localhost:3002/api/lapaz/familias
http://localhost:3003/api/loreto/familias
http://localhost:3004/api/mulege/familias
```

### GET /api/{nodo}/familias

Descripcion:
Lista familias registradas del nodo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "nombre": "Familia Lopez",
    "telefono": "5551234567",
    "cantidad_miembros": 4,
    "direccion": "Col. Centro"
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/{nodo}/familias/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/familias/1
GET http://localhost:3002/api/lapaz/familias/1
GET http://localhost:3003/api/loreto/familias/1
GET http://localhost:3004/api/mulege/familias/1
```

Descripcion:
Obtiene una familia por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "nombre": "Familia Lopez",
  "telefono": "5551234567",
  "cantidad_miembros": 4,
  "direccion": "Col. Centro"
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/{nodo}/familias

URL completa:

```http
POST http://localhost:3001/api/comondu/familias
POST http://localhost:3002/api/lapaz/familias
POST http://localhost:3003/api/loreto/familias
POST http://localhost:3004/api/mulege/familias
```

Descripcion:
Registra una familia nueva.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Familia Lopez",
  "telefono": "5551234567",
  "cantidad_miembros": 4,
  "direccion": "Col. Centro"
}
```

Tambien acepta `cantidadMiembros`, `miembros` y `ubicacion` como aliases de entrada.

Response:

```json
{
  "id": 1,
  "nombre": "Familia Lopez",
  "telefono": "5551234567",
  "cantidad_miembros": 4,
  "direccion": "Col. Centro"
}
```

Codigos posibles: `201`, `400`, `500`.

### PUT /api/{nodo}/familias/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/familias/1
PUT http://localhost:3002/api/lapaz/familias/1
PUT http://localhost:3003/api/loreto/familias/1
PUT http://localhost:3004/api/mulege/familias/1
```

Descripcion:
Actualiza una familia.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Familia Lopez Garcia",
  "telefono": "5557654321",
  "cantidad_miembros": 5,
  "direccion": "Col. Norte"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Familia Lopez Garcia",
  "telefono": "5557654321",
  "cantidad_miembros": 5,
  "direccion": "Col. Norte"
}
```

Codigos posibles: `200`, `400`, `500`.

### DELETE /api/{nodo}/familias/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/familias/1
DELETE http://localhost:3002/api/lapaz/familias/1
DELETE http://localhost:3003/api/loreto/familias/1
DELETE http://localhost:3004/api/mulege/familias/1
```

Descripcion:
Elimina una familia.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Familia eliminada"
}
```

Codigos posibles: `200`, `500`.

## Entregas

Disponibilidad:

```http
http://localhost:3001/api/comondu/entregas
http://localhost:3002/api/lapaz/entregas
http://localhost:3003/api/loreto/entregas
http://localhost:3004/api/mulege/entregas
```

### GET /api/{nodo}/entregas

Descripcion:
Lista entregas del nodo.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "beneficiario_id": 1,
    "producto_id": 1,
    "cantidad": 2,
    "fecha": "2026-05-21T18:00:00.000Z",
    "beneficiario": {
      "id": 1,
      "nombre": "Maria Lopez"
    },
    "producto": {
      "id": 1,
      "nombre": "Arroz"
    }
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/{nodo}/entregas/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/entregas/1
GET http://localhost:3002/api/lapaz/entregas/1
GET http://localhost:3003/api/loreto/entregas/1
GET http://localhost:3004/api/mulege/entregas/1
```

Descripcion:
Obtiene una entrega por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "beneficiario_id": 1,
  "producto_id": 1,
  "cantidad": 2,
  "fecha": "2026-05-21T18:00:00.000Z",
  "beneficiario": {
    "id": 1,
    "nombre": "Maria Lopez"
  },
  "producto": {
    "id": 1,
    "nombre": "Arroz"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/{nodo}/entregas

URL completa:

```http
POST http://localhost:3001/api/comondu/entregas
POST http://localhost:3002/api/lapaz/entregas
POST http://localhost:3003/api/loreto/entregas
POST http://localhost:3004/api/mulege/entregas
```

Descripcion:
Crea una entrega de producto a beneficiario.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "beneficiario_id": 1,
  "producto_id": 1,
  "cantidad": 2
}
```

Response:

```json
{
  "id": 1,
  "beneficiario_id": 1,
  "producto_id": 1,
  "cantidad": 2,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/{nodo}/entregas/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/entregas/1
PUT http://localhost:3002/api/lapaz/entregas/1
PUT http://localhost:3003/api/loreto/entregas/1
PUT http://localhost:3004/api/mulege/entregas/1
```

Descripcion:
Actualiza una entrega.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "beneficiario_id": 1,
  "producto_id": 1,
  "cantidad": 3
}
```

Response:

```json
{
  "id": 1,
  "beneficiario_id": 1,
  "producto_id": 1,
  "cantidad": 3,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/{nodo}/entregas/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/entregas/1
DELETE http://localhost:3002/api/lapaz/entregas/1
DELETE http://localhost:3003/api/loreto/entregas/1
DELETE http://localhost:3004/api/mulege/entregas/1
```

Descripcion:
Elimina una entrega.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Entrega eliminada"
}
```

Codigos posibles: `200`, `500`.

## Comondu exclusivo: Donantes

Disponibilidad:

```http
http://localhost:3001/api/comondu/donantes
```

### GET /api/comondu/donantes

Descripcion:
Lista donantes.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "nombre": "Empresa Local",
    "telefono": "5551234567"
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/comondu/donantes/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/donantes/1
```

Descripcion:
Obtiene un donante por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "nombre": "Empresa Local",
  "telefono": "5551234567"
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/comondu/donantes

URL completa:

```http
POST http://localhost:3001/api/comondu/donantes
```

Descripcion:
Crea un donante.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Empresa Local",
  "telefono": "5551234567"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Empresa Local",
  "telefono": "5551234567"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/comondu/donantes/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/donantes/1
```

Descripcion:
Actualiza un donante.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "nombre": "Empresa Local Actualizada",
  "telefono": "5557654321"
}
```

Response:

```json
{
  "id": 1,
  "nombre": "Empresa Local Actualizada",
  "telefono": "5557654321"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/comondu/donantes/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/donantes/1
```

Descripcion:
Elimina un donante.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Donante eliminado"
}
```

Codigos posibles: `200`, `500`.

## Comondu exclusivo: Movimientos

Disponibilidad:

```http
http://localhost:3001/api/comondu/movimientos
```

### GET /api/comondu/movimientos

Descripcion:
Lista movimientos de inventario.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "producto_id": 1,
    "tipo": "entrada",
    "cantidad": 10,
    "fecha": "2026-05-21T18:00:00.000Z",
    "producto": {
      "id": 1,
      "nombre": "Arroz"
    }
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/comondu/movimientos/:id

URL completa:

```http
GET http://localhost:3001/api/comondu/movimientos/1
```

Descripcion:
Obtiene un movimiento por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "tipo": "entrada",
  "cantidad": 10,
  "fecha": "2026-05-21T18:00:00.000Z",
  "producto": {
    "id": 1,
    "nombre": "Arroz"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/comondu/movimientos

URL completa:

```http
POST http://localhost:3001/api/comondu/movimientos
```

Descripcion:
Crea un movimiento.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "producto_id": 1,
  "tipo": "entrada",
  "cantidad": 10
}
```

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "tipo": "entrada",
  "cantidad": 10,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/comondu/movimientos/:id

URL completa:

```http
PUT http://localhost:3001/api/comondu/movimientos/1
```

Descripcion:
Actualiza un movimiento.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "producto_id": 1,
  "tipo": "salida",
  "cantidad": 5
}
```

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "tipo": "salida",
  "cantidad": 5,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/comondu/movimientos/:id

URL completa:

```http
DELETE http://localhost:3001/api/comondu/movimientos/1
```

Descripcion:
Elimina un movimiento.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Movimiento eliminado"
}
```

Codigos posibles: `200`, `500`.

## Mulege exclusivo: Donaciones

Disponibilidad:

```http
http://localhost:3004/api/mulege/donaciones
```

### GET /api/mulege/donaciones

Descripcion:
Lista donaciones.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "donante": "Juan Perez",
    "producto_id": 1,
    "cantidad": 20,
    "fecha": "2026-05-21T18:00:00.000Z",
    "producto": {
      "id": 1,
      "nombre": "Tomate"
    }
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/mulege/donaciones/:id

URL completa:

```http
GET http://localhost:3004/api/mulege/donaciones/1
```

Descripcion:
Obtiene una donacion por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "donante": "Juan Perez",
  "producto_id": 1,
  "cantidad": 20,
  "fecha": "2026-05-21T18:00:00.000Z",
  "producto": {
    "id": 1,
    "nombre": "Tomate"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/mulege/donaciones

URL completa:

```http
POST http://localhost:3004/api/mulege/donaciones
```

Descripcion:
Crea una donacion.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "donante": "Juan Perez",
  "producto_id": 1,
  "cantidad": 20
}
```

Response:

```json
{
  "id": 1,
  "donante": "Juan Perez",
  "producto_id": 1,
  "cantidad": 20,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/mulege/donaciones/:id

URL completa:

```http
PUT http://localhost:3004/api/mulege/donaciones/1
```

Descripcion:
Actualiza una donacion.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "donante": "Juan Perez",
  "producto_id": 1,
  "cantidad": 25
}
```

Response:

```json
{
  "id": 1,
  "donante": "Juan Perez",
  "producto_id": 1,
  "cantidad": 25,
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/mulege/donaciones/:id

URL completa:

```http
DELETE http://localhost:3004/api/mulege/donaciones/1
```

Descripcion:
Elimina una donacion.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Donacion eliminada"
}
```

Codigos posibles: `200`, `500`.

## Loreto exclusivo: Transferencias CRUD

Disponibilidad:

```http
http://localhost:3003/api/loreto/transferencias
```

Este CRUD es distinto de `/api/red/productos/enviar`. Maneja la tabla `transferencias` del controlador de Loreto.

### GET /api/loreto/transferencias

Descripcion:
Lista transferencias de Loreto.

Headers:

```http
No requiere headers.
```

Params: ninguno.

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
[
  {
    "id": 1,
    "producto_id": 1,
    "cantidad": 5,
    "destino": "lapaz",
    "fecha": "2026-05-21T18:00:00.000Z",
    "producto": {
      "id": 1,
      "nombre": "Coca cola"
    }
  }
]
```

Codigos posibles: `200`, `500`.

### GET /api/loreto/transferencias/:id

URL completa:

```http
GET http://localhost:3003/api/loreto/transferencias/1
```

Descripcion:
Obtiene una transferencia por `id`.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "cantidad": 5,
  "destino": "lapaz",
  "fecha": "2026-05-21T18:00:00.000Z",
  "producto": {
    "id": 1,
    "nombre": "Coca cola"
  }
}
```

Codigos posibles: `200`, `404`, `500`.

### POST /api/loreto/transferencias

URL completa:

```http
POST http://localhost:3003/api/loreto/transferencias
```

Descripcion:
Crea una transferencia en Loreto.

Headers:

```http
Content-Type: application/json
```

Params: ninguno.

Query params: ninguno.

Body RAW:

```json
{
  "producto_id": 1,
  "cantidad": 5,
  "destino": "lapaz"
}
```

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "cantidad": 5,
  "destino": "lapaz",
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `201`, `500`.

### PUT /api/loreto/transferencias/:id

URL completa:

```http
PUT http://localhost:3003/api/loreto/transferencias/1
```

Descripcion:
Actualiza una transferencia de Loreto.

Headers:

```http
Content-Type: application/json
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW:

```json
{
  "producto_id": 1,
  "cantidad": 8,
  "destino": "mulege"
}
```

Response:

```json
{
  "id": 1,
  "producto_id": 1,
  "cantidad": 8,
  "destino": "mulege",
  "fecha": "2026-05-21T18:00:00.000Z"
}
```

Codigos posibles: `200`, `500`.

### DELETE /api/loreto/transferencias/:id

URL completa:

```http
DELETE http://localhost:3003/api/loreto/transferencias/1
```

Descripcion:
Elimina una transferencia de Loreto.

Headers:

```http
No requiere headers.
```

Params:

```json
{
  "id": 1
}
```

Query params: ninguno.

Body RAW: no aplica.

Response:

```json
{
  "message": "Transferencia eliminada"
}
```

Codigos posibles: `200`, `500`.
