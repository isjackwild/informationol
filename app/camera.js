const THREE = require('three');
require('./vendor/TrackballControls.js');
export let camera, controls;



export const init = () => {
	camera = new THREE.PerspectiveCamera(45, window.app.width / window.app.height, 1, 10000);
	camera.position.z = -50;
	camera.position.x = -20;
	controls = new THREE.TrackballControls(camera);
	controls.target.set(0, 0, 0);
}