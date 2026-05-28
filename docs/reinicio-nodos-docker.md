# Reinicio limpio de nodos con Docker

Usen esto cuando Docker Desktop quede con contenedores viejos, volumenes de Kafka/Zookeeper anteriores, o cuando se haya borrado un `docker-compose.*.yml` y despues el nodo ya no levante bien.

## Arquitectura que estamos usando

Este proyecto esta configurado como cluster distribuido real:

- Cada compu levanta su propio `zookeeper`, `kafka` y `rabbitmq` en Docker.
- Cada API de Node.js corre en Windows con `npm run start:NODO`.
- Node.js se conecta a Kafka usando los 4 brokers de Tailscale definidos en `KAFKA_BROKERS`.
- Zookeeper y Kafka tambien se conectan entre nodos usando las IPs de Tailscale.

No es la opcion de "Kafka local aislado". Si cada quien deja solo `localhost:9092`, las APIs pueden prender, pero las transferencias por Kafka entre nodos no quedan como cluster distribuido.

Importante: para que Kafka/Zookeeper funcionen como cluster, tienen que estar arriba varios nodos a la vez. Con la configuracion actual, Zookeeper espera 4 servidores y normalmente necesita quorum, o sea al menos 3 nodos disponibles.

## 1. Revisar que hay vivo

```powershell
docker ps -a
docker images
docker volume ls
```

Si quieren ver solo lo del proyecto:

```powershell
docker ps -a --filter "name=foodbank"
docker volume ls --filter "name=foodbank"
docker images | findstr "confluentinc rabbitmq"
```

## 2. Apagar y limpiar lo viejo

Primero intenten bajarlo con el compose de su nodo:

```powershell
docker compose -f docker-compose.NODO.yml down -v --remove-orphans
```

Cambien `NODO` por `mulege`, `comondu`, `loreto` o `lapaz`.

Si eso falla porque Docker quedo raro o porque antes borraron el yml, borren por nombre:

```powershell
docker stop foodbank-kafka foodbank-zookeeper foodbank-rabbitmq
docker rm foodbank-kafka foodbank-zookeeper foodbank-rabbitmq
docker volume rm foodbank_kafka-data foodbank_zookeeper-data foodbank_zookeeper-log foodbank_rabbitmq-data
```

Si algun comando dice que no existe, no pasa nada. Solo significa que ese resto no estaba en esa compu.

## 3. Opcional: borrar imagenes para descargarlas limpias

Esto no siempre hace falta. Usenlo si Docker sigue fallando despues de borrar contenedores y volumenes:

```powershell
docker rmi confluentinc/cp-kafka:7.6.1 confluentinc/cp-zookeeper:7.6.1 rabbitmq:3-management
```

Luego Docker las vuelve a descargar con `docker compose up`.

## 4. Levantar cada nodo

### Danna / Mulege

```powershell
docker compose -f docker-compose.mulege.yml up -d
npm run start:mulege
```

Status:

```text
http://100.83.23.115:3004/status
```

### Michi / Comondu

```powershell
docker compose -f docker-compose.comondu.yml up -d
npm run start:comondu
```

Status:

```text
http://100.82.181.5:3001/status
```

### Ale / Loreto

```powershell
docker compose -f docker-compose.loreto.yml up -d
npm run start:loreto
```

Status:

```text
http://100.101.236.118:3003/status
```

### Javi / La Paz

```powershell
docker compose -f docker-compose.lapaz.yml up -d
npm run start:lapaz
```

Status:

```text
http://100.114.40.70:3002/status
```

## 5. Verificar que si quedo

En otra terminal:

```powershell
docker ps
```

Deben salir:

- `foodbank-zookeeper`
- `foodbank-kafka`
- `foodbank-rabbitmq`

Y luego prueben su status:

```powershell
Invoke-WebRequest -UseBasicParsing http://SU-IP:PUERTO/status
```

Ejemplo para Loreto:

```powershell
Invoke-WebRequest -UseBasicParsing http://100.101.236.118:3003/status
```

Si responde con `"estado":"activo"`, el nodo ya esta arriba.

## 6. Verificar red por Tailscale

Desde PowerShell, prueben si ven a los otros nodos:

```powershell
tailscale ping 100.83.23.115
tailscale ping 100.82.181.5
tailscale ping 100.101.236.118
tailscale ping 100.114.40.70
```

Y prueben los puertos importantes:

```powershell
Test-NetConnection 100.83.23.115 -Port 9092
Test-NetConnection 100.82.181.5 -Port 9092
Test-NetConnection 100.101.236.118 -Port 9092
Test-NetConnection 100.114.40.70 -Port 9092
```

Para Zookeeper, los puertos importantes son `2181`, `2888` y `3888`. Para la API de cada banco son `3001`, `3002`, `3003` y `3004`.

Si Tailscale responde pero los puertos no, revisen Firewall de Windows y que Docker Desktop este publicando los puertos.

## 7. Si el puerto de Node ya esta ocupado

Revisen que proceso esta usando el puerto:

```powershell
Get-NetTCPConnection -LocalPort 3001,3002,3003,3004 -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess
```

Si ya tenian otro `npm run start:*` abierto, cierren esa terminal o terminen ese proceso antes de volver a correr el nodo.
