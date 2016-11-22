import { init as initPhysics } from './physics.js';
let bomb, selectedWork, links, menu, menuFlipButton;

const kickIt = () => {
	const items = [...document.getElementsByClassName('selected-work__list-item')];
	const links = [...document.getElementsByTagName('a')];
	selectedWork = document.getElementsByClassName('menu__selected-work')[0];
	bomb = document.getElementsByClassName('emoji--bomb')[0];
	menu = document.getElementsByClassName('menu')[0];
	menuFlipButton = document.getElementsByClassName('menu__flip-button')[0];

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
	menuFlipButton.addEventListener('click', flipMenu, false);

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
	bomb.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
}

const onEnterListItem = (e) => {
	selectedWork.classList.add('selected-work--item-hover');
}

const onLinkEnter = (e) => {
	e.stopPropagation();
	e.currentTarget.classList.add('hover');
}

const onLinkLeave = (e) => {
	e.currentTarget.classList.remove('hover');
}

const onLeaveListItem = () => {
	selectedWork.classList.remove('selected-work--item-hover');
}

const flipMenu = () => {
	menu.classList.toggle('menu--flipped');
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}