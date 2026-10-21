# Archivo de patrimonio censurado en Colombia

Sitio web estático para consultar una colección inicial de obras, documentos y objetos relacionados con el patrimonio censurado en Colombia.

El proyecto está construido con HTML, CSS y JavaScript vanilla. No requiere Node.js, framework ni base de datos.

## Estructura

```text
.
├── index.html              # Página principal
├── styles.css              # Estilos y diseño responsive
├── app.js                  # Carga del catálogo, filtros y modales
├── data/
│   └── obras.csv           # Catálogo de obras
└── assets/
    └── obras/              # Imágenes de la colección
```

## Ejecutar localmente

No se debe abrir `index.html` haciendo doble clic. La página carga `data/obras.csv` mediante `fetch()` y los navegadores pueden bloquear esa lectura usando una URL `file://`.

### Opción 1: servidor de Python

Desde la carpeta del proyecto:

```bash
python -m http.server 4173
```

Luego abrir:

```text
http://localhost:4173/
```

Para detener el servidor, presionar `Ctrl + C`.

### Opción 2: VS Code

1. Instalar la extensión **Live Server**.
2. Abrir la carpeta del proyecto en VS Code.
3. Hacer clic derecho sobre `index.html`.
4. Elegir **Open with Live Server**.

## Desplegar como sitio estático

El servidor de producción debe publicar toda la carpeta del proyecto, conservando estas rutas:

```text
/index.html
/styles.css
/app.js
/data/obras.csv
/assets/obras/*.png
```

### GitHub Pages

1. Crear un repositorio en GitHub.
2. Subir todos los archivos de esta carpeta.
3. En el repositorio, ir a **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Seleccionar la rama principal y la carpeta `/ (root)`.
6. Guardar y esperar a que GitHub genere la URL pública.

### Netlify

1. Crear una cuenta en [Netlify](https://www.netlify.com/).
2. Elegir **Add new site → Deploy manually**.
3. Arrastrar la carpeta completa del proyecto al área de despliegue.

También se puede conectar un repositorio Git para que Netlify publique automáticamente cada cambio.

### Vercel

1. Crear una cuenta en [Vercel](https://vercel.com/).
2. Importar el repositorio.
3. Dejar vacío el campo de framework.
4. Dejar vacío el comando de build.
5. Usar `.` como directorio de salida, si Vercel lo solicita.
6. Pulsar **Deploy**.

## Recomendaciones antes de publicar

- Publicar el proyecto desde la raíz del dominio o configurar correctamente la ruta base. Las imágenes del CSV usan rutas como `/assets/obras/hs38.png`.
- Mantener exactamente las mayúsculas y minúsculas de los nombres de archivo. Por ejemplo, `HS031.png` no es igual a `hs031.png` en servidores Linux.
- Verificar que `data/obras.csv` y todas las imágenes estén incluidas en el despliegue.
- Revisar la consola del navegador si aparece “No se pudo cargar el catálogo de obras” o si alguna imagen no carga.
- Confirmar las fuentes, créditos y derechos de reproducción antes de publicar la colección de forma definitiva.

## Edición del catálogo

El archivo `data/obras.csv` usa punto y coma (`;`) como separador. La primera fila contiene los encabezados:

```text
id;titulo;artista;ano;decada;tecnica;dimensiones;registro;sala;categoria;imagenes;nota;fuente
```

Para asociar una o varias imágenes, usar rutas separadas por `|` en la columna `imagenes`:

```text
/assets/obras/hs017.png|/assets/obras/hs018.png
```

Después de modificar el CSV, recargar la página con `Ctrl + F5`.

## Estado del proyecto

Es una maqueta funcional de archivo digital. La versión pública debe incorporar investigación documental final, fechas verificadas, créditos completos y permisos de reproducción.
