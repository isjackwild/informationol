window.app = {
	mouse: {x: 0, y: 0}
};

const THREE = require('three');
const dat = require('dat-gui');

import { init as initLoop, renderer } from './loop.js';
import { init as initScene } from './scene.js';
import { init as initCamera} from './camera.js';
import { camera } from './camera.js';
import _ from 'lodash';



const kickIt = () => {
	if (window.location.search.indexOf('debug') > -1) window.app.debug = true;
	if (window.app.debug) {
		window.app.gui = new dat.GUI();
	}

	addEventListeners();
	onResize();
	initCamera();
	initScene();
	initLoop();
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;

	if (renderer) renderer.setSize(window.app.width, window.app.height);
	if (camera) {
		camera.aspect = window.app.width / window.app.height;
		camera.updateProjectionMatrix();
	}
}

const onMouseMove = (e) => {
	window.app.mouse = {
		x: e.clientX,
		y: e.clientY,
	}
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
	window.addEventListener('mousemove', _.throttle(onMouseMove, 16.666));
	// const canvas = document.getElementsByClassName('canvas')[0];
	// canvas.addEventListener('click', (e) => {
	// 	canvas.requestFullscreen();
	// 	canvas.webkitRequestFullscreen();
	// 	canvas.webkitRequestFullScreen();
	// }, false);
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}