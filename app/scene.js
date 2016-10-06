const THREE = require('three');

export let scene, boxMesh;
import { camera, controls } from './camera.js';
import { mesh as pillbox } from './pillbox.js';
import { mesh as skybox, update as updateSkybox } from './skybox.js';
import { update as updatePhysics, bodies, walls as wallHelpers, windHelpers } from './physics.js';
import { pills } from './pills.js';
import { lights } from './lighting.js';
import { convertToRange } from './lib/maths.js';

const maxRotation = { x: 1, y: 1 };

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);

	lights.forEach((light) => {
		scene.add(light);
	});
	// scene.add(pillbox);

	pills.forEach((pill) => {
		scene.add(pill.mesh);
	});

	wallHelpers.forEach((wall) => {
		scene.add(wall);
	});

	windHelpers.forEach((helper) => {
		scene.add(helper);
	});
}

export const update = (delta) => {
	updatePhysics(delta);
	const targetX = convertToRange(app.mouse.y, [0, window.innerWidth], [-1, 1]) * maxRotation.x * -1;
	const targetY = convertToRange(app.mouse.x, [0, window.innerHeight], [-1, 1]) * maxRotation.y;

	pillbox.rotation.x += (targetX - pillbox.rotation.x) * 0.05;
	pillbox.rotation.y += (targetY - pillbox.rotation.y) * 0.05;

	if (controls) controls.update(delta);
	updateSkybox(delta);
}