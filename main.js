import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(1, 1, 100);

const board = new THREE.Group();
const hiddenCubesGroup = new THREE.Group();
const gameSymbols = new THREE.Group();

let currentPlayer = "sphere";

const verticalLineGeometry = new THREE.BoxGeometry(1, 64, 4);
const verticalLineMaterial = new THREE.MeshBasicMaterial({ color: 0x327fa8 });

const verticalLineLeft = new THREE.Mesh(
  verticalLineGeometry,
  verticalLineMaterial
);
verticalLineLeft.position.set(-32, 0, 12);
board.add(verticalLineLeft);

const verticalLineMiddleLeft = new THREE.Mesh(
  verticalLineGeometry,
  verticalLineMaterial
);
verticalLineMiddleLeft.position.set(-10, 0, 12);
board.add(verticalLineMiddleLeft);

const verticalLineRight = new THREE.Mesh(
  verticalLineGeometry,
  verticalLineMaterial
);
verticalLineRight.position.set(32, 0, 12);
board.add(verticalLineRight);

const verticalLineMiddleRight = new THREE.Mesh(
  verticalLineGeometry,
  verticalLineMaterial
);
verticalLineMiddleRight.position.set(10, 0, 12);
board.add(verticalLineMiddleRight);

const horizontalLineGeometry = new THREE.BoxGeometry(64, 1, 4);
const horizontalLineMaterial = new THREE.MeshBasicMaterial({ color: 0x327fa8 });

const horizontalLineTop = new THREE.Mesh(
  horizontalLineGeometry,
  horizontalLineMaterial
);
horizontalLineTop.position.set(0, 31.5, 12);
board.add(horizontalLineTop);

const horizontalLineMiddleTop = new THREE.Mesh(
  horizontalLineGeometry,
  horizontalLineMaterial
);
horizontalLineMiddleTop.position.set(0, 10, 12);
board.add(horizontalLineMiddleTop);

const horizontalLineBottom = new THREE.Mesh(
  horizontalLineGeometry,
  horizontalLineMaterial
);
horizontalLineBottom.position.set(0, -31.5, 12);
board.add(horizontalLineBottom);

const horizontalLineMiddleBottom = new THREE.Mesh(
  horizontalLineGeometry,
  horizontalLineMaterial
);
horizontalLineMiddleBottom.position.set(0, -10, 12);
board.add(horizontalLineMiddleBottom);

function _hiddenCube(offsets) {
  const cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x327fa8 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.visible = false;
  cube.position.x = offsets.x;
  cube.position.y = offsets.y;
  cube.position.z = offsets.z;
  return cube;
}
const players = ["X", "O"];
const playerMeshes = {
  X: createXMesh(),
  O: createSphereMesh(),
};
let currentPlayerIndex = 0;
const hiddenCubeOffsets = [
  { x: -20, y: 20, z: 12 },
  { x: 0, y: 20, z: 12 },
  { x: 20, y: 20, z: 12 },
  { x: -20, y: 0, z: 12 },
  { x: 0, y: 0, z: 12 },
  { x: 20, y: 0, z: 12 },
  { x: -20, y: -20, z: 12 },
  { x: 0, y: -20, z: 12 },
  { x: 20, y: -20, z: 12 },
];

hiddenCubeOffsets.forEach((offsets) => {
  const hiddenCube = _hiddenCube(offsets);
  hiddenCubesGroup.add(hiddenCube);
});
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("mousemove", onMouseMove);

renderer.domElement.addEventListener("mousedown", onMouseDown);
scene.add(board);
scene.add(hiddenCubesGroup);
scene.add(gameSymbols);

function animate() {
  requestAnimationFrame(animate);

  board.rotation.y += 0.001;
  hiddenCubesGroup.rotation.y += 0.001;
  gameSymbols.rotation.y += 0.001;

  renderer.render(scene, camera);
}
function createXMesh() {
  const xGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([-2, 2, 0, 2, -2, 0, 2, 2, 0, -2, -2, 0]);
  xGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  return new THREE.Mesh(xGeometry, xMaterial);
}

function createSphereMesh() {
  const sphereGeometry = new THREE.SphereGeometry(4, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  return new THREE.Mesh(sphereGeometry, sphereMaterial);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  gameSymbols.children.forEach((cube) => {
    cube.material.color.set(0x327fa8);
  });

  const intersects = raycaster.intersectObjects(hiddenCubesGroup.children);

  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0xff0000);
  }
}

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(hiddenCubesGroup.children);

  if (intersects.length > 0) {
    const clickedCube = intersects[0].object;
    clickedCube.visible = false;

    const currentPlayer = players[currentPlayerIndex];
    const playerMesh = playerMeshes[currentPlayer].clone();
    playerMesh.position.copy(clickedCube.position);

    gameSymbols.add(playerMesh);

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }
}

animate();
