# Zeolite

## Descripción general

Zeolite permite a un usuario que tenga cualquier tipo de narrativa o historia en mente volcar toda la información que comúnmente depositaría en apuntes varios o notas dispersas en un solo lugar que diferencia visualmente entre distintos tipos de entidades importantes como personajes o eventos trascendentes, no solo permitiéndole a este mismo describir cualquiera de estas entidades de forma esquemática y clara, sino también, aprovechando las ventajas de la arquitectura de datos utilizada, permitiéndole al mismo definir atributos personalizados que el usuario considere convenientes para su propio universo.

El sistema, sin embargo, no sirve únicamente como ayuda visual y representación gráfica de universos narrativos; además de permitir pasar de conexiones abstractas a relaciones tangibles, la aplicación analiza constantemente todas estas uniones entre conceptos y entidades para ofrecer al usuario un análisis exhaustivo de cualquier incongruencia o inconsistencia que detecte en el grafo, como por ejemplo, personajes que no tengan ni hayan tenido ninguna interacción social con otro personaje de la trama, eventos que no tienen ninguna consecuencia o localizaciones que no tienen ningún tipo de conexión con ningún personaje, entre otras.

El proyecto incluye:

- Un **backend** desarrollado en Python.
- Un **frontend** basado en React.
- Una base de datos **Neo4j** para almacenamiento de datos en grafo.

---

# Instalación

## Requisitos previos

Antes de comenzar, tener instalado:

- Python 3.x.
- Node.js y npm.
- Neo4j.

---

## Configuración del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/AdrianChabrera/zeolite.git
```

---

### 2. Configurar el Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

---

## Configuración de la base de datos (Neo4j)

Crear una instancia de Neo4j con los siguientes parámetros:

- **Nombre de la base de datos:** `zeolite`
- **Contraseña:** `tu_password`

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=tu_password
```

---

## Ejecución de la aplicación

Abrir dos terminales.

### Backend

```bash
cd backend/app
fastapi dev main.py
```

El servidor estará disponible en: http://127.0.0.1:8000

---

### Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:5173

---

# Manual de Usuario

## Añadir entidades

- Pulsar uno de los botones del panel izquierdo.
- Rellenar los datos en el modal.
- Clic en **"Create Character"**.
- La entidad aparecerá en el grafo.

---

## Crear relaciones

- Arrastrar desde el círculo de un nodo hacia otro.
- Seleccionar el tipo de relación.
- (Opcional) Añadir una descripción.

El sistema evita:
- Relaciones inválidas.
- Duplicados.

---

## Editar y eliminar

- Hacer clic sobre una entidad o relación.
- Modificar los datos y pulsar **"Save"** o eliminar con **"Delete"** (requiere confirmación).

---

## Atributos personalizados

- Añadir un nombre de atributo.
- Pulsar **"+ Add Field"**.
- Rellena su valor.

Para eliminarlo:
- Pulsar **"REMOVE"** junto al atributo.

---

## Dashboard

Panel lateral con métricas del grafo:

- **Información general:** número de entidades y relaciones.
- **Plot Holes:** nodos sin conexión.
- **Hotspots:** localizaciones más relevantes.
- **Social Centrality:** personajes más conectados.
- **Narrative Orphans:** personajes sin origen definido.
- **Isolated Characters:** sin relaciones sociales.
- **Empty Stages:** localizaciones vacías.
- **Ghost Events:** eventos sin participantes.
- **Consequence Gaps:** eventos sin impacto.
- **Forgotten Objects:** objetos sin uso o dueño.
- **Empty Groups:** grupos activos sin miembros.

Incluye:
- Vista **reducida** (resumen).
- Vista **extendida** (todas las métricas).

---

## Panel de visualización

### Filtrar
- Activar/desactivar checkboxes bajo **FILTER** para mostrar u ocultar tipos de entidades.

### Buscar
- Introducir un nombre en **SEARCH**.
- La vista se centrará en el nodo encontrado.

---

# Notas finales

- Neo4j debe estar en ejecución antes de iniciar el backend.
  
---
