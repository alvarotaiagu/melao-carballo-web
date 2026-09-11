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
- **Fotografía:** una sola foto real de plato (facilitada por el propietario,
  `assets/img/dish-original.jpg`; recortes optimizados en `assets/img/web/`),
  usada en la hero y en "De cocina" con dos encuadres distintos del mismo
  original. No hay fotografía de stock, ambiente inventado ni gente falsa en
  ningún sitio — con una sola foto real disponible, el resto de secciones se
  apoyan en tipografía, color e iconografía en vez de imágenes inventadas.
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
- **Icons:** Solar (Iconify) para los símbolos de interfaz; el logo de
  Instagram es el SVG oficial de "Iconify Logos", usado porque enlaza a la
  cuenta real del negocio.
- **Skill de diseño usada:** `build-awwwards-quality-sites` (sistema de
  motion/calidad), con dirección de arte propia sobre el logo y la carta
  reales facilitados por el propietario.

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
- Nombre, logo real, foto real de plato, cuenta de Instagram
  (`@melaocarballo`).
- Dirección (Avenida Ponte da Pedra, 18, 15100 Carballo) y horario: cruzados
  entre varios directorios públicos independientes (búsqueda web,
  rutaculinaria.com, cafeelsiglo.es) que coinciden en los mismos datos.
- Teléfono (604 05 77 96): aparece igual en tres de esas mismas fuentes
  independientes, pero **ninguna es el propio negocio** — conviene que el
  propietario lo confirme antes de publicar.
- Carta: los platos y precios mostrados en "La carta" están tomados
  literalmente de fotos reales de la carta física del propio local
  (guardadas en `fuentes-carta/`), sin inventar ningún plato ni precio. Es
  solo una selección — está marcado como tal ("Esto es solo un aperitivo…").
  Los precios pueden haber cambiado desde que se fotografió la carta.

**⚠️ Asumido, pendiente de confirmar con el propietario:**
- El horario mostrado combina los datos que coinciden entre fuentes de
  terceros; no viene de una confirmación directa del negocio. Está
  implementado en `js/main.js` (`OPENING_HOURS`, con hasta dos franjas por
  día) y calcula "Abierto ahora" / "Cerrado ahora" en vivo, incluyendo los
  cruces de medianoche de viernes y sábado — verificado con 20 casos de
  prueba (cada franja, cada hueco entre servicios, cada cruce de
  medianoche). Si el horario cambia, basta con editar `OPENING_HOURS` (y las
  mismas horas en el JSON-LD de `index.html`).
- Los metadatos usan `https://alvarotaiagu.github.io/melao-carballo-web/`
  (la URL de la vista previa gratuita en GitHub Pages) como dominio; no hay
  dominio propio confirmado todavía. Cuando el negocio tenga su propio
  dominio hay que sustituir esa URL en `index.html` (canonical, `og:url`,
  `og:image`, `twitter:image` y el JSON-LD).
- No se muestra valoración de Google ni reseñas: las cifras que ofrecían los
  directorios de terceros eran contradictorias entre sí (4.7★/87 reseñas
  frente a 4.5★/12 reseñas), así que se ha preferido no mostrar ningún
  número en vez de arriesgarse a publicar uno incorrecto.

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
