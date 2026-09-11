# Melao — landing

Sitio estático (HTML/CSS/JS, sin build). Abrir `index.html` con un servidor
estático cualquiera (por ejemplo `python -m http.server`) — no funciona bien
con `file://` porque el `<script type="module">` y las fuentes necesitan HTTP.

## Dirección de arte

- **Idea visual:** Melao mezcla tres cocinas en una sola carta — tequeños
  venezolanos, pinsa romana y smash burgers/brunch americano — bajo el lema
  "Sabor sin pasaporte". El nombre juega con el doble sentido: en Venezuela
  "melao" es como le dices a alguien que quieres; aquí es como se llama la
  casa.
- **Logo:** se usa el logo real del negocio (`logo-melao.jpg`, facilitado por
  el propietario), no una reinterpretación. Está recortado a PNG con fondo
  transparente en `assets/img/logo/` y es el que aparece en cabecera, pie de
  página y favicon — nunca se inventó un logo sustituto.
- **Color:** paleta tomada directamente del logo real (`css/style.css`,
  `:root`) — coral/rojo del aro, azul cielo de la "M" cursiva y verde lima de
  los pétalos, sobre un fondo crema cálido. Las tres tarjetas de "Nuestra
  mezcla" usan cada una un acento distinto de esos tres colores, como eco
  visual de "tres cocinas".
- **Tipografía:** Fraunces (serif editorial con carácter, para titulares) +
  Manrope (texto e interfaz).
- **Fotografía:** cinco fotos reales facilitadas por el propietario
  (`assets/img/*-original.jpg`; recortes optimizados en `assets/img/web/`):
  la milanesa (hero y pieza destacada de "De cocina"), pancakes en la barra,
  un cóctel, un pancake de chocolate y una tarta sobre la sala. Las cuatro
  últimas forman el mosaico de "De cocina", con lightbox al hacer clic. No
  hay fotografía de stock, ambiente inventado ni gente falsa en ningún
  sitio — donde no hay foto real (el resto de secciones), se apoya en
  tipografía, color e iconografía en vez de imágenes inventadas.
- **Motion:** GSAP + ScrollTrigger para las revelaciones por sección (una
  sola secuencia por sección) y el parallax de la marca de agua; Lenis como
  único motor de scroll suave. Three.js solo en la hero: un shader propio
  (no partículas ni assets externos) con tres manchas gooey en los tres
  colores del logo que responden al puntero — eco abstracto del estallido de
  pétalos del logo real, nunca decoración gratuita. La foto real es el primer
  frame estático — funciona incluso con JavaScript desactivado (comprobado
  con Playwright, `javaScriptEnabled: false`). `prefers-reduced-motion:
  reduce` desactiva Lenis, el shader, el cursor personalizado y el badge
  giratorio, y muestra los estados finales directamente.
- **Icons:** Solar (Iconify) para los símbolos de interfaz. El icono de
  Instagram usaba antes el logo oficial multicolor de "Iconify Logos"
  (`logos:instagram-icon`), pero al ser un SVG de color fijo no heredaba
  `currentColor` y quedaba desentonado junto a los demás iconos de línea
  (coral en el footer, sky en "Encuéntranos") — cambiado el 2026-09-11 a
  `mdi:instagram` (contorno, un solo color) en las cuatro apariciones
  (nav, info-list, follow-cta, footer) para que combine con el resto.
- **Skill de diseño usada:** `build-awwwards-quality-sites` (sistema de
  motion/calidad), con dirección de arte propia sobre el logo y la carta
  reales facilitados por el propietario.

## Icono de app y página 404

- **"Añadir a inicio":** `apple-touch-icon` (180×180) y `manifest.json`
  (192×192 y 512×512), generados a partir del mismo recorte transparente del
  logo real (`assets/img/logo/logo-melao-cutout.png`) sobre fondo crema —
  nunca un icono inventado. `theme-color` a `#241608` (el ink de la marca)
  para que la barra del navegador en móvil combine.
- **`404.html`:** página de error propia (mismo `css/style.css`, tipografía
  y tono que el resto del sitio) con vuelta al inicio y a la carta.
  **⚠️ Importante:** como GitHub Pages sirve este archivo para cualquier ruta
  que no exista, todos sus enlaces y assets usan la ruta absoluta
  `/melao-carballo-web/...` en vez de relativa — una ruta relativa se
  resolvería contra la URL rota que escribió el visitante, no contra la raíz
  del sitio, y el icono/CSS/enlaces de vuelta romperían. Si el sitio pasa a
  un dominio propio, hay que actualizar esas rutas en `404.html` igual que
  el resto de URLs absolutas (ver más abajo).

## Aviso de cookies

El sitio no carga por defecto ninguna pieza que instale cookies. El mapa de
Google no se incrusta automáticamente: en "Encuéntranos" hay un botón
("Cargar el mapa") y el `<iframe>` real de Google solo se crea al hacer clic
en él — hasta ese momento no hay cookies de terceros. El aviso inferior es
solo informativo ("Entendido"), sin "aceptar/rechazar", porque no hay nada
que aceptar mientras no se cargue el mapa. La elección se guarda en
`localStorage` para no mostrarlo de nuevo.

## Contenido real vs. pendiente

**Confirmado y usado tal cual:**
- Nombre, logo real, cinco fotos reales (plato, barra, cóctel, postre, sala),
  cuenta de Instagram (`@melaocarballo`).
- Dirección (Avenida Ponte da Pedra, 18, 15100 Carballo), teléfonos
  (604 057 796 y 697 11 44 70), correo (`melaocarballo@gmail.com`), fecha de
  apertura (junio de 2023) y horario: actualizados el 2026-09-11 cruzando
  el portal oficial de Turismo de Carballo, la ficha de Google del negocio y
  AXOBER (asociación empresarial), que coinciden entre sí — sustituye al
  cruce de directorios genéricos usado antes. El teléfono principal
  (604 057 796) es el que se usa en `tel:`/WhatsApp/JSON-LD; el segundo
  (697 11 44 70) se muestra como alternativa de contacto.
- Horario: el real (jueves a domingo, con hueco de tarde) es bastante más
  corto que el que tenía la web antes (que asumía apertura martes-domingo
  con turno de tarde) — implementado en `js/main.js` (`OPENING_HOURS`, con
  hasta dos franjas por día) y calcula "Abierto ahora" / "Cerrado ahora" en
  vivo. Viernes y sábado cierran justo a medianoche (`"00:00"`), lo que ya
  queda cubierto por la propia franja del día en `isOpenAt()`, así que no
  hace falta lógica de arrastre al día siguiente. Si el horario cambia, hay
  que editar `OPENING_HOURS`, la lista visible en `#hours-list` (`index.html`)
  y las mismas horas en el JSON-LD.
- Servicios: pet friendly (perros dentro y en terraza), accesible (acceso,
  baño y mesas adaptados) y para llevar/a domicilio — añadidos como fila de
  datos en "Encuéntranos" (`.info-list--services`) y como `amenityFeature`
  en el JSON-LD. Antes no se mostraban en ningún sitio de la web.
- Carta: los platos y precios mostrados en "La carta" están tomados
  literalmente de fotos reales de la carta física del propio local
  (guardadas en `fuentes-carta/`), sin inventar ningún plato ni precio. Es
  solo una selección — está marcado como tal ("Esto es solo un aperitivo…").
  Los precios pueden haber cambiado desde que se fotografió la carta.

**⚠️ Pendiente:**
- El horario quedó confirmado el 2026-09-11: el propietario pasó el panel
  de horario de su propia ficha de Google (el que trae el botón "Sugerir
  nuevos horarios", solo visible gestionando la ficha) y coincide exacto,
  día a día, con lo que ya había en `OPENING_HOURS`/`#hours-list`/JSON-LD
  — jueves 9:00–13:30, viernes y sábado 9:00–13:30 y 20:00–24:00, domingo
  10:00–14:00 y 20:00–23:30, lunes a miércoles cerrado. Esa misma ficha
  desglosa además "Desayuno" (8:30–13:00), "Cena" (20:00–23:30, con un
  resto de 0:00–0:30 que es el cierre de sábado noche cruzando a domingo)
  y "Entrega a domicilio" (20:30–23:40) — son estimaciones automáticas de
  Google a partir de reseñas/actividad, no horario fijado por el negocio,
  así que no se han usado para sustituir el horario general ya confirmado;
  quedan aquí anotadas por si en algún momento interesa precisar el rango
  de reparto a domicilio en la web. El segundo teléfono sigue sin
  confirmación directa del propietario.
- Los metadatos usan `https://alvarotaiagu.github.io/melao-carballo-web/`
  (la URL de la vista previa gratuita en GitHub Pages) como dominio; no hay
  dominio propio confirmado todavía. Cuando el negocio tenga su propio
  dominio hay que sustituir esa URL en `index.html` (canonical, `og:url`,
  `og:image`, `twitter:image` y el JSON-LD).
- Valoración de Google: se mostró contradictoria en directorios de terceros
  (4.7★/87 reseñas frente a 4.5★/12 reseñas), así que no se publicó ningún
  número hasta que el propietario confirmó la cifra real directamente sobre
  la ficha de Google del negocio: **4.8★, 17 reseñas**
  (`https://share.google/bW9lgUvX52iownn9A`). Se muestra como sello en la
  hero (`.google-seal` en `index.html`/`css/style.css`, enlaza a la ficha).
  El texto visible (sello, botón "Ver las reseñas...") se rellena desde un
  único sitio, `GOOGLE_RATING` al principio de `js/main.js`, para no tener
  que tocar varias frases sueltas cuando cambie la cifra. A propósito **no
  se muestra el número de reseñas** en ese texto (solo la valoración en
  estrellas): el conteo sube rápido y queda desactualizado enseguida,
  mientras que la nota en estrellas apenas se mueve. La excepción es el
  `aggregateRating` del JSON-LD, que sí lleva su propio `reviewCount` como
  literal en el HTML a propósito (Google lo pide para los datos
  estructurados) — si la cifra cambia, hay que actualizarlo ahí a mano.
- Sección "Reseñas" (`#resenas`): tres citas textuales, tomadas literalmente
  de reseñas reales de Google de esta ficha (Rodrigo S., Yolanda R., Paty
  P.). Yolanda se cruzó vía restaurantguru.com (nombre original en esa
  fuente: "Yolanda Rg", recortado a "Yolanda R." el 2026-09-11 para
  unificar criterio); Paty P. y Rodrigo S. las aportó el propietario
  directamente con capturas de su propia ficha de Google, sustituyendo a
  las reseñas de Jorge Delgado Nieto ("comida normalita") y Jose Manuel
  Viaño que había antes. No se ha inventado ni retocado ninguna frase de
  las reseñas en sí — el único ajuste es de formato: las tres usan ahora
  nombre + inicial del apellido, no el apellido completo, por discreción
  con la identidad de quien reseña. Cada tarjeta enlaza a Google mediante
  el botón final ("Ver las reseñas en Google"), que reutiliza el mismo
  enlace de la ficha ya verificado arriba, para que cualquiera pueda
  comprobarlas. Están replicadas también en el array `review` del
  JSON-LD.

## Validación hecha

- Servido en local y revisado con Playwright (Chromium) en 1440px y 390px,
  con motion normal, con `prefers-reduced-motion: reduce` y con JavaScript
  desactivado. 0 errores de consola en las cuatro pasadas.
- Foco de teclado visible en los primeros 10 elementos tabulables (orden
  lógico: saltar al contenido → marca → navegación → Instagram → CTAs de la
  hero), skip-link funcional, `aria-label` íntegro en los titulares
  divididos en palabras para la animación (comprobado que el texto accesible
  coincide con el texto visible).
- Menú móvil, aviso de cookies y carga del mapa bajo demanda probados por
  interacción real (clic), no solo visualmente.
- Único motor de scroll suave (Lenis); ScrollTrigger ligado correctamente a
  él; el shader de Three.js pausa fuera de pantalla o con la pestaña oculta,
  y libera geometría/material/renderer en `pagehide`.
- Fotos originales en `assets/img/` (archivo); las versiones servidas están
  en `assets/img/web/` (recortadas y redimensionadas, JPEG progresivo).
