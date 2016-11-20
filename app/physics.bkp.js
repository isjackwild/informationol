let raf, then, now, delta;
const CANNON = require('cannon');
const TIMESTEP = 1 / 60;
let world;
let list, items, particles = [];


class Particle {
	constructor(el, { w, h }) {
		this.el = el;
		this.originalBox = el.getBoundingClientRect();
		this.originalPos = {
			x: el.offsetLeft + this.originalBox.width / 2 - w / 2,
			y: el.offsetTop + this.originalBox.height / 2 - h / 2,
			z: 0,
		}

		const shape = new CANNON.Box(new CANNON.Vec3(this.originalBox.width, this.originalBox.height), 5);
		this.body = new CANNON.Body({ mass: 1 });
		this.body.addShape(shape);
		this.body.position.set(this.originalPos.x, this.originalPos.y, this.originalPos.z);
		this.body.velocity.set(Math.random() / 100, Math.random() / 100, Math.random() / 100);
		this.body.angularDamping = 1;
		this.body.linearDamping = 0.1;
	}
	
	update(wind) {
		// this.body.applyLocalImpulse(wind, new CANNON.Vec3(0,0,0));
		this.el.style.transform = `translate3d(${this.body.position.x - this.originalPos.x}px, ${this.body.position.y - this.originalPos.y}px, ${this.body.position.z - this.originalPos.z}px)`;
	}
}

export const init = () => {
	list = document.getElementsByClassName('selected-work')[0];
	items = [...document.getElementsByClassName('selected-work__list-item')];

	world = new CANNON.World();
	world.gravity.set(0,0,0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10;
	world.defaultContactMaterial.restitution = 0.001;
	world.defaultContactMaterial.friction = 0;

	reset();
	animate();
}



const reset = () => {
	const rect = list.getBoundingClientRect();

	for (let i = 0; i < 6; i++) {
		const groundShape = new CANNON.Plane();
		const groundBody = new CANNON.Body({
			mass: 0,
			shape: groundShape,
		});
		
		switch (i) {
			case 0: // floor
				groundBody.position.set(0, rect.height / -2, 0);
				groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI / -2);
				break;
			case 1: // ceil
				groundBody.position.set(0, rect.height / 2, 0);
				groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI / 2);
				break;
			case 2: // left
				groundBody.position.set(rect.width / 2, 0, 0);
				groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI / -2);
				break;
			case 3: // right
				groundBody.position.set(rect.width / -2, 0, 0);
				groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI / 2);
				break;
			case 4: // back
				groundBody.position.set(0, 0, -1);
				break;
			case 5: // front
				groundBody.position.set(0, 0, 1);
				groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI);
				break;
		}

		world.addBody(groundBody);
	}

	items.forEach((item) => {
		const p = new Particle(item, { w: rect.width, h: rect.height });
		world.addBody(p.body);
		particles.push(p);
	});
}




const animate = () => {
	then = now ? now : null;
	now = new Date().getTime();
	delta = then ? (now - then) / 16.666 : 1;

	const ts = Math.min(TIMESTEP * (delta || 1), 0.0333);
	world.step(ts);
	const wind = new CANNON.Vec3(
		Math.random() / 10,
		Math.random() / 10,
		Math.random() / 10,
	);
	particles.forEach(p => p.update(wind));

	raf = requestAnimationFrame(animate);
}