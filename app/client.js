import { init as initPhysics, pause as PausePhysics, play as playPhysics } from './physics.js';
import { init as initDrawing } from './drawing.js';
let customCursor, selectedWork, links, menu, menuFlipButton;
let frontSide = true;

const kickIt = () => {
	const items = [...document.getElementsByClassName('selected-work__list-item')];
	const links = [...document.getElementsByTagName('a')];
	selectedWork = document.getElementsByClassName('menu__selected-work')[0];
	customCursor = document.getElementsByClassName('custom-cursor')[0];
	menu = document.getElementsByClassName('menu')[0];
	menuFlipButton = document.getElementsByClassName('menu__flip-button')[0];
	// flipMenu();
	
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
		initDrawing();
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
	customCursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
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
	frontSide = !frontSide;
	customCursor.classList.toggle('custom-cursor--bomb');
	customCursor.classList.toggle('custom-cursor--pencil');
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}