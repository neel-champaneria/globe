import "./output.css";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmoshpereFragmentShader from "./shaders/atmosphereFragment.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const canvasContainer = document.querySelector("#canvasContainer");
const sizes = {
  width: canvasContainer.offsetWidth,
  height: canvasContainer.offsetHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = canvasContainer.offsetWidth;
  sizes.height = canvasContainer.offsetHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 15);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Axes Helper
// const axesHelper = new THREE.AxesHelper(10, 10, 10);
// scene.add(axesHelper);

const globeTexture = new THREE.TextureLoader().load("./01-3.jpg");

// create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    uniforms: {
      globeTexture: {
        value: globeTexture,
      },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    // blending: THREE.AdditiveBlending,
  })
);
// scene.add(sphere);

const atmosphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmoshpereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);
atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  sizeAttenuation: true,
  size: 1,
});

const starVertices = [];
let count = 0;
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 600;
  const y = (Math.random() - 0.5) * 600;
  const randomZ = Math.random();
  const z = -((randomZ ? randomZ : 1) * (175 - 80) + 80);
  if (z > 0) {
    count++;
  }
  starVertices.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const boxGeometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.8);

function createBox(lat, long, country, population) {
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: "#3bf7ff",
    transparent: true,
    opacity: 0.4,
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  const latitude = (lat / 180) * Math.PI;
  const longitude = (long / 180) * Math.PI;
  const radius = 5;

  const x = radius * Math.cos(latitude) * Math.sin(longitude);
  const y = radius * Math.sin(latitude);
  const z = radius * Math.cos(latitude) * Math.cos(longitude);

  box.position.set(x, y, z);
  box.lookAt(0, 0, 0);
  box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -0.085));
  gsap.to(box.scale, {
    z: 1.4,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "linear",
    delay: Math.random(),
  });

  box.country = country;
  box.population = population;
  group.add(box);
}

// 23.6345, 102.5528
// put negative before south and west
createBox(23.6345, -102.5528, "Mexico", "127.6m");
createBox(-14.235, -51.9253, "Brazil", "211m");
createBox(20.5937, 78.9629, "India", "1.3b");
createBox(35.8617, 104.1954, "China", "1.3b");
createBox(37.0902, -95.7129, "USA", "328.2m");

sphere.rotation.y = -Math.PI / 2;

const mouse = {
  x: undefined,
  y: undefined,
  down: false,
  xPrev: undefined,
  yPrev: undefined,
};

console.log(innerWidth);

canvasContainer.addEventListener("mousedown", () => {
  mouse.down = true;
  mouse.xPrev = event.clientX;
  mouse.yPrev = event.clientY;
});

addEventListener("mouseup", (event) => {
  mouse.down = false;
});

addEventListener("mousemove", (event) => {
  // mouse.x = ((event.clientX - innerWidth / 2) / (innerWidth / 2)) * 2 - 1;
  // mouse.y = -((event.clientY - innerHeight) / innerHeight) * 2 + 1;
  // console.log(mouse);

  mouse.x = ((event.clientX - sizes.width) / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
  // console.log(mouse);

  gsap.set(popUpEl, { x: event.clientX, y: event.clientY });

  if (mouse.down) {
    event.preventDefault();
    const deltaX = event.clientX - mouse.xPrev;
    const deltaY = event.clientY - mouse.yPrev;
    group.rotation.y += deltaX * 0.005;
    group.rotation.x += deltaY * 0.005;
    mouse.xPrev = event.clientX;
    mouse.yPrev = event.clientY;
  }
});

const rayCaster = new THREE.Raycaster();
const popUpEl = document.querySelector("#popUpEl");
const populationEl = document.querySelector("#populationEl");
const populationValueEL = document.querySelector("#populationValueEl");

// console.log({ popUpEl });
/**
 * Animate
 */
const clock = new THREE.Clock();

console.log(group);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  // controls.update();

  // group.rotation.y += 0.001;
  // if (mouse.x) {
  //   gsap.to(group.rotation, {
  //     x: -mouse.y * 5,
  //     y: mouse.x * 5,
  //     duration: 2,
  //   });
  // }

  const objArr = group.children.filter((mesh) => {
    return mesh.geometry.type === "BoxGeometry";
  });

  // console.log(objArr);

  rayCaster.setFromCamera(mouse, camera);
  const intersects = rayCaster.intersectObjects(objArr);

  objArr.forEach((obj) => {
    obj.material.opacity = 0.4;
  });

  gsap.set(popUpEl, {
    display: "none",
  });

  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.opacity = 0.8;
    // console.log(intersects[i]);
    gsap.set(popUpEl, {
      display: "block",
    });

    populationEl.innerHTML = intersects[i].object.country;
    populationValueEL.innerHTML = intersects[i].object.population;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
