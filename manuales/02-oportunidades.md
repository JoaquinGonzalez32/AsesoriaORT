# Manual de Usuario: Oportunidades de Venta

## Descripcion general

Pagina de gestion avanzada del pipeline de ventas. Las oportunidades son leads que avanzaron en el proceso y tienen datos de contacto mas completos. Se agrupan por contacto (codigo SAPE), permitiendo ver que una misma persona puede tener interes en multiples carreras.

---

## Contenido de la pagina

### Panel de KPIs

Fila superior con tarjetas y graficos:

| KPI              | Descripcion                                               |
|------------------|-----------------------------------------------------------|
| Opps Filtradas   | Total de oportunidades que coinciden con los filtros       |
| Contactos        | Cantidad de contactos unicos (agrupados por SAPE)          |
| Inscriptos       | Oportunidades en fase final "Inscripto"                    |
| Pipeline Actual  | Grafico de barras verticales con cantidad por cada fase    |
| Mix de Carreras  | Grafico de barras verticales por carrera                   |

### Fases del pipeline

Las fases posibles de una oportunidad son, en orden:

1. **Interesado** - Contacto muestra interes inicial
2. **Evaluando** - Contacto esta evaluando opciones
3. **Contactado** - Se logro contacto directo
4. **No interesado** - Contacto descarto la opcion
5. **Promesa de Inscripcion** - Contacto se comprometio a inscribirse
6. **Inscripto** - Inscripcion confirmada (fase final exitosa)

### Busqueda inteligente (lenguaje natural)

Campo especial que interpreta frases escritas en espanol y las traduce automaticamente a combinaciones de filtros. Se ubica debajo de los KPIs.

#### Ejemplos de busquedas soportadas

| Consulta                                                | Interpretacion                                |
|---------------------------------------------------------|-----------------------------------------------|
| `inscriptos de UI`                                      | Carrera UI, fase Inscripto                    |
| `interesados en LT`                                     | Carrera LT, fase Interesado                   |
| `inscriptos de UI que tambien tengan interes en VD`      | Contactos con oportunidad en UI (inscripto) Y en VD |
| `interesados en LT o WY`                                | Contactos con oportunidad en LT O en WY (cualquiera de las dos) |
| `con ras agendada`                                      | Solo quienes tienen RAS agendada              |
| `no asistieron`                                         | Solo quienes no asistieron a la RAS           |
| `evaluando LG ademas tengan VD`                         | Contactos con LG (evaluando) Y tambien VD    |

#### Conectores reconocidos

- "tambien tengan interes en", "tambien tengan"
- "que tengan interes en", "que tengan"
- "con interes en", "y tambien", "ademas"

#### Operadores logicos

- **AND** (por defecto): el contacto debe cumplir TODAS las condiciones.
- **OR** (si la frase contiene "o" / "or"): el contacto debe cumplir AL MENOS UNA condicion.

El sistema muestra debajo del campo como interpreto la busqueda (carreras y fases detectadas).

### Panel de filtros avanzados

| Filtro             | Tipo                 | Descripcion                                              |
|--------------------|----------------------|----------------------------------------------------------|
| Nombre / CI / Mail | Texto libre          | Busca por nombre, cedula o correo electronico            |
| Fase               | Selector             | Filtra por fase del pipeline                             |
| Proceso Inicio     | Selector             | Periodo de inicio (Marzo/Agosto 2023 a 2030)             |
| Carreras           | Multi-select         | Checkboxes para seleccionar multiples carreras. Filtra contactos que tengan AL MENOS todas las carreras seleccionadas |
| Realiza RAS        | Selector             | Todos / SI (Realizada) / NO (Pendiente)                  |
| Rango de Fechas    | Dropdown con picker  | Boton que despliega dos campos: Desde y Hasta. Muestra el rango activo en el boton. Boton "Listo" para cerrar, "Limpiar" para resetear el rango |
| Limpiar            | Boton                | Resetea todos los filtros incluyendo busqueda inteligente|

### Lista de contactos agrupados

Las oportunidades se muestran agrupadas por contacto (codigo SAPE). Cada fila de contacto muestra:

- **Badge numerico**: cantidad de oportunidades del contacto (morado si tiene multiples, azul si tiene una sola).
- **Nombre**, **Cedula**, **Telefono**, **Mail**, **SAPE**.
- **Icono de edicion de contacto** (lapiz).
- **Flecha expandir/colapsar**.

Al expandir un contacto se muestra una tabla con sus oportunidades:

| Columna       | Descripcion                                  |
|---------------|----------------------------------------------|
| Carrera       | Carrera de interes                           |
| Fase          | Fase actual (con color segun estado)         |
| Proceso       | Periodo de inicio                            |
| RAS Agend.    | Si tiene reunion agendada (SI/NO)            |
| Realiza RAS   | Si asistio a la reunion (SI/NO con check)    |
| Liceo         | Tipo de liceo                                |
| Accion        | Boton "Gestionar"                            |

---

## Acciones disponibles

### Crear nueva oportunidad

Boton **"+ Nueva Opp"**. Abre un formulario modal con los siguientes campos:

| Campo               | Tipo       | Obligatorio | Descripcion                                    |
|---------------------|------------|:-----------:|------------------------------------------------|
| Nombre Completo     | Texto      | Si          | Nombre del contacto                            |
| Cedula de Identidad | Texto      | No          | CI del contacto                                |
| Correo Electronico  | Email      | No          | Mail del contacto                              |
| SAPE                | Texto      | No          | Codigo SAPE (agrupa oportunidades del mismo contacto) |
| Carrera de Interes  | Selector   | Si          | LV, WY, LT, LD, YN, LG, VD, UI, GF, WE       |
| Fase                | Selector   | Si          | Fase inicial del pipeline                      |
| Proceso Inicio      | Selector   | No          | Periodo de inicio                              |
| Tipo Liceo          | Selector   | No          | Publico, Privado o Interior                    |
| RAS Agendada        | Checkbox   | No          | Indica si se agendo reunion                    |
| Realiza RAS         | Checkbox   | No          | Indica si asistio a la reunion                 |
| Multiples Interes   | Checkbox   | No          | Habilita seleccion de carreras adicionales     |
| Comentarios         | Textarea   | No          | Notas de seguimiento                           |

### Gestionar oportunidad

Boton **"Gestionar"** en cada oportunidad expandida. Abre el mismo formulario de creacion con datos precargados. Permite modificar todos los campos y tambien eliminar la oportunidad.

### Multiples interes

Al activar el checkbox **"Multiples Interes"** dentro del formulario, aparece una grilla con todas las carreras disponibles. Se pueden seleccionar carreras adicionales (la carrera principal aparece deshabilitada).

Al guardar, si se seleccionaron carreras nuevas, el sistema pregunta si se desea **generar una oportunidad separada** para cada carrera adicional, con los mismos datos de contacto.

### Editar contacto

Icono de lapiz en la cabecera de cada contacto. Abre un modal para editar: Nombre, Cedula, Telefono y Mail. Los cambios se aplican a TODAS las oportunidades que comparten el mismo SAPE.

### Eliminar oportunidad

Dentro del modal de gestion, boton **"Eliminar Oportunidad"** en la esquina inferior izquierda. Pide confirmacion antes de eliminar.

### Importar CSV (formato externo ZOHO)

Boton **"Importar"**. Acepta exclusivamente el formato de exportacion del sistema externo (ZOHO). Las columnas obligatorias son `Nombre de Trato` y `Producto`. Si el archivo no las contiene, se muestra un error y no se importa nada.

**Columnas del CSV externo:**

| Columna CSV       | Uso                                                                          |
|-------------------|------------------------------------------------------------------------------|
| `Nombre de Trato` | Se guarda completo en `nombre_trato`. El nombre de la persona se extrae como el texto **antes del primer ` - `** |
| `Producto`        | Se traduce al codigo de carrera interno (ver tabla)                          |
| `Fase`            | Se mapea a la fase del pipeline; si no coincide, queda `Interesado`          |
| `Codigo SAPE`     | Se guarda en `sape`                                                          |
| `Proceso`         | Se guarda en `proceso_inicio`                                                |
| `Record Id`       | Ignorado                                                                     |

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

La comparacion es **case-insensitive y tolerante a tildes**. Si el valor de `Producto` no coincide, la oportunidad se importa igualmente con carrera vacia y se muestra un warning indicando los valores no reconocidos.

Los campos de contacto (cedula, telefono, mail), RAS y comentario quedan vacios al importar.

### Exportar CSV

Boton **"Exportar CSV"**. Descarga la tabla filtrada como archivo CSV con columnas: Nombre, CI, Mail, Carrera, Liceo, Tipo Liceo, Fecha Lead, RAS Agendada, RAS Asistio, Estado.

### Exportar graficas como imagen

Boton **"Imagen"**. Descarga los graficos de Pipeline y Mix de Carreras como archivo de imagen.

### Exportar datos de graficas como CSV

Boton **"CSV"** (junto al boton Imagen). Descarga los datos de los graficos en formato CSV.

---

## Validaciones importantes

- **SAPE duplicado**: si al guardar se detecta que el codigo SAPE ya esta asignado a otro contacto, el sistema alerta y pide confirmacion. Solo se permite duplicar si es la misma persona.
- **Oportunidades de multiples intereses**: al generar oportunidades por carrera adicional, cada una se crea con un comentario que indica la carrera principal de origen.
