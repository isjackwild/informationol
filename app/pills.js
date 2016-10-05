const CANNON = require('cannon');
const THREE = require('three');
import _ from 'lodash';
import { WORLD_SIZE, INIT_POSITION_VARIATION, TIMESTEP, BODIES_COUNT, MAX_VELOCITY, MIN_VELOCITY, WIND_STRENGTH, PILLS_COUNT } from './constants.js';
export const pills = [];


class Pill {
	constructor({ x, y, z, mass, velocity }) {
		const shape = new CANNON.Box(new CANNON.Vec3(2, 2, 0.2));
		this.body = new CANNON.Body({ mass });
		this.body.addShape(shape);
		this.body.position.set(x, y, z);
		this.body.angularVelocity.set(0, Math.random() * 0.2, 0);
		this.body.velocity.set(velocity, velocity, velocity);
		this.body.angularDamping = 0.96;
		this.body.linearDamping = 0;
		

		const geometry = new THREE.BoxGeometry(4, 4, 0.4);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		this.mesh = new THREE.Mesh(geometry, material);
	}

	update(wind) {
		this.body.applyLocalImpulse(wind, new CANNON.Vec3(0,0,0));
		const prevQuat = new CANNON.Quaternion().copy(this.body.quaternion);
		this.body.quaternion.set(
			_.clamp(prevQuat.x, Math.PI / -12, Math.PI / 12),
			prevQuat.y,
			_.clamp(prevQuat.z, Math.PI / -6, Math.PI / 6),
			prevQuat.w,
		); // I don't think this is a particuarly reliable way of doing this...
		this.mesh.position.copy(this.body.position);
		this.mesh.quaternion.copy(this.body.quaternion);
	}

	static generateVelocity() {
		const vel = (Math.random() * MAX_VELOCITY) - MAX_VELOCITY / 2;
		if (Math.abs(vel) > MIN_VELOCITY) {
			return Pill.generateVelocity();
		} else {
			return vel;
		}
	}
}

for (let i = 0; i < PILLS_COUNT; i++) {
	pills.push(new Pill({
		x: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
		y: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
		z: (Math.random() * INIT_POSITION_VARIATION) - INIT_POSITION_VARIATION / 2,
		mass: Math.random() + 0.5,
		velocity: Pill.generateVelocity(),
	}));
}