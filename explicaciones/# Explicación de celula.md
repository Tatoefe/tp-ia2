# Explicación de celula.js

## Clase Celula

Representa una "célula" rectangular con decoración y colores propios.

### Propiedades principales

- `x, y, w, h`: Posición y tamaño.
- `frameThickness`: Grosor del marco externo.
- `numStripes`: Cantidad de líneas internas (horizontales o verticales).
- `frameColor`, `panelColor`, `rectangleBorderColor`: Colores actuales.
- `palette`: Paleta de colores asociada.
- `isHorizontal`: Orientación de las líneas internas (aleatoria).

### Métodos

- `display(pg)`: Dibuja la célula en el contexto gráfico dado (canvas o p5.Graphics). Incluye:
  - Marco externo.
  - Textura de imagen (si está cargada).
  - Panel interno con borde.
  - Líneas internas (según orientación).
- `contains(px, py)`: Verifica si un punto está dentro de la célula.
- `getPuntosEnLados(cantidad)`: Devuelve puntos equidistantes en los lados del rectángulo.
- `overlaps(other)`: Verifica si se superpone con otra célula.
- `setPosition(newX, newY)`: Cambia la posición.
- `changeColors()`: Cambia aleatoriamente los colores de marco, panel y borde.
- `resize(newWidth, newHeight)`: Cambia el tamaño y ajusta el marco.
- `getUbicacion()`: Devuelve el centro de la célula.
- `getPuntoLado(lado)`: Devuelve el punto central de un lado específico.

---
1. Constructor
Cuando creas una nueva Celula, se inicializan sus propiedades:

Posición y tamaño:

x, y: coordenadas de la esquina superior izquierda.
w, h: ancho y alto.
Apariencia:

frameThickness: grosor del marco externo.
numStripes: cantidad de líneas internas (horizontales o verticales).
frameColor: color del marco externo.
panelColor: color del panel interno.
rectangleBorderColor: color del borde del panel interno (toma el primero de la paleta).
palette: referencia a la paleta de colores usada.
colors: arrays de colores posibles para marcos, paneles y bordes, generados a partir de la paleta.
connectionColors: colores posibles para conexiones (por si se usan en la célula).
isHorizontal: orientación de las líneas internas (aleatoria al crear la célula).
2. Método display(pg)
Dibuja la célula en el contexto gráfico (pg o el canvas principal):

Dibuja el marco externo con frameColor.
Si hay imagen de textura, la aplica con transparencia y modo de mezcla.
Dibuja el panel interno con panelColor y un borde con rectangleBorderColor.
Dibuja las líneas internas:
Si isHorizontal es true, dibuja líneas horizontales.
Si es false, dibuja líneas verticales.
Quita el trazo al final.
3. contains(px, py)
Devuelve true si el punto (px, py) está dentro del rectángulo de la célula.

4. getPuntosEnLados(cantidad)
Devuelve un array de puntos equidistantes en cada lado del rectángulo, útil para conexiones.

5. overlaps(other)
Devuelve true si esta célula se superpone con otra célula other.

6. setPosition(newX, newY)
Cambia la posición de la célula a las coordenadas dadas.

7. changeColors()
Cambia aleatoriamente el color del marco, panel y borde, eligiendo de los arrays de la paleta.

8. resize(newWidth, newHeight)
Cambia el tamaño de la célula y ajusta el grosor del marco proporcionalmente.

9. getUbicacion()
Devuelve el centro de la célula (objeto {x, y}).

10. getPuntoLado(lado)
Devuelve el punto central de un lado específico (top, right, bottom, left).

Resumen:
El objeto Celula representa un rectángulo decorado, con métodos para dibujarse, detectar clics, cambiar colores, redimensionarse, y calcular puntos útiles para conexiones y layouts. Todo está pensado para que cada célula sea visualmente rica y fácil de manipular/interconectar en la composición.
