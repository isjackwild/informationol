import { Events, Engine, World, Bodies, Body, Render, MouseConstraint, Mouse } from 'matter-js';
import Victor from 'victor';
let raf, then, now, delta;
let engine, render;
let list, items, titles, fire, bomb;
let particles = [], walls = [], explosions = [], mouseConstraint, mouse;

let BOMB_THRESHOLD;
const BOMB_RESTITUTION = 1.5;
const TITLE_RESTITUTION = 0.8;
const ITEM_RESTITUTION = 0.5;
const WALL_RESTITUTION = 1;


class Particle {
	constructor(el, list, options) {
		const listRect = list.getBoundingClientRect();
		this.el = el;
		this.isStatic = options ? options.isStatic : false;
		this.restitution = options ? options.options : ITEM_RESTITUTION;
		this.rect = el.getBoundingClientRect();
		this.body = null;
		this.originPositionRelativeToWorld = {
			x: el.offsetLeft + (el.clientWidth * 0.5) - listRect.width / 2,
			y: el.offsetTop + (el.clientHeight * 0.5) - listRect.height / 2,
		}

		this.setupBody();
		this.onClick = this.onClick.bind(this);
	}

	setupBody() {
		const pos = this.originPositionRelativeToWorld;
		const options = {
			restitution: this.restitution,
			friction: 0,
			frictionAir: 0,
			frictionStatic: 0,
			isStatic: this.isStatic,
		}

		this.body = Bodies.rectangle(pos.x, pos.y, this.rect.width, this.rect.height, options);
	}

	onClick(x, y) {
		const mP = new Victor(x, y);
		const dist = mP.distance(new Victor(this.body.position.x, this.body.position.y));
		if (dist > BOMB_THRESHOLD) return;
		let scale = 1 - dist / BOMB_THRESHOLD;
		if (window.innerWidth > 1440) scale *= 1.8;
		const force = new Victor(
			this.body.position.x - mP.x,
			this.body.position.y - mP.y,
		).norm().multiply(new Victor(scale, scale));

		Body.applyForce(this.body, { x: mP.x, y: mP.y }, force);
	}
	
	update(time) {
		this.el.style.transform = `
			translate3d(${this.body.position.x - this.originPositionRelativeToWorld.x}px, ${this.body.position.y - this.originPositionRelativeToWorld.y}px, 0px)
			rotate(${this.body.angle * 57.2958}deg)
		`;
	}
}


export const init = () => {
	BOMB_THRESHOLD = window.innerWidth > 1440 ? 800 : 400;

	bomb = document.getElementsByClassName('emoji--bomb')[0];
	list = document.getElementsByClassName('selected-work')[0];
	items = [...document.getElementsByClassName('selected-work__list-item')];
	titles = [...document.getElementsByClassName('selected-work__title')];
	fire = [...document.getElementsByClassName('emoji--fire')];
	const rect = list.getBoundingClientRect();

	if (engine) {
		Engine.clear(engine);
		engine = undefined;
		particles = [];
		fire.forEach((f) => f.parentElement.removeChild(f));
	}

	engine = Engine.create();
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;

	const options = {
		isStatic: true,
		restitution: WALL_RESTITUTION,
	}

	const border = 10;
	walls = [
		Bodies.rectangle(0, (rect.height / -2) - (border / 2), rect.width, border, options),
		Bodies.rectangle(0, (rect.height / 2) + (border / 2), rect.width, border, options),

		Bodies.rectangle((rect.width / -2) - (border / 2), 0, border, rect.height, options),
		Bodies.rectangle((rect.width / 2) + (border / 2), 0, border, rect.height, options),
	]

	items.forEach(item => particles.push(new Particle(item, list)));
	titles.forEach(title => particles.push(new Particle(title, list, { isStatic: true, restitution: TITLE_RESTITUTION })));
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
	
	// Events.on(mouseConstraint, 'mousedown', (e) => {
	// 	addFire(e);
	// });
	// 
	
	list.removeEventListener('click', addFire);
	list.removeEventListener('touchstart', addFire);
	list.addEventListener('click', addFire);
	list.addEventListener('mousedown', onMouseDown);
	list.addEventListener('mouseup', onMouseUp);
	list.addEventListener('touchstart', addFire);


	World.add(engine.world, bodies);
	World.add(engine.world, mouseConstraint);
	Engine.run(engine);

	Events.on(engine, 'afterUpdate', () => {
		const now =  new Date().getTime();
		particles.forEach(p => p.update( now ));
    });
}


const addFire = (e) => {
	const rect = list.getBoundingClientRect();
	const x = e.touches ? e.touches[0].clientX : e.clientX;
	const y = e.touches ? e.touches[0].clientY : e.clientY;

	const elX = x;
	const elY = y - rect.top;

	const worldX = elX - (rect.width / 2);
	const worldY = elY - (rect.height / 2);

	// const { x, y } = e.mouse.absolute;
	// const { x: offsetX, y: offsetY } = e.mouse.mousedownPosition;

	particles.forEach(p => p.onClick(worldX, worldY));

	// const span = document.createElement('span');
	// span.innerHTML = '🔥';
	// span.className = 'emoji emoji--fire';
	// span.style.left = `${elX - 45}px`;
	// span.style.top = `${elY - 6}px`;
	// 
	const explosion = document.createElement('span');
	explosion.className = 'explosion';
	const explosionBoom = document.createElement('span');
	explosionBoom.className = 'explosion__boom';
	explosion.appendChild(explosionBoom);

	explosion.style.left = `${elX - 12}px`;
	explosion.style.top = `${elY - 15}px`;

	const firstChild = document.getElementsByClassName('selected-work__list')[0];
	list.insertBefore(explosion, firstChild);

	requestAnimationFrame(() => {
		const p = new Particle(explosion, list, { isStatic: true, restitution: BOMB_RESTITUTION });
		particles.push(p);
		World.add(engine.world, p.body);
		const sound = new Audio('assets/sound/gun-short.mp3');
		sound.volume = 0.22;
		sound.play();
	});
}

const onMouseDown = () => {
	bomb.classList.add('touched');
}

const onMouseUp = () => {
	bomb.classList.remove('touched');
}





