# Explicación de sketch.js

## Descripción general

El archivo `sketch.js` es el núcleo del proyecto visual interactivo. Utiliza la librería p5.js para generar composiciones de "células" (rectángulos decorados) y conexiones entre ellas, con diferentes paletas de color y layouts automáticos. Permite la interacción mediante teclado, mouse **y sonido** (micrófono) para modificar la composición en tiempo real.

## Paletas de colores

- El array `COLOR_PALETTES` contiene varias paletas, cada una con colores para el fondo, marcos externos, paneles internos, bordes de rectángulos y conexiones.
- Cada paleta es un objeto con arrays de colores en formato HSB.
- Cambiar de paleta afecta todos los colores de la composición.

## Generación de layouts y células

- La clase `LayoutGenerator` genera posiciones y tamaños para las células, evitando superposiciones y asegurando que algunas estén en los bordes.
- Los layouts varían según la cantidad de células (3, 4 o 9).
- Cada célula se instancia con colores y parámetros aleatorios dentro de la paleta activa.

## Conexiones

- Las conexiones se generan automáticamente entre las células, buscando la menor distancia tipo "L" (Manhattan) entre los lados de los rectángulos.
- El color de cada conexión se toma cíclicamente de la paleta activa.

## Interacción con el teclado

- **Teclas 1 a 5**: Muestran una de las 5 composiciones pre-generadas. Si no existe, la crea.
- **ENTER**: Cambia aleatoriamente los colores de todas las células de la composición actual.
- **C/c**: Muestra u oculta las conexiones entre células en todas las composiciones.
- **Espacio**: Cambia la paleta de colores y regenera todas las composiciones.
- **B/b**: Elimina la última célula de la composición actual.
- **S/s**: Agrega una nueva célula en una posición libre (máximo 9).

## Interacción con el mouse

- **Click sobre una célula**: Cambia sus colores aleatoriamente.
- **Click sobre una conexión**: Cambia su color aleatoriamente (si las conexiones están visibles).

## Interacción por sonido (micrófono)

- El sistema analiza el volumen capturado por el micrófono y lo clasifica en tres rangos: **bajo**, **medio** y **alto**.
- Cada rango de volumen activa una acción diferente, similar a las teclas o clicks:
  - **Volumen bajo**: Genera una nueva composición (análogo a teclas 1-5).
  - **Volumen medio**: Cambia los colores de las células (análogo a click en célula).
  - **Volumen alto**: Cambia la paleta y regenera todas las composiciones (análogo a barra espaciadora).
- Los umbrales de volumen se pueden ajustar con la variable `vol` para calibrar la sensibilidad según el micrófono.
- Se utiliza un sistema de "flags" y control temporal para evitar que las acciones se disparen repetidamente mientras se mantiene el mismo rango de volumen.

## Flujo principal

1. En `setup()`, se crean 5 composiciones con cantidades aleatorias de células.
2. En `draw()`, se dibuja la composición seleccionada y se actualizan las referencias a las células y conexiones actuales.
3. Se visualizan en pantalla los valores de volumen, graves, medios, agudos y los umbrales actuales para facilitar la calibración.
4. Las funciones de teclado, mouse y sonido permiten modificar la composición en tiempo real.

---

**Resumen:**  
El archivo `sketch.js` gestiona la lógica principal del proyecto: inicialización, interacción, generación y dibujo de las composiciones, células y conexiones, así como el manejo de las paletas de color y la actualización visual en respuesta a las acciones del usuario. Ahora, además de teclado y mouse, la obra responde a la voz y sonidos captados por el micrófono, permitiendo una experiencia interactiva multimodal y adaptable.

