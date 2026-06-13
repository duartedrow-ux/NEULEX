# NEULEX - Tienda Online

## Paso 1: Configurar Supabase

1. **Crea una cuenta en Supabase** → [supabase.com](https://supabase.com/dashboard)
2. **Crea un nuevo proyecto** y espera a que se configure
3. Ve a **SQL Editor** → **New query**
4. Copia y pega el código del archivo `supabase/migrations/001_create_products_table.sql` y ejecútalo
5. Ve a **Project Settings** → **API** y copia:
   - `Project URL` (pega en `VITE_SUPABASE_URL` en tu archivo `.env`)
   - `anon public` key (pega en `VITE_SUPABASE_ANON_KEY` en tu archivo `.env`)

## Paso 2: Probar la conexión

1. Abre el archivo `.env` y llena las variables con tus credenciales de Supabase
2. Ejecuta `npm run dev` para probar localmente

## Paso 3: Deploy en Vercel

1. **Crea un repositorio en GitHub** con tu código
2. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
3. **Importa tu repositorio**
4. En la sección de **Environment Variables**, agrega las mismas variables que tienes en tu `.env`
5. Haz clic en **Deploy**! 🚀
