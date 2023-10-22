import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const board = new THREE.Group();
const hiddenCubesGroup = new THREE.Group();
const gameSymbols = new THREE.Group();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const material = new THREE.MeshNormalMaterial();

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 90, 32);
const horizontalCylinderGeometry = new THREE.CylinderGeometry(1, 1, 90, 32);

const linePositions = [
  { position: new THREE.Vector3(-44.5, 0, 12), horizontal: false },
  { position: new THREE.Vector3(-14.8, 0, 12), horizontal: false },
  { position: new THREE.Vector3(14.8, 0, 12), horizontal: false },
  { position: new THREE.Vector3(44.5, 0, 12), horizontal: false },
  { position: new THREE.Vector3(0, 44.5, 12), horizontal: true },
  { position: new THREE.Vector3(0, 14.8, 12), horizontal: true },
  { position: new THREE.Vector3(0, -14.8, 12), horizontal: true },
  { position: new THREE.Vector3(0, -44.5, 12), horizontal: true },
];

linePositions.forEach((line) => {
  const lineMesh = new THREE.Mesh(
    line.horizontal ? horizontalCylinderGeometry : cylinderGeometry,
    material
  );
  lineMesh.position.copy(line.position);
  if (line.horizontal) {
    lineMesh.rotation.z = Math.PI / 2;
  }
  board.add(lineMesh);
});

const cubeGeometry = new THREE.BoxGeometry(20, 20, 10);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cubePositions = [
  new THREE.Vector3(30, -30, 12),
  new THREE.Vector3(0, -30, 12),
  new THREE.Vector3(-30, -30, 12),
  new THREE.Vector3(30, 0, 12),
  new THREE.Vector3(0, 0, 12),
  new THREE.Vector3(-30, 0, 12),
  new THREE.Vector3(30, 30, 12),
  new THREE.Vector3(-30, 30, 12),
  new THREE.Vector3(0, 30, 12),
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

  const xArmGeometry1 = new THREE.BoxGeometry(2, 15, 1);
  const xArmMaterial = new THREE.MeshBasicMaterial();
  const xArm1 = new THREE.Mesh(xArmGeometry1, xArmMaterial);
  xArm1.position.set(0, 0, 0);
  xArm1.rotation.z = 2.7;
  xGroup.add(xArm1);

  const xArmGeometry2 = new THREE.BoxGeometry(2, 15, 1);
  const xArm2 = new THREE.Mesh(xArmGeometry2, xArmMaterial);
  xArm2.position.set(0, 0, 0);
  xArm2.rotation.z = 3.6;
  xGroup.add(xArm2);

  return xGroup;
}

function createEarthMesh() {
  const earthGeometry = new THREE.SphereGeometry(6, 50, 50);
  const earthMaterial = new THREE.MeshBasicMaterial({
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

  controls.update();

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
      clickedCube.userData.player = currentPlayer;

      playerMesh.userData.symbol =
        currentPlayer === players[0] ? "X" : "sphere";
      gameSymbols.add(playerMesh);

      clickedCubes.push(clickedCube);

      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

      function checkWin(player) {
        let pos8 = { x: 30, y: -30, z: 12 };
        let pos7 = { x: 0, y: -30, z: 12 };
        let pos6 = { x: -30, y: -30, z: 12 };
        let pos5 = { x: 30, y: 0, z: 12 };
        let pos4 = { x: 0, y: 0, z: 12 };
        let pos3 = { x: -30, y: 0, z: 12 };
        let pos2 = { x: 30, y: 30, z: 12 };
        let pos0 = { x: -30, y: 30, z: 12 };
        let pos1 = { x: 0, y: 30, z: 12 };
        const winConditions = [
          [pos0, pos1, pos2],
          [pos3, pos4, pos5],
          [pos6, pos7, pos8],
          [pos0, pos3, pos6],
          [pos1, pos4, pos7],
          [pos2, pos5, pos8],
          [pos0, pos4, pos8],
          [pos2, pos4, pos6],
        ];
        function formatVector(vector) {
          return `{x: ${vector.x}, y: ${vector.y}, z: ${vector.z}}`;
        }
        if (gameSymbols) {
          const positionsToCheck = [
            pos0,
            pos1,
            pos2,
            pos3,
            pos4,
            pos5,
            pos6,
            pos7,
            pos8,
          ];

          for (const condition of winConditions) {
            const matchingSymbols = [];

            for (const position of condition) {
              const matchingChild = gameSymbols.children.find((gameSymbol) => {
                return gameSymbol.position.equals(position);
              });

              if (matchingChild) {
                matchingSymbols.push(matchingChild);
              }
            }

            if (matchingSymbols.length === 3) {
              const playerSymbol = player === players[0] ? "X" : "sphere";

              const allMatched = matchingSymbols.every(
                (symbol) => symbol.userData.symbol === playerSymbol
              );
              if (allMatched) {
                for (const symbol of matchingSymbols) {
                  animateScale(symbol);
                }
                console.log(`Player ${player} wins!`);
                return true;
              }
            }
          }
        }
      }
      checkWin(currentPlayer);
      let scaleValue = 0;
      const animationSpeed = 0.1;

      function animateScaleUp() {
        if (scaleValue < 1) {
          scaleValue += animationSpeed;

          playerMesh.scale.set(scaleValue, scaleValue, scaleValue);

          requestAnimationFrame(animateScaleUp);
        }
      }

      animateScaleUp();
    }
  }
}
function animateScale(mesh) {
  let scaleValue = 1;
  const animationSpeed = 0.005;

  function animate() {
    scaleValue = 1 + 0.1 * Math.sin(Date.now() * animationSpeed);
    mesh.scale.set(scaleValue, scaleValue, scaleValue);
    requestAnimationFrame(animate);
  }

  animate();
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
  const z = (Math.random() - 0.5) * 2000;
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
