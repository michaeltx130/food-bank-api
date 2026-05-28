# Arranque distribuido con Tailscale

Cada maquina corre:

- 1 Zookeeper
- 1 broker Kafka
- 1 RabbitMQ local para notificaciones
- 1 proceso Node.js del banco que le corresponde

## Mapa de nodos

| Persona | Banco | IP Tailscale | API | Compose | App |
| --- | --- | --- | ---: | --- | --- |
| Danna | Mulege | `100.83.23.115` | 3004 | `docker-compose.mulege.yml` | `npm run start:mulege` |
| Michi | Comondu | `100.82.181.5` | 3001 | `docker-compose.comondu.yml` | `npm run start:comondu` |
| Ale | Loreto | `100.101.236.118` | 3003 | `docker-compose.loreto.yml` | `npm run start:loreto` |
| Javi | La Paz | `100.114.40.70` | 3002 | `docker-compose.lapaz.yml` | `npm run start:lapaz` |

## En cada maquina

1. Confirmar que Tailscale este conectado.

```powershell
tailscale ip -4
```

2. Levantar la infraestructura de su nodo.

```powershell
docker compose -f docker-compose.NODO.yml up -d
```

Ejemplos:

```powershell
docker compose -f docker-compose.mulege.yml up -d
docker compose -f docker-compose.comondu.yml up -d
docker compose -f docker-compose.loreto.yml up -d
docker compose -f docker-compose.lapaz.yml up -d
```

3. Iniciar solo la app de su banco.

```powershell
npm run start:NODO
```

Ejemplos:

```powershell
npm run start:mulege
npm run start:comondu
npm run start:loreto
npm run start:lapaz
```

## Puertos necesarios

Permitir entrada por la red de Tailscale:

- API: `3001`, `3002`, `3003`, `3004`
- Zookeeper: `2181`, `2888`, `3888`
- Kafka: `9092`
- RabbitMQ: `5672`
- Panel RabbitMQ: `15672`, opcional

## Pruebas rapidas

Desde cualquier maquina:

```powershell
Invoke-WebRequest http://100.82.181.5:3001/status
Invoke-WebRequest http://100.114.40.70:3002/status
Invoke-WebRequest http://100.101.236.118:3003/status
Invoke-WebRequest http://100.83.23.115:3004/status
```

Para revisar Kafka desde un contenedor:

```powershell
docker exec foodbank-kafka kafka-broker-api-versions --bootstrap-server 100.83.23.115:9092,100.82.181.5:9092,100.101.236.118:9092,100.114.40.70:9092
```

## Notas

- Los cuatro `.env` de `nodes/` ya apuntan a IPs Tailscale.
- `DB_HOST=localhost` se mantiene porque cada API usa su base local.
- `RABBITMQ_URL=amqp://localhost:5672` se mantiene porque RabbitMQ se usa localmente para notificaciones.
- El cluster de Zookeeper/Kafka necesita mayoria. Con 4 nodos, puede fallar 1 y seguir funcionando; si fallan 2, se pierde quorum.
