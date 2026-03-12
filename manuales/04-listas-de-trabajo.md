# Manual de Usuario: Listas de Trabajo

## Descripcion general

Pagina para importar y gestionar oportunidades exportadas desde Zoho CRM. Permite cargar un CSV con el formato nativo de Zoho y trabajar sobre ese listado de forma independiente al pipeline principal del CRM.

Los datos importados se almacenan en una tabla separada (`listas_de_trabajo`) y no estan vinculados ni afectan a las oportunidades del sistema.

---

## Contenido de la pagina

### Buscador

Campo de texto en la parte superior de la tabla. Filtra los registros por Nombre de Trato en tiempo real. Se resalta en azul cuando tiene contenido activo.

### Tabla de registros

Muestra todos los registros importados, ordenados por fecha de importacion (mas reciente primero).

| Columna        | Descripcion                                                              |
|----------------|--------------------------------------------------------------------------|
| Nombre de Trato| Valor completo del campo "Nombre de Trato" del CSV                       |
| Fase           | Fase de la oportunidad                                                   |
| Carrera        | Codigo de carrera mapeado desde el campo "Producto" del CSV (badge azul) |
| SAPE           | Codigo SAPE                                                              |
| Proceso        | Periodo de inicio (ej: "Marzo 2026")                                     |
| Acciones       | Botones Editar y Eliminar por fila                                       |

Si no hay registros importados, la tabla muestra un mensaje indicandolo.

El pie de tabla muestra el conteo de registros visibles sobre el total.

---

## Importar CSV

Boton **"+ Importar CSV"** en la cabecera. Abre un modal con un campo de archivo.

El CSV debe tener formato de exportacion de Zoho CRM con las siguientes columnas:

| Columna CSV      | Obligatorio | Descripcion                                      |
|------------------|:-----------:|--------------------------------------------------|
| `Nombre de Trato`| Si          | Nombre completo del trato (ej: "Ana Lopez - LT - Marzo 2026") |
| `Producto`       | Si          | Nombre completo de la carrera (ver mapeo abajo)  |
| `Fase`           | No          | Fase de la oportunidad                           |
| `Codigo SAPE`    | No          | Codigo SAPE del contacto                         |
| `Proceso`        | No          | Periodo de inicio                                |
| `Record Id`      | —           | Ignorado automaticamente                         |

Al confirmar, el sistema:
1. Parsea el CSV y valida que existan las columnas obligatorias.
2. Descarta filas que no tengan valor en "Nombre de Trato".
3. Extrae el **nombre del contacto** del campo "Nombre de Trato" tomando el texto antes del primer ` - `.
4. Mapea el campo "Producto" al codigo de carrera correspondiente.
5. Inserta todos los registros validos en la base de datos.
6. Muestra un mensaje de exito con la cantidad de registros importados.
7. Si algun producto no pudo mapearse, muestra un aviso amarillo con los valores no reconocidos (ver abajo).

### Extraccion del nombre

El nombre se extrae automaticamente del campo "Nombre de Trato" tomando el texto antes del primer ` - ` (espacio-guion-espacio).

| Nombre de Trato                    | Nombre extraido |
|------------------------------------|-----------------|
| Eugenia Rodas - LT - Marzo 2026    | Eugenia Rodas   |
| Juan Perez - GF                    | Juan Perez      |

### Mapeo de carreras

El campo "Producto" del CSV contiene el nombre completo de la carrera. El sistema lo convierte al codigo interno de forma automatica. La comparacion es insensible a mayusculas y a tildes.

| Nombre completo en "Producto"                    | Codigo |
|--------------------------------------------------|:------:|
| Diseñador Grafico                                | GF     |
| Diseñador Digital                                | WE     |
| Licenciatura en Animacion y Videojuegos          | LV     |
| Licenciatura en Diseño Multimedia                | LD     |
| Licenciatura en Diseño, Arte y Tecnologia        | LT     |
| Licenciatura en Diseño de Modas                  | WY     |
| Licenciatura en Diseño Grafico                   | LG     |
| Desarrollo y Produccion de Videojuegos           | VD     |
| Diseño de Interfaces                             | UI     |
| Licenciatura en Diseño Industrial                | YN     |

### Productos no reconocidos

Si una fila tiene un valor en "Producto" que no coincide con ninguno de los nombres de la tabla, el registro se importa igual pero con la carrera vacia. Al finalizar la importacion, se muestra un aviso amarillo listando todos los valores no reconocidos. Este aviso se puede cerrar manualmente.

---

## Editar un registro

Boton **"Editar"** en la columna de acciones de cada fila. Abre un modal con los siguientes campos editables:

| Campo          | Tipo     | Descripcion                                                        |
|----------------|----------|--------------------------------------------------------------------|
| Nombre de Trato| Texto    | Valor completo del trato. Al editarlo, se muestra en tiempo real el nombre que sera extraido |
| Fase           | Selector | Fase del pipeline (Interesado, Evaluando, Contactado, No interesado, Promesa de Inscripcion, Inscripto) |
| Carrera        | Selector | Codigo de carrera (GF, WE, LV, LD, LT, WY, LG, VD, UI, YN)      |
| Codigo SAPE    | Texto    | Codigo SAPE del contacto                                           |
| Proceso        | Texto    | Periodo de inicio (ej: "Marzo 2026")                               |

Al guardar, si se modifico el campo "Nombre de Trato", el sistema recalcula automaticamente el nombre del contacto (texto antes del primer ` - `).

---

## Eliminar un registro

Boton **"Eliminar"** en la columna de acciones de cada fila. Abre un modal de confirmacion que muestra el nombre del trato. La eliminacion es permanente y no se puede deshacer.

---

## Estructura de datos

### Tabla `listas_de_trabajo`

| Campo            | Descripcion                                                        |
|------------------|--------------------------------------------------------------------|
| `id`             | Identificador unico (UUID)                                         |
| `nombre_trato`   | Valor completo del campo "Nombre de Trato" del CSV                 |
| `nombre`         | Nombre del contacto extraido automaticamente (antes del primer ` - `) |
| `fase`           | Fase de la oportunidad                                             |
| `carrera_interes`| Codigo de carrera mapeado desde "Producto"                         |
| `codigo_sape`    | Codigo SAPE                                                        |
| `proceso`        | Periodo de inicio                                                  |
| `created_at`     | Fecha y hora de importacion                                        |
