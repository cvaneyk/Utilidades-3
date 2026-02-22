# E1 Utility Suite - Guía de Despliegue en Easypanel

## Requisitos Previos
- Cuenta en Easypanel
- Repositorio en GitHub con el código
- `yarn.lock` generado en la carpeta `frontend/` (ejecutar `yarn install` localmente si no existe)

---

## Paso 1: Guardar en GitHub

1. En Emergent, haz clic en **"Save to GitHub"**
2. Se creará un repositorio con todo el código
3. **Importante:** Verifica que el archivo `frontend/yarn.lock` exista en el repositorio. Si no existe, ejecuta localmente:
   ```bash
   cd frontend
   yarn install
   ```
   Y haz commit del `yarn.lock` generado.

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

> ⚠️ **Importante:** Easypanel puede generar credenciales automáticamente para MongoDB. Revisa la pestaña **"Environment"** o **"Connection Info"** del servicio MongoDB para obtener la URL correcta.

La URL de conexión tendrá una de estas formas:

```
# Sin autenticación (si no se configuró usuario/contraseña):
mongodb://mongodb:27017

# Con autenticación (recomendado - usa las credenciales que genera Easypanel):
mongodb://usuario:contraseña@mongodb:27017
```

Donde `mongodb` es el nombre del servicio (DNS interno de Docker).

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
   - **Build Context / Root Directory**: `backend/` *(importante: el contexto debe apuntar al subdirectorio del backend)*
   - **Port**: `8001`

3. **Variables de Entorno** (en la pestaña Environment):
   ```
   MONGO_URL=mongodb://mongodb:27017
   DB_NAME=e1_utility_suite
   CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
   ```
   > **Nota:** Si MongoDB tiene autenticación, usa la URL completa con credenciales en `MONGO_URL`.
   > Reemplaza `tu-dominio.com` con tu dominio real en `CORS_ORIGINS`.

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
   - **Build Context / Root Directory**: `frontend/` *(importante: el contexto debe apuntar al subdirectorio del frontend)*
   - **Port**: `80`

3. **Build Arguments** (en la pestaña Build):
   ```
   REACT_APP_BACKEND_URL=https://api.tu-dominio.com
   ```
   > ⚠️ Usa la URL **pública** del backend (con `https://`). Esta variable se embebe en el JavaScript estático durante el build, así que debe ser la URL final accesible desde el navegador. **NO** debe terminar en `/`.

4. **Dominio** (en la pestaña Domains):
   - Añade tu dominio principal: `tu-dominio.com`

5. Clic en **"Deploy"**

---

## Cómo Funciona la Conexión

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
   - Backend se conecta a MongoDB usando la URL interna
   - `mongodb` es el nombre del servicio (DNS interno de Docker)
   - No necesitas exponer MongoDB a internet

3. **El código se conecta así** (en `server.py`):
   ```python
   mongo_url = os.environ['MONGO_URL']  # mongodb://mongodb:27017
   client = AsyncIOMotorClient(mongo_url)
   db = client[os.environ['DB_NAME']]   # e1_utility_suite
   ```

4. **El frontend llama al backend desde el navegador**
   - `REACT_APP_BACKEND_URL` se inyecta en el build como variable estática
   - Las llamadas API van a `https://api.tu-dominio.com/api/`
   - Por eso `CORS_ORIGINS` debe incluir el dominio del frontend

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

1. **Backend API**: Visita `https://api.tu-dominio.com/api/`
   - Debería mostrar: `{"message":"E1 Utility Suite API"}`

2. **Frontend**: Visita `https://tu-dominio.com`
   - Debería cargar la aplicación completa

3. **Probar las herramientas** (para verificar que frontend ↔ backend ↔ MongoDB funcionan):
   - **Shortlinks**: Crea un shortlink y verifica que aparece en la lista
   - **QR Generator**: Genera un código QR con una URL
   - **Password Generator**: Genera una contraseña
   - **Word Counter**: Pega un texto y verifica el conteo
   - **Base64**: Codifica/decodifica un texto
   - **Image Converter**: Sube una imagen para convertir a WebP

---

## Troubleshooting

### Error: "Connection refused" en MongoDB
- Verifica que el servicio MongoDB esté "Running"
- Verifica que `MONGO_URL` sea correcto (con o sin credenciales según la configuración)
- Si Easypanel usa autenticación, asegúrate de incluir usuario y contraseña en la URL

### Error: "CORS" en el frontend
- Verifica que `CORS_ORIGINS` en el backend incluya tu dominio frontend
- Ejemplo: `CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com`
- **No usar `*` en producción** por seguridad

### El frontend no conecta con el backend
- Verifica que `REACT_APP_BACKEND_URL` tenga la URL correcta del backend
- Debe incluir `https://` y NO terminar en `/`
- Recuerda que esta variable se inyecta en **build time**, así que si la cambias necesitas **redesplegar** el frontend

### El build del frontend falla
- Verifica que `yarn.lock` existe en `frontend/`
- Si no existe, genera uno localmente: `cd frontend && yarn install`
- Haz commit y push del archivo generado

### El build context es incorrecto
- Si los archivos no se copian correctamente, verifica que el **Build Context / Root Directory** esté configurado como `backend/` o `frontend/` según corresponda
- En Easypanel, esto puede estar en la configuración avanzada del servicio
