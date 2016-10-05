const THREE = require('three');

export const lights = [];
lights[0] = new THREE.AmbientLight( 0xffffff, 0.4 );
lights[1] = new THREE.PointLight( 0xffffff, 0.2 );
lights[2] = new THREE.PointLight( 0xffffff, 0.66 );
// lights[3] = new THREE.PointLight( 0xffffff, 0.5 );

lights[1].position.set(0, -25, 0);
lights[2].position.set(-25, 25, -20);
// lights[3].position.set(-25, -50, -25);