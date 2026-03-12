# Manual de Usuario: Gestión de Leads

## Descripcion general

Pagina para administrar los prospectos (leads) entrantes al sistema. Es la primera etapa del embudo comercial: aqui se registran las personas que mostraron interes inicial y se realiza el seguimiento de llamadas.

---

## Contenido de la pagina

### Panel de KPIs y Graficas

En la parte superior hay un boton de toggle **"Graficas y KPIs"** que muestra u oculta el panel de metricas. Por defecto esta oculto. Al expandirlo se muestran:

- **Prospectos Filtrados**: cantidad de leads que coinciden con los filtros activos, junto con el total general.
- **Efectividad del Filtro**: porcentaje de leads contactados o interesados sobre el total filtrado (tasa de contacto).

### Grafico de barras

Grafico horizontal ubicado junto a los KPIs. Su comportamiento cambia segun los filtros:

- **Sin filtro de estado**: muestra la distribucion por resultado de llamada (cuantos leads hay en cada estado).
- **Con filtro de estado activo**: muestra la distribucion por carrera dentro de ese estado seleccionado.

### Tabla de leads

Tabla principal con las columnas:

| Columna     | Descripcion                                                              |
|-------------|--------------------------------------------------------------------------|
| Fecha       | Fecha de ingreso del lead                                                |
| Nombre      | Nombre completo del prospecto                                            |
| Carrera     | Carrera de interes (codigo abreviado)                                    |
| Resultado   | Estado actual del seguimiento telefonico                                 |
| Intentos    | Cantidad de intentos de llamado realizados                               |
| Comentario  | Notas u observaciones (texto truncado)                                   |
| Acciones    | Boton "Convertir" + menu desplegable (⋮) con opciones Editar y Eliminar  |

---

## Filtros disponibles

| Filtro            | Tipo              | Descripcion                                                              |
|-------------------|-------------------|--------------------------------------------------------------------------|
| Buscar por nombre | Texto libre       | Filtra leads cuyo nombre contenga el texto ingresado                     |
| Mes               | Selector          | Filtra por el mes de la fecha del lead (Enero a Diciembre)               |
| Estado            | Selector          | Filtra por resultado de llamada (ver valores abajo)                      |
| Carrera           | Selector          | Filtra por carrera de interes (LV, WY, LT, LD, YN, LG, VD, UI, GF, WE) |
| Rango de Fechas   | Dropdown con piker | Boton que despliega dos campos: Desde y Hasta. Muestra el rango activo en el boton. Boton "Listo" para cerrar, "Limpiar" para resetear el rango |
| Reiniciar filtros | Boton             | Aparece cuando hay filtros activos; los limpia todos                     |

Los selectores **Carrera** y **Estado** se resaltan en azul cuando tienen un valor activo. El boton de **Rango de Fechas** tambien se resalta en azul cuando tiene algun valor.

### Valores de resultado de llamada

- `Sin Gestión` *(estado por defecto al importar desde CSV externo)*
- `1er Contacto`
- `Contactado`
- `Interesado`
- `No interesado`
- `Numero Incorrecto`
- `Llamar mas tarde`

---

## Acciones disponibles

### Crear un nuevo lead

Boton **"+ Nuevo Lead"**. Abre un formulario modal con los siguientes campos:

| Campo              | Tipo      | Obligatorio | Descripcion                                       |
|--------------------|-----------|:-----------:|---------------------------------------------------|
| Nombre Completo    | Texto     | Si          | Nombre del prospecto                              |
| Carrera Interes    | Selector  | Si          | Opciones: LV, WY, LT, LD, YN, LG, VD, UI, GF, WE |
| Resultado Llamada  | Selector  | No          | Estado del seguimiento telefonico                 |
| Intentos de Llamado| Numero    | No          | Cantidad de intentos realizados (default: 1)      |
| Horario Llamada    | Selector  | No          | Manana, Tarde o Noche                             |
| Comentario         | Textarea  | No          | Notas adicionales                                 |

La fecha del lead se asigna automaticamente con la fecha actual.

### Editar un lead

Opcion **"Editar"** dentro del menu desplegable (⋮) de cada fila. Abre el mismo formulario de creacion con los datos precargados. Se pueden modificar: nombre, carrera, resultado de llamada, intentos de llamado, horario y comentario.

### Eliminar un lead

Opcion **"Eliminar"** dentro del menu desplegable (⋮) de cada fila. Muestra un modal de confirmacion con el nombre del lead. La eliminacion es permanente.

### Convertir un lead a oportunidad

Boton **"Convertir"** disponible solo en leads que aun no fueron convertidos. Los leads ya convertidos muestran la etiqueta verde "Convertido".

Al presionar se abre un formulario con datos adicionales necesarios para la oportunidad:

| Campo              | Tipo       | Descripcion                                    |
|--------------------|------------|------------------------------------------------|
| Cedula             | Texto      | Cedula de identidad                            |
| Telefono           | Texto      | Numero de contacto                             |
| Mail               | Email      | Correo electronico                             |
| SAPE               | Texto      | Codigo SAPE del interesado                     |
| Tipo Liceo         | Selector   | Publico, Privado o Interior                    |
| Proceso Inicio     | Selector   | Periodo de inicio (Marzo/Agosto 2023 a 2030)   |
| Fase               | Selector   | Fase inicial de la oportunidad                 |
| Agendar RAS        | Checkbox   | Si se activa, permite agendar una reunion      |

Si se activa **"Agendar RAS"**, aparecen campos adicionales:

| Campo              | Tipo       | Descripcion                                           |
|--------------------|------------|-------------------------------------------------------|
| Quien hace RAS     | Selector   | Agente que realiza la reunion                         |
| Fecha              | Date       | Fecha de la reunion                                   |
| Hora               | Selector   | Hora de la reunion (intervalos de 30 minutos)         |
| Modalidad          | Selector   | Presencial o En linea                                 |

Tras confirmar la conversion, el sistema:
1. Crea la oportunidad con los datos del lead + datos adicionales.
2. Marca el lead como "convertido".
3. Redirige automaticamente a la pagina de Oportunidades.
4. Si se agendo RAS, crea la reunion correspondiente.

### Menu de acciones (⋯)

Boton con tres puntos ubicado en la barra de filtros. Al hacer click despliega un menu con tres opciones:

| Opcion           | Descripcion                                                   |
|------------------|---------------------------------------------------------------|
| Exportar Imagen  | Descarga las graficas visibles como archivo de imagen         |
| Exportar CSV     | Descarga los datos de las graficas en formato CSV             |
| Importar CSV     | Abre el selector de archivo para cargar leads desde el CSV externo |

#### Importar CSV (formato externo ZOHO)

El importador acepta exclusivamente el formato de exportacion del sistema externo (ZOHO). Las columnas obligatorias son `Nombre`, `Primer Apellido` y `Producto`. Si el archivo no las contiene, se muestra un error y no se importa nada.

**Columnas del CSV externo:**

| Columna CSV            | Uso                                                      |
|------------------------|----------------------------------------------------------|
| `Nombre`               | Primera parte del nombre del lead                        |
| `Primer Apellido`      | Segunda parte; se concatena con `Nombre`                 |
| `Producto`             | Se traduce al codigo de carrera interno (ver tabla)      |
| `Estado de Lead`       | Se mapea al resultado de llamada; si no coincide, queda `Sin Gestion` |
| `Proceso`              | Ignorado en este modulo                                  |
| Resto de columnas      | Ignoradas                                                |

**Mapeo de carrera (columna `Producto` → codigo interno):**

| Valor en CSV                                     | Codigo |
|--------------------------------------------------|:------:|
| Disenador Grafico                                | GF     |
| Disenador Digital                                | WE     |
| Licenciatura en Animacion y Videojuegos          | LV     |
| Licenciatura en Diseno Multimedia                | LD     |
| Licenciatura en Diseno, Arte y Tecnologia        | LT     |
| Licenciatura en Diseno de Modas                  | WY     |
| Licenciatura en Diseno Grafico                   | LG     |
| Desarrollo y Produccion de Videojuegos           | VD     |
| Diseno de Interfaces                             | UI     |
| Licenciatura en Diseno Industrial                | YN     |

La comparacion es **case-insensitive y tolerante a tildes**. Si el valor de `Producto` no coincide con ninguna entrada, el lead se importa igualmente con carrera vacia y se muestra un warning al finalizar indicando los valores no reconocidos.

Los leads importados se crean con fecha actual, 1 intento de llamado, comentario vacio y horario nulo.

---

## Estructura de datos de un Lead

### Campos visibles en la tabla

| Campo               | Descripcion                                                        |
|---------------------|--------------------------------------------------------------------|
| `fecha_lead`        | Fecha de ingreso del lead                                          |
| `nombre`            | Nombre completo del prospecto                                      |
| `carrera_interes`   | Carrera de interes (codigo abreviado)                              |
| `resultado_llamada` | Estado del seguimiento (1er Contacto, Contactado, etc.)            |
| `intentos_llamado`  | Cantidad de intentos de llamado realizados                         |
| `comentario`        | Notas u observaciones (se muestra truncado en la tabla)            |
| `convertido`        | Se muestra como badge "Convertido" o como boton "Convertir"        |

### Campos visibles solo en el formulario de edicion/creacion (no en la tabla)

| Campo              | Descripcion                                                              |
|--------------------|--------------------------------------------------------------------------|
| `horario_llamada`  | Horario preferido de llamada (Manana, Tarde o Noche)                     |

### Campos no visibles en la interfaz

| Campo              | Descripcion                                                              |
|--------------------|--------------------------------------------------------------------------|
| `lead_id`          | Identificador unico (UUID generado automaticamente por Supabase)         |
| `owner`            | ID del usuario que creo el lead (se asigna automaticamente al crear)     |
| `created_at`       | Fecha y hora de creacion del registro                                    |
| `updated_at`       | Fecha y hora de la ultima modificacion                                   |
| `deleted_at`       | Fecha y hora de borrado logico (soft delete, no se elimina fisicamente)  |
