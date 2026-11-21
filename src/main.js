import * as THREE from 'three';
import './style.css';
import { createBubbleCluster, setupBubbleLights, updateBubbles } from './bubbles.js';

const profile = {
  name: 'Miguel Ferrer',
  // Uso BASE_URL para que la imagen cargue también si la web está en una subruta (GitHub Pages).
  image: `${import.meta.env.BASE_URL}drawing_icon.jpg`,
  role: 'Software and Game Developer',
  email: 'm.ferrerg@outlook.es',
  location: 'Seville, Spain'
};

// Cuánto scroll ocupa cada cambio de párrafo. Pruebo entre 0.45 (rápido) y 0.85 (muy progresivo).
const PARAGRAPH_FADE_LENGTH = 0.85;

// Qué parte de su vida visible deja cada párrafo a opacidad máxima.
const PARAGRAPH_FULL_OPACITY_RATIO = 0.60;

// Cuántas vueltas dan los párrafos alrededor del objeto 3D.
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
    id: 'portfolio', label: 'Portfolio', geometry: 'bubbles', color: 0x22d3a8,
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

// Redes sociales junto a la tarjeta de contacto. Los iconos son SVG en línea para no depender de archivos externos.
const socialLinks = [
  {
    label: 'ArtStation',
    url: 'https://www.artstation.com/miguel_ferrer',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z"/></svg>'
  },
  {
    label: 'GitHub',
    url: 'https://github.com/Mike-FG',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/miguelferrerorocher/',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>'
  }
];

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
  <div class="identity-dock">
  <nav class="social-links" aria-label="Redes sociales">
    ${socialLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label}" title="${link.label}">${link.icon}</a>`).join('')}
  </nav>
  <button class="identity expanded" data-identity type="button" aria-expanded="true" aria-label="Ocultar datos de contacto">
    <img class="identity-avatar" src="${profile.image}" alt="${profile.name}">
    <div class="identity-content">
      <strong>${profile.name}</strong>
      <div class="identity-details">
        <p>${profile.role}</p>
        <p><a href="mailto:${profile.email}">${profile.email}</a><br>${profile.location}</p>
      </div>
    </div>
    <span class="identity-toggle" aria-hidden="true">−</span>
  </button>
  </div>
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
    // Nudo toroidal para la primera escena: se lee bien y evita la rigidez del reloj de arena.
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
  // Prisma triangular muy fino para que se reconozca como triángulo desde cualquier ángulo.
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
  // Trayectoria amplia alrededor de una zona de exclusión. Compruebo todos los puntos de la curva y,
  // si hace falta, la escalo hacia fuera para que ni la nave ni la estela atraviesen la figura
  // (Catmull-Rom suaviza demasiado).
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

  // Compruebo la curva completa punto a punto.
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

      // Dos estelas con un volumen mínimo; las voy construyendo y no desaparecen.
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

      // Construyo dos estelas persistentes: tras una vuelta completa la ruta queda dibujada.
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
  // Escena 3: varias pompas con shader de película fina (bubbles.js).
  // Las otras escenas siguen con su figura sólida y wireframe.
  const bubbles = config.geometry === 'bubbles' ? createBubbleCluster() : null;
  let mesh, wire;
  if (bubbles) {
    group.add(bubbles.root);
    mesh = bubbles.hero;
  } else {
    const material = new THREE.MeshPhysicalMaterial({ color: config.color, roughness: 0.25, metalness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.18 });
    mesh = new THREE.Mesh(makeGeometry(config.geometry), material); mesh.rotation.set(.45, .45, .1); group.add(mesh);
    wire = new THREE.LineSegments(new THREE.WireframeGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .16 })); group.add(wire);
  }

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
  if (bubbles) setupBubbleLights(scene, key, rim, ambient, bubbles);

  threeSections.push({ sectionEl, host, scene, camera, renderer, group, mesh, wire, bubbles, orbitGuides, satellites, spaceshipFleet, particles, key, rim, ambient, config, index, stickyReached: new Array(config.blocks.length).fill(false) });
}

sections.forEach((config, index) => setupScene(document.querySelector(`[data-section="${index}"]`), config, index));

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function smooth(v) { v = clamp01(v); return v * v * (3 - 2 * v); }

// Ajustes de animación de las tarjetas (tiempos en segundos: menos = más reactivo, más = más suave).
const PROGRESS_SMOOTH_TAU = 0.14;   // amortigua el scroll (evita los saltos de la rueda)
const POSITION_SMOOTH_TAU = 0.10;   // suaviza el movimiento de cada tarjeta hacia su destino
const OPACITY_SMOOTH_TAU = 0.09;    // suaviza aparición/desaparición y el paso a "fijada"
const CARD_ENTER_OFFSET = 14;       // px que sube la tarjeta al aparecer
const CARD_ENTER_SCALE = 0.04;      // escala inicial = 1 - este valor
const CARD_ENTER_BLUR = 5;          // px de desenfoque inicial (solo capa frontal)

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = reduceMotionQuery.matches;
reduceMotionQuery.addEventListener?.('change', event => { reduceMotion = event.matches; });

// Vectores temporales para no crear objetos en cada frame.
const _projVec = new THREE.Vector3();
const _orbitVec = new THREE.Vector3();
const _anchorVec = new THREE.Vector3();
const _modelCenter = new THREE.Vector3();

// Elementos y estado de cada sección, calculados una sola vez.
function getCache(item) {
  if (item.cache) return item.cache;
  const el = item.sectionEl;
  const fronts = [...el.querySelectorAll('[data-block]')];
  const backs = [...el.querySelectorAll('[data-back-block]')];
  const connectors = attr => [...el.querySelectorAll(`[${attr}]`)].map(g => ({
    g, line: g.querySelector('line'), circle: g.querySelector('circle'), visible: null
  }));
  item.cache = {
    title: el.querySelector('.section-title'),
    fronts,
    backs,
    frontConn: connectors('data-connector'),
    backConn: connectors('data-back-connector'),
    states: fronts.map(() => ({ init: false, cx: 0, cy: 0, t: 0, f: 0, eStr: '', blur: '' })),
    dp: null
  };
  return item.cache;
}

function projectToScreen(item, point) {
  _projVec.copy(point).project(item.camera);
  return {
    x: (_projVec.x * .5 + .5) * innerWidth,
    y: (-_projVec.y * .5 + .5) * innerHeight,
    z: _projVec.z
  };
}

function getSafePosition(item, pos, card, side, fullOpacity = 0, modelScreen = null) {
  const title = getCache(item).title;
  const titleRect = title.getBoundingClientRect();
  const cardWidth = card.offsetWidth || Math.min(390, innerWidth * .34);
  const cardHeight = card.offsetHeight || 150;
  const margin = innerWidth < 700 ? 18 : 28;

  let x = pos.x;
  let y = pos.y;

  // Reservo el área del título para que ninguna tarjeta la invada.
  const safeTop = titleRect.bottom + (innerWidth < 700 ? 42 : 62);
  y = Math.max(y, safeTop + cardHeight * .5);
  y = Math.min(y, innerHeight - margin - cardHeight * .5);

  if (innerWidth < 700) {
    x = Math.max(margin + cardWidth * .5, Math.min(innerWidth - margin - cardWidth * .5, x));
    return { x, y };
  }

  // Al llegar a opacidad máxima anclo la tarjeta a un lateral, para que la órbita no la deje
  // delante de la figura mientras se lee.
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
  const titleRect = getCache(item).title.getBoundingClientRect();
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
  const titleRect = getCache(item).title.getBoundingClientRect();
  const rows = Math.ceil(item.config.blocks.length / 2);
  const row = Math.floor(index / 2);
  const side = index % 2 === 0 ? 'left' : 'right';
  const cardWidth = card.offsetWidth || (innerWidth < 700 ? 245 : 270);
  const cardHeight = card.offsetHeight || 96;

  // Márgenes amplios para que las tarjetas no rocen los bordes.
  const sideMargin = innerWidth < 700 ? 34 : Math.max(110, innerWidth * 0.085);
  const safeTop = titleRect.bottom + (innerWidth < 700 ? 72 : 88);
  const safeBottom = innerHeight - (innerWidth < 700 ? 150 : 165);

  // Reparto los centros por todo el alto útil dejando un hueco mínimo real entre bordes.
  // Si no cabe, reduzco la tarjeta en vez de juntarlas.
  const minGap = innerWidth < 700 ? 34 : 46;
  const usable = Math.max(1, safeBottom - safeTop);
  let step = rows > 1 ? usable / (rows - 1) : 0;
  const requiredStep = cardHeight + minGap;
  const compactScale = rows > 1 && step < requiredStep ? Math.max(0.78, step / requiredStep) : 1;
  card.style.setProperty('--portfolio-slot-scale', compactScale.toFixed(3));

  // Al escalar la tarjeta baja su altura efectiva, así que recupero separación.
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

function getAboutSlot(item, index, card) {
  // Sobre mí: dos columnas laterales (una en móvil), por debajo del título y por encima de la tarjeta
  // de contacto, con separación uniforme.
  const titleRect = getCache(item).title.getBoundingClientRect();
  const mobile = innerWidth < 700;
  const count = item.config.blocks.length;
  const cols = mobile ? 1 : 2;
  const rows = Math.ceil(count / cols);
  const row = Math.floor(index / cols);
  const side = index % 2 === 0 ? 'left' : 'right';
  const cardWidth = card.offsetWidth || 340;
  const cardHeight = card.offsetHeight || 150;

  const margin = mobile ? 26 : Math.max(24, Math.min(72, innerWidth * 0.05));
  const safeTop = titleRect.bottom + (mobile ? 36 : 56);
  const safeBottom = innerHeight - (mobile ? 96 : 185);
  const minGap = mobile ? 14 : 28;
  const usable = Math.max(1, safeBottom - safeTop);

  // Si no caben con el hueco mínimo, las reduzco un poco en lugar de solaparlas.
  const needed = rows * cardHeight + (rows - 1) * minGap;
  const compactScale = needed > usable ? Math.max(0.62, usable / needed) : 1;
  card.style.setProperty('--portfolio-slot-scale', compactScale.toFixed(3));

  const effectiveHeight = cardHeight * compactScale;
  const step = rows > 1 ? (usable - effectiveHeight) / (rows - 1) : 0;
  const y = safeTop + effectiveHeight * 0.5 + step * row;

  if (mobile) return { x: innerWidth * 0.5, y, side };
  return {
    x: side === 'left' ? margin + cardWidth : innerWidth - margin - cardWidth,
    y,
    side
  };
}

function getResumeTechnologyPosition(item, card) {
  const experience = getCache(item).fronts[1];
  if (!experience) return null;
  const expRect = experience.getBoundingClientRect();
  const cardHeight = card.offsetHeight || 130;
  const gap = innerWidth < 700 ? 18 : 26;
  const y = expRect.top - gap - cardHeight * 0.5;

  if (innerWidth < 700) {
    return { x: innerWidth * 0.5, y: Math.max(cardHeight * 0.5 + 18, y), side: 'left' };
  }

  // Misma columna que Experiencia profesional, pero por encima.
  return {
    x: expRect.left,
    y: Math.max(cardHeight * 0.5 + 24, y),
    side: 'right'
  };
}

function avoidResumePinned(item, pos, card, side) {
  if (innerWidth < 700) return pos;
  const pinned = [0, 1].map(i => getCache(item).fronts[i]).filter(Boolean);
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

function setConnector(item, index, opacity, modelAnchor, back = false, draw = 1) {
  const cache = getCache(item);
  const card = (back ? cache.backs : cache.fronts)[index];
  const conn = (back ? cache.backConn : cache.frontConn)[index];
  if (!card || !conn) return;
  if (opacity < .015) {
    if (conn.visible !== false) { conn.g.style.opacity = '0'; conn.visible = false; }
    return;
  }
  conn.visible = true;

  const cardRect = card.getBoundingClientRect();
  const hostRect = item.host.getBoundingClientRect();
  const target = projectToScreen(item, modelAnchor);
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  const fromX = cardCenterX < target.x ? cardRect.right : cardRect.left;

  // La línea crece desde la tarjeta hasta el modelo a medida que aparece.
  const x1 = fromX - hostRect.left;
  const y1 = cardCenterY - hostRect.top;
  const tx = target.x - hostRect.left;
  const ty = target.y - hostRect.top;
  const x2 = x1 + (tx - x1) * draw;
  const y2 = y1 + (ty - y1) * draw;

  conn.line.setAttribute('x1', x1.toFixed(1));
  conn.line.setAttribute('y1', y1.toFixed(1));
  conn.line.setAttribute('x2', x2.toFixed(1));
  conn.line.setAttribute('y2', y2.toFixed(1));
  conn.circle.setAttribute('cx', x2.toFixed(1));
  conn.circle.setAttribute('cy', y2.toFixed(1));
  conn.g.style.opacity = (opacity * (back ? .22 : .52)).toFixed(3);
}

function blockOpacity(i, cursor, count) {
  // Cada párrafo tiene una meseta de opacidad 1 y fades largos a los lados.
  // PARAGRAPH_FULL_OPACITY_RATIO decide cuánto dura esa meseta.
  const distance = Math.abs(i - cursor);
  const outer = 1.0 + PARAGRAPH_FADE_LENGTH * 0.18;
  const plateau = outer * PARAGRAPH_FULL_OPACITY_RATIO;
  if (distance <= plateau) return 1;
  if (distance >= outer) return 0;
  const fadeProgress = (distance - plateau) / Math.max(0.001, outer - plateau);
  return 1 - smooth(fadeProgress);
}

let lastFrameTime = performance.now();
const progressDots = [...document.querySelectorAll('[data-dot]')];

function update() {
  const viewportH = innerHeight;
  let activeSection = 0;
  const now = performance.now();
  const dt = Math.min(0.1, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;

  // Suavizado independiente de los FPS; con movimiento reducido no hay inercia.
  const kProgress = reduceMotion ? 1 : 1 - Math.exp(-dt / PROGRESS_SMOOTH_TAU);
  const kPosition = reduceMotion ? 1 : 1 - Math.exp(-dt / POSITION_SMOOTH_TAU);
  const kOpacity = reduceMotion ? 1 : 1 - Math.exp(-dt / OPACITY_SMOOTH_TAU);
  const mobile = innerWidth < 700;

  threeSections.forEach((item, sectionIndex) => {
    const cache = getCache(item);
    const rect = item.sectionEl.getBoundingClientRect();
    const travel = item.sectionEl.offsetHeight - viewportH;
    const rawProgress = clamp01((-rect.top) / Math.max(1, travel));
    if (rect.top <= viewportH * .45 && rect.bottom >= viewportH * .55) activeSection = sectionIndex;

    // Las secciones fuera de pantalla ni se actualizan ni se renderizan.
    item.visible = rect.bottom > 0 && rect.top < viewportH;
    if (!item.visible) {
      cache.dp = rawProgress;
      cache.states.forEach(state => { state.init = false; });
      return;
    }

    // Amortiguo el progreso: la rueda avanza a saltos y no quiero que las tarjetas vayan a tirones.
    cache.dp = cache.dp === null ? rawProgress : cache.dp + (rawProgress - cache.dp) * kProgress;
    const progress = cache.dp;

    const frontBlocks = cache.fronts;
    const backBlocks = cache.backs;
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

    // Las luces orbitan alrededor de la figura: la blanca en una órbita amplia y elevada, la de color en
    // sentido contrario y con menos radio, para que el volumen cambie sin perder legibilidad.
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
    if (item.bubbles) updateBubbles(item.bubbles, now);

    // Satélites: misma familia cromática, pequeñas órbitas independientes.
    item.orbitGuides.rotation.y = -p * Math.PI * 0.42 + now * 0.000018;
    item.orbitGuides.rotation.z = Math.sin(p * Math.PI * 2) * 0.055;

    item.satellites.rotation.y = -p * Math.PI * 1.05 + now * .000045;
    item.satellites.rotation.z = Math.sin(p * Math.PI * 2) * .09;
    item.satellites.children.forEach((cluster, c) => {
      // Las rocas se mueven despacio dentro de su cluster.
      cluster.userData.rocks.rotation.y = now * .00026 * cluster.userData.speed;
      cluster.userData.rocks.rotation.x = Math.sin(now * .00022 + c) * .24;
    });

    item.group.updateMatrixWorld(true);
    _modelCenter.set(0, 0, .5).applyMatrix4(item.group.matrixWorld);
    const modelScreen = projectToScreen(item, _modelCenter);

    frontBlocks.forEach((front, i) => {
      const back = backBlocks[i];
      const state = cache.states[i];
      let timelineOpacity = blockOpacity(i, cursor, count);

      // Resume: Educación y Experiencia siempre a opacidad máxima.
      // Portfolio: cuando un bloque llega por primera vez al 100% lo dejo fijado.
      const pinnedResumeBlock = sectionIndex === 1 && (i === 0 || i === 1);
      // En Sobre mí pasa lo mismo: las tarjetas aparecen una a una y se quedan.
      const stickySection = sectionIndex === 0 || sectionIndex === 2;
      if (stickySection && (item.stickyReached[i] || timelineOpacity >= 0.999)) {
        item.stickyReached[i] = true;
        timelineOpacity = 1;
      }
      const stickyBlock = stickySection && item.stickyReached[i];
      // Sobre mí: la tarjeta nace ya en su hueco final, sin pasar por la órbita, y no cambia de capa;
      // por eso su opacidad sigue la línea de tiempo en vez de forzarse a 1.
      const slotFromStart = sectionIndex === 0;
      const forceFrontVisible = pinnedResumeBlock || (stickyBlock && !slotFromStart);
      if (pinnedResumeBlock) timelineOpacity = 1;

      // Cada bloque tiene su desfase y gira alrededor del centro.
      const angle = progress * Math.PI * 2 * PARAGRAPH_ORBIT_TURNS + i * 2.15 + sectionIndex * .55;
      const radiusX = 2.55 + (i % 2) * .28;
      const radiusY = 1.28 + (i % 3) * .13;
      const depth = Math.sin(angle);
      _orbitVec.set(
        Math.cos(angle) * radiusX,
        Math.sin(angle * .72 + i * .4) * radiusY,
        depth * 1.65
      );
      const projected = projectToScreen(item, _orbitVec);
      // Los bloques fijados usan lados alternos estables para que se lean bien.
      const side = forceFrontVisible ? (i % 2 === 0 ? 'left' : 'right') : (Math.cos(angle) < 0 ? 'left' : 'right');
      let safe = getSafePosition(item, projected, front, side, forceFrontVisible ? 1 : timelineOpacity, modelScreen);
      let resolvedSide = side;

      // Resume: Educación y Experiencia ocupan posiciones reservadas; el resto no puede solaparse con ellas.
      if (sectionIndex === 1 && pinnedResumeBlock) {
        const pinned = getResumePinnedPosition(item, i, front);
        safe = { x: pinned.x, y: pinned.y };
        resolvedSide = pinned.side;
      } else if (sectionIndex === 1) {
        // Tecnologías va sobre Experiencia profesional, en su misma columna, para que no compita con Educación.
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

      // Portfolio: al fijarse, los bloques pasan a una retícula lateral compacta para que quepan todos sin solaparse.
      if (stickyBlock || slotFromStart) {
        const slot = sectionIndex === 0 ? getAboutSlot(item, i, front) : getPortfolioSlot(item, i, front);
        safe = { x: slot.x, y: slot.y };
        resolvedSide = slot.side;
      }

      // Centro objetivo de la tarjeta. Antes el lado se resolvía con un ancla CSS que cambiaba de golpe;
      // ahora trabajo con coordenadas de centro para poder suavizarlo.
      const w = front.offsetWidth;
      const h = front.offsetHeight;
      const targetCx = mobile ? safe.x : (resolvedSide === 'left' ? safe.x - w / 2 : safe.x + w / 2);
      const targetCy = safe.y;

      // Opacidad suavizada para evitar el pop al fijar una tarjeta o cambiar de capa.
      const forced = forceFrontVisible ? 1 : 0;
      if (!state.init) { state.t = timelineOpacity; state.f = forced; }
      else {
        state.t += (timelineOpacity - state.t) * kOpacity;
        state.f += (forced - state.f) * kOpacity;
      }

      // Los bloques fijados quedan siempre en la capa frontal a opacidad 1; el resto sigue la órbita
      // delante/detrás del modelo.
      const frontDepth = slotFromStart ? 1 : smooth((depth + .18) / .48);
      const backDepth = slotFromStart ? 0 : smooth((-depth + .12) / .42);
      const frontOpacity = state.t * frontDepth + (1 - state.t * frontDepth) * state.f;
      const backOpacity = state.t * backDepth * .42 * (1 - state.f);
      const hidden = frontOpacity < .008 && backOpacity < .008;

      // Si la tarjeta es invisible la coloco directamente; si es visible, se desliza hacia su destino.
      if (!state.init || hidden) {
        state.cx = targetCx; state.cy = targetCy; state.init = true;
      } else {
        state.cx += (targetCx - state.cx) * kPosition;
        state.cy += (targetCy - state.cy) * kPosition;
      }

      // Entrada: elevación, escala y desenfoque ligados a la misma curva que la opacidad.
      const ee = reduceMotion ? 1 : smooth(state.t);
      const lift = (1 - ee) * CARD_ENTER_OFFSET;
      const entryScale = 1 - (1 - ee) * CARD_ENTER_SCALE;
      const transform = `translate3d(${(state.cx - w / 2).toFixed(2)}px, ${(state.cy - h / 2 + lift).toFixed(2)}px, 0) scale(${entryScale.toFixed(4)})`;
      front.style.transform = transform;
      back.style.transform = transform;

      // --e alimenta el escalonado de los textos internos (style.css).
      const eStr = ee.toFixed(3);
      if (state.eStr !== eStr) {
        front.style.setProperty('--e', eStr);
        back.style.setProperty('--e', eStr);
        state.eStr = eStr;
      }

      const blur = reduceMotion ? 0 : (1 - ee) * CARD_ENTER_BLUR;
      const blurStr = blur > .08 ? `blur(${blur.toFixed(2)}px)` : '';
      if (state.blur !== blurStr) { front.style.filter = blurStr; state.blur = blurStr; }

      front.style.opacity = frontOpacity.toFixed(3);
      front.style.visibility = frontOpacity < .008 ? 'hidden' : 'visible';
      front.style.pointerEvents = frontOpacity > .28 ? 'auto' : 'none';

      back.style.opacity = backOpacity.toFixed(3);
      back.style.visibility = backOpacity < .008 ? 'hidden' : 'visible';

      // Punto de conexión desplazado un poco hacia el lado del bloque.
      _anchorVec.set(resolvedSide === 'left' ? -.66 : .66, Math.sin(angle) * .22, .5).applyMatrix4(item.group.matrixWorld);
      setConnector(item, i, frontOpacity, _anchorVec, false, ee);
      setConnector(item, i, backOpacity, _modelCenter, true, ee);
    });
  });

  progressDots.forEach((dot, i) => dot.classList.toggle('active', i === activeSection));
}

function animate() {
  update();
  threeSections.forEach(item => {
    if (item.visible !== false) item.renderer.render(item.scene, item.camera);
  });
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
