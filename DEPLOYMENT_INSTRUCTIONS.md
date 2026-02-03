# 🚀 Sistema de Gestión Clínica - Instrucciones de Despliegue

## 📋 Descripción del Proyecto

Sistema avanzado de gestión clínica con funcionalidades de IA, desarrollado con React.js (Frontend) y Node.js/Express (Backend), utilizando MongoDB como base de datos.

## 🎯 Características Principales

- ✅ **Dashboard Interactivo** con métricas en tiempo real
- ✅ **Gestión Completa de Pacientes** con historial médico
- ✅ **Sistema de Facturación** con integración de seguros
- ✅ **Gestión de Citas Médicas** con calendario interactivo
- ✅ **Análisis con IA** para rayos X y reportes médicos
- ✅ **Odontogramas Digitales** interactivos
- ✅ **Sistema CRM** para gestión de prospectos
- ✅ **Prescripciones Médicas** digitales
- ✅ **Gestión de Proveedores** de laboratorio

## 📋 Prerrequisitos

### Opción 1: Desarrollo Local
- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js)
- **MongoDB** (local o MongoDB Atlas) - [Descargar aquí](https://www.mongodb.com/try/download/community)
- **Git** - [Descargar aquí](https://git-scm.com/)

### Opción 2: Con Docker
- **Docker** - [Descargar aquí](https://www.docker.com/get-started)
- **Docker Compose** (incluido con Docker Desktop)

## 🚀 Opción 1: Despliegue Rápido para Desarrollo

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sistema-gestion-clinica.git
cd sistema-gestion-clinica
```

### 2. Instalar Dependencias del Backend
```bash
npm install
```

### 3. Instalar Dependencias del Frontend
```bash
cd client
npm install
cd ..
```

### 4. Configurar Variables de Entorno
Crea o verifica el archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
MONGODB_URI=mongodb://localhost:27017/clinica_db
# O usar MongoDB Atlas (recomendado):
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/clinica_db

# Autenticación
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRE=7d

# Servidor
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Email (Opcional - para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion

# Stripe (Opcional - para pagos)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe

# OpenAI (Opcional - para funciones de IA)
OPENAI_API_KEY=tu_clave_openai
```

### 5. Ejecutar en Modo Desarrollo
```bash
npm run dev
```

Este comando ejecutará automáticamente:
- **Backend** en `http://localhost:5000`
- **Frontend** en `http://localhost:3000`

### 6. Acceder a la Aplicación
Abre tu navegador y ve a: `http://localhost:3000`

## 🐳 Opción 2: Despliegue con Docker (Recomendado para Producción)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/sistema-gestion-clinica.git
cd sistema-gestion-clinica
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` con las configuraciones de producción:

```env
# Variables para Docker
JWT_SECRET=clave_super_secreta_para_produccion_cambiar
CLIENT_URL=http://localhost:5000
STRIPE_SECRET_KEY=tu_clave_stripe_produccion
STRIPE_PUBLISHABLE_KEY=tu_clave_publica_stripe
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@empresa.com
EMAIL_PASS=tu-password-aplicacion
OPENAI_API_KEY=tu_clave_openai
```

### 3. Ejecutar con Docker Compose
```bash
# Ejecutar en segundo plano
docker-compose up -d

# O ejecutar viendo los logs
docker-compose up
```

### 4. Verificar que los Servicios Estén Ejecutándose
```bash
docker-compose ps
```

Deberías ver:
- `clinica_mongodb` (Puerto 27017)
- `clinica_redis` (Puerto 6379)
- `clinica_app` (Puerto 5000)
- `clinica_nginx` (Puerto 80)

### 5. Acceder a la Aplicación
- **Aplicación**: `http://localhost:5000`
- **Con Nginx**: `http://localhost`

### 6. Comandos Útiles de Docker
```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de MongoDB
docker-compose logs -f mongodb

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir y ejecutar
docker-compose up --build
```

## 🎯 Opción 3: Solo Frontend (Para Desarrollo de UI)

Si solo quieres trabajar en la interfaz de usuario:

```bash
cd client
npm install
npm start
```

La aplicación se ejecutará en `http://localhost:3000` con datos de ejemplo.

## 📱 Comandos de Desarrollo Útiles

### Backend
```bash
# Ejecutar solo el servidor backend
npm run server

# Ejecutar con nodemon (reinicio automático)
npm run dev:server
```

### Frontend
```bash
# Ejecutar solo el frontend
npm run client

# Construir para producción
cd client && npm run build
```

### Ambos
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# Instalar dependencias del cliente
npm run install-client

# Construir todo para producción
npm run build
```

## 🌐 Despliegue en Producción

### Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login a Heroku
heroku login

# Crear aplicación
heroku create nombre-de-tu-app

# Configurar variables de entorno
heroku config:set MONGODB_URI=tu_mongodb_atlas_uri
heroku config:set JWT_SECRET=tu_clave_secreta
heroku config:set NODE_ENV=production

# Desplegar
git push heroku main
```

### Vercel (Solo Frontend)
```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta client
cd client
vercel

# Seguir las instrucciones
```

### DigitalOcean/AWS/Google Cloud
1. Crear una instancia de servidor
2. Instalar Docker y Docker Compose
3. Clonar el repositorio
4. Configurar variables de entorno
5. Ejecutar `docker-compose up -d`
6. Configurar dominio y SSL

## 🔧 Configuración de Base de Datos

### MongoDB Local
```bash
# Instalar MongoDB
# Windows: Descargar desde mongodb.com
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Iniciar MongoDB
mongod

# Conectar (opcional)
mongo
```

### MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Obtener la cadena de conexión
5. Agregar a `.env`: `MONGODB_URI=mongodb+srv://...`

## 🔍 Solución de Problemas Comunes

### Error: Puerto en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :3000
lsof -i :5000

# Terminar proceso
kill -9 PID_DEL_PROCESO

# O usar puerto diferente
PORT=3001 npm start
```

### Error: Dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

### Error: MongoDB no conecta
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version

# Verificar conexión
mongo --eval "db.adminCommand('ismaster')"

# Para Docker
docker-compose logs mongodb
```

### Error: Variables de entorno
```bash
# Verificar que el archivo .env existe
ls -la .env

# Verificar contenido
cat .env

# Reiniciar servidor después de cambios
npm run dev
```

## 📊 Estructura del Proyecto

```
sistema-gestion-clinica/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API
│   │   └── ...
│   └── package.json
├── models/                 # Modelos de MongoDB
├── routes/                 # Rutas de la API
├── middleware/             # Middleware de Express
├── uploads/                # Archivos subidos
├── .env                    # Variables de entorno
├── server.js               # Servidor principal
├── package.json            # Dependencias del backend
├── docker-compose.yml      # Configuración Docker
└── Dockerfile              # Imagen Docker
```

## 🎉 Funcionalidades Disponibles

Una vez desplegado, tendrás acceso a:

### 📊 Dashboard
- Métricas de pacientes, citas y ingresos
- Gráficos interactivos
- Resumen de actividad diaria

### 👥 Gestión de Pacientes
- Registro completo de pacientes
- Historial médico detallado
- Información de seguros
- Contactos de emergencia

### 💰 Facturación
- Creación y gestión de facturas
- Integración con seguros médicos
- Múltiples métodos de pago
- Reportes financieros

### 📅 Citas Médicas
- Calendario interactivo
- Programación de citas
- Notificaciones automáticas
- Gestión de disponibilidad

### 🤖 Análisis con IA
- Análisis de rayos X dentales
- Interpretación de reportes médicos
- Recomendaciones automáticas

### 🦷 Odontogramas
- Odontogramas digitales interactivos
- Historial de tratamientos
- Anotaciones detalladas

### 🎯 CRM de Prospectos
- Gestión de leads
- Seguimiento de conversiones
- Campañas de marketing

### 💊 Prescripciones
- Prescripciones digitales
- Base de datos de medicamentos
- Historial de prescripciones

### 🏥 Proveedores
- Gestión de laboratorios
- Seguimiento de órdenes
- Integración de resultados

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. **Revisa los logs**: `npm run dev` o `docker-compose logs`
2. **Verifica las variables de entorno**: Asegúrate de que `.env` esté configurado
3. **Comprueba las dependencias**: `npm install` en ambas carpetas
4. **Revisa la conexión a MongoDB**: Verifica la URL de conexión
5. **Consulta la documentación**: Lee este archivo completo

## 🔐 Consideraciones de Seguridad

Para producción, asegúrate de:
- Cambiar todas las claves secretas
- Usar HTTPS
- Configurar CORS apropiadamente
- Usar variables de entorno seguras
- Mantener dependencias actualizadas
- Configurar backups de base de datos

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**¡El sistema está listo para usar! 🎉**

Para cualquier duda adicional, revisa la documentación técnica en `SYSTEM_OVERVIEW.md` o contacta al equipo de desarrollo.
