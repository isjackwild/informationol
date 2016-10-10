const THREE = require('three');
require('./vendor/TrackballControls.js');
require('./vendor/OrbitControls.js');
require('./vendor/DeviceOrientationControls.js');

export let camera, controls;



export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 1, 10000);
	camera.position.set(-10, 0, -20)
	controls = new THREE.TrackballControls(camera);
	// window.addEventListener('deviceorientation', setOrientationControls, true);
}

// const setOrientationControls = (e) => {
// 	window.removeEventListener('deviceorientation', setOrientationControls, true);
// 	if (!e.alpha) return;
// 	controls = new THREE.DeviceOrientationControls(camera, true);
// 	controls.connect();
// 	controls.update();
// }