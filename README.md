# Cotizador Next App

Aplicación construida con **Next.js**, **Prisma** y **PostgreSQL**.

---

## 🚀 Despliegue en Docker

### 1. Construir la imagen Docker

```bash
docker build -t cotizador-app .
```

### 2. Ejecutar la imagen con PostgreSQL externa

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require" \
  cotizador-app
```

La app estará disponible en: http://localhost:3000

---

## 🛠️ Desarrollo local

### 1. Clonar el proyecto y configurar el entorno

```bash
git clone https://github.com/Xepelin-BizOps/cotizador-nextjs-app.git
cd cotizador-nextjs-app
```

Renombra `env.template` a `.env` con la URL de tu base de datos local o externa:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cotizador_dev
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. (Opcional) Levantar PostgreSQL local con Docker

Si no tenés una base, podés usar el siguiente `docker-compose.yml`:

```bash
docker-compose up -d
```

Esto levantará PostgreSQL local en `localhost:5432` con:

- Usuario: `user`
- Contraseña: `pass`
- Base de datos: `cotizador_dev`

### 4. Generar y aplicar esquema de Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Ejecutar la app en modo desarrollo

```bash
npm run dev
```

📍 Disponible en: http://localhost:3000

---

## 🧳 Variables de entorno necesarias

| Variable       | Descripción                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | URL de conexión a la base PostgreSQL |

---

## 🐳 docker-compose.yml (opcional para desarrollo)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: cotizador_dev
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```
