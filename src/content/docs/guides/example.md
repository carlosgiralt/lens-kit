---
title: Getting Started
description: Add Lens Kit to any project in minutes using the CDN.
---

Lens Kit is a set of lightweight, framework-agnostic Web Components. Because they are standard [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements), they work in **any environment that renders HTML** — plain HTML files, Django templates, Jinja2, PHP, Rails, React, Vue, and more.

No framework. No build step. No configuration required.

---

## Option 1 — CDN (No Build Step)

Add one `<script>` tag and all components are immediately available.

### UMD (classic `<script>` tag)

Works in any `.html` file, Django template, Jinja2 template, or server-rendered page.

```html
<script src="https://carlosgiralt.github.io/lens-kit/lens-kit.umd.js"></script>
```

### ESM (`type="module"`)

Preferred for modern browsers. Loads only what the browser needs.

```html
<script type="module" src="https://carlosgiralt.github.io/lens-kit/lens-kit.es.js"></script>
```

---

## Plain HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <script src="https://carlosgiralt.github.io/lens-kit/lens-kit.umd.js"></script>
</head>
<body>
  <lk-gallery layout="grid">
    <img src="photo-1.jpg" alt="Mountains" data-caption="Mountain view" />
    <img src="photo-2.jpg" alt="River"     data-caption="River landscape" />
    <img src="photo-3.jpg" alt="Forest"    data-caption="Forest path" />
  </lk-gallery>
</body>
</html>
```

Click any image to open the modal lightbox with pan, zoom, and navigation controls.

---

## Django

Lens Kit works seamlessly in Django templates.

### Using the CDN

```html
{# base.html #}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <script src="https://carlosgiralt.github.io/lens-kit/lens-kit.umd.js"></script>
</head>
<body>
  {% block content %}{% endblock %}
</body>
</html>
```

Then use the components in any template that extends `base.html`:

```html
{# gallery.html #}
{% extends "base.html" %}

{% block content %}
<lk-gallery layout="grid">
  {% for photo in photos %}
    <img src="{{ photo.url }}" alt="{{ photo.title }}" data-caption="{{ photo.title }}" />
  {% endfor %}
</lk-gallery>
{% endblock %}
```

### Serving as a Static File

Download `lens-kit.umd.js` and place it in your `static/` directory:

```
myapp/
  static/
    js/
      lens-kit.umd.js
```

Load it using Django's `{% static %}` tag:

```html
{% load static %}
<script src="{% static 'js/lens-kit.umd.js' %}"></script>
```

### Boolean Attributes with Django

Template variables render as strings. Lens Kit accepts Python-style boolean strings natively:

- truthy: `"True"`, `"true"`, `"1"`, or bare attribute presence
- falsy: `"False"`, `"false"`, `"0"`, `"off"`, `"no"`

```django
<lk-carousel
  show-dots="{{ show_dots }}"
  show-thumbnails="{{ show_thumbnails }}"
>
  {% for photo in photos %}
    <img src="{{ photo.url }}" alt="{{ photo.title }}" />
  {% endfor %}
</lk-carousel>
```

---

## Other Server-Side Frameworks

The same CDN approach works in any server-rendered environment.

**Jinja2 / Flask**
```html
<script src="https://carlosgiralt.github.io/lens-kit/lens-kit.umd.js"></script>

<lk-gallery layout="grid">
  {% for photo in photos %}
    <img src="{{ photo.url }}" alt="{{ photo.title }}" data-caption="{{ photo.title }}" />
  {% endfor %}
</lk-gallery>
```

**PHP**
```php
<script src="https://carlosgiralt.github.io/lens-kit/lens-kit.umd.js"></script>

<lk-gallery layout="grid">
  <?php foreach ($photos as $photo): ?>
    <img
      src="<?= htmlspecialchars($photo['url']) ?>"
      alt="<?= htmlspecialchars($photo['title']) ?>"
      data-caption="<?= htmlspecialchars($photo['title']) ?>"
    />
  <?php endforeach; ?>
</lk-gallery>
```

---

## JavaScript Frameworks

### React

React 19 supports custom elements natively. For React 18 and earlier, pass `ref` to set properties imperatively.

```tsx
import 'https://carlosgiralt.github.io/lens-kit/lens-kit.es.js';

export function PhotoGrid({ photos }: { photos: { id: number; url: string; title: string }[] }) {
  return (
    <lk-gallery layout="grid">
      {photos.map(photo => (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.title}
          data-caption={photo.title}
        />
      ))}
    </lk-gallery>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import 'https://carlosgiralt.github.io/lens-kit/lens-kit.es.js';

defineProps<{ photos: { id: number; url: string; title: string }[] }>();
</script>

<template>
  <lk-gallery layout="grid">
    <img
      v-for="photo in photos"
      :key="photo.id"
      :src="photo.url"
      :alt="photo.title"
      :data-caption="photo.title"
    />
  </lk-gallery>
</template>
```

---

## Listening to Events

All components dispatch native DOM `CustomEvent`s that bubble and are composed (they cross shadow DOM boundaries).

```js
// Carousel slide change
document.querySelector('lk-carousel').addEventListener('change', (e) => {
  console.log('Active slide index:', e.detail.index);
});

// Gallery closed
document.querySelector('lk-gallery').addEventListener('close', () => {
  console.log('Gallery closed');
});
```

---

## Programmatic Control

Components expose public methods accessible via a standard `querySelector` reference.

```js
const carousel = document.querySelector('lk-carousel');

carousel.goToNext();       // advance one slide
carousel.goToPrev();       // go back one slide
carousel.goToIndex(2);     // jump to slide index 2

const panzoom = document.querySelector('lk-panzoom');

panzoom.zoomIn();          // zoom in 1.5×
panzoom.zoomOut();         // zoom out 1.5×
panzoom.reset();           // reset pan, zoom, rotation, flip
panzoom.rotateLeft();      // rotate −90°
panzoom.rotateRight();     // rotate +90°
panzoom.toggleFlipX();     // flip horizontal
panzoom.toggleFlipY();     // flip vertical
```

---

## Next Steps

- [Carousel](../components/carousel/) — swipeable slides with multi-view and thumbnail support
- [Gallery](../components/gallery/) — modal lightbox with toolbar, thumbnails, and video support
- [Panzoom](../components/panzoom/) — standalone zoom, pan, rotate for any content
- [CSS Custom Properties](../reference/example/) — theming and layout customization
