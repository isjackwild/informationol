const THREE = require('three');

export let scene;
import { camera, controls } from './camera.js';
import { mesh as pillbox } from './pillbox.js';
import { mesh as skybox, update as updateSkybox } from './skybox.js';
import { lights } from './lighting.js';
import { convertToRange } from './lib/maths.js';

const maxRotation = { x: 1, y: 1 };
let loops = 0;

export const init = () => {
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add(pillbox);

	lights.forEach((light) => {
		scene.add(light);
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


	if (controls) controls.update(delta);
	loops++
}