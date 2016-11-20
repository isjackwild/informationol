import { Events, Engine, World, Bodies, Body, Render, MouseConstraint, Mouse } from 'matter-js';
import Victor from 'victor';
let raf, then, now, delta;
let engine, render;
let list, items, title;
let particles = [], walls = [], mouseConstraint, mouse;


class Particle {
	constructor(el, list, isStatic) {
		const listRect = list.getBoundingClientRect();
		this.el = el;
		this.isStatic = isStatic;
		this.rect = el.getBoundingClientRect();
		this.body = null;
		this.originPositionRelativeToWorld = {
			x: 0,
			y: el.offsetTop - list.offsetTop + 40 - listRect.height / 2,
		}

		this.setupBody();
		
		this.onClick = this.onClick.bind(this);
	}

	setupBody() {
		const pos = this.originPositionRelativeToWorld;
		const options = {
			restitution: 0.6,
			friction: 0,
			frictionAir: 0,
			frictionStatic: 0,
			isStatic: this.isStatic,
		}

		this.body = Bodies.rectangle(pos.x, pos.y, this.rect.width, this.rect.height, options);
		// this.body.position = new Victor(pos.x, pos.y);
	}

	onClick() {
		const mP = new Victor(mouse.mousedownPosition.x, mouse.mousedownPosition.y);
		const dist = mP.distance(new Victor(this.body.position.x, this.body.position.y));
		if (dist > 500) return;
		
		const scale = 1 - dist / 500;
		const force = new Victor(
			this.body.position.x - mP.x,
			this.body.position.y - mP.y,
		).norm().multiply(new Victor(scale, scale));

		Body.applyForce(this.body, { x: mP.x, y: mP.y }, force);
	}
	
	update(time) {
		const x = Math.cos(time) / 2000;
		const y = Math.sin(time) / 2000;
		Body.applyForce(this.body, { x: 0, y: 0 }, { x, y });

		this.el.style.transform = `
			translate3d(${this.body.position.x - this.originPositionRelativeToWorld.x}px, ${this.body.position.y - this.originPositionRelativeToWorld.y}px, 0px)
			rotate(${this.body.angle * 57.2958}deg)
		`;
	}
}

export const init = () => {
	list = document.getElementsByClassName('selected-work')[0];
	items = [...document.getElementsByClassName('selected-work__list-item')];
	title = document.getElementsByClassName('selected-work__title')[0]
	const rect = list.getBoundingClientRect();

	if (engine) {
		Engine.clear(engine);
		engine = undefined;
		particles = [];
	}

	engine = Engine.create();
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;

	// render = Render.create({
	// 	element: list,
	// 	engine,
	// 	options: {
	// 		pixelRatio: 2,
	// 	}
	// });

	const options = {
		isStatic: true,
		restitution: 1,
	}

	const border = window.innerWidth <= 768 ? 25 : 35;
	walls = [
		Bodies.rectangle(0, (rect.height / -2) + (border / 2), rect.width, border, options),
		Bodies.rectangle(0, (rect.height / 2) - (border / 2), rect.width, border, options),

		Bodies.rectangle((rect.width / -2) + (border / 2), 0, border, rect.height, options),
		Bodies.rectangle((rect.width / 2) - (border / 2), 0, border, rect.height, options),
	]

	items.forEach(item => particles.push(new Particle(item, list)));

	particles.push(new Particle(title, list, true))
	const bodies = [...walls, ...particles.map(item => item.body)];

	mouse = Mouse.create(list);
	mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
	mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
	mouse.element.removeEventListener("touchmove", mouse.mousemove);
	Mouse.setOffset(mouse, { x: rect.width / -2, y: rect.height / -2 });
	mouseConstraint = MouseConstraint.create(engine, {
		mouse,
	});
	
	Events.on(mouseConstraint, 'mousedown', (e) => {
		particles.forEach(p => p.onClick());
	});


	World.add(engine.world, bodies);
	World.add(engine.world, mouseConstraint);
	Engine.run(engine);

	Events.on(engine, 'afterUpdate', () => {
		const now =  new Date().getTime();
		particles.forEach(p => p.update( now ));
    });
}






