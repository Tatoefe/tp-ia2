// Color Palettes using HSB color mode
const COLOR_PALETTES = [
  {
    background: [280, 8, 15],
    externalFrame: [
      [332, 97, 65],
      [95, 75, 55],
      [186, 98, 25]
    ],
    rectangles: [
      [231, 50, 85],
      [11, 98, 95]
    ],
    rectangleBorders: [
      [33, 98, 95],
      [277, 79, 49]
    ],
    connections: [
      [186, 98, 65],
      [2, 90, 41]
    ]
  },
  {
    background: [62, 98, 95],
    externalFrame: [
      [220, 98, 55],
      [152, 97, 37],
      [338, 98, 95]
    ],
    rectangles: [
      [338, 98, 95]
    ],
    rectangleBorders: [
      [152, 91, 40],
      [270, 53, 56]
    ],
    connections: [
      [335, 100, 79],
      [120, 92, 68]
    ]
  },
  {
    background: [332, 64, 95],
    externalFrame: [
      [62, 98, 85],
      [0, 100, 69],
      [211, 71, 45],
      [22, 89, 95]
    ],
    rectangles: [
      [79, 97, 85],
      [329, 96, 69],
      [224, 22, 72],
      [11, 98, 95]
    ],
    rectangleBorders: [
      [102, 73, 59],
      [350, 89, 87],
      [191, 63, 25],
      [54, 65, 83]
    ],
    connections: [
      [195, 49, 67],
      [287, 37, 52],
      [106, 32, 77]
    ]
  },
  {
    background: [62, 98, 95],
    externalFrame: [
      [6, 85, 100],
      [33, 98, 95],
      [45, 99, 100],
      [260, 33, 82],
      [238, 53, 88],
      [332, 27, 100],
      [91, 86, 95],
      [209, 91, 75]
    ],
    rectangles: [
      [206, 25, 90],
      [327, 72, 95],
      [79, 79, 93],
      [65, 54, 91],
      [205, 55, 90]
    ],
    rectangleBorders: [
      [349, 98, 95],
      [248, 19, 81],
      [197, 43, 86],
      [155, 100, 55]
    ],
    connections: [
      [134, 100, 56],
      [355, 89, 100],
      [233, 79, 61],
      [227, 32, 87]
    ]
  }
];

//Variables globales

let img;
let backgroundColor;
let currentPaletteIndex = 0;
let graphicsArray = [null, null, null, null, null];
let graphicsData = [null, null, null, null, null];
let currentGraphicIndex = -1;
let currentCelulas = [];
let currentConexiones = [];
let showConnections = true;

let sonidoInteractivo;
let vol = 10; // Ajusta este valor según tu micrófono. Más bajo, más sensibilidad. Más alto, menos sensibilidad.

// Constantes para el sonido interactivo
const VOLUMEN_BAJO = 0.035 * vol;
const VOLUMEN_MEDIO = 0.05 * vol;
const VOLUMEN_ALTO = 0.09 * vol;
const FRAMES_UMBRAL = 1; // Sostenimiento de frames para activar acciones

let ultimaAccionVolumen = "ninguna";
let framesVolumenBajo = 0;
let framesVolumenMedio = 0;
let framesVolumenAlto = 0;

let bajoActivo = false;
let medioActivo = false;
let altoActivo = false;

// --- Nuevas constantes y funciones para el control por tono ---
const PITCH_MIN = 100;
const PITCH_MAX = 400;
const RANGOS = 6;
let framesPitchGrave = 0;
const PITCH_GRAVE_UMBRAL = 150; // Hz, ajusta según tu voz/micrófono
const FRAMES_PITCH_GRAVE = 60;  // 60 frames ≈ 1 segundo a 60fps
let graveActivo = false;

let framesGrave = 0;
const GRAVE_UMBRAL = 120; // Ajusta este valor según tu entorno y micrófono
const FRAMES_GRAVE = 60;  // 60 frames ≈ 1 segundo a 60fps


let volumenAnterior = 0;
const PITCH_UPDATE_INTERVAL = 100; // Intervalo en milisegundos para actualizar el gráfico por tono

let framesAgudo = 0;
const AGUDO_UMBRAL = 400; // Hz
const FRAMES_AGUDO = 20;  // 1 segundo a 60fps
let agudoActivo = false;

let framesMid = 0;
let lastMidChange = 0;
let showDataOverlay = true;

function pitchToCellCount(pitch) {
  if (pitch < 100) return ultimoCellCount; // No modificar células si el pitch está en el rango de graves
  let p = constrain(pitch, PITCH_MIN, PITCH_MAX);
  let rango = floor(map(p, PITCH_MIN, PITCH_MAX, 0, RANGOS));
  return CELULAS_MIN + rango;
}

// Utilidad para obtener la distancia Manhattan (L)
function distanciaL(p1, p2) {
  return abs(p1.x - p2.x) + abs(p1.y - p2.y);
}

// Utilidad para obtener un color de la paleta de conexiones (cíclico)
function colorDePaleta(palette, idx) {
  let colorHSB = palette.connections[idx % palette.connections.length];
  return color(colorHSB[0], colorHSB[1], colorHSB[2]);
}

// Genera conexiones entre células (árbol mínimo, sin cruces)
function generarConexiones(celulas, palette) {
  let conexiones = [];
  if (celulas.length < 2) return conexiones;

  let conectadas = new Set([0]);
  let colorIndex = 0;

  while (conectadas.size < celulas.length) {
    let mejor = null;
    let mejorI = -1;
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
            let d = distanciaL(p1, p2);
            if (d < mejorDist) {
              mejorDist = d;
              mejor = { c1, c2, l1, l2 };
              mejorI = i;
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
      conexiones.push(new Conexion(
        mejor.c1, mejor.c2, mejorLado1, mejorLado2, colorConexion
      ));
      conectadas.add(mejorJ);
    } else {
      break;
    }
  }

  return conexiones;
}

// Clase para generar distribuciones de células sin superposición
class LayoutGenerator {
  constructor(canvasWidth, canvasHeight, numCells) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.numCells = Math.max(3, numCells);
    this.minSeparation = 18;
    this.TARGET_COVERAGE = 0.70;
    this.COVERAGE_TOLERANCE = 0.05;
    this.MIN_CELL_SIZE = Math.min(canvasWidth, canvasHeight) * 0.08;
  }

  checkForOverlaps(positions) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (this.doRectsOverlap(positions[i], positions[j], this.minSeparation)) {
          return true;
        }
      }
    }
    return false;
  }

  doRectsOverlap(a, b, minSep = 0) {
    return !(
      a.x + a.width + minSep <= b.x ||
      b.x + b.width + minSep <= a.x ||
      a.y + a.height + minSep <= b.y ||
      b.y + b.height + minSep <= a.y
    );
  }

  generateLayout() {
    const n = this.numCells;
    const areaObjetivo = this.TARGET_COVERAGE * this.canvasWidth * this.canvasHeight;
    const maxTriesPerCell = 200;
    const maxGlobalTries = 100;
    let globalTries = 0;

    let cellAreas, aspectRatios, sizes;

    function generarAreasYAspectRatios() {
      let randomFactors = [];
      let total = 0;
      for (let i = 0; i < n; i++) {
        let f = random(0.8, 1.2);
        randomFactors.push(f);
        total += f;
      }
      cellAreas = randomFactors.map(f => (f / total) * areaObjetivo);
      aspectRatios = [];
      for (let i = 0; i < n; i++) aspectRatios.push(random(0.7, 1.4));
      sizes = aspectRatios.map((r, i) => {
        let w = sqrt(cellAreas[i] * r);
        let h = cellAreas[i] / w;
        return { w, h };
      });
    }

    let bestPositions = [];
    let bestCoverage = 0;

    while (globalTries < maxGlobalTries) {
      generarAreasYAspectRatios();
      let positions = [];
      let totalAreaColocada = 0;

      for (let i = 0; i < n; i++) {
        let w = sizes[i].w;
        let h = sizes[i].h;
        let placed = false;
        let tries = 0;
        let lado = null;
        if (i < Math.min(n, 4)) {
          let lados = ['left', 'right', 'top', 'bottom'];
          lado = lados[i % 4];
        }
        while (tries < maxTriesPerCell && !placed) {
          let x, y;
          if (lado === 'left') {
            x = 0;
            y = random(0, this.canvasHeight - h);
          } else if (lado === 'right') {
            x = this.canvasWidth - w;
            y = random(0, this.canvasHeight - h);
          } else if (lado === 'top') {
            x = random(0, this.canvasWidth - w);
            y = 0;
          } else if (lado === 'bottom') {
            x = random(0, this.canvasWidth - w);
            y = this.canvasHeight - h;
          } else {
            x = random(0, this.canvasWidth - w);
            y = random(0, this.canvasHeight - h);
          }
          let pos = { x, y, width: w, height: h };
          let overlaps = positions.some(other => this.doRectsOverlap(pos, other, this.minSeparation));
          if (!overlaps) {
            positions.push(pos);
            totalAreaColocada += w * h;
            placed = true;
          }
          tries++;
        }
        if (!placed) {
          sizes[i].w *= 0.9;
          sizes[i].h *= 0.9;
          if (sizes[i].w < this.MIN_CELL_SIZE || sizes[i].h < this.MIN_CELL_SIZE) {
            break;
          }
          i--;
        }
      }

      let coverage = totalAreaColocada / (this.canvasWidth * this.canvasHeight);
      if (!this.checkForOverlaps(positions) && coverage > bestCoverage) {
        bestCoverage = coverage;
        bestPositions = positions.map(p => ({...p}));
        if (coverage >= 0.65 && coverage <= 0.75) {
          return bestPositions;
        }
      }
      globalTries++;
    }
    return bestPositions;
  }
}

// Utilidad para crear una célula desde una posición y paleta
function crearCelulaDesdePos(pos, palette) {
  let w = pos.width;
  let h = pos.height;
  let frameThickness = max(10, min(20, w * 0.1));
  let numStripes = floor(random(3, 5));
  let frameColorArr = random(palette.externalFrame);
  let panelColorArr = random(palette.rectangles);
  let frameColor = color(frameColorArr[0], frameColorArr[1], frameColorArr[2]);
  let panelColor = color(panelColorArr[0], panelColorArr[1], panelColorArr[2]);
  return new Celula(
    pos.x, pos.y, w, h,
    frameThickness, numStripes,
    frameColor, panelColor,
    palette
  );
}

// Refactoriza la suma/resta de células en keyPressed()
function regenerarCelulasYConexiones(nuevoCount) {
  let palette = COLOR_PALETTES[currentPaletteIndex];
  let layoutGenerator = new LayoutGenerator(width, height, nuevoCount);
  let positions = layoutGenerator.generateLayout();
  let newCelulas = positions.map(pos => crearCelulaDesdePos(pos, palette));
  let newConexiones = generarConexiones(newCelulas, palette);
  currentCelulas = newCelulas;
  currentConexiones = newConexiones;
  if (currentGraphicIndex >= 0) {
    graphicsData[currentGraphicIndex].celulas = newCelulas;
    graphicsData[currentGraphicIndex].conexiones = newConexiones;
    let pg = createGraphics(width, height);
    pg.colorMode(HSB, 360, 100, 100);
    pg.background(palette.background[0], palette.background[1], palette.background[2]);
    if (showConnections) {
      for (let conexion of newConexiones) conexion.display(pg);
    }
    for (let celula of newCelulas) celula.display(pg);
    graphicsArray[currentGraphicIndex] = pg;
    graphicsData[currentGraphicIndex].pg = pg;
  }
}

// Genera un p5.Graphics con n células y sus conexiones
function createCellGraphic(cellCount) {
  let pg = createGraphics(width, height);
  pg.colorMode(HSB, 360, 100, 100);
  let palette = COLOR_PALETTES[currentPaletteIndex];
  pg.background(palette.background[0], palette.background[1], palette.background[2]);
  let layoutGenerator = new LayoutGenerator(width, height, cellCount);
  let positions = layoutGenerator.generateLayout();
  let tempCelulas = positions.map(pos => crearCelulaDesdePos(pos, palette));
  let tempConexiones = generarConexiones(tempCelulas, palette);
  if (showConnections) {
    for (let conexion of tempConexiones) conexion.display(pg);
  }
  for (let celula of tempCelulas) celula.display(pg);
  return { pg, celulas: tempCelulas, conexiones: tempConexiones };
}

// --- p5.js setup/draw/preload ---
let estado = "iniciar"; // Estado inicial
let estadoPaletteIndex = 0; // Paleta para el gradiente del estado de inicio

function preload() {
  img = loadImage('img/textura1.jpg');
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  let palette = COLOR_PALETTES[currentPaletteIndex];
  backgroundColor = color(palette.background[0], palette.background[1], palette.background[2]);
  background(backgroundColor);
  for (let i = 0; i < 5; i++) {
    let cellCount = floor(random(3, 10));
    let result = createCellGraphic(cellCount);
    graphicsArray[i] = result.pg;
    graphicsData[i] = result;
  }
  textSize(60);
  textAlign(CENTER, CENTER);
  sonidoInteractivo = new SonidoInteractivo();
}

// Utilidad para regenerar todos los gráficos (DRY)
function regenerarGraficos() {
  let palette = COLOR_PALETTES[currentPaletteIndex];
  backgroundColor = color(palette.background[0], palette.background[1], palette.background[2]);
  for (let i = 0; i < 5; i++) {
    let cellCount = floor(random(3, 10));
    let result = createCellGraphic(cellCount);
    graphicsArray[i] = result.pg;
    graphicsData[i] = result;
  }
  currentGraphicIndex = -1;
  background(backgroundColor);
  currentCelulas = [];
  currentConexiones = [];
}

const CELULAS_MIN = 3;
const CELULAS_MAX = 9;
let ultimoCellCount = CELULAS_MIN; // Variable global
let lastPitchUpdate = 0; // Última vez que se actualizó el gráfico por tono
let lastGraveChange = 0;
const GRAVE_COOLDOWN = 350; // milisegundos (1 segundo)

function draw() {
  if (estado === "iniciar") {
    let palette = COLOR_PALETTES[estadoPaletteIndex];
    // Precalcula los colores como objetos p5.Color
    let colorsArr = [
      ...(palette.externalFrame || []),
      ...(palette.rectangles || []),
      ...(palette.rectangleBorders || []),
      ...(palette.connections || [])
    ].map(arr => color(arr[0], arr[1], arr[2]));
    if (colorsArr.length < 2) colorsArr.push(colorsArr[0]);

    // Parámetros de animación y blur
    let speed = 0.08;
    let offset = (millis() * speed / 1000) % 1;
    let blurPasses = 5; // Puedes ajustar para más/menos blur
    let blurAlpha = 40 / blurPasses; // Opacidad baja para suavidad

    for (let blurPass = 0; blurPass < blurPasses; blurPass++) {
      let blurOffset = blurPass * 0.03;
      for (let y = 0; y < height; y++) {
        let pos = ((y / height) + offset + blurOffset) % 1;
        pos += (noise(y * 0.02 + blurPass * 10, millis() * 0.0002) - 0.5) * 0.45;
        pos = constrain(pos, 0, 1);
        let idx = pos * (colorsArr.length - 1);
        let idxA = Math.floor(idx);
        let idxB = (idxA + 1) % colorsArr.length;
        let amt = idx - idxA;
        let cGrad = lerpColor(colorsArr[idxA], colorsArr[idxB], amt);
        cGrad.setAlpha(blurAlpha);
        stroke(cGrad);
        line(0, y, width, y);
      }
    }

    // Texto central
    push();
    stroke(0, 0, 100);
    fill(0, 0, 100);
    text("Toca i para Iniciar", width / 2, height / 2.5);
    textSize(25);
    text("Posibles modificaciones: aplaudir, cambiar de tono, Tecla M,", width / 2, height / 1.9);
    text("sostener agudos, sostener grave, decir la letra A o E", width / 2, height / 1.65);
    pop();
  } else if (estado === "obra") {
    background(backgroundColor);
    if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
      image(graphicsArray[currentGraphicIndex], 0, 0);
      currentCelulas = graphicsData[currentGraphicIndex].celulas;
      currentConexiones = graphicsData[currentGraphicIndex].conexiones;
    }
  }

  if (sonidoInteractivo) sonidoInteractivo.actualizar();
  // Visualización de los valores de sonido
  if (sonidoInteractivo && sonidoInteractivo.activo && showDataOverlay) { // <--- Modifica aquí
    push();
    fill(0, 0, 100, 200);
    rect(10, 10, 210, 95, 10); // <-- altura aumentada de 80 a 95
    fill(0);
    textSize(13);
    textAlign(LEFT, TOP);
    text("Vol: " + nf(sonidoInteractivo.volumen, 1, 3) + "  Sens: " + vol, 18, 16);
    text("Grv:" + nf(sonidoInteractivo.bass, 1, 0) +
         " Med:" + nf(sonidoInteractivo.mid, 1, 0) +
         " Agu:" + nf(sonidoInteractivo.treble, 1, 0), 18, 32);
    text("B<" + nf(VOLUMEN_BAJO, 1, 2) +
         " M<" + nf(VOLUMEN_MEDIO, 1, 2) +
         " A<" + nf(VOLUMEN_ALTO, 1, 2), 18, 48);
    let rango = "Ninguno";
    if (sonidoInteractivo.volumen < VOLUMEN_BAJO) rango = "Bajo";
    else if (sonidoInteractivo.volumen < VOLUMEN_MEDIO) rango = "Medio";
    else if (sonidoInteractivo.volumen < VOLUMEN_ALTO) rango = "Alto";
    text("Rango: " + rango, 18, 64);
    // --- Agrega aquí el pitch ---
    text("Pitch: " + nf(sonidoInteractivo.pitchValue, 1, 2) + " Hz", 18, 80);
    pop();

    // Espectro de frecuencias
    push();
    noFill();
    stroke(200, 80, 80);
    beginShape();
    for (let i = 0; i < sonidoInteractivo.spectrum.length; i++) {
      let x = map(i, 0, sonidoInteractivo.spectrum.length, 10, 230);
      let y = map(sonidoInteractivo.spectrum[i], 0, 255, 130, 60);
      vertex(x, y);
    }
    endShape();
    pop();

    // Forma de onda
    push();
    noFill();
    stroke(120, 80, 80);
    beginShape();
    for (let i = 0; i < sonidoInteractivo.waveform.length; i++) {
      let x = map(i, 0, sonidoInteractivo.waveform.length, 10, 230);
      let y = map(sonidoInteractivo.waveform[i], -1, 1, 150, 190);
      vertex(x, y);
    }
    endShape();
    pop();
  }

  if (sonidoInteractivo && sonidoInteractivo.activo && estado === "obra") {
    let pitch = sonidoInteractivo.pitchValue;
    let cellCount = pitchToCellCount(pitch);

    // Solo actualiza si ha pasado suficiente tiempo desde la última actualización
    if (cellCount !== ultimoCellCount && millis() - lastPitchUpdate > PITCH_UPDATE_INTERVAL) {
      ultimoCellCount = cellCount;
      lastPitchUpdate = millis();
      let result = createCellGraphic(cellCount);
      currentGraphicIndex = 0; // O el índice que prefieras
      graphicsArray[currentGraphicIndex] = result.pg;
      graphicsData[currentGraphicIndex] = result;
      currentCelulas = graphicsData[currentGraphicIndex].celulas;
      currentConexiones = graphicsData[currentGraphicIndex].conexiones;
    }
  }

  if (sonidoInteractivo && sonidoInteractivo.activo && estado === "obra") {
    let v = sonidoInteractivo.volumen;

    // --- ATAQUE: Detecta un aumento brusco de volumen (ataque rápido) ---
    let ataqueUmbral = 0.15; // Ajusta este valor según sensibilidad deseada
    if (v - volumenAnterior > ataqueUmbral) {
      // Ejecuta lo mismo que la barra ESPACIADORA
      currentPaletteIndex = (currentPaletteIndex + 1) % COLOR_PALETTES.length;
      regenerarGraficos(); // <-- Esto regenera todo el sistema visual con la nueva paleta
    }
    volumenAnterior = v;

    // Volumen BAJO
    if (v < VOLUMEN_BAJO) {
      framesVolumenBajo++;
      framesVolumenMedio = 0;
      framesVolumenAlto = 0;
      if (framesVolumenBajo > FRAMES_UMBRAL && !bajoActivo) {
        // Acción bajo
        let idx = floor(random(0, 5));
        currentGraphicIndex = idx;
        let cellCount = floor(random(3, 10));
        let result = createCellGraphic(cellCount);
        graphicsArray[idx] = result.pg;
        graphicsData[idx] = result;
        currentCelulas = graphicsData[idx].celulas;
        currentConexiones = graphicsData[idx].conexiones;
        bajoActivo = true;
        medioActivo = false;
        altoActivo = false;
      }
    }
    // Volumen MEDIO
    else if (v < VOLUMEN_MEDIO) {
      framesVolumenMedio++;
      framesVolumenBajo = 0;
      framesVolumenAlto = 0;
      if (framesVolumenMedio > FRAMES_UMBRAL && !medioActivo) {
        // Acción medio
        for (let celula of currentCelulas) celula.changeColors();
        let palette = COLOR_PALETTES[currentPaletteIndex];
        let pg = createGraphics(width, height);
        pg.colorMode(HSB, 360, 100, 100);
        pg.background(palette.background[0], palette.background[1], palette.background[2]);
        if (showConnections) for (let conexion of currentConexiones) conexion.display(pg);
        for (let celula of currentCelulas) celula.display(pg);
        graphicsArray[currentGraphicIndex] = pg;
        graphicsData[currentGraphicIndex].pg = pg;
        bajoActivo = false;
        medioActivo = true;
        altoActivo = false;
      }
    }
    // Volumen ALTO
    else if (v < VOLUMEN_ALTO) {
      framesVolumenAlto++;
      framesVolumenBajo = 0;
      framesVolumenMedio = 0;
      if (framesVolumenAlto > FRAMES_UMBRAL && !altoActivo) {
        // Acción alto (barra espaciadora)
        currentPaletteIndex = (currentPaletteIndex + 1) % COLOR_PALETTES.length;
        // NO actualices backgroundColor aquí
        for (let celula of currentCelulas) celula.changeColors();
        for (let conexion of currentConexiones) {
          if (conexion.changeColor) conexion.changeColor();
        }
        // Redibuja solo células y conexiones sobre el mismo fondo
        if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
          let pg = createGraphics(width, height);
          pg.colorMode(HSB, 360, 100, 100);
          pg.background(backgroundColor); // Mantiene el fondo actual
          if (showConnections) {
            for (let conexion of currentConexiones) conexion.display(pg);
          }
          for (let celula of currentCelulas) celula.display(pg);
          graphicsArray[currentGraphicIndex] = pg;
          graphicsData[currentGraphicIndex].pg = pg;
        }
        bajoActivo = false;
        medioActivo = false;
        altoActivo = true;
      }
    }
    // Fuera de rango: resetea flags y contadores
    else {
      framesVolumenBajo = 0;
      framesVolumenMedio = 0;
      framesVolumenAlto = 0;
      bajoActivo = false;
      medioActivo = false;
      altoActivo = false;
    }
  }

  if (sonidoInteractivo && sonidoInteractivo.activo && estado === "obra") {
    let bass = sonidoInteractivo.bass;
    let pitch = sonidoInteractivo.pitchValue;

    // --- Detecta graves constantes por bass o pitch 80-100 Hz ---
    let graveDetectado = false;

    // Por bass
    if (bass > GRAVE_UMBRAL) {
      framesGrave++;
      if (
        framesGrave > FRAMES_GRAVE &&
        millis() - lastGraveChange > GRAVE_COOLDOWN
      ) {
        graveDetectado = true;
      }
    } else {
      framesGrave = 0;
    }

    // Por pitch
    if (pitch >= 80 && pitch < 100) {
      framesPitchGrave++;
      if (
        framesPitchGrave > FRAMES_PITCH_GRAVE &&
        millis() - lastGraveChange > GRAVE_COOLDOWN
      ) {
        graveDetectado = true;
      }
    } else {
      framesPitchGrave = 0;
    }

    // Si se detectó grave por cualquiera de los dos triggers, cambia colores UNA SOLA VEZ
    if (graveDetectado) {
      for (let celula of currentCelulas) celula.changeColors();
      for (let conexion of currentConexiones) {
        if (conexion.changeColor) conexion.changeColor();
      }
      if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
        let pg = createGraphics(width, height);
        pg.colorMode(HSB, 360, 100, 100);
        pg.background(backgroundColor);
        if (showConnections) {
          for (let conexion of currentConexiones) conexion.display(pg);
        }
        for (let celula of currentCelulas) celula.display(pg);
        graphicsArray[currentGraphicIndex] = pg;
        graphicsData[currentGraphicIndex].pg = pg;
      }
      lastGraveChange = millis();
      // Resetea ambos contadores para evitar doble trigger
      framesGrave = 0;
      framesPitchGrave = 0;
    }

    // --- Detecta agudos constantes por pitch > 400 Hz ---
    if (pitch > AGUDO_UMBRAL) {
      framesAgudo++;
      if (
        framesAgudo > FRAMES_AGUDO &&
        millis() - lastGraveChange > GRAVE_COOLDOWN
      ) {
        for (let celula of currentCelulas) celula.changeColors();
        for (let conexion of currentConexiones) {
          if (conexion.changeColor) conexion.changeColor();
        }
        if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
          let pg = createGraphics(width, height);
          pg.colorMode(HSB, 360, 100, 100);
          pg.background(backgroundColor);
          if (showConnections) {
            for (let conexion of currentConexiones) conexion.display(pg);
          }
          for (let celula of currentCelulas) celula.display(pg);
          graphicsArray[currentGraphicIndex] = pg;
          graphicsData[currentGraphicIndex].pg = pg;
        }
        lastGraveChange = millis();
        framesAgudo = 0;
        framesGrave = 0;
        framesPitchGrave = 0;
      }
    } else {
      framesAgudo = 0;
    }
  }

  // --- Trigger de conexiones por medios (mid) ---
  const MID_UMBRAL = 60; // Ajusta según tu micrófono y entorno
  const FRAMES_MID = 15;  // Frames necesarios para activar (0.25s a 60fps)
  const MID_COOLDOWN = 350; // milisegundos

  if (sonidoInteractivo && sonidoInteractivo.activo && estado === "obra") {
    let mid = sonidoInteractivo.mid;
    if (mid > MID_UMBRAL) {
      framesMid++;
      if (
        framesMid > FRAMES_MID &&
        millis() - lastMidChange > MID_COOLDOWN
      ) {
        showConnections = !showConnections; // Alterna visibilidad
        // Redibuja el gráfico actual
        if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
          let palette = COLOR_PALETTES[currentPaletteIndex];
          let pg = createGraphics(width, height);
          pg.colorMode(HSB, 360, 100, 100);
          pg.background(palette.background[0], palette.background[1], palette.background[2]);
          if (showConnections) {
            for (let conexion of currentConexiones) conexion.display(pg);
          }
          for (let celula of currentCelulas) celula.display(pg);
          graphicsArray[currentGraphicIndex] = pg;
          graphicsData[currentGraphicIndex].pg = pg;
        }
        lastMidChange = millis();
        framesMid = 0;
      }
    } else {
      framesMid = 0;
    }
  }
}

// Modifica mousePressed para solo funcionar en estado "obra"
function mousePressed() {
  if (estado !== "obra") return;
  let changed = false;
  for (let i = currentCelulas.length - 1; i >= 0; i--) {
    if (currentCelulas[i].contains(mouseX, mouseY)) {
      currentCelulas[i].changeColors();
      changed = true;
      break;
    }
  }
  if (!changed && showConnections) {
    for (let conexion of currentConexiones) {
      if (conexion.isNear && conexion.isNear(mouseX, mouseY)) {
        if (conexion.changeColor) conexion.changeColor();
        break;
      }
    }
  }
  if (currentGraphicIndex >= 0 && graphicsArray[currentGraphicIndex]) {
    let palette = COLOR_PALETTES[currentPaletteIndex];
    let pg = createGraphics(width, height);
    pg.colorMode(HSB, 360, 100, 100);
    pg.background(palette.background[0], palette.background[1], palette.background[2]);
    if (showConnections) {
      for (let conexion of currentConexiones) conexion.display(pg);
    }
    for (let celula of currentCelulas) celula.display(pg);
    graphicsArray[currentGraphicIndex] = pg;
    graphicsData[currentGraphicIndex].pg = pg;
  }
  if (!sonidoInteractivo.activo) {
    userStartAudio();
    sonidoInteractivo.iniciar();
  }
}

// Modifica keyPressed para manejar el estado y regenerar gráficos de forma eficiente
function keyPressed() {
  if (key === 'i' || key === 'I') {
    if (estado === "obra") {
      estadoPaletteIndex = (estadoPaletteIndex + 1) % COLOR_PALETTES.length;
      estado = "iniciar";
    } else if (estado === "iniciar") {
      currentPaletteIndex = estadoPaletteIndex;
      regenerarGraficos();
      estado = "obra";
      // --- INICIO DE AUDIO Y VISUALIZACIÓN ---
      if (!sonidoInteractivo.activo) {
        userStartAudio();
        sonidoInteractivo.iniciar();
      }
    }
    return;
  }
  if (estado !== "obra") return;

  if (key >= '1' && key <= '5') {
    let idx = int(key) - 1;
    currentGraphicIndex = idx;
    let cellCount = floor(random(3, 10));
    let result = createCellGraphic(cellCount);
    graphicsArray[idx] = result.pg;
    graphicsData[idx] = result;
    currentCelulas = graphicsData[idx].celulas;
    currentConexiones = graphicsData[idx].conexiones;
  }
  if (keyCode === ENTER && currentCelulas.length > 0) {
    for (let celula of currentCelulas) {
      celula.changeColors();
    }
    // Cambia el color de todas las conexiones
    for (let conexion of currentConexiones) {
      if (conexion.changeColor) conexion.changeColor();
    }
    let palette = COLOR_PALETTES[currentPaletteIndex];
    let pg = createGraphics(width, height);
    pg.colorMode(HSB, 360, 100, 100);
    pg.background(palette.background[0], palette.background[1], palette.background[2]);
    if (showConnections) {
      for (let conexion of currentConexiones) conexion.display(pg);
    }
    for (let celula of currentCelulas) celula.display(pg);
    graphicsArray[currentGraphicIndex] = pg;
    graphicsData[currentGraphicIndex].pg = pg;
  }
  if (key === 'c' || key === 'C') {
    showConnections = !showConnections;
    for (let i = 0; i < 5; i++) {
      if (graphicsData[i]) {
        let palette = COLOR_PALETTES[currentPaletteIndex];
        let pg = createGraphics(width, height);
        pg.colorMode(HSB, 360, 100, 100);
        pg.background(palette.background[0], palette.background[1], palette.background[2]);
        if (showConnections) {
          for (let conexion of graphicsData[i].conexiones) conexion.display(pg);
        }
        for (let celula of graphicsData[i].celulas) celula.display(pg);
        graphicsArray[i] = pg;
        graphicsData[i].pg = pg;
      }
    }
  }
  if (keyCode === 32) {
    currentPaletteIndex = (currentPaletteIndex + 1) % COLOR_PALETTES.length;
    regenerarGraficos();
  }
  if ((key === 'b' || key === 'B') && currentCelulas.length > 3) {
    regenerarCelulasYConexiones(currentCelulas.length - 1);
  }
  if ((key === 's' || key === 'S') && currentCelulas.length < 9) {
    regenerarCelulasYConexiones(currentCelulas.length + 1);
  }
  if (key === 'm' || key === 'M') {
    showDataOverlay = !showDataOverlay;
  }
}

// --- Utilidades de geometría y conexiones ---
function orientation(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0;
  return (val > 0) ? 1 : 2;
}
function onSegment(p, q, r) {
  return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
         q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}
function linesIntersect(a1, a2, b1, b2) {
  let o1 = orientation(a1, a2, b1);
  let o2 = orientation(a1, a2, b2);
  let o3 = orientation(b1, b2, a1);
  let o4 = orientation(b1, b2, a2);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a1, b1, a2)) return true;
  if (o2 === 0 && onSegment(a1, b2, a2)) return true;
  if (o3 === 0 && onSegment(b1, a1, b2)) return true;
  if (o4 === 0 && onSegment(b1, a2, b2)) return true;
  return false;
}
function constrain(val, min, max) {
  return Math.max(min, Math.min(max, val));
}





