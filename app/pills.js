const CANNON = require('cannon');
const THREE = require('three');
const TweenLite = require('gsap');
import _ from 'lodash';
import { decode } from './sound-handler.js';
import { WORLD_SIZE, INIT_POSITION_VARIATION, TIMESTEP, BODIES_COUNT, MAX_VELOCITY, MIN_VELOCITY, WIND_STRENGTH, PILLS_COUNT } from './constants.js';


export default class Particle {
	constructor({ x, y, z, mass, velocity, soundSrc, audioScene }) {
		this.initPosition = { x, y, z };
		this.mass = mass;
		this.initVelocity = { x: velocity, y: velocity, z: velocity };
		this.audioScene = audioScene;
		this.onLoadSound = this.onLoadSound.bind(this);
		this.onDecodeSound = this.onDecodeSound.bind(this);

		this.setupBody();
		this.setupMesh();
		this.loadSound(soundSrc);
	}

	setupBody() {
		// const shape = new CANNON.Box(new CANNON.Vec3(2, 2, 0.2));
		const shape = new CANNON.Sphere(2);
		this.body = new CANNON.Body({ mass: this.mass });
		this.body.addShape(shape);
		this.body.position.set(this.initPosition.x, this.initPosition.y, this.initPosition.z);
		this.body.angularVelocity.set(0, Math.random() * 0.2, 0);
		// this.body.velocity.set(this.initVelocity.x, this.initVelocity.y, this.initVelocity.z);
		this.body.angularDamping = 0.92;
		this.body.linearDamping = 0.1;
	}

	setupMesh() {
		// const geometry = new THREE.BoxGeometry(4, 4, 0.4);
		const geometry = new THREE.SphereGeometry(2, 16, 16);
		// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.mesh.onEnterFocus = this.onEnterFocus.bind(this);
		this.mesh.onExitFocus = this.onExitFocus.bind(this);
	}

	loadSound(src) {
		this.request = new XMLHttpRequest();
		this.request.open('GET', `assets/sounds/${src}`, true);
		this.request.responseType = 'arraybuffer'
		this.request.onload = this.onLoadSound;
		this.request.send();
	}

	onLoadSound(e) {
		if (e.target.readyState === 4 && e.target.status === 200) {
			decode(e.target.response, this.onDecodeSound, this.onErrorDecodeSound);
		} else if (e.target.readyState === 4) {
			console.error('Error: Sound probably missing');
		}
	}

	onDecodeSound(e) {
		this.sound = this.audioScene.createPanner(e);
		this.sound.source.start(0);
	}

	onErrorDecodeSound(e) {
		console.error('Error decoding sound:', e);
	}

	kill() {
		// Blah
	}

	onEnterFocus() {
		this.mesh.material.color.set(0xed4962);
		if (this.sound) TweenLite.to(this.sound.gainNode.gain, 0.33, {value: 8});
	}

	onExitFocus() {
		this.mesh.material.color.set(0xffffff);
		if (this.sound) TweenLite.to(this.sound.gainNode.gain, 0.33, {value: 1});
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

		if (this.sound) {
			const matrix = new THREE.Matrix4();
			matrix.extractRotation(this.mesh.matrix);
			const direction = new THREE.Vector3(0, 0, 1);
			matrix.multiplyVector3(direction)
			this.sound.pannerForward.setPosition(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
			this.sound.pannerForward.setOrientation(direction.x, direction.y, direction.z);
			// this.sound.pannerBackward.setPosition(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
			// this.sound.pannerBackward.setOrientation(direction.x * -1, direction.y * -1, direction.z * -1);
		}
	}

	static generateVelocity() {
		const vel = (Math.random() * MAX_VELOCITY) - MAX_VELOCITY / 2;
		if (Math.abs(vel) > MIN_VELOCITY) {
			return Particle.generateVelocity();
		} else {
			return vel;
		}
	}
}