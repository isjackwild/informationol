const THREE = require('three');

const clouds = document.getElementsByClassName('clouds')[0];
const texture = new THREE.Texture(clouds);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.generateMipmaps = false;

const geom = new THREE.SphereGeometry(20, 20, 20);
const material = new THREE.MeshBasicMaterial({
	map: texture,
});
material.side = THREE.BackSide;
export const mesh = new THREE.Mesh( geom, material );
mesh.frustrumCulled = false;

export const update = () => {
	if (clouds.readyState === clouds.HAVE_ENOUGH_DATA) texture.needsUpdate = true;
}