import { Events, Engine, World, Bodies, Body, Render, MouseConstraint, Mouse } from 'matter-js';
import Victor from 'victor';
let raf, then, now, delta;
let engine, render;
let list, items, titles, fire;
let particles = [], walls = [], mouseConstraint, mouse;


class Particle {
	constructor(el, list, isStatic) {
		const listRect = list.getBoundingClientRect();
		this.el = el;
		this.isStatic = isStatic;
		this.rect = el.getBoundingClientRect();
		if (isStatic) console.log(el.offsetTop);
		this.body = null;
		this.originPositionRelativeToWorld = {
			x: 0,
			y: el.offsetTop - list.offsetTop - listRect.height / 2,
		}

		if (!isStatic) this.originPositionRelativeToWorld.y += 40;

		this.setupBody();
		
		this.onClick = this.onClick.bind(this);
	}

	// kill() {
	// 	this.el.removeEventListener('click', this.onClick);
	// }

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
		if (dist > 400) return;
		
		const scale = 1 - dist / 400;
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
	titles = [...document.getElementsByClassName('selected-work__title')];
	fire = [...document.getElementsByClassName('emoji--fire')];
	const rect = list.getBoundingClientRect();

	if (engine) {
		Engine.clear(engine);
		engine = undefined;
		particles = [];
		fire.forEach( (f) => f.parentElement.removeChild(f));
	}

	engine = Engine.create();
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;

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
	titles.forEach(title => particles.push(new Particle(title, list, true)));
	// particles.push(new Particle(title, list, true))
	const bodies = [...walls, ...particles.map(item => item.body)];

	mouse = Mouse.create(list);
	mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
	mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
	mouse.element.removeEventListener("touchmove", mouse.mousemove);
	mouse.element.removeEventListener("touchstart", mouse.mousedown);
	mouse.element.removeEventListener("touchend", mouse.mouseup);
	Mouse.setOffset(mouse, { x: rect.width / -2, y: rect.height / -2 });
	mouseConstraint = MouseConstraint.create(engine, {
		mouse,
	});
	
	Events.on(mouseConstraint, 'mousedown', (e) => {
		particles.forEach(p => p.onClick());
		addFire(e);
	});


	World.add(engine.world, bodies);
	World.add(engine.world, mouseConstraint);
	Engine.run(engine);

	Events.on(engine, 'afterUpdate', () => {
		const now =  new Date().getTime();
		particles.forEach(p => p.update( now ));
    });
}


const addFire = (e) => {
	const { x, y } = e.mouse.absolute;
	console.log(x, y);
	const span = document.createElement('span');
	span.innerHTML = '🔥';
	span.className = 'emoji emoji--fire';
	span.style.top = `${y + list.offsetTop - 23}px`;
	span.style.left = `${x + 8}px`;
	list.parentNode.insertBefore(span, list);

	const p = new Particle(span, list, true);
	particles.push(p);
	World.add(engine.world, p.body);
	// list.appendChild(span);
}





