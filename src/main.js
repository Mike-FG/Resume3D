import * as THREE from 'three';
import './style.css';

const profile = {
  name: 'Miguel Ferrer',
  image: '/drawing_icon.jpg',
  role: 'Software and Game Developer',
  email: 'm.ferrerg@outlook.es',
  phone: '+34 717 719 078',
  location: 'Seville, Spain'
};

// AJUSTE PRINCIPAL DE TRANSICIONES
// Sube este valor para que cada cambio entre párrafos ocupe más scroll.
// Recomendado: 0.45 (rápido) → 0.85 (muy progresivo).
const PARAGRAPH_FADE_LENGTH = 0.85;

// Porcentaje aproximado de la vida visible de cada párrafo a opacidad máxima.
const PARAGRAPH_FULL_OPACITY_RATIO = 0.60;

// Velocidad de órbita de los párrafos alrededor del objeto 3D.
const PARAGRAPH_ORBIT_TURNS = 0.35;

const sections = [
  {
    id: 'about', label: 'Sobre mí', geometry: 'knot', color: 0x7c5cff,
    bgA: '#090a18', bgB: '#23124c',
    blocks: [
      ['Perfil', 'Soy desarrollador de software y videojuegos, con una combinación de sensibilidad artística y enfoque técnico. Tengo experiencia trabajando en equipos Scrum y explorando motores gráficos como Unity y Unreal Engine 5.'],
      ['Cómo trabajo', 'Me interesa crear productos útiles y entretenidos. Disfruto especialmente del proceso de resolver problemas y de convertir ideas técnicas en experiencias que la gente pueda utilizar o disfrutar.'],
      ['Exploración personal', 'También desarrollo proyectos personales con Python, donde combino programación, automatización, creatividad y experimentación visual.'],
      ['Más allá del código', 'Cuando no estoy programando, suelo dedicar tiempo al dibujo y a proyectos de arte digital 2D y 3D.']
    ]
  },
  {
    id: 'resume', label: 'Resume', geometry: 'triangle', color: 0xff6d3a,
    bgA: '#130b0a', bgB: '#45140b',
    blocks: [
      ['Educación', [
        'Universidad Rey Juan Carlos — Diseño y Desarrollo de Videojuegos (2018–2022).',
        "Harvard University & edX — CS50's Introduction to Programming with Python (2023–2024).",
        'Universidad de Extremadura — Máster Universitario en Formación del Profesorado de Secundaria (2023–2024).'
      ]],
      ['Experiencia profesional', [
        'Ikea Credit (2019–2020) — gestión del proceso de financiación de compras.',
        'All my Homes (2023) — desarrollo de una aplicación inmersiva de escritorio en Unreal Engine.',
        'Profesor en Formación Profesional (2024) — clases de programación Java en un instituto público durante las prácticas del máster.'
      ]],
      ['Idiomas', [
        'Español — nativo.',
        'Inglés — certificación oficial Cambridge B2.'
      ]],
      ['Tecnologías', [
        'Python, Java y C++.',
        'Unreal Engine y Unity.',
        'Frameworks, librerías y metodologías Agile.'
      ]]
    ]
  },
  {
    id: 'portfolio', label: 'Portfolio', geometry: 'hexsphere', color: 0x22d3a8,
    bgA: '#06120f', bgB: '#073f39',
    blocks: [
      ['Hermex', 'Aplicación personal en Python para gestión local de contraseñas.', 'Personal'],
      ['YTScrapper', 'Herramienta de web scraping para descargar el MP4 disponible de mayor calidad sin restricciones de copyright.', 'Personal'],
      ['Rolling Beats', 'Rhythm game con scripts orientados a automatizar parte del gameplay de las canciones.', 'Académico'],
      ['Slime Journey', 'Proyecto de fin de grado centrado en shaders mediante programación nodal en Unity.', 'Académico'],
      ['Real Estate Marketing App', 'Modelado 3D e integración en Unreal Engine para una aplicación de marketing inmobiliario.', 'Profesional'],
      ['MOR Coffee', 'Trabajo de modelado 3D para una marca internacional de café.', 'Profesional'],
      ['Simple Graphic Engine', 'Motor gráfico basado en OpenGL con soporte para modelos 3D.', 'Académico'],
      ['Multiplayer Web Game', 'Aplicación Spring para juego local de dos jugadores con almacenamiento de puntuaciones.', 'Académico']
    ]
  }
];

const KEYWORDS = [
  'Software and Game Developer', 'desarrollador de software', 'videojuegos', 'Scrum', 'Unity', 'Unreal Engine 5', 'Unreal Engine',
  'Python', 'Java', 'C++', 'OpenGL', 'Spring', 'Agile', 'Cambridge B2', 'Harvard University & edX', 'CS50',
  'Universidad Rey Juan Carlos', 'Universidad de Extremadura', 'Diseño y Desarrollo de Videojuegos',
  'shaders', 'programación nodal', 'modelado 3D', 'arte digital 2D y 3D', 'automatización', 'web scraping',
  'Hermex', 'YTScrapper', 'Rolling Beats', 'Slime Journey', 'MOR Coffee', 'Simple Graphic Engine', 'Multiplayer Web Game',
  'Real Estate Marketing App', 'Ikea Credit', 'All my Homes', 'Formación Profesional'
].sort((a, b) => b.length - a.length);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightKeywords(text) {
  let result = text;
  KEYWORDS.forEach(keyword => {
    const pattern = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    result = result.replace(pattern, '<span class="keyword">$1</span>');
  });
  return result;
}

function renderBlockBody(content) {
  if (Array.isArray(content)) {
    return `<ul class="resume-list">${content.map(item => `<li><span class="resume-bullet" aria-hidden="true"></span><span>${highlightKeywords(item)}</span></li>`).join('')}</ul>`;
  }
  return `<p>${highlightKeywords(content)}</p>`;
}

function colorToCss(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

const PORTFOLIO_URL = 'https://www.youtube.com/';

function renderFloatingBlock(section, block, blockIndex, back = false) {
  const attr = back ? `data-back-block="${blockIndex}" aria-hidden="true"` : `data-block="${blockIndex}"`;
  const body = `<h3>${block[0]}</h3>${renderBlockBody(block[1])}${block[2] ? `<p class="meta">${block[2]}</p>` : ''}`;
  if (!back && section.id === 'portfolio') {
    return `<a class="floating-copy portfolio-copy" ${attr} href="${PORTFOLIO_URL}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${block[0]} en YouTube">${body}</a>`;
  }
  return `<article class="floating-copy${section.id === 'portfolio' ? ' portfolio-copy' : ''}" ${attr}>${body}</article>`;
}

const app = document.querySelector('#app');
app.innerHTML = `
  <button class="identity expanded" data-identity type="button" aria-expanded="true" aria-label="Ocultar datos de contacto">
    <img class="identity-avatar" src="${profile.image}" alt="${profile.name}">
    <div class="identity-content">
      <strong>${profile.name}</strong>
      <div class="identity-details">
        <p>${profile.role}</p>
        <p><a href="mailto:${profile.email}">${profile.email}</a><br><a href="tel:+34717719078">${profile.phone}</a><br>${profile.location}</p>
      </div>
    </div>
    <span class="identity-toggle" aria-hidden="true">−</span>
  </button>
  <div class="progress">${sections.map((_, i) => `<span data-dot="${i}"></span>`).join('')}</div>
  <div class="scroll-hint">Desliza ↓</div>
  ${sections.map((section, index) => `
    <section class="section" id="${section.id}" data-section="${index}" style="--bg-a:${section.bgA};--bg-b:${section.bgB};--accent:${colorToCss(section.color)}">
      <div class="section-canvas">
        <h2 class="section-title"><span class="section-kicker">0${index + 1} / 03</span>${section.label}</h2>
        <div class="copy-layer copy-layer-back">
          ${section.blocks.map((block, blockIndex) => renderFloatingBlock(section, block, blockIndex, true)).join('')}
        </div>
        <svg class="connector-layer connector-layer-back" aria-hidden="true">
          ${section.blocks.map((_, blockIndex) => `<g data-back-connector="${blockIndex}"><line></line><circle r="2.4"></circle></g>`).join('')}
        </svg>
        <svg class="connector-layer connector-layer-front" aria-hidden="true">
          ${section.blocks.map((_, blockIndex) => `<g data-connector="${blockIndex}"><line></line><circle r="2.4"></circle></g>`).join('')}
        </svg>
        <div class="copy-layer copy-layer-front">
          ${section.blocks.map((block, blockIndex) => renderFloatingBlock(section, block, blockIndex, false)).join('')}
        </div>
      </div>
    </section>`).join('')}
`;

const identity = document.querySelector('[data-identity]');
identity.addEventListener('click', (event) => {
  if (event.target.closest('a')) return;
  const expanded = identity.classList.toggle('expanded');
  identity.classList.toggle('compact', !expanded);
  identity.setAttribute('aria-expanded', String(expanded));
  identity.setAttribute('aria-label', expanded ? 'Ocultar datos de contacto' : 'Mostrar datos de contacto');
  const toggle = identity.querySelector('.identity-toggle');
  if (toggle) toggle.textContent = expanded ? '−' : '+';
});

const threeSections = [];

function makeGeometry(type) {
  if (type === 'knot') {
    // Primera escena: nudo toroidal limpio y escultórico.
    // Mantiene una silueta geométrica clara, pero evita la rigidez del reloj de arena.
    return new THREE.TorusKnotGeometry(1.08, 0.34, 180, 16, 2, 3);
  }
  if (type === 'triangle') {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.7); shape.lineTo(-1.5, -1.1); shape.lineTo(1.5, -1.1); shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.1, bevelThickness: 0.1 });
  }
  const geo = new THREE.IcosahedronGeometry(1.55, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const scale = 1 + 0.06 * Math.sin(v.x * 7 + v.y * 5 + v.z * 6);
    v.multiplyScalar(scale); pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function makeSatelliteTriangleGeometry(size, seed) {
  // Prisma triangular muy fino: conserva una silueta triangular clara desde varios ángulos.
  const shape = new THREE.Shape();
  const skew = (seededRandom(seed + 1) - 0.5) * 0.22;
  shape.moveTo(0, size * (1.05 + skew));
  shape.lineTo(-size * (0.92 + seededRandom(seed + 2) * 0.16), -size * 0.78);
  shape.lineTo(size * (0.92 + seededRandom(seed + 3) * 0.16), -size * 0.78);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: size * 0.16,
    bevelEnabled: false,
    steps: 1
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function createSatelliteClusters(config) {
  const root = new THREE.Group();
  const clusterCount = 8;

  for (let c = 0; c < clusterCount; c++) {
    const cluster = new THREE.Group();
    const angle = (c / clusterCount) * Math.PI * 2 + seededRandom(c + 10) * 0.45;
    const radius = 2.4 + seededRandom(c + 20) * 0.72;
    cluster.position.set(
      Math.cos(angle) * radius,
      (seededRandom(c + 30) - 0.5) * 1.65,
      Math.sin(angle) * radius * (0.52 + seededRandom(c + 40) * 0.18)
    );

    const rocks = new THREE.Group();
    const pieces = 3 + Math.floor(seededRandom(c + 50) * 3);

    for (let j = 0; j < pieces; j++) {
      const seed = c * 100 + j + 1;
      const size = 0.045 + seededRandom(seed) * 0.045;
      const rock = new THREE.Mesh(
        makeSatelliteTriangleGeometry(size, seed),
        new THREE.MeshStandardMaterial({
          color: config.color,
          emissive: config.color,
          emissiveIntensity: 0.2,
          roughness: 0.62,
          metalness: 0.08,
          flatShading: true
        })
      );
      rock.position.set(
        (seededRandom(seed + 3) - 0.5) * 0.34,
        (seededRandom(seed + 5) - 0.5) * 0.30,
        (seededRandom(seed + 7) - 0.5) * 0.28
      );
      rock.rotation.set(
        seededRandom(seed + 9) * Math.PI,
        seededRandom(seed + 11) * Math.PI,
        seededRandom(seed + 13) * Math.PI
      );
      rock.scale.set(
        0.72 + seededRandom(seed + 15) * 0.7,
        0.7 + seededRandom(seed + 17) * 0.75,
        0.72 + seededRandom(seed + 19) * 0.68
      );
      rocks.add(rock);
    }

    cluster.add(rocks);

    cluster.userData = {
      speed: 0.22 + seededRandom(c + 60) * 0.22,
      rocks
    };
    root.add(cluster);
  }
  return root;
}

function createOrbitGuides(config) {
  const guides = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });

  const settings = Array.from({ length: 12 }, (_, index) => ({
    radius: 1.92 + index * 0.105 + seededRandom(index + 200) * 0.18,
    scaleY: 0.28 + seededRandom(index + 220) * 0.48,
    rx: 0.42 + seededRandom(index + 240) * 1.18,
    rz: -1.05 + seededRandom(index + 260) * 2.1
  }));

  settings.forEach((setting, index) => {
    const points = [];
    const segments = 180;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(a) * setting.radius,
        Math.sin(a) * setting.radius * setting.scaleY,
        0
      ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineLoop(geometry, material.clone());
    line.material.opacity = 0.055 + (index % 4) * 0.018;
    line.rotation.x = setting.rx;
    line.rotation.z = setting.rz;
    guides.add(line);
  });

  return guides;
}


function makeShipGeometry(size = 0.045) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    size * 1.25, 0, 0,
    -size, size * 0.68, 0,
    -size, -size * 0.68, 0
  ], 3));
  geometry.computeVertexNormals();
  return geometry;
}

function buildSafeFlightCurve(seed, clusterIndex) {
  // Recorrido amplio alrededor de una zona de exclusión generosa.
  // Tras crear la curva comprobamos todos sus puntos y, si hiciera falta,
  // escalamos la trayectoria completa hacia fuera. Así ni la nave ni su estela
  // pueden atravesar la figura central aunque Catmull-Rom suavice demasiado.
  const safeRadius = 3.85;
  const points = [];
  const pointCount = 10;
  const baseAngle = seededRandom(seed + 1) * Math.PI * 2;
  const direction = seededRandom(seed + 2) > 0.5 ? 1 : -1;
  const sweep = Math.PI * (1.7 + seededRandom(seed + 3) * 0.75);

  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    const angle = baseAngle + direction * t * sweep;
    const radius = 4.35 + seededRandom(seed + 20 + i) * 2.2;
    const yWave = Math.sin(angle * 0.62 + clusterIndex * 1.4) * (0.8 + seededRandom(seed + 40 + i) * 0.85);
    const zWave = Math.cos(angle * 0.48 + seededRandom(seed + 60 + i) * 1.8) * (0.55 + seededRandom(seed + 80 + i) * 0.95);
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      yWave,
      Math.sin(angle) * radius * 0.72 + zWave
    ));
  }

  let curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);

  // Validación geométrica real de la curva completa.
  let minDistance = Infinity;
  for (let i = 0; i <= 260; i++) {
    minDistance = Math.min(minDistance, curve.getPoint(i / 260).length());
  }
  if (minDistance < safeRadius) {
    const scaleOut = (safeRadius / Math.max(minDistance, 0.001)) * 1.08;
    points.forEach(point => point.multiplyScalar(scaleOut));
    curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  }

  return curve;
}

function makeTrailSegment(a, b, material, radius = 0.008) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  if (length < 0.001) return null;
  const geometry = new THREE.CylinderGeometry(radius, radius * 0.7, length, 5, 1, true);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function createSpaceshipFleet(sectionIndex, config) {
  const root = new THREE.Group();
  const clusterCount = 1 + Math.floor(seededRandom(sectionIndex * 71 + 19) * 2); // 1–2 clusters por escena.

  for (let clusterIndex = 0; clusterIndex < clusterCount; clusterIndex++) {
    const seed = sectionIndex * 1000 + clusterIndex * 127 + 500;
    const curve = buildSafeFlightCurve(seed, clusterIndex);
    const cluster = new THREE.Group();
    cluster.userData.curve = curve;
    cluster.userData.speed = 0.018 + seededRandom(seed + 6) * 0.012;
    cluster.userData.phase = seededRandom(seed + 7) * 0.22;

    const shipCount = 1 + Math.floor(seededRandom(seed + 8) * 3); // clusters pequeños: 1–3 naves.
    for (let member = 0; member < shipCount; member++) {
      const shipSeed = seed + member * 23;
      const ship = new THREE.Group();
      const size = 0.028 + seededRandom(shipSeed + 1) * 0.018;
      const color = new THREE.Color(config.color).lerp(new THREE.Color(0xffffff), 0.18 + seededRandom(shipSeed + 2) * 0.2);
      const body = new THREE.Mesh(
        makeShipGeometry(size),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ship.add(body);

      const offsetT = (member - (shipCount - 1) * 0.5) * 0.014;
      ship.userData.offsetT = offsetT;
      ship.userData.lastTrailT = null;
      ship.userData.lastTrailPoint = null;
      ship.userData.trailComplete = false;
      ship.userData.trailRoot = new THREE.Group();
      root.add(ship.userData.trailRoot);

      // Dos estelas con un volumen mínimo. Se van construyendo y no desaparecen.
      ship.userData.trailMaterials = [-1, 1].map(() => new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.17,
        depthWrite: false
      }));
      ship.userData.trailSpread = size * 0.22;
      cluster.add(ship);
    }

    root.add(cluster);
  }
  return root;
}

function updateSpaceshipFleet(fleet, now) {
  const elapsed = now * 0.001;
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1);

  fleet.children.forEach(cluster => {
    if (!cluster.userData.curve) return;
    const curve = cluster.userData.curve;
    const baseT = (elapsed * cluster.userData.speed + cluster.userData.phase) % 1;

    cluster.children.forEach((ship, memberIndex) => {
      let t = (baseT + ship.userData.offsetT + 1) % 1;
      const position = curve.getPointAt(t);
      curve.getTangentAt(t, tangent).normalize();
      side.crossVectors(tangent, up);
      if (side.lengthSq() < 0.01) side.set(0, 1, 0);
      side.normalize();

      ship.position.copy(position);
      ship.rotation.z = Math.atan2(tangent.y, tangent.x);
      ship.rotation.y = -Math.asin(THREE.MathUtils.clamp(tangent.z, -1, 1));

      // Construye dos estelas persistentes. Tras una vuelta completa, la ruta ya queda dibujada.
      if (!ship.userData.trailComplete) {
        const lastT = ship.userData.lastTrailT;
        if (lastT !== null && t < lastT) {
          ship.userData.trailComplete = true;
        } else if (lastT === null || t - lastT > 0.0045) {
          const prevCenter = ship.userData.lastTrailPoint || position.clone();
          [-1, 1].forEach((sign, idx) => {
            const spread = ship.userData.trailSpread * sign;
            const a = prevCenter.clone().addScaledVector(side, spread);
            const b = position.clone().addScaledVector(side, spread);
            const segment = makeTrailSegment(a, b, ship.userData.trailMaterials[idx], 0.007);
            if (segment) ship.userData.trailRoot.add(segment);
          });
          ship.userData.lastTrailPoint = position.clone();
          ship.userData.lastTrailT = t;
        }
      }
    });
  });
}

function setupScene(sectionEl, config, index) {
  const host = sectionEl.querySelector('.section-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(config.bgA), 0.07);
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);

  const group = new THREE.Group(); scene.add(group);
  const material = new THREE.MeshPhysicalMaterial({ color: config.color, roughness: 0.25, metalness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const mesh = new THREE.Mesh(makeGeometry(config.geometry), material); mesh.rotation.set(.45, .45, .1); group.add(mesh);
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .16 })); group.add(wire);

  const orbitGuides = createOrbitGuides(config);
  group.add(orbitGuides);

  const satellites = createSatelliteClusters(config);
  group.add(satellites);

  const spaceshipFleet = createSpaceshipFleet(index, config);
  scene.add(spaceshipFleet);

  const starsGeometry = new THREE.BufferGeometry();
  const stars = new Float32Array(500 * 3);
  for (let i = 0; i < stars.length; i += 3) {
    stars[i] = (Math.random() - .5) * 16;
    stars[i + 1] = (Math.random() - .5) * 10;
    stars[i + 2] = (Math.random() - .5) * 8;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  const particles = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: .018, transparent: true, opacity: .48 })); scene.add(particles);

  const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(config.color, 30, 12, 2); rim.position.set(-3.5, -1.5, 3); scene.add(rim);
  const ambient = new THREE.AmbientLight(0xffffff, .7); scene.add(ambient);

  threeSections.push({ sectionEl, host, scene, camera, renderer, group, mesh, wire, orbitGuides, satellites, spaceshipFleet, particles, key, rim, ambient, config, index, stickyReached: new Array(config.blocks.length).fill(false) });
}

sections.forEach((config, index) => setupScene(document.querySelector(`[data-section="${index}"]`), config, index));

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function smooth(v) { v = clamp01(v); return v * v * (3 - 2 * v); }

function projectToScreen(item, point) {
  const projected = point.clone().project(item.camera);
  return {
    x: (projected.x * .5 + .5) * innerWidth,
    y: (-projected.y * .5 + .5) * innerHeight,
    z: projected.z
  };
}

function getSafePosition(item, pos, card, side, fullOpacity = 0, modelScreen = null) {
  const title = item.sectionEl.querySelector('.section-title');
  const titleRect = title.getBoundingClientRect();
  const cardWidth = card.offsetWidth || Math.min(390, innerWidth * .34);
  const cardHeight = card.offsetHeight || 150;
  const margin = innerWidth < 700 ? 18 : 28;

  let x = pos.x;
  let y = pos.y;

  // Reserva el área del título y evita que cualquier tarjeta la invada.
  const safeTop = titleRect.bottom + (innerWidth < 700 ? 42 : 62);
  y = Math.max(y, safeTop + cardHeight * .5);
  y = Math.min(y, innerHeight - margin - cardHeight * .5);

  if (innerWidth < 700) {
    x = Math.max(margin + cardWidth * .5, Math.min(innerWidth - margin - cardWidth * .5, x));
    return { x, y };
  }

  // Cuando el párrafo alcanza opacidad máxima lo anclamos claramente a un lateral.
  // Esto evita que la órbita lo deje delante de la figura justo durante el momento de lectura.
  const modelX = modelScreen?.x ?? innerWidth * .5;
  const modelClearance = Math.min(260, Math.max(170, innerWidth * .16));
  const leftRightEdge = Math.min(innerWidth * .47, modelX - modelClearance);
  const rightLeftEdge = Math.max(innerWidth * .53, modelX + modelClearance);

  if (side === 'left') {
    const orbitX = Math.max(margin + cardWidth, Math.min(innerWidth * .49, x));
    const stableX = Math.max(margin + cardWidth, leftRightEdge);
    x = THREE.MathUtils.lerp(orbitX, stableX, smooth(fullOpacity));
  } else {
    const orbitX = Math.max(innerWidth * .51, Math.min(innerWidth - margin - cardWidth, x));
    const stableX = Math.min(innerWidth - margin - cardWidth, rightLeftEdge);
    x = THREE.MathUtils.lerp(orbitX, stableX, smooth(fullOpacity));
  }

  return { x, y };
}
function getResumePinnedPosition(item, index, card) {
  const titleRect = item.sectionEl.querySelector('.section-title').getBoundingClientRect();
  const margin = innerWidth < 700 ? 18 : 30;
  const cardWidth = card.offsetWidth || 360;
  const safeTop = titleRect.bottom + 72;
  const y = Math.min(innerHeight - 130, Math.max(safeTop + 110, innerHeight * 0.54));
  if (innerWidth < 700) {
    return { x: innerWidth * 0.5, y: index === 0 ? safeTop + 120 : Math.min(innerHeight - 150, safeTop + 330), side: 'left' };
  }
  return index === 0
    ? { x: margin + cardWidth, y, side: 'left' }
    : { x: innerWidth - margin - cardWidth, y, side: 'right' };
}

function getPortfolioSlot(item, index, card) {
  const titleRect = item.sectionEl.querySelector('.section-title').getBoundingClientRect();
  const rows = Math.ceil(item.config.blocks.length / 2);
  const row = Math.floor(index / 2);
  const side = index % 2 === 0 ? 'left' : 'right';
  const cardWidth = card.offsetWidth || (innerWidth < 700 ? 245 : 270);
  const cardHeight = card.offsetHeight || 96;

  // Márgenes deliberadamente amplios: las tarjetas no rozan los bordes de página.
  const sideMargin = innerWidth < 700 ? 34 : Math.max(110, innerWidth * 0.085);
  const safeTop = titleRect.bottom + (innerWidth < 700 ? 72 : 88);
  const safeBottom = innerHeight - (innerWidth < 700 ? 150 : 122);

  // Repartimos los centros en todo el alto útil y dejamos un gap mínimo REAL entre bordes.
  // Si la ventana no tiene altura suficiente, reducimos visualmente la tarjeta en lugar de juntarlas.
  const minGap = innerWidth < 700 ? 34 : 46;
  const usable = Math.max(1, safeBottom - safeTop);
  let step = rows > 1 ? usable / (rows - 1) : 0;
  const requiredStep = cardHeight + minGap;
  const compactScale = rows > 1 && step < requiredStep ? Math.max(0.78, step / requiredStep) : 1;
  card.style.setProperty('--portfolio-slot-scale', compactScale.toFixed(3));

  // Al escalar la tarjeta, su altura efectiva baja y recuperamos separación visual.
  const effectiveHeight = cardHeight * compactScale;
  const topCenter = safeTop + effectiveHeight * 0.5;
  const bottomCenter = safeBottom - effectiveHeight * 0.5;
  step = rows > 1 ? (bottomCenter - topCenter) / (rows - 1) : 0;
  const y = topCenter + step * row;

  if (innerWidth < 700) {
    return { x: innerWidth * 0.5, y, side };
  }
  return {
    x: side === 'left' ? sideMargin + cardWidth : innerWidth - sideMargin - cardWidth,
    y,
    side
  };
}

function getResumeTechnologyPosition(item, card) {
  const experience = item.sectionEl.querySelector('[data-block="1"]');
  if (!experience) return null;
  const expRect = experience.getBoundingClientRect();
  const cardHeight = card.offsetHeight || 130;
  const gap = innerWidth < 700 ? 18 : 26;
  const y = expRect.top - gap - cardHeight * 0.5;

  if (innerWidth < 700) {
    return { x: innerWidth * 0.5, y: Math.max(cardHeight * 0.5 + 18, y), side: 'left' };
  }

  // Misma columna que Experiencia profesional, pero claramente por encima.
  return {
    x: expRect.left,
    y: Math.max(cardHeight * 0.5 + 24, y),
    side: 'right'
  };
}

function avoidResumePinned(item, pos, card, side) {
  if (innerWidth < 700) return pos;
  const pinned = [0, 1].map(i => item.sectionEl.querySelector(`[data-block="${i}"]`)).filter(Boolean);
  const cardW = card.offsetWidth || 350;
  const cardH = card.offsetHeight || 150;
  let y = pos.y;
  pinned.forEach(el => {
    const r = el.getBoundingClientRect();
    const candidateLeft = side === 'left' ? pos.x - cardW : pos.x;
    const candidateRight = side === 'left' ? pos.x : pos.x + cardW;
    const candidateTop = y - cardH / 2;
    const candidateBottom = y + cardH / 2;
    const intersects = candidateRight > r.left - 18 && candidateLeft < r.right + 18 && candidateBottom > r.top - 18 && candidateTop < r.bottom + 18;
    if (intersects) {
      y = r.bottom + 24 + cardH / 2;
      if (y + cardH / 2 > innerHeight - 26) y = r.top - 24 - cardH / 2;
    }
  });
  return { x: pos.x, y: Math.max(cardH / 2 + 20, Math.min(innerHeight - cardH / 2 - 24, y)) };
}

function setConnector(item, index, opacity, modelAnchor, back = false) {
  const card = item.sectionEl.querySelector(back ? `[data-back-block="${index}"]` : `[data-block="${index}"]`);
  const connector = item.sectionEl.querySelector(back ? `[data-back-connector="${index}"]` : `[data-connector="${index}"]`);
  if (!card || !connector) return;
  if (opacity < .015) { connector.style.opacity = '0'; return; }

  const line = connector.querySelector('line');
  const circle = connector.querySelector('circle');
  const cardRect = card.getBoundingClientRect();
  const hostRect = item.host.getBoundingClientRect();
  const target = projectToScreen(item, modelAnchor);
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  const fromX = cardCenterX < target.x ? cardRect.right : cardRect.left;

  line.setAttribute('x1', (fromX - hostRect.left).toFixed(1));
  line.setAttribute('y1', (cardCenterY - hostRect.top).toFixed(1));
  line.setAttribute('x2', (target.x - hostRect.left).toFixed(1));
  line.setAttribute('y2', (target.y - hostRect.top).toFixed(1));
  circle.setAttribute('cx', (target.x - hostRect.left).toFixed(1));
  circle.setAttribute('cy', (target.y - hostRect.top).toFixed(1));
  connector.style.opacity = (opacity * (back ? .22 : .52)).toFixed(3);
}

function blockOpacity(i, cursor, count) {
  // Cada párrafo tiene una meseta central de opacidad 1 y fades largos a ambos lados.
  // PARAGRAPH_FULL_OPACITY_RATIO controla qué porcentaje de su vida visible permanece al 100%.
  const distance = Math.abs(i - cursor);
  const outer = 1.0 + PARAGRAPH_FADE_LENGTH * 0.18;
  const plateau = outer * PARAGRAPH_FULL_OPACITY_RATIO;
  if (distance <= plateau) return 1;
  if (distance >= outer) return 0;
  const fadeProgress = (distance - plateau) / Math.max(0.001, outer - plateau);
  return 1 - smooth(fadeProgress);
}

function update() {
  const viewportH = innerHeight;
  let activeSection = 0;
  const now = performance.now();

  threeSections.forEach((item, sectionIndex) => {
    const rect = item.sectionEl.getBoundingClientRect();
    const travel = item.sectionEl.offsetHeight - viewportH;
    const progress = clamp01((-rect.top) / Math.max(1, travel));
    if (rect.top <= viewportH * .45 && rect.bottom >= viewportH * .55) activeSection = sectionIndex;

    const frontBlocks = [...item.sectionEl.querySelectorAll('[data-block]')];
    const backBlocks = [...item.sectionEl.querySelectorAll('[data-back-block]')];
    const count = frontBlocks.length;
    const cursor = progress * Math.max(1, count - 1);
    const p = smooth(progress);

    // El modelo pivota siguiendo la órbita narrativa.
    item.group.position.x += ((Math.sin(p * Math.PI * 2) * .22) - item.group.position.x) * .07;
    item.group.position.y += ((Math.cos(p * Math.PI * 2) * .1) - item.group.position.y) * .07;
    item.group.rotation.y = p * Math.PI * (1.35 + sectionIndex * .2) + now * .00012;
    item.group.rotation.x = .3 + Math.sin(p * Math.PI * 2) * .15;
    const scale = 1 + Math.sin(p * Math.PI) * .16;
    item.group.scale.setScalar(scale);
    item.particles.rotation.y = now * .000025 * (sectionIndex + 1);

    // Las luces también orbitan alrededor de la figura.
    // La luz blanca recorre una órbita amplia y elevada; la luz de color va en sentido contrario
    // y con un radio algo menor para que el volumen cambie continuamente sin perder legibilidad.
    const lightTime = now * 0.00022;
    const keyAngle = lightTime + sectionIndex * 1.15;
    const rimAngle = -lightTime * 1.28 + sectionIndex * 0.85 + 1.7;
    item.key.position.set(
      Math.cos(keyAngle) * 5.4,
      3.8 + Math.sin(keyAngle * 0.73) * 1.6,
      Math.sin(keyAngle) * 5.4
    );
    item.rim.position.set(
      Math.cos(rimAngle) * 4.1,
      -0.6 + Math.sin(rimAngle * 1.17) * 2.5,
      Math.sin(rimAngle) * 4.1
    );
    item.key.target.position.copy(item.group.position);
    if (!item.key.target.parent) item.scene.add(item.key.target);

    updateSpaceshipFleet(item.spaceshipFleet, now);

    // Satélites: misma familia cromática, pequeñas órbitas independientes.
    item.orbitGuides.rotation.y = -p * Math.PI * 0.42 + now * 0.000018;
    item.orbitGuides.rotation.z = Math.sin(p * Math.PI * 2) * 0.055;

    item.satellites.rotation.y = -p * Math.PI * 1.05 + now * .000045;
    item.satellites.rotation.z = Math.sin(p * Math.PI * 2) * .09;
    item.satellites.children.forEach((cluster, c) => {
      // Las rocas se mueven lentamente dentro de su cluster.
      cluster.userData.rocks.rotation.y = now * .00026 * cluster.userData.speed;
      cluster.userData.rocks.rotation.x = Math.sin(now * .00022 + c) * .24;
    });

    item.group.updateMatrixWorld(true);
    const modelCenter = new THREE.Vector3(0, 0, .5).applyMatrix4(item.group.matrixWorld);
    const modelScreen = projectToScreen(item, modelCenter);

    frontBlocks.forEach((front, i) => {
      const back = backBlocks[i];
      let timelineOpacity = blockOpacity(i, cursor, count);

      // Resume: Educación y Experiencia profesional permanecen siempre a opacidad máxima.
      // Portfolio: cuando un bloque alcanza por primera vez el 100%, queda fijado a máxima opacidad.
      const pinnedResumeBlock = sectionIndex === 1 && (i === 0 || i === 1);
      if (sectionIndex === 2 && (item.stickyReached[i] || timelineOpacity >= 0.999)) {
        item.stickyReached[i] = true;
        timelineOpacity = 1;
      }
      const stickyPortfolioBlock = sectionIndex === 2 && item.stickyReached[i];
      const forceFrontVisible = pinnedResumeBlock || stickyPortfolioBlock;
      if (pinnedResumeBlock) timelineOpacity = 1;

      // Cada bloque tiene un desfase distinto y gira físicamente alrededor del centro.
      const angle = progress * Math.PI * 2 * PARAGRAPH_ORBIT_TURNS + i * 2.15 + sectionIndex * .55;
      const radiusX = 2.55 + (i % 2) * .28;
      const radiusY = 1.28 + (i % 3) * .13;
      const depth = Math.sin(angle);
      const orbitPoint = new THREE.Vector3(
        Math.cos(angle) * radiusX,
        Math.sin(angle * .72 + i * .4) * radiusY,
        depth * 1.65
      );
      const projected = projectToScreen(item, orbitPoint);
      // Los bloques fijados usan lados alternos estables para mantenerse legibles.
      const side = forceFrontVisible ? (i % 2 === 0 ? 'left' : 'right') : (Math.cos(angle) < 0 ? 'left' : 'right');
      let safe = getSafePosition(item, projected, front, side, forceFrontVisible ? 1 : timelineOpacity, modelScreen);
      let resolvedSide = side;

      // Resume: Educación y Experiencia profesional ocupan posiciones reservadas.
      // Los demás bloques nunca pueden solaparse con esas dos zonas estáticas.
      if (sectionIndex === 1 && pinnedResumeBlock) {
        const pinned = getResumePinnedPosition(item, i, front);
        safe = { x: pinned.x, y: pinned.y };
        resolvedSide = pinned.side;
      } else if (sectionIndex === 1) {
        // Tecnologías se presenta sobre Experiencia profesional, en su misma columna.
        // Así no compite con Educación en la parte superior izquierda.
        if (i === 3 && timelineOpacity > 0.02) {
          const technologyPos = getResumeTechnologyPosition(item, front);
          if (technologyPos) {
            safe = { x: technologyPos.x, y: technologyPos.y };
            resolvedSide = technologyPos.side;
          }
        } else {
          safe = avoidResumePinned(item, safe, front, side);
        }
      }

      // Portfolio: al quedar fijados, los bloques pasan a una retícula lateral compacta.
      // Esto permite conservar todos los proyectos visibles sin solapamientos.
      if (sectionIndex === 2 && stickyPortfolioBlock) {
        const slot = getPortfolioSlot(item, i, front);
        safe = { x: slot.x, y: slot.y };
        resolvedSide = slot.side;
      }

      // Los bloques fijados permanecen siempre en la capa frontal a opacidad 1.
      // El resto conserva el comportamiento orbital delante/detrás del modelo.
      const frontDepth = smooth((depth + .18) / .48);
      const backDepth = smooth((-depth + .12) / .42);
      const frontOpacity = forceFrontVisible ? 1 : timelineOpacity * frontDepth;
      const backOpacity = forceFrontVisible ? 0 : timelineOpacity * backDepth * .42;

      [front, back].forEach(block => {
        block.dataset.side = resolvedSide;
        block.style.left = `${safe.x}px`;
        block.style.top = `${safe.y}px`;
      });

      front.style.opacity = frontOpacity.toFixed(3);
      front.style.visibility = frontOpacity < .008 ? 'hidden' : 'visible';
      front.style.pointerEvents = frontOpacity > .28 ? 'auto' : 'none';

      back.style.opacity = backOpacity.toFixed(3);
      back.style.visibility = backOpacity < .008 ? 'hidden' : 'visible';

      // Punto de conexión levemente desplazado hacia el lado del bloque.
      const anchorLocal = new THREE.Vector3(resolvedSide === 'left' ? -.66 : .66, Math.sin(angle) * .22, .5);
      const anchorWorld = anchorLocal.applyMatrix4(item.group.matrixWorld);
      setConnector(item, i, frontOpacity, anchorWorld, false);
      setConnector(item, i, backOpacity, modelCenter, true);
    });
  });

  document.querySelectorAll('[data-dot]').forEach((dot, i) => dot.classList.toggle('active', i === activeSection));
}

function animate() {
  update();
  threeSections.forEach(item => item.renderer.render(item.scene, item.camera));
  requestAnimationFrame(animate);
}
animate();

let transitionLock = false;
window.addEventListener('wheel', (event) => {
  if (transitionLock) return;
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const sectionEls = [...document.querySelectorAll('.section')];

  for (let i = 0; i < sectionEls.length; i++) {
    const el = sectionEls[i];
    const start = el.offsetTop;
    const end = start + el.offsetHeight - innerHeight;
    const nearEnd = y >= end - 3 && y <= end + 8;
    const nearStart = y >= start - 8 && y <= start + 3;

    if (event.deltaY > 0 && nearEnd && i < sectionEls.length - 1) {
      transitionLock = true;
      sectionEls[i + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => transitionLock = false, 650);
      break;
    }
    if (event.deltaY < 0 && nearStart && i > 0) {
      transitionLock = true;
      const previous = sectionEls[i - 1];
      window.scrollTo({ top: previous.offsetTop + previous.offsetHeight - innerHeight, behavior: 'smooth' });
      setTimeout(() => transitionLock = false, 650);
      break;
    }
  }
  if (y >= max - 2) transitionLock = false;
}, { passive: true });

window.addEventListener('resize', () => {
  threeSections.forEach(item => {
    item.camera.aspect = innerWidth / innerHeight;
    item.camera.updateProjectionMatrix();
    item.renderer.setSize(innerWidth, innerHeight);
    item.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
});
