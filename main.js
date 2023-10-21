import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.z = 100;

const board = new THREE.Group();
const hiddenCubesGroup = new THREE.Group();
const gameSymbols = new THREE.Group();

let currentPlayer = "sphere"; // Starting with sphere

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const material = new THREE.MeshStandardMaterial({
  color: 0xfcc742,
  emissive: 0x7b1414,
  metalness: 0.5,
  roughness: 0.5,
});

const lineGeometry = new THREE.BoxGeometry(1, 64, 4);
const horizontalLineGeometry = new THREE.BoxGeometry(64, 1, 4);

const linePositions = [
  { position: new THREE.Vector3(-32, 0, 12), horizontal: false },
  { position: new THREE.Vector3(-10, 0, 12), horizontal: false },
  { position: new THREE.Vector3(10, 0, 12), horizontal: false },
  { position: new THREE.Vector3(32, 0, 12), horizontal: false },
  { position: new THREE.Vector3(0, 31.5, 12), horizontal: true },
  { position: new THREE.Vector3(0, 10, 12), horizontal: true },
  { position: new THREE.Vector3(0, -10, 12), horizontal: true },
  { position: new THREE.Vector3(0, -31.5, 12), horizontal: true },
];

linePositions.forEach((line) => {
  const lineMesh = new THREE.Mesh(
    line.horizontal ? horizontalLineGeometry : lineGeometry,
    material
  );
  lineMesh.position.copy(line.position);
  board.add(lineMesh);
});

const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cubePositions = [
  new THREE.Vector3(20, -20, 12),
  new THREE.Vector3(0, -20, 12),
  new THREE.Vector3(-20, -20, 12),
  new THREE.Vector3(20, 0, 12),
  new THREE.Vector3(0, 0, 12),
  new THREE.Vector3(-20, 0, 12),
  new THREE.Vector3(20, 20, 12),
  new THREE.Vector3(-20, 20, 12),
  new THREE.Vector3(0, 20, 12),
];

cubePositions.forEach((position) => {
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.copy(position);
  cube.visible = false;
  hiddenCubesGroup.add(cube);
});

const players = ["X", "O"];
const playerMeshes = {
  X: createXMesh(),
  O: createEarthMesh(),
};
let currentPlayerIndex = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("mousedown", onMouseDown);
scene.add(board);
scene.add(hiddenCubesGroup);
scene.add(gameSymbols);

function createXMesh() {
  const xGroup = new THREE.Group();

  const xArmGeometry1 = new THREE.BoxGeometry(2, 12, 1);
  const xArmMaterial = new THREE.MeshBasicMaterial();
  const xArm1 = new THREE.Mesh(xArmGeometry1, xArmMaterial);
  xArm1.position.set(0, 0, 0);
  xArm1.rotation.z = 2.7;
  xGroup.add(xArm1);

  const xArmGeometry2 = new THREE.BoxGeometry(2, 12, 1);
  const xArm2 = new THREE.Mesh(xArmGeometry2, xArmMaterial);
  xArm2.position.set(0, 0, 0);
  xArm2.rotation.z = 3.6;
  xGroup.add(xArm2);

  return xGroup;
}

const earthTexture = new THREE.TextureLoader().load(
  "./assets/images/2k_earth_daymap.jpg"
);

function createEarthMesh() {
  const earthGeometry = new THREE.SphereGeometry(5, 50, 50);
  const earthMaterial = new THREE.MeshBasicMaterial({
    // color: 0xff0000
    map: new THREE.TextureLoader().load("./assets/images/globe.jpg"),
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  return earth;
}

const clickedCubes = [];

function animate() {
  requestAnimationFrame(animate);

  gameSymbols.children.forEach((playerMesh) => {
    playerMesh.rotation.y += 0.008;
  });

  renderer.render(scene, camera);
}

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(hiddenCubesGroup.children);

  if (intersects.length > 0) {
    const clickedCube = intersects[0].object;

    if (!clickedCube.userData.clicked) {
      clickedCube.userData.clicked = true;
      clickedCube.visible = false;

      const currentPlayer = players[currentPlayerIndex];
      const playerMesh = playerMeshes[currentPlayer].clone();
      playerMesh.position.copy(clickedCube.position);

      gameSymbols.add(playerMesh);

      clickedCubes.push(clickedCube);

      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
  }
}
window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
}

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertices = [];

for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 2000;
  starVertices.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

onWindowResize();

animate();
