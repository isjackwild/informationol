const THREE = require('three');
require('./vendor/TrackballControls.js');
require('./vendor/OrbitControls.js');
require('./vendor/DeviceOrientationControls.js');

export let camera, controls;



export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 1, 10000);
	controls = new THREE.OrbitControls(camera);
	controls.target.set(
		camera.position.x + 0.15,
		camera.position.y,
		camera.position.z
	);
	controls.noPan = true;
	controls.noZoom = true;

	window.addEventListener('deviceorientation', setOrientationControls, true);
}

const setOrientationControls = (e) => {
	window.removeEventListener('deviceorientation', setOrientationControls, true);
	if (!e.alpha) return;
	controls = new THREE.DeviceOrientationControls(camera, true);
	console.log(controls);
	controls.connect();
	controls.update();
}