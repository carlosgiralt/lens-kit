# Lens Kit

Framework-agnostic Web Components for gallery lightbox, carousel, and pan/zoom — built with Lit and TypeScript.

Lens Kit is a focused, premium media viewer library built on standard Web Components. Drop it into any modern frontend framework (React, Vue, Angular, Svelte) or plain HTML without wrappers or adapters.

## Components

### `<lk-gallery>`
Modal lightbox gallery that auto-detects images and videos from its slot content. Includes a configurable toolbar with zoom, rotation, flip, fullscreen, and slideshow controls. Composes the carousel and panzoom components internally.

### `<lk-carousel>`
Touch-enabled swipeable carousel with pointer event support (mouse, touch, pen), dot indicators, optional thumbnails, and prev/next navigation. Emits a `change` event with the current index.

### `<lk-panzoom>`
Interactive pan, zoom, rotate, and flip for any slotted content. Supports single-touch drag, multi-touch pinch zoom, and mouse wheel zoom with cursor-aware scaling.

## Installation

```bash
pnpm add lens-kit
```

## Usage

```html
<script type="module">
  import 'lens-kit';
</script>

<lk-gallery>
  <img src="photo1.jpg" alt="First photo" />
  <img src="photo2.jpg" alt="Second photo" />
  <video src="clip.mp4"></video>
</lk-gallery>
```

Components can also be used independently:

```html
<lk-carousel show-nav show-dots>
  <div>Slide one</div>
  <div>Slide two</div>
</lk-carousel>

<lk-panzoom min-scale="0.5" max-scale="4">
  <img src="high-res.jpg" alt="Zoomable image" />
</lk-panzoom>
```

## Styling

All components expose CSS custom properties for theming. Internals are encapsulated in Shadow DOM — styles applied to the host or via custom properties will not leak.

Refer to the [CSS Custom Properties reference](./src/content/docs/reference/css-props.md) for the full list.

## Development

```bash
pnpm install

# Component library dev server
pnpm dev

# Documentation site (localhost:4321)
pnpm docs:dev

# Production library build → dist/lens-kit.es.js + dist/lens-kit.umd.js
pnpm build
```

## License

MIT © Carlos Alberto Giralt Torriente
