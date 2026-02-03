# Sistema Avanzado de Gestión Clínica | Advanced Clinical Management System

## 🏥 Descripción | Description

**Español:** Sistema completo de gestión clínica con funcionalidades avanzadas de IA, gestión de pacientes, citas, análisis de rayos X dentales, odontogramas, CRM, y más.

**English:** Complete clinical management system with advanced AI features, patient management, appointments, dental X-ray analysis, odontograms, CRM, and more.

## ✨ Características Principales | Key Features

### 🔐 Autenticación y Roles | Authentication & Roles
- ✅ Sistema de autenticación JWT
- ✅ Roles basados en permisos (Admin, Doctor, Enfermera, Recepcionista, Técnico de Lab)
- ✅ Control de acceso granular

### 👥 Gestión de Pacientes | Patient Management
- ✅ Registro completo de pacientes
- ✅ Historial médico y dental
- ✅ Gestión de alergias y medicamentos
- ✅ Contactos de emergencia

### 📅 Sistema de Citas | Appointment System
- ✅ Calendario inteligente de citas
- ✅ Programación automática
- ✅ Notificaciones y recordatorios
- ✅ Gestión de estados de citas

### 🤖 Análisis con IA | AI Analysis
- ✅ **Análisis de Rayos X Dentales con IA**
- ✅ **Análisis de Informes de Laboratorio con IA**
- ✅ **Comparación de Pruebas Médicas**
- ✅ Recomendaciones automáticas
- ✅ Revisión y aprobación por doctores

### 🦷 Odontograma Digital | Digital Odontogram
- ✅ Carta dental interactiva
- ✅ Planes de tratamiento
- ✅ Seguimiento de procedimientos
- ✅ Historial dental visual

### 💼 CRM y Prospectos | CRM & Prospects
- ✅ Gestión de leads y prospectos
- ✅ Seguimiento de conversiones
- ✅ Análisis de fuentes de pacientes
- ✅ Automatización de seguimiento

### 💊 Gestión de Recetas | Prescription Management
- ✅ Recetas digitales
- ✅ Firma digital de doctores
- ✅ Códigos QR para verificación
- ✅ Seguimiento de dispensación

### 🔬 Proveedores de Laboratorio | Laboratory Providers
- ✅ Gestión de proveedores externos
- ✅ Seguimiento de rendimiento
- ✅ Integración de resultados
- ✅ Análisis de calidad

### 💰 Facturación y Pagos | Billing & Payments
- ✅ Integración con Stripe
- ✅ Gestión de seguros
- ✅ Facturación automática
- ✅ Reportes financieros

### 📊 Reportes y Analytics | Reports & Analytics
- ✅ Dashboard administrativo
- ✅ Reportes de múltiples clínicas
- ✅ Análisis de rendimiento
- ✅ Métricas en tiempo real

### 🌐 Multi-idioma | Multi-language
- ✅ Español e Inglés
- ✅ Detección automática de idioma
- ✅ Interfaz completamente traducida

### 🔒 Seguridad HIPAA | HIPAA Compliance
- ✅ Encriptación de datos
- ✅ Auditoría de accesos
- ✅ Respaldos seguros
- ✅ Cumplimiento de normativas

## 🛠️ Stack Tecnológico | Technology Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Redis** para caché y sesiones
- **Multer** para carga de archivos
- **Nodemailer** para emails
- **Stripe** para pagos

### Frontend
- **React.js** 18+
- **Material-UI (MUI)** para componentes
- **React Router** para navegación
- **React Query** para gestión de estado
- **Axios** para HTTP requests
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **React Konva** para odontogramas
- **i18next** para internacionalización

### AI & Machine Learning
- **OpenAI API** para análisis de IA
- **TensorFlow.js** (opcional)
- **Computer Vision APIs**

### DevOps & Deployment
- **Docker** + **Docker Compose**
- **Nginx** como reverse proxy
- **MongoDB** containerizado
- **Redis** containerizado

## 🚀 Instalación y Configuración | Installation & Setup

### Prerrequisitos | Prerequisites
```bash
- Node.js 18+
- MongoDB 6.0+
- Redis 7+
- Docker & Docker Compose (opcional)
```

### 1. Clonar el Repositorio | Clone Repository
```bash
git clone https://github.com/tu-usuario/sistema-gestion-clinica.git
cd sistema-gestion-clinica
```

### 2. Configurar Variables de Entorno | Environment Variables
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
nano .env
```

### 3. Instalar Dependencias | Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install
```

### 4. Configurar Base de Datos | Database Setup
```bash
# Iniciar MongoDB (si no está en Docker)
mongod

# Ejecutar migraciones (opcional)
npm run migrate
```

### 5. Ejecutar en Desarrollo | Run Development
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm start
```

### 6. Ejecutar con Docker | Run with Docker
```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Solo base de datos
docker-compose up mongodb redis
```

## 📁 Estructura del Proyecto | Project Structure

```
sistema-gestion-clinica/
├── 📁 client/                 # Frontend React
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componentes reutilizables
│   │   ├── 📁 pages/          # Páginas principales
│   │   ├── 📁 contexts/       # Context providers
│   │   ├── 📁 hooks/          # Custom hooks
│   │   ├── 📁 utils/          # Utilidades
│   │   └── 📁 assets/         # Recursos estáticos
│   └── package.json
├── 📁 models/                 # Modelos de MongoDB
├── 📁 routes/                 # Rutas de API
├── 📁 middleware/             # Middleware personalizado
├── 📁 utils/                  # Utilidades del backend
├── 📁 uploads/                # Archivos subidos
├── 📄 server.js               # Servidor principal
├── 📄 package.json
├── 📄 Dockerfile
├── 📄 docker-compose.yml
└── 📄 README.md
```

## 🔧 Configuración | Configuration

### Variables de Entorno | Environment Variables

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/clinica_db
REDIS_URL=redis://localhost:6379

# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura

# APIs externas
OPENAI_API_KEY=tu_clave_openai
STRIPE_SECRET_KEY=tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=tu_clave_publica_stripe

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app

# Configuración general
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

## 🎯 Uso del Sistema | System Usage

### 1. Primer Acceso | First Access
1. Crear cuenta de administrador
2. Configurar clínica principal
3. Agregar usuarios del personal
4. Configurar servicios y precios

### 2. Gestión Diaria | Daily Management
1. **Dashboard**: Vista general del día
2. **Citas**: Programar y gestionar citas
3. **Pacientes**: Registrar nuevos pacientes
4. **Análisis IA**: Subir y analizar rayos X
5. **Recetas**: Generar recetas digitales

### 3. Funciones Avanzadas | Advanced Features
1. **Odontogramas**: Crear cartas dentales
2. **CRM**: Gestionar prospectos
3. **Reportes**: Analizar métricas
4. **Laboratorios**: Gestionar proveedores

## 🔒 Seguridad | Security

### Medidas Implementadas | Implemented Measures
- ✅ Autenticación JWT con expiración
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de entrada en todas las rutas
- ✅ Rate limiting para prevenir ataques
- ✅ CORS configurado correctamente
- ✅ Headers de seguridad con Helmet
- ✅ Sanitización de datos
- ✅ Auditoría de accesos

### Cumplimiento HIPAA | HIPAA Compliance
- ✅ Encriptación de datos en tránsito y reposo
- ✅ Control de acceso basado en roles
- ✅ Auditoría completa de accesos
- ✅ Respaldos automáticos seguros
- ✅ Políticas de retención de datos

## 📊 API Documentation

### Endpoints Principales | Main Endpoints

#### Autenticación | Authentication
```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registrar usuario
GET  /api/auth/me            # Obtener usuario actual
POST /api/auth/logout        # Cerrar sesión
PUT  /api/auth/change-password # Cambiar contraseña
```

#### Pacientes | Patients
```
GET    /api/patients         # Listar pacientes
POST   /api/patients         # Crear paciente
GET    /api/patients/:id     # Obtener paciente
PUT    /api/patients/:id     # Actualizar paciente
DELETE /api/patients/:id     # Eliminar paciente
```

#### Citas | Appointments
```
GET    /api/appointments     # Listar citas
POST   /api/appointments     # Crear cita
PUT    /api/appointments/:id # Actualizar cita
DELETE /api/appointments/:id # Cancelar cita
```

#### Análisis IA | AI Analysis
```
POST /api/ai/analyze-xray    # Analizar rayos X
POST /api/ai/analyze-lab     # Analizar laboratorio
GET  /api/ai/analyses        # Listar análisis
```

## 🧪 Testing

### Ejecutar Pruebas | Run Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Producción con Docker | Production with Docker
```bash
# Construir para producción
docker-compose -f docker-compose.prod.yml up --build

# Con SSL/HTTPS
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up
```

### Variables de Producción | Production Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://usuario:password@host:27017/clinica_db
JWT_SECRET=clave_super_secreta_produccion
# ... otras variables
```

## 🤝 Contribución | Contributing

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia | License

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte | Support

- **Email**: soporte@heavycoders.com
- **Documentación**: [docs.heavycoders.com](https://docs.heavycoders.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/sistema-gestion-clinica/issues)

## 🎉 Agradecimientos | Acknowledgments

- Material-UI por los componentes de interfaz
- OpenAI por las capacidades de IA
- MongoDB por la base de datos
- React community por las librerías

---

**Desarrollado con ❤️ por Heavycoders**

*Sistema de Gestión Clínica - Transformando la atención médica con tecnología avanzada*
