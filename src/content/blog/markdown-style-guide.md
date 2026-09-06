---
title: 'Guia de estilo para Markdown'
description: 'Una muestra de la sintaxis basica de Markdown disponible al escribir contenido en Astro.'
pubDate: 'Jun 19 2024'
heroImage: '../../assets/blog-placeholder-1.jpg'
---

Esta pagina presenta algunos de los elementos de Markdown que puedes usar al publicar contenido en Astro.

## Encabezados

Los elementos HTML desde `<h1>` hasta `<h6>` representan seis niveles de encabezados. `<h1>` es el nivel mas alto y `<h6>` el mas bajo.

# Encabezado 1
## Encabezado 2
### Encabezado 3
#### Encabezado 4

## Parrafos

Un parrafo organiza ideas relacionadas y facilita una lectura pausada. Deja una linea vacia entre dos bloques de texto para crear parrafos separados.

## Imagenes

```markdown
![Texto alternativo](./ruta/de/la/imagen)
```

![Imagen de ejemplo](../../assets/blog-placeholder-about.jpg)

## Citas

Una cita en bloque representa contenido tomado de otra fuente o una idea que merece una pausa visual.

> No compartas informacion comunicandote; comunicate compartiendo informacion.<br>
> - Rob Pike

## Tablas

| Cursiva    | Negrita      | Codigo   |
| ---------- | ------------- | -------- |
| _cursiva_  | **negrita**   | `codigo` |

## Bloques de codigo

Escribe tres acentos graves, indica el lenguaje y cierra el bloque con otros tres.

```html
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Documento de ejemplo</title></head>
  <body><p>Prueba</p></body>
</html>
```

## Listas

1. Primer elemento
2. Segundo elemento
3. Tercer elemento

- Fruta
  - Manzana
  - Naranja
- Lacteos
  - Leche
  - Queso

## Otros elementos

Puedes usar <abbr title="Formato de Intercambio de Graficos">GIF</abbr>, H<sub>2</sub>O, X<sup>n</sup>, <kbd>CTRL</kbd> y <mark>texto resaltado</mark> directamente dentro de Markdown.
