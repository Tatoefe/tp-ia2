class Celula {
  constructor(x, y, w, h, frameThickness, numStripes, frameColor, panelColor, palette) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.frameThickness = frameThickness;
    this.numStripes = numStripes;
    this.frameColor = frameColor;
    this.panelColor = panelColor;
    this.palette = palette;
    this.colors = {
      frames: palette.externalFrame.map(c => color(c[0], c[1], c[2])),
      panels: palette.rectangles.map(c => color(c[0], c[1], c[2])),
      borders: palette.rectangleBorders.map(c => color(c[0], c[1], c[2]))
    };
    this.rectangleBorderColor = this.colors.borders[0]; // Primer color de bordes
    this.connectionColors = palette.connections.map(c => color(c[0], c[1], c[2]));
    // Determinar orientación aleatoria: true para horizontal, false para vertical
    this.isHorizontal = random() > 0.5;
  }
  
display(pg) {
    let ctx = pg || window;
    // Marco
    ctx.fill(this.frameColor);
    ctx.noStroke();
    ctx.rect(this.x, this.y, this.w, this.h);

    // Textura
    if (img) {
      ctx.push();
      ctx.blendMode(SOFT_LIGHT);
      ctx.tint(255, 120);
      ctx.image(img, this.x, this.y, this.w, this.h);
      ctx.noTint();
      ctx.blendMode(BLEND);
      ctx.pop();
    }

    // Borde interior
    ctx.stroke(this.rectangleBorderColor);
    ctx.strokeWeight(4);
    ctx.fill(this.panelColor);
    ctx.rect(
      this.x + this.frameThickness,
      this.y + this.frameThickness,
      this.w - this.frameThickness * 2,
      this.h - this.frameThickness * 2
    );

    // Líneas internas
    if (this.isHorizontal) {
      let stripeHeight = (this.h - this.frameThickness * 2) / this.numStripes;
      for (let i = 1; i < this.numStripes; i++) {
        ctx.line(
          this.x + this.frameThickness,
          this.y + this.frameThickness + i * stripeHeight,
          this.x + this.w - this.frameThickness,
          this.y + this.frameThickness + i * stripeHeight
        );
      }
    } else {
      let stripeWidth = (this.w - this.frameThickness * 2) / this.numStripes;
      for (let i = 1; i < this.numStripes; i++) {
        ctx.line(
          this.x + this.frameThickness + i * stripeWidth,
          this.y + this.frameThickness,
          this.x + this.frameThickness + i * stripeWidth,
          this.y + this.h - this.frameThickness
        );
      }
    }
    ctx.noStroke();
  }
  
  // Verifica si un punto (px, py) está dentro de la celula
  contains(px, py) {
    return (px > this.x && px < this.x + this.w &&
            py > this.y && py < this.y + this.h);
  }

  getPuntosEnLados(cantidad = 3) {
  let puntos = [];

  // TOP
  for (let i = 1; i <= cantidad; i++) {
    puntos.push({
      punto: {
        x: this.x + (this.w * i) / (cantidad + 1),
        y: this.y
      },
      lado: 'top'
    });
  }

  // RIGHT
  for (let i = 1; i <= cantidad; i++) {
    puntos.push({
      punto: {
        x: this.x + this.w,
        y: this.y + (this.h * i) / (cantidad + 1)
      },
      lado: 'right'
    });
  }

  // BOTTOM
  for (let i = 1; i <= cantidad; i++) {
    puntos.push({
      punto: {
        x: this.x + (this.w * i) / (cantidad + 1),
        y: this.y + this.h
      },
      lado: 'bottom'
    });
  }

  // LEFT
  for (let i = 1; i <= cantidad; i++) {
    puntos.push({
      punto: {
        x: this.x,
        y: this.y + (this.h * i) / (cantidad + 1)
      },
      lado: 'left'
    });
  }

  return puntos;
}
  
  // Verifica si esta célula se superpone con otra
  overlaps(other) {
    return !(this.x + this.w < other.x || 
             other.x + other.w < this.x || 
             this.y + this.h < other.y || 
             other.y + other.h < this.y);
  }
  
  // Reubica la celula a una nueva posición específica
  setPosition(newX, newY) {
    this.x = newX;
    this.y = newY;
  }
  
  // Cambia ambos colores (marco y panel) aleatoriamente
  changeColors() {
    this.frameColor = random(this.colors.frames);
    this.panelColor = random(this.colors.panels);
    this.rectangleBorderColor = random(this.colors.borders);
  }
  
  // Redimensiona la célula
  resize(newWidth, newHeight) {
    this.w = newWidth;
    this.h = newHeight;
    // Ajustar el grosor del marco proporcionalmente
    this.frameThickness = max(10, min(20, newWidth * 0.1, newHeight * 0.1));
  }

  // Devuelve la ubicación central de la célula
  getUbicacion() {
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2
    };
  }

  getPuntoLado(lado) {
    switch (lado) {
      case 'top':
        return { x: this.x + this.w / 2, y: this.y };
      case 'right':
        return { x: this.x + this.w, y: this.y + this.h / 2 };
      case 'bottom':
        return { x: this.x + this.w / 2, y: this.y + this.h };
      case 'left':
        return { x: this.x, y: this.y + this.h / 2 };
      default:
        return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
    }
  }
}