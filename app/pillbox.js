const THREE = require('three');

const loader = new THREE.TextureLoader();

const materials = [];
const textures = {
	faces: {
		map: loader.load(`assets/materials/pillbox/faces.jpg`),
		specularMap: loader.load(`assets/materials/pillbox/faces--specular.jpg`),
		bumpMap: loader.load(`assets/materials/pillbox/faces--bump.jpg`),
	},
	horizontals: {
		map: loader.load(`assets/materials/pillbox/horizontals.jpg`),
	},
	verticals: {
		map: loader.load(`assets/materials/pillbox/verticals.jpg`),
	},
}

// Verticals
materials[0] = materials[1] = new THREE.MeshPhongMaterial({
	map: textures.verticals.map,
	// specularMap: textures.verticals.specularMap,
	shininess: 30,
	specular: 0xD92ED9,
});

// Horizontals
materials[2] = materials[3] = new THREE.MeshPhongMaterial({
	map: textures.horizontals.map,
	// specularMap: textures.horizontals.specularMap,
	shininess: 10,
	specular: 0x000000,
});

// Faces
materials[4] = materials[5] = new THREE.MeshPhongMaterial({
	map: textures.faces.map,
	specularMap: textures.faces.specularMap,
	bumpMap: textures.faces.bumpMap,
	bumpScale: 0.015,
	shininess: 30,
	specular: 0xD92ED9,
});



const geom = new THREE.BoxGeometry(12, 4, 2);
// const material = new THREE.MeshPhongMaterial({color: 0xff0000});
// console.log(materials);
const material = new THREE.MultiMaterial(materials);
export const mesh = new THREE.Mesh( geom, material );

setTimeout(() => {
	if (window.app.debug) {
		const folder = app.gui.addFolder('material');
		const controller = folder.add(materials[4], 'shininess');
	}
}, 0);