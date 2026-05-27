# Reinicio limpio de nodos con Docker

Usen esto cuando Docker Desktop quede con contenedores viejos, volumenes de Kafka/Zookeeper anteriores, o cuando se haya borrado un `docker-compose.*.yml` y despues el nodo ya no levante bien.

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
http://100.72.90.81:3004/status
```

### Michi / Comondu

```powershell
docker compose -f docker-compose.comondu.yml up -d
npm run start:comondu
```

Status:

```text
http://100.104.46.91:3001/status
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
http://100.80.52.8:3002/status
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

## 6. Si el puerto de Node ya esta ocupado

Revisen que proceso esta usando el puerto:

```powershell
Get-NetTCPConnection -LocalPort 3001,3002,3003,3004 -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess
```

Si ya tenian otro `npm run start:*` abierto, cierren esa terminal o terminen ese proceso antes de volver a correr el nodo.
