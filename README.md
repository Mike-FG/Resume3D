# Miguel Ferrer — Three.js CV

Proyecto base de portfolio/CV narrativo en Three.js con tres secciones:

1. Sobre mí — icosfera violeta
2. Resume — triángulo extrusionado naranja
3. Portfolio — esfera facetada verde

Cada sección usa scroll largo, una escena Three.js sticky a pantalla completa y bloques de texto que aparecen/desaparecen según el progreso del scroll.

## Requisitos

- Node.js 18+ (recomendado Node.js 20 o superior)
- Visual Studio Code

## Instalar y ejecutar

Abre esta carpeta en VS Code y, en la terminal integrada:

```bash
npm install
npm run dev
```

Vite mostrará una URL local, normalmente:

```text
http://localhost:5173
```

Ábrela en el navegador.

## Build de producción

```bash
npm run build
npm run preview
```

La carpeta generada para publicar será `dist/`.

## Dónde editar

- `src/main.js`: contenido, escenas 3D, objetos, scroll y transiciones.
- `src/style.css`: estética, posiciones, fondos y responsive.
- `index.html`: metadatos y carga general.

## Ideas para siguiente iteración

- Reincorporar las imágenes del portfolio original.
- Añadir enlaces clicables a LinkedIn / Itch.io / ArtStation.
- Añadir postprocesado con bloom.
- Sustituir la "hexsphere" por un modelo GLTF propio.
- Añadir navegación mediante teclado/touch y una transición de cámara entre secciones.


## Foto de perfil

El proyecto incluye `public/drawing_icon.jpg` como imagen provisional para que la tarjeta funcione desde el primer arranque. Para usar tu imagen real, coloca una foto en `public/profile.jpg` y cambia en `src/main.js`:

```js
image: '/drawing_icon.jpg',
```

por:

```js
image: '/profile.jpg',
```


## Ajustes de ritmo

- `PARAGRAPH_FADE_LENGTH = 0.85`: longitud de los fades.
- `PARAGRAPH_FULL_OPACITY_RATIO = 0.60`: porcentaje aproximado de la vida de cada párrafo a opacidad máxima.
- `PARAGRAPH_ORBIT_TURNS = 0.35`: vueltas de órbita narrativa.
- Cada sección usa `height: 800vh`.


## Cambios v7
- La segunda sección usa el título **Resume**, igual que el encabezado/navegación del HTML 2D original.
- La tarjeta de contacto comienza desplegada por defecto.
- Los satélites de los clusters son pequeños prismas triangulares del color de cada figura.


## Ajustes v8

- La imagen de identidad se carga desde `public/drawing_icon.jpg`.
- Los párrafos a máxima opacidad se estabilizan en un lateral y mantienen separación respecto al modelo 3D.
- El indicador de navegación usa “Desliza”.
- Las escenas incluyen naves triangulares con dos estelas blancas, rutas múltiples y pequeños clusters.
