import { init as initPhysics } from './physics.js';
let bomb, list;

const kickIt = () => {
	const items = [...document.getElementsByClassName('selected-work__list-item')];
	list = document.getElementsByClassName('selected-work')[0];
	bomb = document.getElementsByClassName('bomb')[0];

	window.addEventListener('mousemove', onMouseMove, false);
	items.forEach((item) => {
		item.addEventListener('mouseenter', onEnterListItem);
		item.addEventListener('mouseleave', onLeaveListItem);
		item.style.transform = null
	});
	requestAnimationFrame(() => {
		initPhysics();
	});
	window.addEventListener('resize', (e) => {
		requestAnimationFrame(() => {
			initPhysics();
		});
	});
}

const onMouseMove = (e) => {
	bomb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
}

const onEnterListItem = () => {
	list.classList.add('selected-work--item-hover');
}

const onLeaveListItem = () => {
	list.classList.remove('selected-work--item-hover');
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}