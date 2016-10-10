const THREE = require('three');
const CANNON = require('cannon');
const TIMESTEP = 1 / 60;
import { lerpRGBColour } from './lib/colour.js';
import { WORLD_SIZE, INIT_POSITION_VARIATION, WIND_STRENGTH } from './constants.js';


export const PhysicsScene = () => {
	const particles = [];
	const walls = [];
	const windHelpers = [];

	const world = new CANNON.World();
	world.gravity.set(0,0,0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10;
	world.defaultContactMaterial.restitution = 0.8;
	world.defaultContactMaterial.friction = 0;


	const setupWalls = () => {
		for (let i = 0; i < 6; i++) {
			const groundShape = new CANNON.Plane();
			const groundBody = new CANNON.Body({
				mass: 0,
				shape: groundShape,
			});
			
			switch (i) {
				case 0: // floor
					groundBody.position.set(0, WORLD_SIZE / -2, 0);
					groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI / -2);
					break;
				case 1: // ceil
					groundBody.position.set(0, WORLD_SIZE / 2, 0);
					groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI / 2);
					break;
				case 2: // left
					groundBody.position.set(WORLD_SIZE / 2, 0, 0);
					groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI / -2);
					break;
				case 3: // right
					groundBody.position.set(WORLD_SIZE / -2, 0, 0);
					groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI / 2);
					break;
				case 4: // back
					groundBody.position.set(0, 0, WORLD_SIZE / -2);
					break;
				case 5: // front
					groundBody.position.set(0, 0, WORLD_SIZE / 2);
					groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI);
					break;
			}

			// const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, WORLD_SIZE);
			// const material = new THREE.MeshBasicMaterial({
			// 	color: 0x0000ff,
			// 	wireframe: true,
			// 	opacity: 0.2,
			// 	transparent: true,
			// });
			// const mesh = new THREE.Mesh(geometry, material);
			// mesh.position.copy(groundBody.position);
			// mesh.quaternion.copy(groundBody.quaternion);
			// walls.push(mesh);
			world.addBody(groundBody);
		}
	}

	const setupWindHelpers = () => {
		const step = 5;
		for (let x = WORLD_SIZE / -2; x <= WORLD_SIZE / 2; x += step) {
			for (let y = WORLD_SIZE / -2; y <= WORLD_SIZE / 2; y += step) {
				for (let z = WORLD_SIZE / -2; z <= WORLD_SIZE / 2; z += step) {
					const arrow = new THREE.ArrowHelper(
						new THREE.Vector3(0,0,0),
						new THREE.Vector3(x,y,z),
						1,
						0x00ff00,
						0.25,
						0.25
					);
					windHelpers.push(arrow);
				}
			}	
		}
	}

	const add = (particle) => {
		particles.push(particle);
		world.addBody(particle.body);
	}

	const update = (delta) => {
		const ts = Math.min(TIMESTEP * (delta || 1), 0.0333);

		const time = new Date().getTime();

		particles.forEach((particle, i) => {
			const wind = new CANNON.Vec3(
				particle.body.position.x / (WORLD_SIZE / 2) * Math.sin(time / 2000),
				particle.body.position.y / (WORLD_SIZE / 2) * Math.sin(time / 3000),
				particle.body.position.y / (WORLD_SIZE / 2) * Math.sin(time / 1000),
			);
			wind.normalize();
			const scale = Math.sin(time / 2000) * WIND_STRENGTH;
			particle.update(wind.scale(scale));
		});

		windHelpers.forEach((helper) => {
			helper.setDirection(new THREE.Vector3(
				helper.position.x / (WORLD_SIZE / 2) * Math.sin(time / 2000),
				helper.position.y / (WORLD_SIZE / 2) * Math.sin(time / 3000),
				helper.position.y / (WORLD_SIZE / 2) * Math.sin(time / 1000),
			).normalize());
			const scale = Math.sin(time / 2000) * helper.position.y / (WORLD_SIZE / 2);
			const rgb = lerpRGBColour(scale, {r:255, g: 0, b: 0}, {r:0, g: 255, b: 0});
			helper.setColor(new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255));
		});

		world.step(ts);
	}

	setupWalls();
	// setupWindHelpers();

	return { update, add, walls, windHelpers }
}