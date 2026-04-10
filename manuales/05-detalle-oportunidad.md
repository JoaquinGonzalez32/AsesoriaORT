# Manual de Usuario: Detalle de Oportunidad

## Descripcion general

Pagina de detalle individual de una oportunidad (ruta `/opportunities/:id`). Muestra todos los datos de la oportunidad, permite editarla inline, y gestiona la RAS vinculada.

Se accede desde:
- Boton **"Ver"** en la pagina de Oportunidades.
- Boton **"Ver Opp"** en la pagina de Agenda RASES.

---

## Contenido de la pagina

### Breadcrumbs

Navegacion superior: Oportunidades > Nombre del contacto.

### Datos de la oportunidad

Muestra todos los campos organizados en cards:

| Campo              | Descripcion                                          |
|--------------------|------------------------------------------------------|
| Nombre             | Nombre completo del contacto                         |
| Cedula             | Cedula de identidad                                  |
| Telefono           | Numero de contacto                                   |
| Mail               | Correo electronico                                   |
| SAPE               | Codigo SAPE                                          |
| Carrera Interes    | Carrera principal                                    |
| Otros Intereses    | Carreras adicionales (si tiene multiples intereses)  |
| Fase               | Fase actual del pipeline (badge con color)           |
| Proceso Inicio     | Periodo de inicio                                    |
| Tipo Liceo         | Publico, Privado o Interior                          |
| RAS Agendada       | Si/No                                                |
| Motivo Desinteres  | Solo visible si la fase es "No interesado"           |
| Comentario         | Notas de seguimiento                                 |

### Edicion inline

Boton **"Editar"** que transforma los campos en inputs editables. Permite modificar todos los campos de la oportunidad. Botones **"Guardar"** y **"Cancelar"** para confirmar o descartar.

### Eliminar oportunidad

Boton **"Eliminar"** con confirmacion modal.

---

## Seccion RAS vinculada

### Con RAS existente

Muestra una card con los datos de la reunion:

| Campo           | Descripcion                           |
|-----------------|---------------------------------------|
| Titulo          | Titulo de la reunion                  |
| Interesado      | Nombre del interesado                 |
| Agente          | Quien realiza la RAS                  |
| Fecha y hora    | Fecha/hora programada                 |
| Modalidad       | Presencial o En linea                 |
| Carrera         | Carrera asociada                      |
| Resultado       | Pendiente/Realizada/Frustrada/Cancelada |
| Comentario      | Notas de la reunion                   |

Acciones disponibles:
- **Editar**: modifica los datos de la RAS.
- **Eliminar**: elimina la RAS y actualiza `ras_agendada` a false.

### Sin RAS

Muestra boton **"Agendar RAS"** que abre un formulario con:

| Campo         | Tipo       | Descripcion                                 |
|---------------|------------|---------------------------------------------|
| Titulo        | Texto      | Titulo de la reunion                        |
| Agente        | Selector   | Quien realiza la RAS (11 agentes)           |
| Fecha y hora  | Datetime   | Intervalos de 30 minutos                    |
| Modalidad     | Selector   | Presencial o En linea                       |
| Comentario    | Textarea   | Notas adicionales                           |

Al crear la RAS se actualiza automaticamente `ras_agendada` a true.

---

## Otras oportunidades del mismo contacto

Si el contacto tiene otras oportunidades (mismo nombre), se muestra una seccion con links a cada una, mostrando carrera y fase.
