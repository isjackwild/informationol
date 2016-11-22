let canvas, ctx;
let mouseDown = false;
let colour = "orange";
let lastX = 0, lastY = 0;
let devicePixelRatio = 1, backingStoreRatio = 1, ratio;
let colours;


export const init = () => {
	devicePixelRatio = window.devicePixelRatio || 1,
	// backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
	ratio = devicePixelRatio;

	colours = [...document.getElementsByClassName('colour-picker__option')];
	canvas = document.getElementsByClassName('about__canvas')[0];
	ctx = canvas.getContext('2d');
	onResize();
	
	
	colours.forEach((c) => {
		c.addEventListener('click', chooseColour, false);
	});

	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('resize', onResize, false);
}

const onMouseDown = () => {
	mouseDown = true;
}

const onMouseUp = () => {
	mouseDown = false;	
}

const onMouseMove = (e) => {
	const rect = canvas.getBoundingClientRect();
	const x = (e.clientX - rect.left) * devicePixelRatio;
	const y = (e.clientY - rect.top) * devicePixelRatio;

	if (mouseDown) {
		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(x, y);
		ctx.closePath();
		ctx.stroke();
	}
	lastX = x;
	lastY = y;
}

const onResize = () => {
	canvas.width = canvas.clientWidth * devicePixelRatio;
	canvas.height = canvas.clientHeight * devicePixelRatio;
	ctx.strokeStyle = colour;
	ctx.lineWidth = 30;
	ctx.lineJoin = 'round';
}

const chooseColour = (e) => {
	const current = document.getElementsByClassName('colour-picker__option--selected')[0].classList.remove('colour-picker__option--selected');
	e.currentTarget.classList.add('colour-picker__option--selected');
	ctx.strokeStyle = e.currentTarget.dataset.colour;
}