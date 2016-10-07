const THREE = require('three');
require('./vendor/StereoEffect.js');
import { update as updatePhysics } from './scene.js';
import { init as initScene, scene, update as updateScene } from './scene.js';
import { init as initCamera, camera } from './camera.js';
import { positionListener } from './sound-handler.js';

let canvas;
let raf, then, now, delta;
let currentCamera, currentScene;
export let renderer, stereoFx;

export const init = () => {
	canvas = document.getElementsByClassName('canvas')[0];
	setupRenderer();
	currentCamera = camera;
	currentScene = scene;
	now = new Date().getTime();
	animate();
}

export const kill = () => {
	cancelAnimationFrame(raf);
}

const setupRenderer = () => {
	renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
	});

	renderer.setClearColor(0x282828);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	stereoFx = new THREE.StereoEffect(renderer);
}

const update = (delta) => {
	updateScene(delta);

	positionListener(currentCamera.position, currentCamera.getWorldDirection());
}

const render = () => {
	// currentCamera.lookAt(currentScene.position);
	if (window.location.search.indexOf('vr') > -1) {
		stereoFx.render(currentScene, currentCamera);
	} else {
		renderer.render(currentScene, currentCamera);
	}
}

const animate = () => {
	then = now ? now : null;
	now = new Date().getTime();
	delta = then ? (now - then) / 16.666 : 1;

	update(delta);
	render();
	raf = requestAnimationFrame(animate);
}
