# CESVI-PROYECTO

Proyecto full-stack con **FrontEnd (JavaScript)** y **BackEnd (PHP)**.

> Estado: en desarrollo. Este README incluye lo que ya está y lo que falta por agregar/configurar.

---

## Tabla de contenido
- [Requisitos](#requisitos)
- [Estructura del repo](#estructura-del-repo)
- [Instalación](#instalación)
  - [FrontEnd](#frontend)
  - [BackEnd](#backend)
- [Configuración (.env)](#configuración-env)
  - [FrontEnd .env](#frontend-env)
  - [BackEnd .env](#backend-env)
- [Scripts útiles](#scripts-útiles)
- [Tests](#tests)
- [Build / Producción](#build--producción)
- [Contribuir](#contribuir)
- [Pendientes (por agregar / confirmar)](#pendientes-por-agregar--confirmar)

---

## Requisitos

### General
- Git

### FrontEnd
- Node.js (recomendado **LTS**) y npm  
  Verifica:
  ```bash
  node -v
  npm -v
  ```

### BackEnd (PHP)
- PHP (versión según tu proyecto)
- Composer (si aplica)

> Si usas MySQL/PostgreSQL u otro servicio, agrégalo aquí (pendiente si no está definido).

---

## Estructura del repo

> Ajusta si tus carpetas tienen otro nombre.

- `FrontEnd/` — aplicación web (JS)
- `BackEnd/` (o carpeta equivalente) — API/servidor (PHP)
- `.gitignore`
- `README.md`

---

## Instalación

Clona el repositorio:
```bash
git clone https://github.com/IsoleucineDev/CESVI-PROYECTO.git
cd CESVI-PROYECTO
```

### FrontEnd

```bash
cd FrontEnd
npm install
```

Para ejecutar en desarrollo:
```bash
npm run dev
```

> Si tu frontend usa Vite/React/Vue/etc., este comando suele ser el correcto. Si no existe, revisa `FrontEnd/package.json`.

### BackEnd

> Si tu backend usa Composer:
```bash
cd BackEnd
composer install
```

Para correr el backend depende del framework:

- **PHP built-in server** (simple):
  ```bash
  php -S localhost:8000 -t public
  ```
- **Framework (Laravel/Symfony/etc.)**: agrega el comando real aquí (pendiente si no está definido).

---

## Configuración (.env)

### FrontEnd .env
Crea un archivo `FrontEnd/.env` (o `.env.local` si tu stack lo prefiere).

Ejemplo:
```env
# URL del backend / API
VITE_API_URL=http://localhost:8000
```

> Si no usas Vite, cambia el prefijo y formato según tu framework.

### BackEnd .env
Crea un archivo `BackEnd/.env` (o el que use tu framework).

Ejemplo (genérico):
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de datos (si aplica)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cesvi
DB_USERNAME=root
DB_PASSWORD=
```

> Si tu back maneja autenticación (ej. Keycloak), documenta variables aquí.

---

## Scripts útiles

### FrontEnd
Desde `FrontEnd/`:
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

> Los scripts exactos se ven en `FrontEnd/package.json`.

### BackEnd
Depende del stack (pendiente documentar comandos exactos si aún no están definidos).

---

## Tests

### FrontEnd
Desde `FrontEnd/`:
```bash
npm test
# o
npm run test
# o
npm run vitest
```

> Confirma el script real en `FrontEnd/package.json`.

### BackEnd
- Si tienes PHPUnit:
  ```bash
  vendor/bin/phpunit
  ```

> Pendiente: confirmar framework/herramienta de testing en PHP.

---

## Build / Producción

### FrontEnd
Desde `FrontEnd/`:
```bash
npm run build
```

La salida normalmente queda en `dist/` (según framework).

### BackEnd
Pendiente: documentar proceso de deploy (servidor, rutas públicas, variables de entorno, etc.).

---

## Contribuir

1. Crea una rama:
   ```bash
   git checkout -b feature/mi-cambio
   ```
2. Haz commits con mensajes claros.
3. Push:
   ```bash
   git push -u origin feature/mi-cambio
   ```
4. Abre un Pull Request.

---

## Pendientes (por agregar / confirmar)

- [ ] Confirmar stack exacto del FrontEnd (React/Vite/etc.) y actualizar comandos reales.
- [ ] Documentar rutas/URL del backend y endpoints principales.
- [ ] Documentar autenticación (se menciona “Keycloak” en commits): estado actual, cómo configurar, cómo desactivar/activar.
- [ ] Definir variables `.env` definitivas (FrontEnd y BackEnd).
- [ ] Documentar base de datos (motor, esquema/migraciones, seeders).
- [ ] Agregar instrucciones de deploy (producción) y ambientes.
- [ ] Agregar badges (build/tests) si hay CI.
- [ ] Agregar licencia si aplica.
