import * as THREE from 'three';

// Pompas de jabón iridiscentes.
// Cada pompa es una esfera con su ShaderMaterial, que imita una película fina:
//   - interferencia de película fina: el color depende del grosor (fluye con ruido y se acumula abajo)
//     y del ángulo de visión, lo que da bandas rosa / amarillo / cian / verde
//   - fresnel: centro casi transparente y borde cargado de color
//   - reflejo tenue de un cielo procedural con nubes
//   - brillos especulares de las luces de la escena (paso sus posiciones cada frame)
//   - deformación animada ligera, para que la pompa respire

const VERTEX_SHADER = /* glsl */`
  uniform float uTime;
  uniform float uSeed;
  uniform float uWobble;

  varying vec3 vWorldPos;
  varying vec3 vN;
  varying vec3 vDir;

  vec3 deform(vec3 p) {
    float w = sin(p.x * 2.7 + uTime * 1.15 + uSeed * 6.0)
            + sin(p.y * 3.3 - uTime * 0.95 + uSeed * 3.0)
            + sin(p.z * 2.3 + uTime * 0.80 + uSeed * 9.0);
    return p * (1.0 + uWobble * w);
  }

  void main() {
    vec3 n = normalize(position);
    vec3 t1 = normalize(cross(n, abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
    vec3 t2 = cross(n, t1);
    float e = 0.02;

    // Normal de la superficie deformada, por diferencias finitas.
    vec3 p0 = deform(n);
    vec3 p1 = deform(normalize(n + t1 * e));
    vec3 p2 = deform(normalize(n + t2 * e));
    vec3 nl = normalize(cross(p1 - p0, p2 - p0));
    if (dot(nl, n) < 0.0) nl = -nl;

    vec4 wp = modelMatrix * vec4(p0, 1.0);
    vWorldPos = wp.xyz;
    vN = normalize(mat3(modelMatrix) * nl);
    vDir = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  uniform float uTime;
  uniform float uSeed;
  uniform float uThickness;
  uniform float uOpacity;
  uniform vec3 uLightPos[4];
  uniform vec3 uLightCol[4];

  varying vec3 vWorldPos;
  varying vec3 vN;
  varying vec3 vDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 3; i++) {
      s += a * vnoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return s;
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vWorldPos);
    if (!gl_FrontFacing) N = -N;
    float ndv = clamp(dot(N, V), 0.0, 1.0);

    // Grosor de la película: remolinos con ruido y más grosor abajo por la gravedad
    vec3 q = vDir * 1.7 + vec3(uSeed * 10.0);
    vec3 warp = vec3(
      fbm(q + vec3(0.0, uTime * 0.05, 0.0)),
      fbm(q + vec3(7.1, 3.3, uTime * 0.04)),
      fbm(q + vec3(2.2, 5.5, 1.1))
    );
    float flow = fbm(q * 1.3 + warp * 2.2 + vec3(0.0, -uTime * 0.06, 0.0));
    float drain = 0.5 - vDir.y * 0.5;
    float thick = uThickness * (0.50 + 0.95 * flow + 0.45 * drain);

    // Interferencia de película fina (aproximación)
    float cosT = sqrt(max(0.0, 1.0 - (1.0 - ndv * ndv) / (1.33 * 1.33)));
    float opd = 2.0 * 1.33 * thick * cosT;
    float phase = opd * 2.3;
    vec3 film = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.00, 0.33, 0.67)));
    film = mix(vec3(dot(film, vec3(0.333))), film, 0.82);   // un punto pastel
    film = mix(film, vec3(1.0), 0.16);

    // Reflejo de cielo procedural
    vec3 R = reflect(-V, N);
    float h = R.y;
    vec3 sky = mix(vec3(1.00, 0.70, 0.86), vec3(0.50, 0.76, 1.00), smoothstep(-0.5, 0.8, h));
    float clouds = smoothstep(0.42, 0.78, fbm(R * 2.4 + vec3(uSeed * 5.0, uTime * 0.03, 0.0)));
    sky = mix(sky, vec3(0.78, 0.80, 0.88), clouds * 0.7);
    float hh = (h + 0.05) * 3.5;
    sky += vec3(1.0, 0.85, 0.5) * exp(-hh * hh) * 0.35;

    // Composición: centro casi transparente y borde cargado de color
    float fres = pow(1.0 - ndv, 2.4);
    float edge = pow(1.0 - ndv, 6.0);
    vec3 col = film * (0.10 + 1.10 * fres);
    col += sky * mix(vec3(1.0), film, 0.55) * (0.10 + 0.55 * fres);
    col += film * edge * 0.9 + vec3(edge * 0.15);

    // Brillos de las luces de la escena
    for (int i = 0; i < 4; i++) {
      vec3 L = normalize(uLightPos[i] - vWorldPos);
      vec3 H = normalize(L + V);
      float nh = max(dot(N, H), 0.0);
      float s = pow(nh, 260.0) * 2.2 + pow(nh, 40.0) * 0.18;
      col += uLightCol[i] * s * mix(vec3(1.0), film, 0.25);
    }

    if (!gl_FrontFacing) col *= 0.55;   // la cara trasera aporta menos

    // Alpha = intensidad y rgb normalizado: se comporta como suma de luz pero deja un alpha válido en el canvas.
    float m = max(col.r, max(col.g, col.b));
    float a = clamp(m * uOpacity, 0.0, 1.0);
    gl_FragColor = vec4(col / max(m, 0.001), a);
  }
`;

// Posición base, radio y carácter de cada pompa; la primera es la protagonista.
const BUBBLE_DEFS = [
  { p: [0.0, 0.0, 0.0],    r: 1.45, wobble: 0.012, thickness: 1.00, seed: 0.13 },
  { p: [-2.3, 0.9, -0.6],  r: 0.55, wobble: 0.020, thickness: 0.90, seed: 0.41 },
  { p: [2.4, -0.7, 0.4],   r: 0.42, wobble: 0.022, thickness: 1.10, seed: 0.67 },
  { p: [1.9, 1.5, -1.0],   r: 0.30, wobble: 0.026, thickness: 0.80, seed: 0.29 },
  { p: [-1.7, -1.3, 0.9],  r: 0.34, wobble: 0.024, thickness: 1.20, seed: 0.83 },
  { p: [0.3, 2.0, -0.4],   r: 0.22, wobble: 0.028, thickness: 0.95, seed: 0.52 },
  { p: [-2.8, -0.1, 1.2],  r: 0.18, wobble: 0.030, thickness: 1.05, seed: 0.74 },
  { p: [2.9, 0.6, -1.4],   r: 0.26, wobble: 0.026, thickness: 0.85, seed: 0.19 },
  { p: [0.9, -1.8, 1.1],   r: 0.16, wobble: 0.032, thickness: 1.15, seed: 0.91 },
  { p: [-0.6, -2.1, -0.8], r: 0.20, wobble: 0.030, thickness: 1.00, seed: 0.36 }
];

export function createBubbleCluster() {
  const geometry = new THREE.SphereGeometry(1, 128, 96);

  // Uniforms compartidos por todas las pompas (misma referencia, se actualizan una vez).
  const uniforms = {
    uTime: { value: 0 },
    uLightPos: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
    // Color de cada brillo: llave blanca cálida, rim rosa, relleno cian y luz cálida amarilla.
    uLightCol: { value: [
      new THREE.Vector3(1.00, 0.95, 0.88),
      new THREE.Vector3(1.00, 0.55, 0.85),
      new THREE.Vector3(0.40, 0.90, 1.00),
      new THREE.Vector3(1.00, 0.85, 0.45)
    ] }
  };

  const root = new THREE.Group();
  const items = BUBBLE_DEFS.map((def, i) => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        uSeed: { value: def.seed },
        uWobble: { value: def.wobble },
        uThickness: { value: def.thickness },
        uOpacity: { value: i === 0 ? 0.95 : 0.85 }
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...def.p);
    mesh.scale.setScalar(def.r);
    root.add(mesh);
    return {
      mesh,
      base: new THREE.Vector3(...def.p),
      radius: def.r,
      phase: i * 1.7 + 0.4,
      speed: 0.32 + (i % 4) * 0.07,
      // La protagonista casi no se mueve; las pequeñas flotan más.
      amp: i === 0 ? 0.05 : 0.12 + 0.1 / (1 + def.r * 4)
    };
  });

  return { root, hero: items[0].mesh, items, uniforms, geometry, lights: [], fill: null, warm: null };
}

// Luces de la escena de pompas: llave cálida, rim rosa, relleno cian, una cálida amarilla para las bandas
// amarillas y una hemisférica suave para el resto de objetos.
export function setupBubbleLights(scene, key, rim, ambient, cluster) {
  key.color.set(0xfff0dc);
  key.intensity = 3.4;
  rim.color.set(0xff8ad6);
  rim.intensity = 26;
  ambient.color.set(0xcfe8ff);
  ambient.intensity = 0.3;

  const fill = new THREE.PointLight(0x6fe9ff, 22, 14, 2);
  const warm = new THREE.PointLight(0xffd37a, 18, 14, 2);
  const hemi = new THREE.HemisphereLight(0xbfe6ff, 0x1c2a4a, 0.55);
  scene.add(fill, warm, hemi);

  cluster.fill = fill;
  cluster.warm = warm;
  cluster.lights = [key, rim, fill, warm];
}

export function updateBubbles(cluster, now) {
  const t = now * 0.001;
  cluster.uniforms.uTime.value = t;

  // Las luces de relleno y cálida orbitan despacio en sentidos distintos.
  cluster.fill.position.set(Math.cos(-t * 0.35 + 2.4) * 4.6, 1.2 + Math.sin(t * 0.27) * 1.6, Math.sin(-t * 0.35 + 2.4) * 4.6);
  cluster.warm.position.set(Math.cos(t * 0.21 + 4.0) * 5.2, 3.2 + Math.sin(t * 0.31) * 1.2, Math.sin(t * 0.21 + 4.0) * 3.8 + 1.0);
  cluster.lights.forEach((light, i) => cluster.uniforms.uLightPos.value[i].copy(light.position));

  // Flotación suave de cada pompa.
  cluster.items.forEach(item => {
    const a = t * item.speed + item.phase;
    item.mesh.position.set(
      item.base.x + Math.sin(a * 0.9) * item.amp,
      item.base.y + Math.sin(a * 1.3 + 1.0) * item.amp * 1.4,
      item.base.z + Math.cos(a * 0.7) * item.amp
    );
    item.mesh.scale.setScalar(item.radius * (1 + Math.sin(a * 1.7) * 0.012));
  });
}
