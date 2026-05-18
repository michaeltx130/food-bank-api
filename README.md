# FoodBank API Distribuida

API distribuida para bancos de alimentos. Cada banco corre como un nodo independiente de Express, con su propia base de datos MySQL/MariaDB y sincronizacion por Kafka. RabbitMQ se usa para notificaciones.

## Nodos

| Banco | Env | Puerto | URL local |
| --- | --- | ---: | --- |
| Comondu | `nodes/comondu.env` | 3001 | `http://localhost:3001` |
| La Paz | `nodes/lapaz.env` | 3002 | `http://localhost:3002` |
| Loreto | `nodes/loreto.env` | 3003 | `http://localhost:3003` |
| Mulege | `nodes/mulege.env` | 3004 | `http://localhost:3004` |

## Requisitos

- Node.js y npm
- Docker Desktop
- MySQL o MariaDB
- Hamachi, solo si los nodos van a correr en computadoras distintas

## Instalacion

```powershell
npm install
npm run prisma:generate:all
```

Si todavia no existen las bases de datos, crealas e importa los SQL de `sqlBDs`:

```sql
CREATE DATABASE Comondu;
CREATE DATABASE LaPaz;
CREATE DATABASE Loreto;
CREATE DATABASE Mulege;
```

Archivos SQL:

- `sqlBDs/comondu/Comondu.sql`
- `sqlBDs/lapaz/LaPaz.sql`
- `sqlBDs/loreto/Loreto.sql`
- `sqlBDs/mulege/Mulege.sql`

## Arranque local, todo en una computadora

1. Levanta Kafka, Zookeeper y RabbitMQ:

```powershell
docker compose up -d
```

2. Revisa que los `.env` apunten a servicios locales:

```env
DB_HOST=localhost
MI_NODO=http://localhost:3001
KAFKA_BROKERS=localhost:9092
RABBITMQ_URL=amqp://localhost:5672
```

3. Inicia los cuatro nodos:

```powershell
.\start-all.ps1
```

Tambien puedes usar npm (este es mejor):

```powershell
npm run dev
```

4. Prueba el estado:

```powershell
Invoke-WebRequest http://localhost:3001/status
Invoke-WebRequest http://localhost:3001/api/nodos/estado
```

## Arranque distribuido con Hamachi

Usa este modo cuando cada banco corre en una computadora diferente.

### 1. Definir IPs Hamachi

Ejemplo:

| Banco/servicio | IP Hamachi | Puerto |
| --- | --- | ---: |
| Comondu | `25.10.10.1` | 3001 |
| La Paz | `25.10.10.2` | 3002 |
| Loreto | `25.10.10.3` | 3003 |
| Mulege | `25.10.10.4` | 3004 |
| Kafka/RabbitMQ | `25.10.10.1` | 9092 / 5672 |

La computadora que tenga Kafka/RabbitMQ puede ser cualquiera. En los ejemplos se usa Comondu.

### 2. Cambiar los `.env`

En cada archivo de `nodes/*.env`, cambia las URLs de nodos de `localhost` a la IP Hamachi correspondiente.

Ejemplo para `nodes/comondu.env`:

```env
PORT=3001
BANCO_NAME=Comondu
BANCO_ID=comondu

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=Comondu

MI_NODO=http://25.10.10.1:3001

NODO_LAPAZ=http://25.10.10.2:3002
NODO_LORETO=http://25.10.10.3:3003
NODO_MULEGE=http://25.10.10.4:3004

SYNC_DRIVER=kafka
KAFKA_BROKERS=25.10.10.1:9092

RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://25.10.10.1:5672
RABBITMQ_NOTIFICATIONS_QUEUE=notifications

NODO_PREFIX=comondu
DATABASE_URL="mysql://root:tu_password@localhost:3306/Comondu"
```

Regla practica:

- `MI_NODO`: IP Hamachi de la computadora donde corre ese nodo.
- `NODO_COMONDU`, `NODO_LAPAZ`, `NODO_LORETO`, `NODO_MULEGE`: IP Hamachi de cada computadora remota.
- `DB_HOST`: dejalo como `localhost` si la base de datos esta en la misma computadora que el nodo.
- `KAFKA_BROKERS`: IP Hamachi de la computadora que corre Kafka.
- `RABBITMQ_URL`: IP Hamachi de la computadora que corre RabbitMQ.
- `DATABASE_URL`: normalmente conserva `localhost` si Prisma se conecta a la base local.

### 3. Preparar Kafka para aceptar conexiones remotas

En `docker-compose.yml`, si Kafka se va a consumir desde otras computadoras por Hamachi, cambia:

```yaml
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
```

por:

```yaml
KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://25.10.10.1:9092,PLAINTEXT_INTERNAL://kafka:29092
```

Usa la IP Hamachi real de la computadora donde corre Kafka.

Despues reinicia los contenedores:

```powershell
docker compose down
docker compose up -d
```

### 4. Abrir puertos en firewall

Permite conexiones entrantes por Hamachi para:

- API: `3001`, `3002`, `3003`, `3004`
- Kafka: `9092`
- RabbitMQ: `5672`
- RabbitMQ panel web: `15672`, opcional
- MySQL/MariaDB: `3306`, solo si alguna API se conectara a una base remota

### 5. Iniciar cada nodo

En cada computadora inicia solo el nodo que le corresponde:

```powershell
npm run start:comondu
npm run start:lapaz
npm run start:loreto
npm run start:mulege
```

Si una sola computadora corre todos los nodos, usa:

```powershell
npm run dev
```

## Endpoints utiles

Estado del nodo:

```http
GET /status
GET /status/db
```

Estado de la red:

```http
GET /api/nodos/estado
```

Inventario local:

```http
GET /api/productos
GET /api/categorias
GET /api/tabla/productos
```

Sincronizacion:

```http
GET /api/sync/estado
POST /api/sync/push
```

Enviar productos a otro banco:

```http
POST /api/red/productos/enviar
Content-Type: application/json

{
  "destino": "lapaz",
  "producto_id": 1,
  "cantidad": 5
}
```

## Checklist rapido si algo no conecta

- `GET /status` funciona en el nodo local.
- Desde otra computadora funciona `http://IP_HAMACHI:PUERTO/status`.
- Los `.env` no tienen `localhost` en `MI_NODO` ni en `NODO_*` cuando estas usando Hamachi.
- `KAFKA_BROKERS` apunta a la IP Hamachi del host de Kafka.
- `KAFKA_ADVERTISED_LISTENERS` tambien usa esa IP Hamachi.
- El firewall permite los puertos necesarios.
- La base de datos existe y `DB_NAME` coincide exactamente con `Comondu`, `LaPaz`, `Loreto` o `Mulege`.

