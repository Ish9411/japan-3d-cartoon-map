// ES-module build for r160+
// Imports
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js';

(function() {
  const app = document.getElementById('app');

  // ---- Scene setup ----
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7ab6e6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  app.appendChild(renderer.domElement);

  // Label renderer for text labels
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  app.appendChild(labelRenderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(-80, 140, 220);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.minDistance = 60;
  controls.maxDistance = 500;

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(-150, 220, 100);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -300;
  sun.shadow.camera.right = 300;
  sun.shadow.camera.top = 300;
  sun.shadow.camera.bottom = -300;
  scene.add(sun);

  // ---- Helpers: toon material ----
  function makeToonMaterial(colorHex) {
    const size = 4;
    const data = new Uint8Array(3 * size);
    for (let i = 0; i < size; i++) {
      const shade = Math.round((i / (size - 1)) * 255);
      data[i * 3 + 0] = shade;
      data[i * 3 + 1] = shade;
      data[i * 3 + 2] = shade;
    }
    const gradientMap = new THREE.DataTexture(data, size, 1, THREE.RGBFormat);
    gradientMap.needsUpdate = true;

    return new THREE.MeshToonMaterial({
      color: new THREE.Color(colorHex),
      gradientMap
    });
  }

  // ---- Sea plane ----
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 800),
    new THREE.MeshPhongMaterial({ color: 0x5ca9e1, shininess: 10 })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -5;
  sea.receiveShadow = true;
  scene.add(sea);

  // ---- Island helpers ----
  function roundedPolygonShape(points, radius) {
    const shape = new THREE.Shape();
    if (points.length < 3) return shape;
    const vec2 = (x, z) => new THREE.Vector2(x, z);
    const p0 = vec2(points[0][0], points[0][1]);
    shape.moveTo(p0.x, p0.y);
    for (let i = 0; i < points.length; i++) {
      const pCurr = vec2(points[i][0], points[i][1]);
      const pNext = vec2(points[(i + 1) % points.length][0], points[(i + 1) % points.length][1]);
      const dir = pNext.clone().sub(pCurr).normalize();
      const len = pNext.distanceTo(pCurr);
      const r = Math.min(radius, len / 2);
      const from = pCurr.clone().add(dir.clone().multiplyScalar(len - r));
      const to = pCurr.clone().add(dir.clone().multiplyScalar(r));
      shape.lineTo(to.x, to.y);
      shape.quadraticCurveTo(pCurr.x, pCurr.y, from.x, from.y);
    }
    shape.closePath();
    return shape;
  }

  function makeIsland(name, points, options) {
    const group = new THREE.Group();
    group.name = name;

    const shape = roundedPolygonShape(points, options.cornerRadius || 6);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: options.depth || 8,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 2,
      bevelSegments: 2,
      curveSegments: 12,
      steps: 1
    });
    const land = new THREE.Mesh(geometry, makeToonMaterial(options.color || 0x74c365));
    land.rotation.x = -Math.PI / 2;
    land.castShadow = true;
    land.receiveShadow = true;
    group.add(land);
    group.userData = { landMesh: land };
    scene.add(group);
    return group;
  }

  // Stylized island outlines (xz-plane)
  const hokkaidoPts = [[300,-60],[350,-20],[320,20],[280,40],[240,20],[260,-30]];
  const honshuPts = [[-260,-70],[-200,-50],[-120,-40],[0,-20],[100,-10],[170,10],[200,40],[160,80],[80,90],[10,80],[-70,70],[-130,40],[-200,0],[-260,-30]];
  const shikokuPts = [[-120,-120],[-60,-110],[0,-115],[-10,-150],[-90,-155],[-140,-140]];
  const kyushuPts = [[-260,-160],[-210,-150],[-160,-150],[-140,-190],[-200,-210],[-260,-195]];
  const okinawaPts= [[-320,-260],[-300,-255],[-280,-270],[-300,-285]];

  const islands = {
    Hokkaido: makeIsland('Hokkaido', hokkaidoPts, { color: 0x9edc89, depth: 8, cornerRadius: 12 }),
    Honshu:   makeIsland('Honshu',   honshuPts,   { color: 0x79c56d, depth:10, cornerRadius: 10 }),
    Shikoku:  makeIsland('Shikoku',  shikokuPts,  { color: 0x84cf79, depth: 7, cornerRadius: 8  }),
    Kyushu:   makeIsland('Kyushu',   kyushuPts,   { color: 0x8ad783, depth: 7, cornerRadius: 8  }),
    Okinawa:  makeIsland('Okinawa',  okinawaPts,  { color: 0x9adf8f, depth: 5, cornerRadius: 6  }),
  };
  islands.Hokkaido.position.y = 0.4;
  islands.Honshu.position.y   = 0.2;
  islands.Shikoku.position.y  = 0.15;
  islands.Kyushu.position.y   = 0.12;
  islands.Okinawa.position.y  = 0.1;

  // Places (rough, stylized positions)
  const places = [
    { name: "Sapporo",  kind:"city",       position: new THREE.Vector3(305, 6,   0) },
    { name: "Tokyo",    kind:"city",       position: new THREE.Vector3(120, 6,  20) },
    { name: "Yokohama", kind:"city",       position: new THREE.Vector3(115, 6,  35) },
    { name: "Nagoya",   kind:"city",       position: new THREE.Vector3( 60, 6,  40) },
    { name: "Kyoto",    kind:"city",       position: new THREE.Vector3(-40, 6,  30) },
    { name: "Osaka",    kind:"city",       position: new THREE.Vector3(-30, 6,  40) },
    { name: "Nara",     kind:"city",       position: new THREE.Vector3(-20, 6,  55) },
    { name: "Hiroshima",kind:"city",       position: new THREE.Vector3(-160,6,  30) },
    { name: "Fukuoka",  kind:"city",       position: new THREE.Vector3(-210,6,-165) },
    // Attractions
    { name: "Mount Fuji",           kind:"attraction", position: new THREE.Vector3(80, 10, 10) },
    { name: "Tokyo Tower",          kind:"attraction", position: new THREE.Vector3(125,10, 18) },
    { name: "Fushimi Inari Torii",  kind:"attraction", position: new THREE.Vector3(-44,9, 24) },
    { name: "Osaka Castle",         kind:"attraction", position: new THREE.Vector3(-28,9, 35) },
    { name: "Itsukushima Torii",    kind:"attraction", position: new THREE.Vector3(-170,9,36) },
    { name: "Nara Park",            kind:"attraction", position: new THREE.Vector3(-17,9, 58) },
  ];

  // Markers & labels
  const markersGroup = new THREE.Group();
  scene.add(markersGroup);

  const cityMaterial = new THREE.MeshToonMaterial({ color: 0x1f8b4c });
  const cityGeo = new THREE.SphereGeometry(2.6, 16, 16);

  function makeLabel(text) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.padding = "3px 6px";
    div.style.background = "rgba(0,0,0,0.7)";
    div.style.color = "white";
    div.style.borderRadius = "6px";
    div.style.fontSize = "11px";
    return new CSS2DObject(div);
  }

  function addCityMarker(place) {
    const pin = new THREE.Mesh(cityGeo, cityMaterial);
    pin.position.copy(place.position);
    pin.position.y += 3;
    pin.castShadow = true;
    pin.userData = { place };
    markersGroup.add(pin);

    const label = makeLabel(place.name);
    label.position.set(0, 10, 0);
    pin.add(label);
    return pin;
  }

  // Attractions (exaggerated)
  const attractionGroup = new THREE.Group();
  scene.add(attractionGroup);

  function addFuji(position) {
    const base = new THREE.ConeGeometry(22, 36, 6);
    const snow = new THREE.ConeGeometry(16, 10, 6);
    const rockMat = makeToonMaterial(0x3a7f4e);
    const snowMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const cone = new THREE.Mesh(base, rockMat); cone.position.copy(position).add(new THREE.Vector3(0,12,0)); cone.castShadow = true;
    const top  = new THREE.Mesh(snow, snowMat); top.position.copy(position).add(new THREE.Vector3(0,30,0));  top.castShadow = true;
    attractionGroup.add(cone, top);
    const label = makeLabel("Mount Fuji"); label.position.copy(position).add(new THREE.Vector3(0,44,0)); scene.add(label);
  }

  function addTokyoTower(position) {
    const mat = makeToonMaterial(0xff3d00);
    const parts = new THREE.Group();
    const base = new THREE.CylinderGeometry(1, 6, 16, 6);
    const mid  = new THREE.CylinderGeometry(1, 4, 20, 6);
    const top  = new THREE.ConeGeometry(3, 8, 6);
    const m1 = new THREE.Mesh(base, mat); m1.position.y = 8;
    const m2 = new THREE.Mesh(mid,  mat); m2.position.y = 26;
    const m3 = new THREE.Mesh(top,  mat); m3.position.y = 40;
    parts.add(m1, m2, m3); parts.position.copy(position); parts.castShadow = true; attractionGroup.add(parts);
  }

  function addTorii(position) {
    const mat = makeToonMaterial(0xff3d00);
    const group = new THREE.Group();
    const pillar = new THREE.CylinderGeometry(1.2, 1.2, 10, 8);
    const bar    = new THREE.BoxGeometry(10, 1.2, 2);
    const p1 = new THREE.Mesh(pillar, mat); p1.position.set(-4,5,0);
    const p2 = new THREE.Mesh(pillar, mat); p2.position.set( 4,5,0);
    const b  = new THREE.Mesh(bar, mat);    b.position.set(0,10.5,0);
    group.add(p1,p2,b); group.position.copy(position); group.castShadow = true; attractionGroup.add(group);
  }

  function addOsakaCastle(position) {
    const baseMat = makeToonMaterial(0x6b4f39), roofMat = makeToonMaterial(0x2ba84a);
    const g = new THREE.Group();
    function level(w, h, y) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), baseMat);
      m.position.y = y; m.castShadow = true; g.add(m);
      const r = new THREE.Mesh(new THREE.ConeGeometry(w*0.75, h*0.8, 4), roofMat);
      r.position.y = y + h*0.9; r.rotation.y = Math.PI/4; r.castShadow = true; g.add(r);
    }
    level(18,6,4); level(14,6,12); level(10,6,20);
    g.position.copy(position); attractionGroup.add(g);
  }

  function addNaraDeer(position) {
    const mat = makeToonMaterial(0x9c6b3d);
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(8,4,3), mat); body.position.y = 6;
    const head = new THREE.Mesh(new THREE.BoxGeometry(3,3,3), mat); head.position.set(5,8,0);
    const legGeo = new THREE.BoxGeometry(1,6,1);
    for (let x of [-3,3]) for (let z of [-1,1]) { const leg = new THREE.Mesh(legGeo, mat); leg.position.set(x,3,z); g.add(leg); }
    const antler = new THREE.Mesh(new THREE.BoxGeometry(0.6,2.4,0.6), new THREE.MeshToonMaterial({ color: 0xead39c })); antler.position.set(6,10,0);
    g.add(body, head, antler); g.position.copy(position); attractionGroup.add(g);
  }

  // Build markers and attractions
  const cityPins = [];
  for (const p of places) if (p.kind === "city") cityPins.push(addCityMarker(p));
  for (const p of places) {
    if (p.kind !== "attraction") continue;
    const pos = p.position;
    if (p.name.includes("Fuji")) addFuji(pos);
    else if (p.name.includes("Tokyo Tower")) addTokyoTower(pos);
    else if (p.name.includes("Fushimi")) addTorii(pos);
    else if (p.name.includes("Itsukushima")) addTorii(pos);
    else if (p.name.includes("Osaka Castle")) addOsakaCastle(pos);
    else if (p.name.includes("Nara")) addNaraDeer(pos);
  }

  // ---- Routing ----
  const routesGroup = new THREE.Group();
  scene.add(routesGroup);

  function drawRoute(aName, bName) {
    const a = places.find(p => p.name === aName);
    const b = places.find(p => p.name === bName);
    if (!a || !b) return;
    routesGroup.clear();

    const start = a.position.clone().add(new THREE.Vector3(0, 12, 0));
    const end   = b.position.clone().add(new THREE.Vector3(0, 12, 0));
    const mid   = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 40 + start.distanceTo(end)*0.05, 0));

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tube  = new THREE.TubeGeometry(curve, 64, 1.3, 12, false);
    const mesh  = new THREE.Mesh(tube, new THREE.MeshToonMaterial({ color: 0xff6b57 }));
    mesh.castShadow = true; routesGroup.add(mesh);

    const train = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshToonMaterial({ color: 0xffffff }));
    routesGroup.add(train);
    let t = 0;
    (function animTrain() {
      if (!train.parent) return;
      t += 0.002; if (t > 1) t = 0;
      train.position.copy(curve.getPointAt(t));
      requestAnimationFrame(animTrain);
    })();

    const km = (start.distanceTo(end) * 6).toFixed(0);
    document.getElementById('distance').textContent = `Approx. straight-line distance: ~${km} km (stylized scale)`;
  }

  // UI hookup
  const fromSel = document.getElementById('from');
  const toSel   = document.getElementById('to');
  const routeBtn= document.getElementById('routeBtn');
  const clearBtn= document.getElementById('clearBtn');
  const auto    = document.getElementById('autorotate');

  function populateSelects() {
    const cityNames = places.filter(p => p.kind === 'city').map(p => p.name);
    for (const name of cityNames) {
      const o1 = document.createElement('option'); o1.value = o1.textContent = name; fromSel.appendChild(o1);
      const o2 = document.createElement('option'); o2.value = o2.textContent = name; toSel.appendChild(o2);
    }
    fromSel.value = "Tokyo"; toSel.value = "Kyoto";
  }
  populateSelects();

  routeBtn.addEventListener('click', () => drawRoute(fromSel.value, toSel.value));
  clearBtn.addEventListener('click', () => { routesGroup.clear(); document.getElementById('distance').textContent = ''; });
  auto.addEventListener('change', () => { controls.autoRotate = auto.checked; });

  // Click-to-route
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  const cityPinsArr = cityPins; let awaitingSecond = false;
  renderer.domElement.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(cityPinsArr, false)[0];
    if (hit) {
      const name = hit.object.userData.place.name;
      if (!awaitingSecond) { fromSel.value = name; awaitingSecond = true; }
      else { toSel.value = name; awaitingSecond = false; drawRoute(fromSel.value, toSel.value); }
    }
  });

  // Resize
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h); labelRenderer.setSize(w,h);
  });

  // Animate
  (function animate() {
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
})();
