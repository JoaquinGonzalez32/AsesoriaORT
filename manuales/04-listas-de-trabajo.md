# Manual de Usuario: Listas de Trabajo

## Descripcion general

Pagina para crear y gestionar listas de trabajo a partir de snapshots importados de oportunidades. La idea central es tomar un conjunto fijo de contactos en un momento determinado y trabajar sobre ese listado de forma aislada, sin que los cambios en el CRM principal lo alteren.

Esto permite realizar campanas de contacto, estudios de interes o evaluaciones de cierre, y al finalizar exportar un informe donde los numeros iniciales (total de contactos importados) coinciden con los finales.

Los datos de cada lista son independientes del pipeline de oportunidades: no se cruzan ni se vinculan con la tabla de oportunidades del sistema.

---

## Estructura de la pagina

La pagina tiene dos vistas internas que se alternan sin cambiar de ruta:

- **Vista 1 - Listado de listas**: pantalla inicial al ingresar a la seccion.
- **Vista 2 - Detalle de lista**: se accede al hacer click en "Ver" desde el listado.

---

## Vista 1: Listado de listas

### Tabla de listas guardadas

Muestra todas las listas creadas, ordenadas por fecha de creacion (mas reciente primero).

| Columna        | Descripcion                                                              |
|----------------|--------------------------------------------------------------------------|
| Nombre         | Nombre identificador de la lista                                         |
| Fecha Creacion | Fecha en que se creo la lista (dd/mm/yyyy)                               |
| Items          | Cantidad total de oportunidades importadas                               |
| Progreso       | Barra de progreso + texto "X de Y" indicando cuantos items fueron gestionados (resultado distinto de "Sin gestionar") |
| Acciones       | Botones Ver y Eliminar                                                   |

Si no hay listas creadas, la tabla muestra un mensaje indicandolo.

---

## Acciones disponibles en Vista 1

### Crear una nueva lista

Boton **"+ Nueva Lista"** en la cabecera. Abre un modal con:

| Campo         | Tipo      | Obligatorio | Descripcion                                                  |
|---------------|-----------|:-----------:|--------------------------------------------------------------|
| Nombre        | Texto     | Si          | Identificador de la lista (ej: "evaluacion ras - 3/3/2026")  |
| Archivo CSV   | Archivo   | Si          | Archivo .csv con las oportunidades a importar                |

Al confirmar, el sistema:
1. Crea el registro de la lista con el nombre indicado.
2. Parsea el CSV y crea un item por cada fila valida.
3. Asigna automaticamente el resultado "Sin gestionar" a todos los items.
4. Actualiza el contador de items en la lista.

Si el CSV no tiene la columna "nombre" o no contiene filas validas, se muestra un mensaje de error y no se crea la lista.

#### Formato del CSV de importacion

El archivo debe ser un CSV separado por comas. La primera fila debe contener los encabezados. La columna "nombre" es obligatoria; el resto son opcionales.

| Columna CSV      | Descripcion                                     | Obligatorio |
|------------------|-------------------------------------------------|:-----------:|
| `nombre`         | Nombre completo del contacto                    | Si          |
| `cedula`         | Cedula de identidad                             | No          |
| `mail`           | Correo electronico                              | No          |
| `telefono`       | Numero de telefono                              | No          |
| `sape`           | Codigo SAPE                                     | No          |
| `carrera`        | Carrera de interes                              | No          |
| `fase`           | Fase que tenia la oportunidad al momento de exportar | No     |
| `proceso_inicio` | Periodo de inicio                               | No          |
| `liceo_tipo`     | Tipo de liceo (Publico, Privado, Interior)      | No          |

Los valores de columnas adicionales que no figuren en esta lista son ignorados.

### Eliminar una lista

Boton **"Eliminar"** en la fila de cada lista. Muestra una confirmacion inline ("Eliminar? Si / No") antes de proceder. Al confirmar, se elimina la lista y todos sus items de forma permanente. La accion no se puede deshacer.

---

## Vista 2: Detalle de una lista

Se accede haciendo click en **"Ver"** desde el listado. Muestra todos los items de la lista y permite gestionarlos individualmente.

### Cabecera

Muestra el nombre de la lista, la fecha de creacion y la cantidad total de items. El boton **"← Volver"** regresa al listado de listas. En el extremo derecho se encuentran dos botones:

| Boton          | Descripcion                                                   |
|----------------|---------------------------------------------------------------|
| Importar CSV   | Agrega nuevos items a la lista desde un archivo CSV adicional |
| Exportar CSV   | Descarga todos los items de la lista como archivo CSV         |

### Panel de resumen por resultado

Fila de tarjetas con el conteo de items agrupados por estado de resultado. Cada tarjeta muestra el numero total y el nombre del resultado.

| Tarjeta               | Items que cuenta                              |
|-----------------------|-----------------------------------------------|
| Sin gestionar         | Items que no fueron trabajados todavia        |
| Interesado            | Items con resultado "Interesado"              |
| Evaluando             | Items con resultado "Evaluando"               |
| Contactado            | Items con resultado "Contactado"              |
| No interesado         | Items con resultado "No interesado"           |
| Promesa de Inscripcion| Items con resultado "Promesa de Inscripcion"  |
| Inscripto             | Items con resultado "Inscripto"               |

Las tarjetas son clickeables: al hacer click en una tarjeta se activa el filtro por ese resultado. Hacer click nuevamente lo desactiva.

El panel se actualiza en tiempo real a medida que se modifican los resultados en la tabla.

### Filtros disponibles

| Filtro   | Tipo      | Descripcion                                                         |
|----------|-----------|---------------------------------------------------------------------|
| Buscar   | Texto     | Filtra por nombre, cedula o mail del contacto                       |
| Resultado| Selector  | Filtra por valor de resultado                                        |
| Carrera  | Selector  | Lista dinamica con las carreras presentes en los items de la lista  |
| Limpiar  | Boton     | Aparece cuando hay alguno filtro activo; los resetea todos          |

El contador inferior derecho indica cuantos items coinciden con los filtros activos sobre el total de la lista.

### Tabla de items

| Columna       | Descripcion                                                                    |
|---------------|--------------------------------------------------------------------------------|
| Nombre        | Nombre completo del contacto                                                   |
| Cedula        | Cedula de identidad (muestra — si no tiene)                                    |
| Carrera       | Carrera de interes (muestra — si no tiene)                                     |
| Fase Original | Fase que tenia la oportunidad al momento de importar (solo lectura)            |
| Resultado     | Selector editable directamente en la tabla (ver valores abajo)                 |
| Comentario    | Texto editable haciendo click sobre la celda                                   |

---

## Importar CSV adicional

Boton **"Importar CSV"** en la cabecera de la vista detalle. Permite agregar mas items a una lista ya existente sin necesidad de crear una nueva.

Al hacer click se abre un modal con un campo de archivo. El formato del CSV es identico al de la importacion inicial (mismas columnas, mismas reglas). Al confirmar:

1. Se parsea el CSV y se insertan los nuevos items al final de la lista.
2. Todos los items nuevos entran con resultado "Sin gestionar" y sin comentario.
3. El contador de items total de la lista se actualiza sumando los nuevos.
4. La tabla se refresca mostrando los items anteriores mas los recien importados.

Esta accion es util cuando se trabaja en etapas: por ejemplo, importar un primer lote, gestionar esos contactos, y luego sumar un segundo lote a la misma lista de trabajo.

---

## Edicion inline

### Cambiar resultado

El campo **Resultado** es un selector (`<select>`) directamente en cada fila de la tabla. Al cambiar el valor, el cambio se guarda automaticamente en la base de datos sin necesidad de confirmar. El panel de resumen se actualiza en el momento.

### Agregar o editar comentario

El campo **Comentario** funciona como texto clickeable:

- Si el item no tiene comentario, aparece el texto en gris "Agregar...".
- Al hacer click, se convierte en un campo de texto editable.
- Al salir del campo (perder foco) o presionar **Enter**, el comentario se guarda automaticamente.
- Para cancelar sin guardar, presionar **Escape**.

### Valores de resultado

- `Sin gestionar` — estado inicial al importar el item
- `Interesado`
- `Evaluando`
- `Contactado`
- `No interesado`
- `Promesa de Inscripcion`
- `Inscripto`

---

## Exportar CSV

Boton **"Exportar CSV"** en la cabecera de la vista detalle. Descarga un archivo CSV con todos los items de la lista (sin aplicar los filtros activos). El archivo incluye las siguientes columnas:

`Nombre`, `Cedula`, `Mail`, `Telefono`, `SAPE`, `Carrera`, `Fase Original`, `Resultado`, `Comentario`

El archivo viene con BOM para compatibilidad con Excel y abre correctamente con caracteres especiales.

---

## Estructura de datos

### Lista (listas_trabajo)

| Campo        | Descripcion                                           |
|--------------|-------------------------------------------------------|
| `id`         | Identificador unico (UUID)                            |
| `nombre`     | Nombre descriptivo de la lista                        |
| `created_at` | Fecha y hora de creacion                              |
| `total_items`| Cantidad total de items en la lista (se actualiza cada vez que se importa un CSV adicional) |
| `updated_at` | Fecha y hora de ultima actualizacion del registro     |

### Item (lista_items)

| Campo           | Descripcion                                                      |
|-----------------|------------------------------------------------------------------|
| `id`            | Identificador unico (UUID)                                       |
| `lista_id`      | Referencia a la lista a la que pertenece                         |
| `nombre`        | Nombre del contacto (solo lectura)                               |
| `cedula`        | Cedula (solo lectura)                                            |
| `mail`          | Mail (solo lectura)                                              |
| `telefono`      | Telefono (solo lectura)                                          |
| `sape`          | Codigo SAPE (solo lectura)                                       |
| `carrera`       | Carrera de interes (solo lectura)                                |
| `fase_original` | Fase al momento de importar (solo lectura)                       |
| `proceso_inicio`| Periodo de inicio (solo lectura)                                 |
| `liceo_tipo`    | Tipo de liceo (solo lectura)                                     |
| `resultado`     | Estado de gestion (editable)                                     |
| `comentario`    | Notas del operador (editable)                                    |
| `created_at`    | Fecha y hora de creacion del item                                |

Los campos marcados como "solo lectura" corresponden al snapshot importado desde el CSV y no se pueden modificar desde la interfaz. Solo `resultado` y `comentario` son editables.
