# Manual de Usuario: Informes

## Descripcion general

Pagina para generar informes personalizados en formato Word (.docx). Permite seleccionar el tipo de informe, aplicar filtros, elegir y reordenar las secciones a incluir, previsualizar el resultado en vivo y exportar el documento.

---

## Layout

La pagina se divide en dos columnas:

- **Panel izquierdo (configuracion)**: selector de tipo, filtros, lista de secciones con drag-and-drop, boton de exportar.
- **Panel derecho (preview)**: vista previa del informe en formato A4 que se actualiza en tiempo real.

En pantallas pequenas las columnas se apilan verticalmente.

---

## Tipo de informe

Selector con tres opciones:

| Tipo           | Descripcion                                    |
|----------------|------------------------------------------------|
| Leads          | Informe basado en los datos de prospectos      |
| Oportunidades  | Informe basado en el pipeline de ventas        |
| RASES          | Informe basado en las reuniones de asesoramiento |

Al cambiar de tipo se resetean los filtros (con valores predeterminados) y se cargan las secciones correspondientes.

---

## Filtros disponibles

Los filtros varian segun el tipo de informe:

| Filtro          | Leads         | Oportunidades | RASES         |
|-----------------|:-------------:|:-------------:|:-------------:|
| Mes             | Si (default: mes actual) | —   | Si (default: mes actual) |
| Proceso         | —             | Si (default: proceso vigente) | — |
| Estado          | Si            | Si            | Si            |
| Carrera         | Si            | Si            | Si            |
| Rango de fechas | —             | Si            | Si            |

El **rango de fechas** (Desde / Hasta) aparece como un bloque con dos campos de fecha. Se resalta en azul cuando tiene valores activos y tiene un boton "Limpiar" para resetear.

Los selectores se resaltan en azul cuando tienen un filtro activo.

---

## Secciones por tipo

### Leads

| Seccion                           | Tipo    | Activa por defecto | Descripcion                                                |
|-----------------------------------|---------|:------------------:|------------------------------------------------------------|
| Indicadores Clave                 | KPI     | Si                 | Total de leads y contactados con barra de progreso         |
| Distribucion por Resultado        | Grafica | Si                 | Barras horizontales por resultado de llamada               |
| Resumen por Resultado y Horario   | Tabla   | Si                 | Tabla cruzada resultado × horario (Mañana/Tarde/Noche)     |
| Detalle de Leads                  | Detalle | No                 | Listado individual con nombre, carrera, resultado, intentos y comentario |

### Oportunidades

| Seccion              | Tipo    | Activa por defecto | Descripcion                                        |
|----------------------|---------|:------------------:|----------------------------------------------------|
| Indicadores Clave    | KPI     | Si                 | Total, contactos e inscriptos con barra de progreso |
| Pipeline por Fase    | Grafica | Si                 | Barras horizontales con las 6 fases del pipeline    |
| Mix de Carreras      | Grafica | Si                 | Barras horizontales por carrera de interes           |

### RASES

| Seccion              | Tipo    | Activa por defecto | Descripcion                                              |
|----------------------|---------|:------------------:|----------------------------------------------------------|
| Indicadores Clave    | KPI     | Si                 | Total, presencial y en linea                             |
| Resultado RAS        | Grafica | Si                 | Barras por resultado (Realizada, Pendiente, etc.)        |
| RAS por Agente       | Grafica | Si                 | Barras por agente, ordenadas de mayor a menor            |
| RAS por Carrera      | Grafica | Si                 | Barras por carrera de interes                            |

---

## Gestion de secciones

Cada seccion se muestra como una fila con:

- **Drag handle** (⠿): arrastrar para reordenar.
- **Checkbox**: activar o desactivar la seccion.
- **Nombre**: titulo de la seccion (editable).
- **Boton info** (?): tooltip con descripcion de lo que incluye la seccion.
- **Flecha expandir** (▸): abre un panel para editar el titulo de la seccion, con boton "Reset" para restaurar el titulo por defecto.

Las secciones se pueden reordenar arrastrando el handle. El orden se refleja inmediatamente en el preview.

---

## Preview en vivo

El panel derecho muestra una vista previa del informe en formato A4 con:

- **Header**: titulo del informe, subtitulo "CRM Asesoria ORT", fecha actual y filtros aplicados.
- **Secciones activas**: en el orden configurado, con KPIs, graficas de barras CSS y tablas.
- **Footer**: texto "CRM Asesoria ORT - Informe generado automaticamente" y numero de pagina.

El preview se actualiza instantaneamente al cambiar filtros, activar/desactivar secciones, reordenar o editar titulos.

Si no hay secciones activas, muestra un mensaje indicando que se debe activar al menos una.

---

## Exportar Word

Boton **"Exportar Word"** en la parte inferior del panel de configuracion. Al presionar:

1. Genera el documento .docx con las secciones activas en el orden configurado.
2. Incluye KPIs como tablas, graficas como imagenes PNG (generadas via canvas) y tablas de datos.
3. Descarga automaticamente el archivo con nombre `Informe_[Tipo]_[Fecha].docx`.
4. Muestra un toast de exito o error.

Durante la generacion el boton muestra un spinner con texto "Generando...".

El boton se deshabilita si no hay secciones activas.
