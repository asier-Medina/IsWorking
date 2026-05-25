# ISWORKING

Es una plataforma web integral diseñada para la gestión, control y registro de la jornada laboral de los empleados en entorno empresarial. 

Su propuesta de valor principal radica en la automatización y la precisión del fichaje, permitiendo registrar las entradas, pausas y salidas del personal, capturando de forma obligatoria y transparente su ubicación GPS mediante el dispositivo desde el cual se realiza la acción.

El sistema mitiga los problemas de absentismo, fraude en el fichaje y simplifica la gestión de recursos humanos al centralizar la información. Los administradores disponen de un panel de control avanzado desde el cual pueden auditar las horas trabajadas, visualizar mapas interactivos con las ubicaciones exactas de los fichajes y gestionar cuadrantes horrios y plantillas de turnos de manera eficiente.


# Panel del Empleado (Fichaje)

*Autenticación Segura*

*Control de Estado (Fichaje en Tiempo Real)*

*Geolocalización Mandatoria*

*Historial Personal*

# Panel del Administrador

    • Panel de Monitoreo Global - Visualización en tiempo real del estado actual de la plantilla (quién está trabajando, quién está en pausa y quién ha salido)

    • Auditoría Geográfica - Integración con mapas interactivos para renderizar pines de localización basados en los datos GPS recopilados de los empleados.

    • Gestión de Horarios y Turnos (Schedules & Shifts) - Creación de plantillas de turnos rotativos u horarios fijos y asignación directa a los empleados.

    • Gestión de Empresas y Usuarios - Altas, bajas y modificaciones de cuentas de empleados adjuntos a una organización específica.

    • Módulo de Logs Avanzado -  Registro inmutable de acciones críticas del sistema para auditorías internas de seguridad.

## Estructura del prototipo y arquitectura de la app

**1- Backend-driven con API REST**

**2- Frontend Single Page Application (SPA)**
     
   ## Arquitectura del Backend

    • Capa de Rutas (Routes): Actúa como la interfaz de entrada de las peticiones HTTP, definiendo los endpoints de la API.

    • Capa de Controladores (Controllers): Contiene la lógica de control del flujo, gestionando la petición, invocando los servicios correspondientes y estructurando la respuesta HTTP.

    • Capa de Servicios (Services): Encapsula de forma estricta la lógica de negocio del software, manteniéndola independiente del protocolo de transferencia.

    • Capa de Modelos (Models / Acceso a Datos): Abstracción de las bases de datos para interactuar con las entidades del sistema mediante ORMs/ODMs.

## Tecnologías usadas:

**1- Frontend**
    • Next.js 14 / React: Framework de desarrollo web para la estructuración de la interfaz de usuario basada en componentes reactivos de última generación.

    • Tailwind CSS: Framework de estilos CSS orientado a utilidades para un diseño web responsive, fluido y adaptado a dispositivos móviles.

**2- Backend**
    • Node.js & Express: Entorno de ejecución e infraestructura ligera para el despliegue del servidor HTTP y enrutamiento de la API REST.

    • Cookie-Parser: Middleware especializado en la gestión y lectura de cookies cifradas/seguras para mecanismos de autenticación eficientes.

    • Cors: Mecanismo de seguridad implementado para la restricción y habilitación controlada del intercambio de recursos de origen cruzado entre el cliente y el servidor.

**3- Base de Datos y Almacenamiento**
    • Estrategia Híbrida de Persistencia: El sistema utiliza dos motores de base de datos de manera simultánea para optimizar el rendimiento según el caso de uso:

        ◦ PostgreSQL (Relacional): Gestiona la estructura rígida del negocio como las identidades de usuarios, asignación de empresas, plantillas de turnos (shifts) y calendarios (schedules). Se administra mediante el ORM Sequelize, garantizando la integridad referencial y las transacciones mediante relaciones estrictas (associations.js).

        ◦ MongoDB (No Relacional): Diseñado específicamente para almacenar volúmenes masivos de datos semiestructurados con alta velocidad de escritura, tales como los registros históricos de fichajes (LogRecord) y auditorías del sistema (LogAdmin), gestionado a través de Mongoose.

**4- Infraestructura y CI/CD**
    • Docker & Docker Compose: Contenerización exhaustiva de los entornos de desarrollo y bases de datos para garantizar la paridad del entorno entre local y producción.

    • GitHub Actions: Pipeline automatizado de Integración Continua y Despliegue Continuo (CI/CD) para validar la integridad del software en cada actualización del repositorio.

**5- Enfoque Técnico (Análisis de Código)**
El archivo index.js expone un diseño de inicialización robusto y controlado:

    • Seguridad de Cookies y Orígenes Cruzados (CORS): El servidor restringe los accesos únicamente al dominio configurado en las variables de entorno (process.env.FRONTEND_URL), haciendo obligatorio el parámetro credentials: true. Esto blinda la aplicación, garantizando que los JSON Web Tokens (JWT) o identificadores de sesión viajen exclusivamente a través de cookies seguras HttpOnly, mitigando vulnerabilidades como ataques XSS (Cross-Site Scripting).

    • Inicialización Síncrona de Conexiones: La función autoejecutable start() actúa como guardián del ciclo de vida del servidor. El backend se niega rotundamente a aceptar tráfico de red (app.listen) si alguna de las conexiones críticas a las bases de datos (PostgreSQL vía Sequelize o MongoDB) falla, invocando un cierre controlado del proceso (process.exit(1)).

    • Modularidad de Endpoints: La API divide sus responsabilidades de forma atómica en sub-enrutadores prefijados bajo la raíz /api:

        ◦ /api/auth: Control de sesiones, logins y logouts.
        ◦ /api/companies: Gestión de datos macro organizacionales.
        ◦ /api/users: CRUD de operarios y administradores.
        ◦ /api/records: El motor de fichajes con coordenadas GPS.
        ◦ /api/schedules & /api/shift-templates: Motores de asignación temporal horaria.
        ◦ /api/logs: Trazabilidad técnica y de auditorías.

    • Manejo Global de Excepciones: Inmediatamente después de la declaración de rutas, se inyectan middlewares de captura de errores (notFound y errorHandler). Esto asegura que cualquier fallo no controlado en las capas inferiores sea interceptado, transformado en un formato JSON estándar y devuelto con un código de estado HTTP adecuado, evitando la filtración de trazas internas del servidor al cliente.

## Árbol de archivos del proyecto backend

├── DOCS/                           # Documentos técnicos, scripts de prueba y logs
│   ├── cookies_logs_admin.txt
│   ├── cookies_logs_employee.txt
│   ├── test_api.sh                 # Script automatizado de pruebas de endpoints
│   └── test_mongo.sh               # Pruebas específicas de rendimiento en NoSQL
├── src/                            # Directorio raíz del código fuente
│   ├── config/                     # Configuraciones de infraestructura y BD
│   │   ├── mongo.js                # Conector e inicializador de MongoDB
│   │   └── postgres.js             # Instancia y configuración de Sequelize
│   ├── middlewares/                # Filtros de peticiones e interceptores de errores
│   │   └── errorHandler.js         # Control centralizado de códigos 404 y 500
│   ├── models/                     # Capa de abstracción de datos (Modelos)
│   │   ├── mongo/                  # Modelos NoSQL (Esquemas dinámicos)
│   │   │   ├── LogAdmin.js         # Log de auditoría de administradores
│   │   │   ├── LogAuth.js          # Historial de accesos e inicios de sesión
│   │   │   └── LogRecord.js        # Persistencia masiva de fichajes con coordenadas
│   │   └── postgres/               # Modelos SQL (Entidades relacionales)
│   │       ├── associations.js     # Configuración de relaciones (1:N, N:M)
│   │       ├── Schedule.js         # Modelo de calendarios laborales
│   │       ├── ShiftTemplate.js    # Plantillas de turnos horarios
│   │       └── [Otros modelos Relacionales (User, Company...)]
│   ├── routes/                     # Enrutadores jerárquicos de la API REST
│   │   ├── auth.routes.js
│   │   ├── company.routes.js
│   │   ├── logs.routes.js
│   │   ├── records.routes.js
│   │   ├── schedules.routes.js
│   │   ├── shifts.routes.js
│   │   └── user.routes.js
│   ├── services/                   # Módulos de lógica de negocio pura
│   │   ├── auth.service.js
│   │   ├── company.service.js
│   │   ├── logs.service.js
│   │   ├── records.service.js
│   │   ├── schedules.service.js
│   │   ├── shifts.service.js
│   │   └── user.service.js
│   └── index.js                    # Punto de entrada y orquestador de la aplicación
├── .env                            # Variables de entorno críticas (Privadas)
├── .env.example                    # Plantilla pública de variables requeridas
├── .gitignore                      # Exclusiones del sistema de control de versiones
├── docker-compose.yml              # Orquestador local de servicios y DBs en contenedores
├── Dockerfile                      # Instrucciones de construcción de la imagen backend
├── init.sql                        # Script de inicialización estructural para PostgreSQL
├── nodemon.json                    # Configuración del entorno de recarga en desarrollo
├── output.txt                      # Volcado de datos/logs del sistema
├── package.json                    # Manifiesto de dependencias, metadatos y scripts npm
└── README.md                       # Documentación inicial y manual de despliegue rápido


## Autores
- [nombre](repositorio git)
- [nombre](repositorio git)
- [nombre](repositorio git)
- [Ermidio](https://github.com/Edy1110)



<!-- Interfaz web de la plataforma IsWorking, desarrollada con React y Vite.

## Requisitos

- Node.js >= 18
- Backend IsWorking corriendo en `http://localhost:3000`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El frontend arranca en `http://localhost:5173` y conecta automáticamente con el backend mediante el proxy de Vite.

## Build

```bash
npm run build -->