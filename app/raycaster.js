const THREE = require('three');

const raycaster = new THREE.Raycaster();

export const update = (origin, direction, intersectableMeshes) => {
	raycaster.set(origin, direction);
	// const intersects = raycaster.intersectObjects(intersectableMeshes);
	// intersects.forEach((mesh) => {
	// 	console.log(mesh.object);
	// 	mesh.object.material.color.set(0xff00ff);
	// });

	intersectableMeshes.forEach((mesh) => {
		const intersected = raycaster.intersectObject(mesh);
		if (intersected.length) return mesh.onEnterFocus();
		mesh.onExitFocus();
	});
}