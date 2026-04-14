---
title: CSS Custom Properties
description: Complete reference of every CSS custom property exposed by Lens Kit components.
---

All Lens Kit components expose CSS custom properties that control their appearance without requiring you to touch shadow DOM internals. Set them on the host element or any ancestor in your stylesheet.

```css
/* Scope to a single instance */
lk-carousel#hero {
  --carousel-dot-size: 12px;
}

/* Or apply globally */
:root {
  --carousel-nav-bg: rgba(30, 30, 30, 0.8);
  --gallery-backdrop: rgba(0, 0, 0, 0.95);
}
```

---

## `lk-carousel`

### Images

| Property | Default | Description |
|---|---|---|
| `--carousel-aspect-ratio` | `16 / 9` | Aspect ratio applied to `<img>` elements slotted directly into the carousel. |
| `--carousel-image-fit` | `cover` | `object-fit` value for slotted `<img>` elements. Use `contain` to avoid cropping. |
| `--slide-width` | `100%` | Width of each slide. Automatically derived from the `slide-width` attribute — only override manually if you set slide width via CSS rather than the attribute. |

### Navigation buttons

| Property | Default | Description |
|---|---|---|
| `--carousel-nav-size` | `44px` | Diameter of the previous / next buttons. |
| `--carousel-nav-offset` | `16px` | Distance of the buttons from the left and right edges. |
| `--carousel-nav-bg` | `rgba(0, 0, 0, 0.55)` | Button background color. |
| `--carousel-nav-border` | `1px solid rgba(255, 255, 255, 0.2)` | Button border. |
| `--carousel-nav-color` | `#ffffff` | Button icon color. |
| `--carousel-nav-shadow` | `0 4px 14px rgba(0, 0, 0, 0.35)` | Button drop shadow. |
| `--carousel-nav-hover-bg` | `rgba(0, 0, 0, 0.75)` | Button background on hover. |
| `--carousel-nav-hover-color` | `#ffffff` | Button icon color on hover. |
| `--carousel-nav-disabled-opacity` | `0.35` | Opacity of the button at the first or last slide. |
| `--carousel-focus-outline` | `2px solid #ffffff` | Focus ring applied to nav buttons, dots, and thumbnails when focused via keyboard. |

### Dots

| Property | Default | Description |
|---|---|---|
| `--carousel-dot-size` | `10px` | Diameter of each dot. |
| `--carousel-dot-bg` | `rgba(255, 255, 255, 0.55)` | Inactive dot background. |
| `--carousel-dot-border` | `1px solid rgba(0, 0, 0, 0.25)` | Inactive dot border. |
| `--carousel-dot-opacity` | `0.35` | Inactive dot opacity. |
| `--carousel-dot-active-bg` | `#ffffff` | Active dot background. |
| `--carousel-dot-active-opacity` | `1` | Active dot opacity. |
| `--carousel-dots-gap` | `8px` | Gap between dots. |
| `--carousel-dots-margin-top` | `12px` | Space above the dot row. |
| `--carousel-dots-padding-bottom` | `12px` | Space below the dot row. |

### Thumbnails

| Property | Default | Description |
|---|---|---|
| `--carousel-thumbnail-size` | `60px` | Width and height of each thumbnail button. |
| `--carousel-thumbnail-radius` | `4px` | Thumbnail border radius. |
| `--carousel-thumbnail-border` | `2px solid rgba(255, 255, 255, 0.35)` | Inactive thumbnail border. |
| `--carousel-thumbnail-active-border-color` | `#ffffff` | Active thumbnail border color. |
| `--carousel-thumbnail-bg` | `rgba(0, 0, 0, 0.25)` | Thumbnail background (visible while image loads). |
| `--carousel-thumbnail-opacity` | `0.6` | Inactive thumbnail opacity. |
| `--carousel-thumbnails-gap` | `8px` | Gap between thumbnails. |
| `--carousel-thumbnails-margin-top` | `12px` | Space above the thumbnail strip. |
| `--carousel-thumbnails-padding-bottom` | `12px` | Space below the thumbnail strip. |

### Overlay mode

These apply when the `overlay` attribute is set on `lk-carousel`. Dots and thumbnails are positioned absolutely over the bottom of the track.

| Property | Default | Description |
|---|---|---|
| `--carousel-overlay-padding` | `20px` | Padding inside the overlay area. |
| `--carousel-overlay-padding-bottom` | `30px` | Bottom padding inside the overlay area (increase for notched screens). |
| `--carousel-overlay-background` | `linear-gradient(to top, rgba(0,0,0,0.72), transparent)` | Background of the overlay strip. |

### Example

```css
lk-carousel {
  /* Softer nav buttons */
  --carousel-nav-bg: rgba(255, 255, 255, 0.15);
  --carousel-nav-border: none;
  --carousel-nav-color: #ffffff;
  --carousel-nav-size: 40px;

  /* Square, visible dots */
  --carousel-dot-size: 8px;
  --carousel-dot-opacity: 0.5;
  --carousel-dot-active-bg: #f59e0b;
  --carousel-dot-active-opacity: 1;

  /* Larger thumbnails */
  --carousel-thumbnail-size: 80px;
  --carousel-thumbnail-active-border-color: #f59e0b;
}
```

---

## `lk-gallery`

### Grid layout

Only applies when `layout="grid"`.

| Property | Default | Description |
|---|---|---|
| `--gallery-cols` | `auto-fit` | Number of columns. Use a number like `3` for a fixed count, or keep `auto-fit` to fill available width. |
| `--gallery-min-width` | `150px` | Minimum column width before the grid wraps. Ignored when `--gallery-cols` is a fixed number. |
| `--gallery-gap` | `16px` | Gap between grid items. |
| `--gallery-image-height` | `150px` | Fixed height of thumbnail images in the grid. |
| `--gallery-image-fit` | `cover` | `object-fit` value for grid thumbnail images. |
| `--gallery-radius` | `8px` | Border radius of grid thumbnail images. |

### Modal

| Property | Default | Description |
|---|---|---|
| `--gallery-backdrop` | `rgba(0, 0, 0, 0.9)` | Color of the `<dialog>` backdrop overlay behind the modal. |
| `--gallery-modal-color` | `#ffffff` | Default text color inside the modal. |
| `--gallery-modal-background` | `transparent` | Modal content area background. |
| `--gallery-modal-fullscreen-background` | `#111111` | Modal content background when in fullscreen mode. |
| `--gallery-reserved-ui-height` | `150px` | Height reserved for toolbar and caption when calculating the maximum height of modal images. Reduce if your toolbar is hidden. |

### Caption

| Property | Default | Description |
|---|---|---|
| `--gallery-caption-color` | `#ffffff` | Caption text color. |
| `--gallery-caption-background` | `linear-gradient(to top, rgba(0,0,0,0.7), transparent)` | Caption background gradient. |
| `--gallery-caption-with-thumbnails-bottom` | `64px` | Bottom offset of the caption when `show-thumbnails` is active, to avoid overlap with the thumbnail strip. |

### Toolbar

| Property | Default | Description |
|---|---|---|
| `--gallery-toolbar-background` | `linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)` | Toolbar background gradient. |
| `--gallery-counter-color` | `#ffffff` | Slide counter text color (e.g. "2 / 5"). |
| `--gallery-divider-width` | `1px` | Width of the `\|` divider element in the toolbar. |
| `--gallery-divider-height` | `20px` | Height of the divider. |
| `--gallery-divider-color` | `rgba(255, 255, 255, 0.4)` | Divider color. |
| `--gallery-divider-opacity` | `1` | Divider opacity. |
| `--gallery-divider-margin` | `0 8px` | Margin around the divider. |
| `--gallery-action-size` | `36px` | Minimum width and height of toolbar action buttons. |
| `--gallery-action-padding` | `6px` | Padding inside action buttons. |
| `--gallery-action-bg` | `rgba(0, 0, 0, 0.5)` | Action button background. |
| `--gallery-action-border` | `1px solid rgba(255, 255, 255, 0.25)` | Action button border. |
| `--gallery-action-radius` | `999px` | Action button border radius. |
| `--gallery-action-color` | `#ffffff` | Action button icon color. |
| `--gallery-action-shadow` | `0 2px 10px rgba(0, 0, 0, 0.25)` | Action button drop shadow. |
| `--gallery-action-hover-bg` | `rgba(0, 0, 0, 0.7)` | Action button background on hover. |
| `--gallery-action-hover-color` | `#ffffff` | Action button icon color on hover. |
| `--gallery-action-hover-border-color` | `rgba(255, 255, 255, 0.45)` | Action button border color on hover. |
| `--gallery-focus-outline` | `2px solid #ffffff` | Focus ring for toolbar action buttons. |

### Example

```css
lk-gallery {
  /* Grid layout */
  --gallery-cols: 4;
  --gallery-min-width: 140px;
  --gallery-gap: 8px;
  --gallery-image-height: 160px;
  --gallery-radius: 4px;

  /* Modal */
  --gallery-backdrop: rgba(0, 0, 0, 0.95);

  /* Toolbar accent color */
  --gallery-action-bg: rgba(245, 158, 11, 0.2);
  --gallery-action-border: 1px solid rgba(245, 158, 11, 0.5);
  --gallery-action-hover-bg: rgba(245, 158, 11, 0.4);
}
```

---

## `lk-panzoom`

`lk-panzoom` does not expose CSS custom properties — its internals are fully managed via JavaScript state. Control its dimensions by styling the host element from outside the shadow DOM.

```css
lk-panzoom {
  width: 100%;
  height: 500px;
  display: block;
}
```
