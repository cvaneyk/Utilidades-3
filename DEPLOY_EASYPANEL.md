# E1 Utility Suite - Guía de Despliegue en Easypanel

## Requisitos Previos
- Cuenta en Easypanel
- Repositorio en GitHub con el código

---

## Paso 1: Guardar en GitHub

1. En Emergent, haz clic en **"Save to GitHub"**
2. Se creará un repositorio con todo el código

---

## Paso 2: Crear Proyecto en Easypanel

1. Accede a tu panel de Easypanel
2. Crea un nuevo **Proyecto** (ej: `e1-utility-suite`)

---

## Paso 3: Crear Servicio MongoDB

1. Dentro del proyecto, clic en **"+ Service"**
2. Selecciona **"MongoDB"** de los templates
3. Configuración:
   - **Service Name**: `mongodb`
   - **Version**: 6 (o la más reciente)
4. Clic en **"Create"**
5. Espera a que inicie (estado: Running)

### Obtener la URL de conexión:
En Easypanel, MongoDB se conecta internamente usando:
```
mongodb://mongodb:27017
```
Donde `mongodb` es el nombre del servicio.

---

## Paso 4: Crear Servicio Backend

1. Clic en **"+ Service"** → **"App"**
2. Configuración:
   - **Service Name**: `backend`
   - **Source**: GitHub
   - **Repository**: Selecciona tu repo
   - **Branch**: `main`
   - **Build**: Dockerfile
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Port**: `8001`

3. **Variables de Entorno** (en la pestaña Environment):
   ```
   MONGO_URL=mongodb://mongodb:27017
   DB_NAME=e1_utility_suite
   CORS_ORIGINS=*
   ```

4. **Dominio** (en la pestaña Domains):
   - Añade un dominio: `api.tu-dominio.com` o usa el generado por Easypanel

5. Clic en **"Deploy"**

---

## Paso 5: Crear Servicio Frontend

1. Clic en **"+ Service"** → **"App"**
2. Configuración:
   - **Service Name**: `frontend`
   - **Source**: GitHub
   - **Repository**: Selecciona tu repo
   - **Branch**: `main`
   - **Build**: Dockerfile
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Port**: `80`

3. **Build Arguments** (en la pestaña Build):
   ```
   REACT_APP_BACKEND_URL=https://api.tu-dominio.com
   ```
   (Usa la URL del backend del paso anterior)

4. **Dominio** (en la pestaña Domains):
   - Añade tu dominio principal: `tu-dominio.com`

5. Clic en **"Deploy"**

---

## Cómo Funciona la Conexión MongoDB

```
┌─────────────────────────────────────────────────────────┐
│                    EASYPANEL                            │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────┐  │
│  │  Frontend   │───▶│   Backend   │───▶│  MongoDB   │  │
│  │  (React)    │    │  (FastAPI)  │    │            │  │
│  │  Port: 80   │    │  Port: 8001 │    │ Port: 27017│  │
│  └─────────────┘    └─────────────┘    └────────────┘  │
│        │                  │                   │         │
│        ▼                  ▼                   ▼         │
│   tu-dominio.com    api.tu-dominio.com    (interno)    │
└─────────────────────────────────────────────────────────┘
```

### Explicación:

1. **MongoDB NO necesita conexión a GitHub**
   - MongoDB es solo una base de datos
   - Se crea desde un template de Easypanel
   - Los datos se guardan en un volumen persistente

2. **La conexión es interna**
   - Backend se conecta a MongoDB usando: `mongodb://mongodb:27017`
   - `mongodb` es el nombre del servicio (DNS interno de Docker)
   - No necesitas exponer MongoDB a internet

3. **El código se conecta así** (en `server.py`):
   ```python
   mongo_url = os.environ['MONGO_URL']  # mongodb://mongodb:27017
   client = AsyncIOMotorClient(mongo_url)
   db = client[os.environ['DB_NAME']]   # e1_utility_suite
   ```

---

## Comandos Útiles (Local con Docker Compose)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build
```

---

## Verificar que Funciona

1. **Backend**: Visita `https://api.tu-dominio.com/api/`
   - Debería mostrar: `{"message":"E1 Utility Suite API"}`

2. **Frontend**: Visita `https://tu-dominio.com`
   - Debería cargar la aplicación completa

3. **MongoDB**: Crea un shortlink para verificar que se guarda en la DB

---

## Troubleshooting

### Error: "Connection refused" en MongoDB
- Verifica que el servicio MongoDB esté "Running"
- Verifica que `MONGO_URL` sea exactamente `mongodb://mongodb:27017`

### Error: "CORS" en el frontend
- Añade tu dominio frontend a `CORS_ORIGINS` en el backend
- Ejemplo: `CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com`

### El frontend no conecta con el backend
- Verifica que `REACT_APP_BACKEND_URL` tenga la URL correcta del backend
- Debe incluir `https://` y NO terminar en `/`
