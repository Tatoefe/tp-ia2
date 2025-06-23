# Explicación de conexiones.js

## Clase Conexion

Representa una conexión visual entre dos células, dibujada como una línea en "L".

### Propiedades

- `celula1`, `celula2`: Células conectadas.
- `lado1`, `lado2`: Lados de cada célula donde inicia/termina la conexión.
- `color`: Color actual de la conexión.
- `p1`, `p2`: Puntos de inicio y fin de la conexión (en los lados de las células).

### Métodos

- `display(pg)`: Dibuja la conexión como una línea en "L" (dos segmentos) en el contexto gráfico.
- `getPuntoConexion(celula, lado, offset)`: Calcula un punto desplazado hacia adentro en el lado indicado.
- `isNear(mx, my)`: Verifica si el mouse está cerca de la conexión (para interacción).
- `changeColor()`: Cambia el color de la conexión a uno aleatorio de la paleta.

## Funciones auxiliares

- `distToSegment(px, py, a, b)`: Distancia de un punto a un segmento.
- `getPuntoLado(celula, lado)`: Devuelve el punto central de un lado de la célula.
- `generarConexiones(celulas, palette)`: Genera conexiones entre células, evitando que crucen otras células.
- `crearMejorConexion(...)`: Busca la mejor conexión posible entre dos células.
- `yaExisteConexion(...)`: Verifica si ya existe una conexión entre dos células.
- `LcruzaOtraCelula(...)`: Verifica si una conexión en "L" cruza otra célula.

---
1. Constructor
Cuando creas una nueva Conexion, se inicializan sus propiedades:

celula1, celula2:
Las dos células que se conectan.

lado1, lado2:
El lado de cada célula donde comienza y termina la conexión (puede ser "top", "right", "bottom" o "left").

color:
El color de la conexión, tomado de la paleta activa.

p1, p2:
Los puntos de inicio y fin de la conexión, calculados en el centro del lado correspondiente de cada célula.

2. display(pg)
Dibuja la conexión en el contexto gráfico (pg):

Calcula los puntos de inicio (p1) y fin (p2) en los lados de las células.
Dibuja la conexión como una línea en "L":
Un segmento desde p1 hasta un punto intermedio alineado en X o Y.
Otro segmento desde ese punto intermedio hasta p2.
Usa el color de la conexión y un grosor definido.
3. getPuntoConexion(celula, lado, offset)
Calcula un punto desplazado hacia adentro desde el borde de la célula, útil para que la conexión no quede pegada al borde.

4. isNear(mx, my)
Devuelve true si el punto (mx, my) está cerca de la línea de la conexión (útil para detectar clics sobre la conexión).

5. changeColor()
Cambia el color de la conexión a uno aleatorio de la paleta de conexiones.

6. Funciones auxiliares relacionadas
distToSegment(px, py, a, b):
Calcula la distancia mínima de un punto a un segmento de línea (usado en isNear).

getPuntoLado(celula, lado):
Devuelve el punto central de un lado específico de una célula.

generarConexiones(celulas, palette):
Genera todas las conexiones posibles entre las células, buscando siempre la conexión más corta y evitando cruces innecesarios.

crearMejorConexion(...):
Busca la mejor conexión posible entre dos células, considerando todos los lados.

yaExisteConexion(...):
Verifica si ya existe una conexión entre dos células para evitar duplicados.

LcruzaOtraCelula(...):
Verifica si una conexión en "L" cruza otra célula (para evitar conexiones que atraviesen paneles).

Resumen:
El objeto Conexion representa una línea visual entre dos células, calculando automáticamente los puntos de unión más convenientes y permitiendo interacción (cambio de color, detección de clics). Su lógica asegura que las conexiones sean claras, visualmente agradables y no se crucen innecesariamente con otras células.