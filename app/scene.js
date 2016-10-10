const THREE = require('three');

export let scene, audioScene, physicsScene, boxMesh, intersectableMeshes;
export const pills = [];
import Particle from './pills.js'
import { camera, controls } from './camera.js';
import { mesh as pillbox } from './pillbox.js';
import { mesh as skybox, update as updateSkybox } from './skybox.js';
import { PhysicsScene } from './physics.js';
import { lights } from './lighting.js';
import { convertToRange } from './lib/maths.js';
import { update as updateRaycaster } from './raycaster.js';
import { AudioScene, positionListener } from './sound-handler.js';
import { PILLS_COUNT, INIT_POSITION_VARIATION } from './constants.js';

const maxRotation = { x: 1, y: 1 };
let loops = 0;

export const init = () => {
	scene = new THREE.Scene();
	physicsScene = PhysicsScene();
	audioScene = AudioScene();
	scene.add(camera);

	for (let i = 0; i < PILLS_COUNT; i++) {
		pills.push(new Particle({
			x: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
			y: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
			z: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
			mass: Math.random() / 4 + 0.25,
			// mass: 0,
			// velocity: Particle.generateVelocity(),
			velocity: 0,
			soundSrc: `${Math.floor(Math.random() * 6)}.mp3`,
			audioScene,
		}));
	}

	intersectableMeshes = pills.map((pill) => {
		return pill.mesh;
	});

	lights.forEach((light) => {
		scene.add(light);
	});

	// scene.add(shadowCameraHelper);


	pills.forEach((pill) => {
		scene.add(pill.mesh);
		physicsScene.add(pill);
	});

	physicsScene.walls.forEach((wall) => {
		scene.add(wall);
	});

	physicsScene.windHelpers.forEach((helper) => {
		scene.add(helper);
	});
}

export const update = (delta) => {
	const targetX = convertToRange(app.mouse.y, [0, window.innerWidth], [-1, 1]) * maxRotation.x * -1;
	const targetY = convertToRange(app.mouse.x, [0, window.innerHeight], [-1, 1]) * maxRotation.y;
	pillbox.rotation.x += (targetX - pillbox.rotation.x) * 0.05;
	pillbox.rotation.y += (targetY - pillbox.rotation.y) * 0.05;
	
	const position = new THREE.Vector3().copy(camera.position);
	const direction = new THREE.Vector3().copy(camera.getWorldDirection());
	updateSkybox(delta);
	if (loops % 10 === 0) updateRaycaster(position, direction, intersectableMeshes);
	physicsScene.update(delta);
	positionListener(position, direction);

	if (controls) controls.update(delta);
	loops++
}