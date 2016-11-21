import { init as initPhysics } from './physics.js';
let bomb, list, links;

const kickIt = () => {
	const items = [...document.getElementsByClassName('selected-work__list-item')];
	const links = [...document.getElementsByTagName('a')];
	list = document.getElementsByClassName('selected-work')[0];
	bomb = document.getElementsByClassName('emoji--bomb')[0];
	console.log(bomb);

	items.forEach((item) => {
		item.addEventListener('mouseenter', onEnterListItem);
		item.addEventListener('mouseleave', onLeaveListItem);
		item.style.transform = null
	});
	links.forEach((link) => {
		link.addEventListener('mouseenter', onLinkEnter, false);
		link.addEventListener('mouseleave', onLinkLeave, false);

		link.addEventListener('touchstart', onLinkEnter, false);
		link.addEventListener('touchend', onLinkLeave, false);
	});
	requestAnimationFrame(() => {
		initPhysics();
	});

	if (window.innerWidth > 768) {
		window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('resize', () => {
			requestAnimationFrame(() => {
				initPhysics();
			});
		});
	} else {
		window.addEventListener('orientationchange', () => {
			requestAnimationFrame(() => {
				initPhysics();
			});
		});
	}
}

const onMouseMove = (e) => {
	bomb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
}

const onEnterListItem = () => {
	list.classList.add('selected-work--item-hover');
}

const onLinkEnter = (e) => {
	e.currentTarget.classList.add('hover');
}

const onLinkLeave = (e) => {
	e.currentTarget.classList.remove('hover');
}

const onLeaveListItem = () => {
	list.classList.remove('selected-work--item-hover');
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}