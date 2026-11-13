# reference/

Archivos originales del diseño:

- `Main.dc.html` (identidad y sistema) y `01-…` a `20-….dc.html`: una pantalla o grupo de estados por archivo. Son HTML con CSS y SVG; sirven como **fuente exacta de textos, medidas, colores y trazados**.
- `arco.css`: clases y variables de color compartidas, además de los `@keyframes` (ola, carga).
- `canvas.json`: posición y tamaño de cada canvas en el lienzo del diseño (útil para entender el orden).

Los `.dc.html` están pensados para el editor donde se diseñaron (usan etiquetas propias como `<x-dc>`, `<sc-if>` y un script `support.js` que no se incluye). **Para verlos en un navegador usa la carpeta `preview/`**, que es la misma maquetación con la ruta del CSS corregida. No copies esas etiquetas propias a la implementación: reconstruye cada pantalla con la tecnología elegida.
