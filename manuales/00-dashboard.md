# Manual de Usuario: Dashboard

## Descripcion general

Pagina de inicio del CRM. Presenta una vision consolidada del estado de todo el embudo comercial agrupado en tres secciones: Captacion (Leads), Conversion (Oportunidades) y Cierre (RASES).

---

## Vista General vs. Mes

En la parte superior hay un toggle para alternar entre:

- **General**: muestra los KPIs acumulados de todos los registros activos.
- **Mes**: filtra los KPIs al mes y año seleccionados con selectores de mes y año.

---

## Secciones

### Captacion (Leads)

KPIs principales:

| KPI                 | Descripcion                                          |
|---------------------|------------------------------------------------------|
| Total Leads         | Cantidad total de leads (filtrados si aplica)        |
| 1er Contacto        | Leads en estado "1er Contacto"                       |
| Contactados         | Leads en estado "Contactado"                         |
| Interesados         | Leads en estado "Interesado"                         |

Graficas colapsables:

- **Embudo de Leads**: grafico de barras horizontal con las etapas Nuevos (1er C), Contactados, Interesados. Colores semanticos frio → calido → verde.
- **Distribucion por Resultado**: barras horizontales con todos los resultados de llamada ordenados de mayor a menor. Se puede filtrar por estado y por mes.
- **Top Carreras (Leads)**: barras verticales por carrera de interes, ordenadas de mayor a menor.

### Conversion (Oportunidades)

KPIs principales:

| KPI             | Descripcion                                                  |
|-----------------|--------------------------------------------------------------|
| Total Opps      | Cantidad total de oportunidades                              |
| RAS Agendadas   | Oportunidades con reunion agendada                           |
| Inscriptos      | Oportunidades en fase "Inscripto" con barra de progreso      |

Graficas colapsables:

- **Pipeline por Fase**: barras verticales con las 6 fases del pipeline.
- **Mix de Carreras**: barras verticales por carrera de interes.

### Cierre (RASES)

KPIs principales:

| KPI              | Descripcion                              |
|------------------|------------------------------------------|
| Total RASES      | Cantidad total de reuniones              |
| RAS Realizadas   | Reuniones con resultado "Realizada"      |

Graficas colapsables:

- **Modalidad**: grafico circular Presencial vs. En linea.
- **RAS por Agente**: barras horizontales por agente.
- **RAS por Carrera**: barras verticales por carrera.

---

## Exportacion

Cada seccion tiene un menu de acciones (⋯) con:

- **Exportar Imagen**: descarga las graficas de esa seccion como PNG.
- **Exportar CSV**: descarga los datos de las graficas en formato CSV.

---

## Comportamiento

- Todas las secciones son colapsables con un boton de toggle.
- Las graficas dentro de cada seccion tambien se pueden mostrar u ocultar individualmente.
- El dashboard se actualiza automaticamente al agregar, editar o eliminar datos en otras paginas.
