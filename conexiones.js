// Genera conexiones para unir todas las células en un árbol, evitando cruces y pasando por el camino más corto posible
function generarConexiones(celulas, palette) {
  let conexiones = [];
  if (celulas.length < 2) return conexiones;

  let conectadas = new Set([0]);
  let colorIndex = 0;

  while (conectadas.size < celulas.length) {
    let mejor = null;
    let mejorJ = -1;
    let mejorDist = Infinity;
    let mejorLado1 = '';
    let mejorLado2 = '';

    for (let i of conectadas) {
      for (let j = 0; j < celulas.length; j++) {
        if (conectadas.has(j)) continue;
        let c1 = celulas[i];
        let c2 = celulas[j];
        let lados = ['top', 'right', 'bottom', 'left'];

        for (let l1 of lados) {
          for (let l2 of lados) {
            let p1 = c1.getPuntoLado(l1);
            let p2 = c2.getPuntoLado(l2);
            let d = abs(p1.x - p2.x) + abs(p1.y - p2.y);

            // Verificar que la conexión no cruce ninguna existente ni pase por otras células
            let cruza = conexiones.some(con => linesIntersect(p1, p2, con.p1, con.p2));
            let pasaPorOtra = LcruzaOtraCelula(p1, p2, celulas, c1, c2);

            if (!cruza && !pasaPorOtra && d < mejorDist) {
              mejorDist = d;
              mejor = { c1, c2, l1, l2, p1, p2 };
              mejorJ = j;
              mejorLado1 = l1;
              mejorLado2 = l2;
            }
          }
        }
      }
    }

    if (mejor) {
      let colorConexion = colorDePaleta(palette, colorIndex++);
      let conexion = new Conexion(
        mejor.c1, mejor.c2, mejorLado1, mejorLado2, colorConexion
      );
      conexiones.push(conexion);
      conectadas.add(mejorJ);
    } else {
      break;
    }
  }
  return conexiones;
}

class Conexion {
  constructor(celula1, celula2, lado1, lado2, color) {
    this.celula1 = celula1;
    this.celula2 = celula2;
    this.lado1 = lado1;
    this.lado2 = lado2;
    this.color = color;

    // Calcula la distancia entre los centros de las células
    const centro1 = celula1.getUbicacion();
    const centro2 = celula2.getUbicacion();
    const distanciaCentros = dist(centro1.x, centro1.y, centro2.x, centro2.y);

    // Offset base (grosor del marco o valor fijo)
    let baseOffset = Math.min(celula1.frameThickness || 12, celula2.frameThickness || 12);
    let offset = Math.min(baseOffset, Math.max(2, distanciaCentros / 2.5));
    this.offset = offset;

    // Calcula puntos de conexión desplazados hacia adentro
    this.p1 = this.getPuntoConexion(this.celula1, this.lado1, offset);
    this.p2 = this.getPuntoConexion(this.celula2, this.lado2, offset);
  }

  display(pg) {
    let ctx = pg || window;
    ctx.stroke(this.color);
    ctx.strokeWeight(20);
    ctx.noFill();
    ctx.beginShape();
    ctx.vertex(this.p1.x, this.p1.y);
    let puntoIntermedio = { x: this.p1.x, y: this.p2.y };
    ctx.vertex(puntoIntermedio.x, puntoIntermedio.y);
    ctx.vertex(this.p2.x, this.p2.y);
    ctx.endShape();
  }

  getPuntoConexion(celula, lado, offset) {
    const margen = 0.18;
    let x, y;
    if (lado === 'top' || lado === 'bottom') {
      let min = celula.x + celula.w * margen;
      let max = celula.x + celula.w * (1 - margen);
      x = random(min, max);
      y = (lado === 'top') ? celula.y + offset : celula.y + celula.h - offset;
    } else {
      let min = celula.y + celula.h * margen;
      let max = celula.y + celula.h * (1 - margen);
      y = random(min, max);
      x = (lado === 'left') ? celula.x + offset : celula.x + celula.w - offset;
    }
    return { x, y };
  }

  isNear(mx, my) {
    let p1 = this.p1;
    let p2 = this.p2;
    let inter = { x: p1.x, y: p2.y };
    let d1 = distToSegment(mx, my, p1, inter);
    let d2 = distToSegment(mx, my, inter, p2);
    return min(d1, d2) < 20;
  }

  changeColor() {
    // Cambia el color de la conexión a uno aleatorio de la paleta actual
    let palette = COLOR_PALETTES[currentPaletteIndex];
    let idx = floor(random(palette.connections.length));
    let colorHSB = palette.connections[idx];
    this.color = color(colorHSB[0], colorHSB[1], colorHSB[2]);
  }
}

// Utilidad: distancia punto-segmento
function distToSegment(px, py, a, b) {
  let l2 = sq(b.x - a.x) + sq(b.y - a.y);
  if (l2 === 0) return dist(px, py, a.x, a.y);
  let t = ((px - a.x) * (b.x - a.x) + (py - a.y) * (b.y - a.y)) / l2;
  t = max(0, min(1, t));
  return dist(px, py, a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
}

// Utilidad: punto central de un lado de la célula
function getPuntoLado(celula, lado) {
  switch(lado) {
    case 'top':    return { x: celula.x + celula.w / 2, y: celula.y };
    case 'right':  return { x: celula.x + celula.w, y: celula.y + celula.h / 2 };
    case 'bottom': return { x: celula.x + celula.w / 2, y: celula.y + celula.h };
    case 'left':   return { x: celula.x, y: celula.y + celula.h / 2 };
  }
  return { x: celula.x, y: celula.y };
}

// Verifica si un segmento (horizontal o vertical) cruza una celula
function segmentoCruzaCelula(x1, y1, x2, y2, celula) {
  let minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  let minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
  let segRect = {x1: minX, y1: minY, x2: maxX, y2: maxY};
  let celRect = {
    x1: celula.x, y1: celula.y,
    x2: celula.x + celula.w, y2: celula.y + celula.h
  };
  return rectsIntersect(segRect.x1, segRect.y1, segRect.x2, segRect.y2, celRect.x1, celRect.y1, celRect.x2, celRect.y2);
}

// Verifica si una conexión en L cruza otra célula
function LcruzaOtraCelula(p1, p2, celulas, c1, c2) {
  let intermedio1 = {x: p1.x, y: p2.y};
  let intermedio2 = {x: p2.x, y: p1.y};
  for (let cel of celulas) {
    if (cel === c1 || cel === c2) continue;
    if (
      segmentoCruzaCelula(p1.x, p1.y, intermedio1.x, intermedio1.y, cel) ||
      segmentoCruzaCelula(intermedio1.x, intermedio1.y, p2.x, p2.y, cel) ||
      segmentoCruzaCelula(p1.x, p1.y, intermedio2.x, intermedio2.y, cel) ||
      segmentoCruzaCelula(intermedio2.x, intermedio2.y, p2.x, p2.y, cel)
    ) return true;
  }
  return false;
}

// Rectángulos se intersectan
function rectsIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  return !(bx2 < ax1 || bx1 > ax2 || by2 < ay1 || by1 > ay2);
}