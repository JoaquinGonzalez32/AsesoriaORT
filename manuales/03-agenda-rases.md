# Manual de Usuario: Agenda de RASES

## Descripcion general

Pagina para controlar las Reuniones de Asesoramiento Selectivo (RAS). Muestra todas las citas agendadas con interesados, quien las realiza y su modalidad. Las reuniones se visualizan como tarjetas individuales (cards).

---

## Contenido de la pagina

### Panel de KPIs

Fila superior con metricas y graficos:

| KPI              | Descripcion                                               |
|------------------|-----------------------------------------------------------|
| Citas Filtradas  | Cantidad de reuniones que coinciden con los filtros, junto al total |
| Top Agente       | Nombre del agente con mas reuniones y su cantidad          |
| Modalidad (torta)| Grafico circular: Presencial vs. En Linea                  |
| RAS por Agente   | Grafico de barras horizontales con cantidad por agente      |

### Grafico RAS por Carrera

Debajo de los KPIs (se muestra solo si hay datos). Barras verticales mostrando la distribucion de reuniones por carrera.

### Tarjetas de reuniones

Cada reunion se muestra como una tarjeta con:

- **Cabecera azul**: badge de modalidad (Presencial/En linea), fecha, titulo de la reunion.
- **Cuerpo**: nombre del interesado, agente que realiza la RAS, carrera (si aplica).
- **Pie**: boton "Eliminar".

Las tarjetas se organizan en una grilla responsiva (1 columna en movil, 2 en tablet, 3 en escritorio).

---

## Filtros disponibles

| Filtro              | Tipo          | Descripcion                                              |
|---------------------|---------------|----------------------------------------------------------|
| Nombre Interesado   | Texto libre   | Filtra por nombre del interesado                         |
| Titulo RAS          | Texto libre   | Filtra por titulo de la reunion                          |
| Quien hace RAS      | Selector      | Lista dinamica de agentes (generada desde los datos)     |
| Modalidad           | Selector      | Presencial / En linea                                    |
| Carrera             | Selector      | Lista dinamica de carreras disponibles en los datos      |
| Estado Oportunidad  | Selector      | Lista dinamica de estados disponibles en los datos       |
| Mes                 | Selector      | Enero a Diciembre                                        |
| Desde               | Fecha         | Fecha minima                                             |
| Hasta               | Fecha         | Fecha maxima                                             |
| Limpiar             | Boton         | Resetea todos los filtros (aparece solo cuando hay alguno activo) |

Todos los filtros se aplican de forma combinada (AND). Los selectores de agente, carrera y estado se generan dinamicamente a partir de los datos existentes.

---

## Acciones disponibles

### Eliminar una reunion

Boton **"Eliminar"** en cada tarjeta. Muestra un modal de confirmacion con el nombre del interesado. La eliminacion es permanente.

### Importar CSV

Boton **"Importar CSV"**. Permite cargar multiples reuniones desde un archivo CSV. Campos esperados:

| Campo               | Obligatorio | Descripcion                                    |
|---------------------|:-----------:|------------------------------------------------|
| `titulo`            | Si          | Titulo de la reunion                           |
| `nombre_interesado` | Si          | Nombre del interesado                          |
| `agente_nombre`     | No          | Agente que realiza la RAS (default: "Sin asignar") |
| `fecha_hora`        | No          | Fecha y hora en formato ISO (default: fecha actual) |
| `modalidad`         | No          | "Presencial" o "En linea" (default: Presencial)|
| `carrera`           | No          | Carrera asociada                               |
| `estado_oportunidad`| No          | Estado de la oportunidad (default: "Pendiente")|

### Exportar graficas como imagen

Boton **"Imagen"**. Descarga todas las graficas visibles (modalidad, agente, carrera) como archivo de imagen.

### Exportar datos como CSV

Boton **"CSV"**. Descarga los datos de las graficas en formato CSV.

---

## Como se crean las reuniones

Las RAS no se crean directamente desde esta pagina. Se generan a traves de dos flujos:

1. **Desde la pagina de Leads**: al convertir un lead a oportunidad y activar la opcion "Agendar Reunion (RAS)". Se asigna agente, fecha y modalidad en ese momento.

2. **Desde la importacion CSV**: carga masiva de reuniones usando el boton "Importar CSV" en esta misma pagina.

### Agentes disponibles para RAS

Los agentes que pueden ser asignados a las reuniones son:

- Natalia Benarducci
- Mariana Muzi
- Bruno Arce
- Diego Miranda
- Alejandro Erramun
- Lucia Nazur
- Fabian Barros
- Maria Podesta
- Fernanda Nunez
- Pablo Pirotto
- Daniel Dominguez

---

## Datos que muestra cada tarjeta

| Dato                | Ubicacion       | Descripcion                              |
|---------------------|-----------------|------------------------------------------|
| Modalidad           | Badge superior  | Presencial (blanco) o En linea (azul)    |
| Fecha               | Esquina superior| Fecha formateada                         |
| Titulo              | Cabecera        | Titulo de la reunion (hasta 2 lineas)    |
| Interesado          | Cuerpo          | Nombre del prospecto                     |
| Quien hace RAS      | Cuerpo          | Nombre del agente asignado               |
| Carrera             | Cuerpo          | Carrera asociada (si aplica)             |
