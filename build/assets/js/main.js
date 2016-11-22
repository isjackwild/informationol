(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _physics = require('./physics.js');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var bomb = void 0,
    selectedWork = void 0,
    links = void 0,
    menu = void 0,
    menuFlipButton = void 0;

var kickIt = function kickIt() {
	var items = [].concat(_toConsumableArray(document.getElementsByClassName('selected-work__list-item')));
	var links = [].concat(_toConsumableArray(document.getElementsByTagName('a')));
	selectedWork = document.getElementsByClassName('menu__selected-work')[0];
	bomb = document.getElementsByClassName('emoji--bomb')[0];
	menu = document.getElementsByClassName('menu')[0];
	menuFlipButton = document.getElementsByClassName('menu__flip-button')[0];

	items.forEach(function (item) {
		item.addEventListener('mouseenter', onEnterListItem);
		item.addEventListener('mouseleave', onLeaveListItem);
		item.style.transform = null;
	});
	links.forEach(function (link) {
		link.addEventListener('mouseenter', onLinkEnter, false);
		link.addEventListener('mouseleave', onLinkLeave, false);

		link.addEventListener('touchstart', onLinkEnter, false);
		link.addEventListener('touchend', onLinkLeave, false);
	});
	menuFlipButton.addEventListener('click', flipMenu, false);

	requestAnimationFrame(function () {
		(0, _physics.init)();
	});
	if (window.innerWidth > 768) {
		window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('resize', function () {
			requestAnimationFrame(function () {
				(0, _physics.init)();
			});
		});
	} else {
		window.addEventListener('orientationchange', function () {
			requestAnimationFrame(function () {
				(0, _physics.init)();
			});
		});
	}
};

var onMouseMove = function onMouseMove(e) {
	bomb.style.transform = 'translate3d(' + e.clientX + 'px, ' + e.clientY + 'px, 0)';
};

var onEnterListItem = function onEnterListItem(e) {
	selectedWork.classList.add('selected-work--item-hover');
};

var onLinkEnter = function onLinkEnter(e) {
	e.stopPropagation();
	e.currentTarget.classList.add('hover');
};

var onLinkLeave = function onLinkLeave(e) {
	e.currentTarget.classList.remove('hover');
};

var onLeaveListItem = function onLeaveListItem() {
	selectedWork.classList.remove('selected-work--item-hover');
};

var flipMenu = function flipMenu() {
	menu.classList.toggle('menu--flipped');
};

if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}

},{"./physics.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.init = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matterJs = require('matter-js');

var _victor = require('victor');

var _victor2 = _interopRequireDefault(_victor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var raf = void 0,
    then = void 0,
    now = void 0,
    delta = void 0;
var engine = void 0,
    render = void 0;
var list = void 0,
    items = void 0,
    titles = void 0,
    fire = void 0;
var particles = [],
    walls = [],
    mouseConstraint = void 0,
    mouse = void 0;

var BOMB_THRESHOLD = void 0;
var BOMB_RESTITUTION = 1.5;
var TITLE_RESTITUTION = 0.8;
var ITEM_RESTITUTION = 0.5;
var WALL_RESTITUTION = 1;

var Particle = function () {
	function Particle(el, list, options) {
		_classCallCheck(this, Particle);

		var listRect = list.getBoundingClientRect();
		this.el = el;
		this.isStatic = options ? options.isStatic : false;
		this.restitution = options ? options.options : ITEM_RESTITUTION;
		this.rect = el.getBoundingClientRect();
		this.body = null;
		this.originPositionRelativeToWorld = {
			x: el.offsetLeft + el.clientWidth * 0.5 - listRect.width / 2,
			y: el.offsetTop + el.clientHeight * 0.5 - listRect.height / 2
		};

		// if (!isStatic) this.originPositionRelativeToWorld.y += 40;

		this.setupBody();

		this.onClick = this.onClick.bind(this);
	}

	// kill() {
	// 	this.el.removeEventListener('click', this.onClick);
	// }

	_createClass(Particle, [{
		key: 'setupBody',
		value: function setupBody() {
			var pos = this.originPositionRelativeToWorld;
			var options = {
				restitution: this.restitution,
				friction: 0,
				frictionAir: 0,
				frictionStatic: 0,
				isStatic: this.isStatic
			};

			this.body = _matterJs.Bodies.rectangle(pos.x, pos.y, this.rect.width, this.rect.height, options);
			// this.body.position = new Victor(pos.x, pos.y);
		}
	}, {
		key: 'onClick',
		value: function onClick(x, y) {
			var mP = new _victor2.default(x, y);
			var dist = mP.distance(new _victor2.default(this.body.position.x, this.body.position.y));
			if (dist > BOMB_THRESHOLD) return;
			var scale = 1 - dist / BOMB_THRESHOLD;
			var force = new _victor2.default(this.body.position.x - mP.x, this.body.position.y - mP.y).norm().multiply(new _victor2.default(scale, scale));

			_matterJs.Body.applyForce(this.body, { x: mP.x, y: mP.y }, force);
		}
	}, {
		key: 'update',
		value: function update(time) {
			var x = Math.cos(time) / 2000;
			var y = Math.sin(time) / 2000;
			_matterJs.Body.applyForce(this.body, { x: 0, y: 0 }, { x: x, y: y });

			this.el.style.transform = '\n\t\t\ttranslate(' + (this.body.position.x - this.originPositionRelativeToWorld.x) + 'px, ' + (this.body.position.y - this.originPositionRelativeToWorld.y) + 'px)\n\t\t\trotate(' + this.body.angle * 57.2958 + 'deg)\n\t\t';
		}
	}]);

	return Particle;
}();

var init = exports.init = function init() {
	// return;
	BOMB_THRESHOLD = window.innerWidth > 1440 ? 600 : 400;

	list = document.getElementsByClassName('menu__selected-work')[0];
	items = [].concat(_toConsumableArray(document.getElementsByClassName('selected-work__list-item')));
	titles = [].concat(_toConsumableArray(document.getElementsByClassName('selected-work__title')));
	fire = [].concat(_toConsumableArray(document.getElementsByClassName('emoji--fire')));
	var rect = list.getBoundingClientRect();

	if (engine) {
		_matterJs.Engine.clear(engine);
		engine = undefined;
		particles = [];
		fire.forEach(function (f) {
			return f.parentElement.removeChild(f);
		});
	}

	engine = _matterJs.Engine.create();
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;

	var options = {
		isStatic: true,
		restitution: WALL_RESTITUTION
	};

	var border = window.innerWidth <= 768 ? 25 : 35;
	walls = [_matterJs.Bodies.rectangle(0, rect.height / -2 + border / 2, rect.width, border, options), _matterJs.Bodies.rectangle(0, rect.height / 2 - border / 2, rect.width, border, options), _matterJs.Bodies.rectangle(rect.width / -2 + border / 2, 0, border, rect.height, options), _matterJs.Bodies.rectangle(rect.width / 2 - border / 2, 0, border, rect.height, options)];

	items.forEach(function (item) {
		return particles.push(new Particle(item, list));
	});
	titles.forEach(function (title) {
		return particles.push(new Particle(title, list, { isStatic: true, restitution: TITLE_RESTITUTION }));
	});
	// particles.push(new Particle(title, list, true))
	var bodies = [].concat(_toConsumableArray(walls), _toConsumableArray(particles.map(function (item) {
		return item.body;
	})));

	mouse = _matterJs.Mouse.create(list);
	mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
	mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
	mouse.element.removeEventListener("touchmove", mouse.mousemove);
	mouse.element.removeEventListener("touchstart", mouse.mousedown);
	mouse.element.removeEventListener("touchend", mouse.mouseup);
	_matterJs.Mouse.setOffset(mouse, { x: rect.width / -2, y: rect.height / -2 });
	mouseConstraint = _matterJs.MouseConstraint.create(engine, {
		mouse: mouse
	});

	// Events.on(mouseConstraint, 'mousedown', (e) => {
	// 	addFire(e);
	// });
	// 

	list.removeEventListener('click', addFire);
	list.removeEventListener('touchstart', addFire);
	list.addEventListener('click', addFire);
	list.addEventListener('touchstart', addFire);

	_matterJs.World.add(engine.world, bodies);
	_matterJs.World.add(engine.world, mouseConstraint);
	_matterJs.Engine.run(engine);

	_matterJs.Events.on(engine, 'afterUpdate', function () {
		var now = new Date().getTime();
		particles.forEach(function (p) {
			return p.update(now);
		});
	});
};

var addFire = function addFire(e) {
	var rect = list.getBoundingClientRect();
	var x = e.touches ? e.touches[0].clientX : e.clientX;
	var y = e.touches ? e.touches[0].clientY : e.clientY;

	var elX = x;
	var elY = y - rect.top;

	var worldX = elX - rect.width / 2;
	var worldY = elY - rect.height / 2;

	// const { x, y } = e.mouse.absolute;
	// const { x: offsetX, y: offsetY } = e.mouse.mousedownPosition;

	particles.forEach(function (p) {
		return p.onClick(worldX, worldY);
	});

	var span = document.createElement('span');
	span.innerHTML = '🔥';
	span.className = 'emoji emoji--fire';
	span.style.left = elX - 43 + 'px';
	span.style.top = elY - 23 + 'px';

	var firstChild = document.getElementsByClassName('selected-work')[0];
	list.insertBefore(span, firstChild);

	requestAnimationFrame(function () {
		var p = new Particle(span, list, { isStatic: true, restitution: BOMB_RESTITUTION });
		particles.push(p);
		_matterJs.World.add(engine.world, p.body);
		var sound = new Audio('assets/sound/gun-short.mp3');
		sound.volume = 0.22;
		sound.play();
	});
};

},{"matter-js":3,"victor":4}],3:[function(require,module,exports){
(function (global){
/**
* matter-js 0.11.1 by @liabru 2016-11-09
* http://brm.io/matter-js/
* License MIT
*/

/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Liam Brummitt
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Matter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
* The `Matter.Body` module contains methods for creating and manipulating body models.
* A `Matter.Body` is a rigid body that can be simulated by a `Matter.Engine`.
* Factories for commonly used body configurations (such as rectangles, circles and other polygons) can be found in the module `Matter.Bodies`.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).

* @class Body
*/

var Body = {};

module.exports = Body;

var Vertices = _dereq_('../geometry/Vertices');
var Vector = _dereq_('../geometry/Vector');
var Sleeping = _dereq_('../core/Sleeping');
var Render = _dereq_('../render/Render');
var Common = _dereq_('../core/Common');
var Bounds = _dereq_('../geometry/Bounds');
var Axes = _dereq_('../geometry/Axes');

(function() {

    Body._inertiaScale = 4;
    Body._nextCollidingGroupId = 1;
    Body._nextNonCollidingGroupId = -1;
    Body._nextCategory = 0x0001;

    /**
     * Creates a new rigid body model. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * Vertices must be specified in clockwise order.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {} options
     * @return {body} body
     */
    Body.create = function(options) {
        var defaults = {
            id: Common.nextId(),
            type: 'body',
            label: 'Body',
            parts: [],
            angle: 0,
            vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),
            position: { x: 0, y: 0 },
            force: { x: 0, y: 0 },
            torque: 0,
            positionImpulse: { x: 0, y: 0 },
            constraintImpulse: { x: 0, y: 0, angle: 0 },
            totalContacts: 0,
            speed: 0,
            angularSpeed: 0,
            velocity: { x: 0, y: 0 },
            angularVelocity: 0,
            isSensor: false,
            isStatic: false,
            isSleeping: false,
            motion: 0,
            sleepThreshold: 60,
            density: 0.001,
            restitution: 0,
            friction: 0.1,
            frictionStatic: 0.5,
            frictionAir: 0.01,
            collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
                group: 0
            },
            slop: 0.05,
            timeScale: 1,
            render: {
                visible: true,
                opacity: 1,
                sprite: {
                    xScale: 1,
                    yScale: 1,
                    xOffset: 0,
                    yOffset: 0
                },
                lineWidth: 1.5
            }
        };

        var body = Common.extend(defaults, options);

        _initProperties(body, options);

        return body;
    };

    /**
     * Returns the next unique group index for which bodies will collide.
     * If `isNonColliding` is `true`, returns the next unique group index for which bodies will _not_ collide.
     * See `body.collisionFilter` for more information.
     * @method nextGroup
     * @param {bool} [isNonColliding=false]
     * @return {Number} Unique group index
     */
    Body.nextGroup = function(isNonColliding) {
        if (isNonColliding)
            return Body._nextNonCollidingGroupId--;

        return Body._nextCollidingGroupId++;
    };

    /**
     * Returns the next unique category bitfield (starting after the initial default category `0x0001`).
     * There are 32 available. See `body.collisionFilter` for more information.
     * @method nextCategory
     * @return {Number} Unique category bitfield
     */
    Body.nextCategory = function() {
        Body._nextCategory = Body._nextCategory << 1;
        return Body._nextCategory;
    };

    /**
     * Initialises body properties.
     * @method _initProperties
     * @private
     * @param {body} body
     * @param {} [options]
     */
    var _initProperties = function(body, options) {
        options = options || {};

        // init required properties (order is important)
        Body.set(body, {
            bounds: body.bounds || Bounds.create(body.vertices),
            positionPrev: body.positionPrev || Vector.clone(body.position),
            anglePrev: body.anglePrev || body.angle,
            vertices: body.vertices,
            parts: body.parts || [body],
            isStatic: body.isStatic,
            isSleeping: body.isSleeping,
            parent: body.parent || body
        });

        Vertices.rotate(body.vertices, body.angle, body.position);
        Axes.rotate(body.axes, body.angle);
        Bounds.update(body.bounds, body.vertices, body.velocity);

        // allow options to override the automatically calculated properties
        Body.set(body, {
            axes: options.axes || body.axes,
            area: options.area || body.area,
            mass: options.mass || body.mass,
            inertia: options.inertia || body.inertia
        });

        // render properties
        var defaultFillStyle = (body.isStatic ? '#eeeeee' : Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58'])),
            defaultStrokeStyle = Common.shadeColor(defaultFillStyle, -20);
        body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
        body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
        body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
        body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
    };

    /**
     * Given a property and a value (or map of), sets the property(s) on the body, using the appropriate setter functions if they exist.
     * Prefer to use the actual setter functions in performance critical situations.
     * @method set
     * @param {body} body
     * @param {} settings A property name (or map of properties and values) to set on the body.
     * @param {} value The value to set if `settings` is a single property name.
     */
    Body.set = function(body, settings, value) {
        var property;

        if (typeof settings === 'string') {
            property = settings;
            settings = {};
            settings[property] = value;
        }

        for (property in settings) {
            value = settings[property];

            if (!settings.hasOwnProperty(property))
                continue;

            switch (property) {

            case 'isStatic':
                Body.setStatic(body, value);
                break;
            case 'isSleeping':
                Sleeping.set(body, value);
                break;
            case 'mass':
                Body.setMass(body, value);
                break;
            case 'density':
                Body.setDensity(body, value);
                break;
            case 'inertia':
                Body.setInertia(body, value);
                break;
            case 'vertices':
                Body.setVertices(body, value);
                break;
            case 'position':
                Body.setPosition(body, value);
                break;
            case 'angle':
                Body.setAngle(body, value);
                break;
            case 'velocity':
                Body.setVelocity(body, value);
                break;
            case 'angularVelocity':
                Body.setAngularVelocity(body, value);
                break;
            case 'parts':
                Body.setParts(body, value);
                break;
            default:
                body[property] = value;

            }
        }
    };

    /**
     * Sets the body as static, including isStatic flag and setting mass and inertia to Infinity.
     * @method setStatic
     * @param {body} body
     * @param {bool} isStatic
     */
    Body.setStatic = function(body, isStatic) {
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            part.isStatic = isStatic;

            if (isStatic) {
                part.restitution = 0;
                part.friction = 1;
                part.mass = part.inertia = part.density = Infinity;
                part.inverseMass = part.inverseInertia = 0;

                part.positionPrev.x = part.position.x;
                part.positionPrev.y = part.position.y;
                part.anglePrev = part.angle;
                part.angularVelocity = 0;
                part.speed = 0;
                part.angularSpeed = 0;
                part.motion = 0;
            }
        }
    };

    /**
     * Sets the mass of the body. Inverse mass and density are automatically updated to reflect the change.
     * @method setMass
     * @param {body} body
     * @param {number} mass
     */
    Body.setMass = function(body, mass) {
        body.mass = mass;
        body.inverseMass = 1 / body.mass;
        body.density = body.mass / body.area;
    };

    /**
     * Sets the density of the body. Mass is automatically updated to reflect the change.
     * @method setDensity
     * @param {body} body
     * @param {number} density
     */
    Body.setDensity = function(body, density) {
        Body.setMass(body, density * body.area);
        body.density = density;
    };

    /**
     * Sets the moment of inertia (i.e. second moment of area) of the body of the body. 
     * Inverse inertia is automatically updated to reflect the change. Mass is not changed.
     * @method setInertia
     * @param {body} body
     * @param {number} inertia
     */
    Body.setInertia = function(body, inertia) {
        body.inertia = inertia;
        body.inverseInertia = 1 / body.inertia;
    };

    /**
     * Sets the body's vertices and updates body properties accordingly, including inertia, area and mass (with respect to `body.density`).
     * Vertices will be automatically transformed to be orientated around their centre of mass as the origin.
     * They are then automatically translated to world space based on `body.position`.
     *
     * The `vertices` argument should be passed as an array of `Matter.Vector` points (or a `Matter.Vertices` array).
     * Vertices must form a convex hull, concave hulls are not supported.
     *
     * @method setVertices
     * @param {body} body
     * @param {vector[]} vertices
     */
    Body.setVertices = function(body, vertices) {
        // change vertices
        if (vertices[0].body === body) {
            body.vertices = vertices;
        } else {
            body.vertices = Vertices.create(vertices, body);
        }

        // update properties
        body.axes = Axes.fromVertices(body.vertices);
        body.area = Vertices.area(body.vertices);
        Body.setMass(body, body.density * body.area);

        // orient vertices around the centre of mass at origin (0, 0)
        var centre = Vertices.centre(body.vertices);
        Vertices.translate(body.vertices, centre, -1);

        // update inertia while vertices are at origin (0, 0)
        Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));

        // update geometry
        Vertices.translate(body.vertices, body.position);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

    /**
     * Sets the parts of the `body` and updates mass, inertia and centroid.
     * Each part will have its parent set to `body`.
     * By default the convex hull will be automatically computed and set on `body`, unless `autoHull` is set to `false.`
     * Note that this method will ensure that the first part in `body.parts` will always be the `body`.
     * @method setParts
     * @param {body} body
     * @param [body] parts
     * @param {bool} [autoHull=true]
     */
    Body.setParts = function(body, parts, autoHull) {
        var i;

        // add all the parts, ensuring that the first part is always the parent body
        parts = parts.slice(0);
        body.parts.length = 0;
        body.parts.push(body);
        body.parent = body;

        for (i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part !== body) {
                part.parent = body;
                body.parts.push(part);
            }
        }

        if (body.parts.length === 1)
            return;

        autoHull = typeof autoHull !== 'undefined' ? autoHull : true;

        // find the convex hull of all parts to set on the parent body
        if (autoHull) {
            var vertices = [];
            for (i = 0; i < parts.length; i++) {
                vertices = vertices.concat(parts[i].vertices);
            }

            Vertices.clockwiseSort(vertices);

            var hull = Vertices.hull(vertices),
                hullCentre = Vertices.centre(hull);

            Body.setVertices(body, hull);
            Vertices.translate(body.vertices, hullCentre);
        }

        // sum the properties of all compound parts of the parent body
        var total = _totalProperties(body);

        body.area = total.area;
        body.parent = body;
        body.position.x = total.centre.x;
        body.position.y = total.centre.y;
        body.positionPrev.x = total.centre.x;
        body.positionPrev.y = total.centre.y;

        Body.setMass(body, total.mass);
        Body.setInertia(body, total.inertia);
        Body.setPosition(body, total.centre);
    };

    /**
     * Sets the position of the body instantly. Velocity, angle, force etc. are unchanged.
     * @method setPosition
     * @param {body} body
     * @param {vector} position
     */
    Body.setPosition = function(body, position) {
        var delta = Vector.sub(position, body.position);
        body.positionPrev.x += delta.x;
        body.positionPrev.y += delta.y;

        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            part.position.x += delta.x;
            part.position.y += delta.y;
            Vertices.translate(part.vertices, delta);
            Bounds.update(part.bounds, part.vertices, body.velocity);
        }
    };

    /**
     * Sets the angle of the body instantly. Angular velocity, position, force etc. are unchanged.
     * @method setAngle
     * @param {body} body
     * @param {number} angle
     */
    Body.setAngle = function(body, angle) {
        var delta = angle - body.angle;
        body.anglePrev += delta;

        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            part.angle += delta;
            Vertices.rotate(part.vertices, delta, body.position);
            Axes.rotate(part.axes, delta);
            Bounds.update(part.bounds, part.vertices, body.velocity);
            if (i > 0) {
                Vector.rotateAbout(part.position, delta, body.position, part.position);
            }
        }
    };

    /**
     * Sets the linear velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
     * @method setVelocity
     * @param {body} body
     * @param {vector} velocity
     */
    Body.setVelocity = function(body, velocity) {
        body.positionPrev.x = body.position.x - velocity.x;
        body.positionPrev.y = body.position.y - velocity.y;
        body.velocity.x = velocity.x;
        body.velocity.y = velocity.y;
        body.speed = Vector.magnitude(body.velocity);
    };

    /**
     * Sets the angular velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
     * @method setAngularVelocity
     * @param {body} body
     * @param {number} velocity
     */
    Body.setAngularVelocity = function(body, velocity) {
        body.anglePrev = body.angle - velocity;
        body.angularVelocity = velocity;
        body.angularSpeed = Math.abs(body.angularVelocity);
    };

    /**
     * Moves a body by a given vector relative to its current position, without imparting any velocity.
     * @method translate
     * @param {body} body
     * @param {vector} translation
     */
    Body.translate = function(body, translation) {
        Body.setPosition(body, Vector.add(body.position, translation));
    };

    /**
     * Rotates a body by a given angle relative to its current angle, without imparting any angular velocity.
     * @method rotate
     * @param {body} body
     * @param {number} rotation
     */
    Body.rotate = function(body, rotation) {
        Body.setAngle(body, body.angle + rotation);
    };

    /**
     * Scales the body, including updating physical properties (mass, area, axes, inertia), from a world-space point (default is body centre).
     * @method scale
     * @param {body} body
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {vector} [point]
     */
    Body.scale = function(body, scaleX, scaleY, point) {
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];

            // scale vertices
            Vertices.scale(part.vertices, scaleX, scaleY, body.position);

            // update properties
            part.axes = Axes.fromVertices(part.vertices);

            if (!body.isStatic) {
                part.area = Vertices.area(part.vertices);
                Body.setMass(part, body.density * part.area);

                // update inertia (requires vertices to be at origin)
                Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                Body.setInertia(part, Vertices.inertia(part.vertices, part.mass));
                Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
            }

            // update bounds
            Bounds.update(part.bounds, part.vertices, body.velocity);
        }

        // handle circles
        if (body.circleRadius) { 
            if (scaleX === scaleY) {
                body.circleRadius *= scaleX;
            } else {
                // body is no longer a circle
                body.circleRadius = null;
            }
        }

        if (!body.isStatic) {
            var total = _totalProperties(body);
            body.area = total.area;
            Body.setMass(body, total.mass);
            Body.setInertia(body, total.inertia);
        }
    };

    /**
     * Performs a simulation step for the given `body`, including updating position and angle using Verlet integration.
     * @method update
     * @param {body} body
     * @param {number} deltaTime
     * @param {number} timeScale
     * @param {number} correction
     */
    Body.update = function(body, deltaTime, timeScale, correction) {
        var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);

        // from the previous step
        var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
            velocityPrevX = body.position.x - body.positionPrev.x,
            velocityPrevY = body.position.y - body.positionPrev.y;

        // update velocity with Verlet integration
        body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
        body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;

        // update angular velocity with Verlet integration
        body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
        body.anglePrev = body.angle;
        body.angle += body.angularVelocity;

        // track speed and acceleration
        body.speed = Vector.magnitude(body.velocity);
        body.angularSpeed = Math.abs(body.angularVelocity);

        // transform the body geometry
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];

            Vertices.translate(part.vertices, body.velocity);
            
            if (i > 0) {
                part.position.x += body.velocity.x;
                part.position.y += body.velocity.y;
            }

            if (body.angularVelocity !== 0) {
                Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                Axes.rotate(part.axes, body.angularVelocity);
                if (i > 0) {
                    Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                }
            }

            Bounds.update(part.bounds, part.vertices, body.velocity);
        }
    };

    /**
     * Applies a force to a body from a given world-space position, including resulting torque.
     * @method applyForce
     * @param {body} body
     * @param {vector} position
     * @param {vector} force
     */
    Body.applyForce = function(body, position, force) {
        body.force.x += force.x;
        body.force.y += force.y;
        var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
        body.torque += offset.x * force.y - offset.y * force.x;
    };

    /**
     * Returns the sums of the properties of all compound parts of the parent body.
     * @method _totalProperties
     * @private
     * @param {body} body
     * @return {}
     */
    var _totalProperties = function(body) {
        // https://ecourses.ou.edu/cgi-bin/ebook.cgi?doc=&topic=st&chap_sec=07.2&page=theory
        // http://output.to/sideway/default.asp?qno=121100087

        var properties = {
            mass: 0,
            area: 0,
            inertia: 0,
            centre: { x: 0, y: 0 }
        };

        // sum the properties of all compound parts of the parent body
        for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
            var part = body.parts[i];
            properties.mass += part.mass;
            properties.area += part.area;
            properties.inertia += part.inertia;
            properties.centre = Vector.add(properties.centre, 
                                           Vector.mult(part.position, part.mass !== Infinity ? part.mass : 1));
        }

        properties.centre = Vector.div(properties.centre, 
                                       properties.mass !== Infinity ? properties.mass : body.parts.length);

        return properties;
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired when a body starts sleeping (where `this` is the body).
    *
    * @event sleepStart
    * @this {body} The body that has started sleeping
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when a body ends sleeping (where `this` is the body).
    *
    * @event sleepEnd
    * @this {body} The body that has ended sleeping
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * An integer `Number` uniquely identifying number generated in `Body.create` by `Common.nextId`.
     *
     * @property id
     * @type number
     */

    /**
     * A `String` denoting the type of object.
     *
     * @property type
     * @type string
     * @default "body"
     * @readOnly
     */

    /**
     * An arbitrary `String` name to help the user identify and manage bodies.
     *
     * @property label
     * @type string
     * @default "Body"
     */

    /**
     * An array of bodies that make up this body. 
     * The first body in the array must always be a self reference to the current body instance.
     * All bodies in the `parts` array together form a single rigid compound body.
     * Parts are allowed to overlap, have gaps or holes or even form concave bodies.
     * Parts themselves should never be added to a `World`, only the parent body should be.
     * Use `Body.setParts` when setting parts to ensure correct updates of all properties.
     *
     * @property parts
     * @type body[]
     */

    /**
     * A self reference if the body is _not_ a part of another body.
     * Otherwise this is a reference to the body that this is a part of.
     * See `body.parts`.
     *
     * @property parent
     * @type body
     */

    /**
     * A `Number` specifying the angle of the body, in radians.
     *
     * @property angle
     * @type number
     * @default 0
     */

    /**
     * An array of `Vector` objects that specify the convex hull of the rigid body.
     * These should be provided about the origin `(0, 0)`. E.g.
     *
     *     [{ x: 0, y: 0 }, { x: 25, y: 50 }, { x: 50, y: 0 }]
     *
     * When passed via `Body.create`, the vertices are translated relative to `body.position` (i.e. world-space, and constantly updated by `Body.update` during simulation).
     * The `Vector` objects are also augmented with additional properties required for efficient collision detection. 
     *
     * Other properties such as `inertia` and `bounds` are automatically calculated from the passed vertices (unless provided via `options`).
     * Concave hulls are not currently supported. The module `Matter.Vertices` contains useful methods for working with vertices.
     *
     * @property vertices
     * @type vector[]
     */

    /**
     * A `Vector` that specifies the current world-space position of the body.
     *
     * @property position
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Vector` that specifies the force to apply in the current step. It is zeroed after every `Body.update`. See also `Body.applyForce`.
     *
     * @property force
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Number` that specifies the torque (turning force) to apply in the current step. It is zeroed after every `Body.update`.
     *
     * @property torque
     * @type number
     * @default 0
     */

    /**
     * A `Number` that _measures_ the current speed of the body after the last `Body.update`. It is read-only and always positive (it's the magnitude of `body.velocity`).
     *
     * @readOnly
     * @property speed
     * @type number
     * @default 0
     */

    /**
     * A `Number` that _measures_ the current angular speed of the body after the last `Body.update`. It is read-only and always positive (it's the magnitude of `body.angularVelocity`).
     *
     * @readOnly
     * @property angularSpeed
     * @type number
     * @default 0
     */

    /**
     * A `Vector` that _measures_ the current velocity of the body after the last `Body.update`. It is read-only. 
     * If you need to modify a body's velocity directly, you should either apply a force or simply change the body's `position` (as the engine uses position-Verlet integration).
     *
     * @readOnly
     * @property velocity
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Number` that _measures_ the current angular velocity of the body after the last `Body.update`. It is read-only. 
     * If you need to modify a body's angular velocity directly, you should apply a torque or simply change the body's `angle` (as the engine uses position-Verlet integration).
     *
     * @readOnly
     * @property angularVelocity
     * @type number
     * @default 0
     */

    /**
     * A flag that indicates whether a body is considered static. A static body can never change position or angle and is completely fixed.
     * If you need to set a body as static after its creation, you should use `Body.setStatic` as this requires more than just setting this flag.
     *
     * @property isStatic
     * @type boolean
     * @default false
     */

    /**
     * A flag that indicates whether a body is a sensor. Sensor triggers collision events, but doesn't react with colliding body physically.
     *
     * @property isSensor
     * @type boolean
     * @default false
     */

    /**
     * A flag that indicates whether the body is considered sleeping. A sleeping body acts similar to a static body, except it is only temporary and can be awoken.
     * If you need to set a body as sleeping, you should use `Sleeping.set` as this requires more than just setting this flag.
     *
     * @property isSleeping
     * @type boolean
     * @default false
     */

    /**
     * A `Number` that _measures_ the amount of movement a body currently has (a combination of `speed` and `angularSpeed`). It is read-only and always positive.
     * It is used and updated by the `Matter.Sleeping` module during simulation to decide if a body has come to rest.
     *
     * @readOnly
     * @property motion
     * @type number
     * @default 0
     */

    /**
     * A `Number` that defines the number of updates in which this body must have near-zero velocity before it is set as sleeping by the `Matter.Sleeping` module (if sleeping is enabled by the engine).
     *
     * @property sleepThreshold
     * @type number
     * @default 60
     */

    /**
     * A `Number` that defines the density of the body, that is its mass per unit area.
     * If you pass the density via `Body.create` the `mass` property is automatically calculated for you based on the size (area) of the object.
     * This is generally preferable to simply setting mass and allows for more intuitive definition of materials (e.g. rock has a higher density than wood).
     *
     * @property density
     * @type number
     * @default 0.001
     */

    /**
     * A `Number` that defines the mass of the body, although it may be more appropriate to specify the `density` property instead.
     * If you modify this value, you must also modify the `body.inverseMass` property (`1 / mass`).
     *
     * @property mass
     * @type number
     */

    /**
     * A `Number` that defines the inverse mass of the body (`1 / mass`).
     * If you modify this value, you must also modify the `body.mass` property.
     *
     * @property inverseMass
     * @type number
     */

    /**
     * A `Number` that defines the moment of inertia (i.e. second moment of area) of the body.
     * It is automatically calculated from the given convex hull (`vertices` array) and density in `Body.create`.
     * If you modify this value, you must also modify the `body.inverseInertia` property (`1 / inertia`).
     *
     * @property inertia
     * @type number
     */

    /**
     * A `Number` that defines the inverse moment of inertia of the body (`1 / inertia`).
     * If you modify this value, you must also modify the `body.inertia` property.
     *
     * @property inverseInertia
     * @type number
     */

    /**
     * A `Number` that defines the restitution (elasticity) of the body. The value is always positive and is in the range `(0, 1)`.
     * A value of `0` means collisions may be perfectly inelastic and no bouncing may occur. 
     * A value of `0.8` means the body may bounce back with approximately 80% of its kinetic energy.
     * Note that collision response is based on _pairs_ of bodies, and that `restitution` values are _combined_ with the following formula:
     *
     *     Math.max(bodyA.restitution, bodyB.restitution)
     *
     * @property restitution
     * @type number
     * @default 0
     */

    /**
     * A `Number` that defines the friction of the body. The value is always positive and is in the range `(0, 1)`.
     * A value of `0` means that the body may slide indefinitely.
     * A value of `1` means the body may come to a stop almost instantly after a force is applied.
     *
     * The effects of the value may be non-linear. 
     * High values may be unstable depending on the body.
     * The engine uses a Coulomb friction model including static and kinetic friction.
     * Note that collision response is based on _pairs_ of bodies, and that `friction` values are _combined_ with the following formula:
     *
     *     Math.min(bodyA.friction, bodyB.friction)
     *
     * @property friction
     * @type number
     * @default 0.1
     */

    /**
     * A `Number` that defines the static friction of the body (in the Coulomb friction model). 
     * A value of `0` means the body will never 'stick' when it is nearly stationary and only dynamic `friction` is used.
     * The higher the value (e.g. `10`), the more force it will take to initially get the body moving when nearly stationary.
     * This value is multiplied with the `friction` property to make it easier to change `friction` and maintain an appropriate amount of static friction.
     *
     * @property frictionStatic
     * @type number
     * @default 0.5
     */

    /**
     * A `Number` that defines the air friction of the body (air resistance). 
     * A value of `0` means the body will never slow as it moves through space.
     * The higher the value, the faster a body slows when moving through space.
     * The effects of the value are non-linear. 
     *
     * @property frictionAir
     * @type number
     * @default 0.01
     */

    /**
     * An `Object` that specifies the collision filtering properties of this body.
     *
     * Collisions between two bodies will obey the following rules:
     * - If the two bodies have the same non-zero value of `collisionFilter.group`,
     *   they will always collide if the value is positive, and they will never collide
     *   if the value is negative.
     * - If the two bodies have different values of `collisionFilter.group` or if one
     *   (or both) of the bodies has a value of 0, then the category/mask rules apply as follows:
     *
     * Each body belongs to a collision category, given by `collisionFilter.category`. This
     * value is used as a bit field and the category should have only one bit set, meaning that
     * the value of this property is a power of two in the range [1, 2^31]. Thus, there are 32
     * different collision categories available.
     *
     * Each body also defines a collision bitmask, given by `collisionFilter.mask` which specifies
     * the categories it collides with (the value is the bitwise AND value of all these categories).
     *
     * Using the category/mask rules, two bodies `A` and `B` collide if each includes the other's
     * category in its mask, i.e. `(categoryA & maskB) !== 0` and `(categoryB & maskA) !== 0`
     * are both true.
     *
     * @property collisionFilter
     * @type object
     */

    /**
     * An Integer `Number`, that specifies the collision group this body belongs to.
     * See `body.collisionFilter` for more information.
     *
     * @property collisionFilter.group
     * @type object
     * @default 0
     */

    /**
     * A bit field that specifies the collision category this body belongs to.
     * The category value should have only one bit set, for example `0x0001`.
     * This means there are up to 32 unique collision categories available.
     * See `body.collisionFilter` for more information.
     *
     * @property collisionFilter.category
     * @type object
     * @default 1
     */

    /**
     * A bit mask that specifies the collision categories this body may collide with.
     * See `body.collisionFilter` for more information.
     *
     * @property collisionFilter.mask
     * @type object
     * @default -1
     */

    /**
     * A `Number` that specifies a tolerance on how far a body is allowed to 'sink' or rotate into other bodies.
     * Avoid changing this value unless you understand the purpose of `slop` in physics engines.
     * The default should generally suffice, although very large bodies may require larger values for stable stacking.
     *
     * @property slop
     * @type number
     * @default 0.05
     */

    /**
     * A `Number` that allows per-body time scaling, e.g. a force-field where bodies inside are in slow-motion, while others are at full speed.
     *
     * @property timeScale
     * @type number
     * @default 1
     */

    /**
     * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.
     *
     * @property render
     * @type object
     */

    /**
     * A flag that indicates if the body should be rendered.
     *
     * @property render.visible
     * @type boolean
     * @default true
     */

    /**
     * Sets the opacity to use when rendering.
     *
     * @property render.opacity
     * @type number
     * @default 1
    */

    /**
     * An `Object` that defines the sprite properties to use when rendering, if any.
     *
     * @property render.sprite
     * @type object
     */

    /**
     * An `String` that defines the path to the image to use as the sprite texture, if any.
     *
     * @property render.sprite.texture
     * @type string
     */
     
    /**
     * A `Number` that defines the scaling in the x-axis for the sprite, if any.
     *
     * @property render.sprite.xScale
     * @type number
     * @default 1
     */

    /**
     * A `Number` that defines the scaling in the y-axis for the sprite, if any.
     *
     * @property render.sprite.yScale
     * @type number
     * @default 1
     */

     /**
      * A `Number` that defines the offset in the x-axis for the sprite (normalised by texture width).
      *
      * @property render.sprite.xOffset
      * @type number
      * @default 0
      */

     /**
      * A `Number` that defines the offset in the y-axis for the sprite (normalised by texture height).
      *
      * @property render.sprite.yOffset
      * @type number
      * @default 0
      */

    /**
     * A `Number` that defines the line width to use when rendering the body outline (if a sprite is not defined).
     * A value of `0` means no outline will be rendered.
     *
     * @property render.lineWidth
     * @type number
     * @default 1.5
     */

    /**
     * A `String` that defines the fill style to use when rendering the body (if a sprite is not defined).
     * It is the same as when using a canvas, so it accepts CSS style property values.
     *
     * @property render.fillStyle
     * @type string
     * @default a random colour
     */

    /**
     * A `String` that defines the stroke style to use when rendering the body outline (if a sprite is not defined).
     * It is the same as when using a canvas, so it accepts CSS style property values.
     *
     * @property render.strokeStyle
     * @type string
     * @default a random colour
     */

    /**
     * An array of unique axis vectors (edge normals) used for collision detection.
     * These are automatically calculated from the given convex hull (`vertices` array) in `Body.create`.
     * They are constantly updated by `Body.update` during the simulation.
     *
     * @property axes
     * @type vector[]
     */
     
    /**
     * A `Number` that _measures_ the area of the body's convex hull, calculated at creation by `Body.create`.
     *
     * @property area
     * @type string
     * @default 
     */

    /**
     * A `Bounds` object that defines the AABB region for the body.
     * It is automatically calculated from the given convex hull (`vertices` array) in `Body.create` and constantly updated by `Body.update` during simulation.
     *
     * @property bounds
     * @type bounds
     */

})();

},{"../core/Common":14,"../core/Sleeping":22,"../geometry/Axes":25,"../geometry/Bounds":26,"../geometry/Vector":28,"../geometry/Vertices":29,"../render/Render":31}],2:[function(_dereq_,module,exports){
/**
* The `Matter.Composite` module contains methods for creating and manipulating composite bodies.
* A composite body is a collection of `Matter.Body`, `Matter.Constraint` and other `Matter.Composite`, therefore composites form a tree structure.
* It is important to use the functions in this module to modify composites, rather than directly modifying their properties.
* Note that the `Matter.World` object is also a type of `Matter.Composite` and as such all composite methods here can also operate on a `Matter.World`.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Composite
*/

var Composite = {};

module.exports = Composite;

var Events = _dereq_('../core/Events');
var Common = _dereq_('../core/Common');
var Body = _dereq_('./Body');

(function() {

    /**
     * Creates a new composite. The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properites section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {} [options]
     * @return {composite} A new composite
     */
    Composite.create = function(options) {
        return Common.extend({ 
            id: Common.nextId(),
            type: 'composite',
            parent: null,
            isModified: false,
            bodies: [], 
            constraints: [], 
            composites: [],
            label: 'Composite'
        }, options);
    };

    /**
     * Sets the composite's `isModified` flag. 
     * If `updateParents` is true, all parents will be set (default: false).
     * If `updateChildren` is true, all children will be set (default: false).
     * @method setModified
     * @param {composite} composite
     * @param {boolean} isModified
     * @param {boolean} [updateParents=false]
     * @param {boolean} [updateChildren=false]
     */
    Composite.setModified = function(composite, isModified, updateParents, updateChildren) {
        composite.isModified = isModified;

        if (updateParents && composite.parent) {
            Composite.setModified(composite.parent, isModified, updateParents, updateChildren);
        }

        if (updateChildren) {
            for(var i = 0; i < composite.composites.length; i++) {
                var childComposite = composite.composites[i];
                Composite.setModified(childComposite, isModified, updateParents, updateChildren);
            }
        }
    };

    /**
     * Generic add function. Adds one or many body(s), constraint(s) or a composite(s) to the given composite.
     * Triggers `beforeAdd` and `afterAdd` events on the `composite`.
     * @method add
     * @param {composite} composite
     * @param {} object
     * @return {composite} The original composite with the objects added
     */
    Composite.add = function(composite, object) {
        var objects = [].concat(object);

        Events.trigger(composite, 'beforeAdd', { object: object });

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            switch (obj.type) {

            case 'body':
                // skip adding compound parts
                if (obj.parent !== obj) {
                    Common.warn('Composite.add: skipped adding a compound body part (you must add its parent instead)');
                    break;
                }

                Composite.addBody(composite, obj);
                break;
            case 'constraint':
                Composite.addConstraint(composite, obj);
                break;
            case 'composite':
                Composite.addComposite(composite, obj);
                break;
            case 'mouseConstraint':
                Composite.addConstraint(composite, obj.constraint);
                break;

            }
        }

        Events.trigger(composite, 'afterAdd', { object: object });

        return composite;
    };

    /**
     * Generic remove function. Removes one or many body(s), constraint(s) or a composite(s) to the given composite.
     * Optionally searching its children recursively.
     * Triggers `beforeRemove` and `afterRemove` events on the `composite`.
     * @method remove
     * @param {composite} composite
     * @param {} object
     * @param {boolean} [deep=false]
     * @return {composite} The original composite with the objects removed
     */
    Composite.remove = function(composite, object, deep) {
        var objects = [].concat(object);

        Events.trigger(composite, 'beforeRemove', { object: object });

        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];

            switch (obj.type) {

            case 'body':
                Composite.removeBody(composite, obj, deep);
                break;
            case 'constraint':
                Composite.removeConstraint(composite, obj, deep);
                break;
            case 'composite':
                Composite.removeComposite(composite, obj, deep);
                break;
            case 'mouseConstraint':
                Composite.removeConstraint(composite, obj.constraint);
                break;

            }
        }

        Events.trigger(composite, 'afterRemove', { object: object });

        return composite;
    };

    /**
     * Adds a composite to the given composite.
     * @private
     * @method addComposite
     * @param {composite} compositeA
     * @param {composite} compositeB
     * @return {composite} The original compositeA with the objects from compositeB added
     */
    Composite.addComposite = function(compositeA, compositeB) {
        compositeA.composites.push(compositeB);
        compositeB.parent = compositeA;
        Composite.setModified(compositeA, true, true, false);
        return compositeA;
    };

    /**
     * Removes a composite from the given composite, and optionally searching its children recursively.
     * @private
     * @method removeComposite
     * @param {composite} compositeA
     * @param {composite} compositeB
     * @param {boolean} [deep=false]
     * @return {composite} The original compositeA with the composite removed
     */
    Composite.removeComposite = function(compositeA, compositeB, deep) {
        var position = Common.indexOf(compositeA.composites, compositeB);
        if (position !== -1) {
            Composite.removeCompositeAt(compositeA, position);
            Composite.setModified(compositeA, true, true, false);
        }

        if (deep) {
            for (var i = 0; i < compositeA.composites.length; i++){
                Composite.removeComposite(compositeA.composites[i], compositeB, true);
            }
        }

        return compositeA;
    };

    /**
     * Removes a composite from the given composite.
     * @private
     * @method removeCompositeAt
     * @param {composite} composite
     * @param {number} position
     * @return {composite} The original composite with the composite removed
     */
    Composite.removeCompositeAt = function(composite, position) {
        composite.composites.splice(position, 1);
        Composite.setModified(composite, true, true, false);
        return composite;
    };

    /**
     * Adds a body to the given composite.
     * @private
     * @method addBody
     * @param {composite} composite
     * @param {body} body
     * @return {composite} The original composite with the body added
     */
    Composite.addBody = function(composite, body) {
        composite.bodies.push(body);
        Composite.setModified(composite, true, true, false);
        return composite;
    };

    /**
     * Removes a body from the given composite, and optionally searching its children recursively.
     * @private
     * @method removeBody
     * @param {composite} composite
     * @param {body} body
     * @param {boolean} [deep=false]
     * @return {composite} The original composite with the body removed
     */
    Composite.removeBody = function(composite, body, deep) {
        var position = Common.indexOf(composite.bodies, body);
        if (position !== -1) {
            Composite.removeBodyAt(composite, position);
            Composite.setModified(composite, true, true, false);
        }

        if (deep) {
            for (var i = 0; i < composite.composites.length; i++){
                Composite.removeBody(composite.composites[i], body, true);
            }
        }

        return composite;
    };

    /**
     * Removes a body from the given composite.
     * @private
     * @method removeBodyAt
     * @param {composite} composite
     * @param {number} position
     * @return {composite} The original composite with the body removed
     */
    Composite.removeBodyAt = function(composite, position) {
        composite.bodies.splice(position, 1);
        Composite.setModified(composite, true, true, false);
        return composite;
    };

    /**
     * Adds a constraint to the given composite.
     * @private
     * @method addConstraint
     * @param {composite} composite
     * @param {constraint} constraint
     * @return {composite} The original composite with the constraint added
     */
    Composite.addConstraint = function(composite, constraint) {
        composite.constraints.push(constraint);
        Composite.setModified(composite, true, true, false);
        return composite;
    };

    /**
     * Removes a constraint from the given composite, and optionally searching its children recursively.
     * @private
     * @method removeConstraint
     * @param {composite} composite
     * @param {constraint} constraint
     * @param {boolean} [deep=false]
     * @return {composite} The original composite with the constraint removed
     */
    Composite.removeConstraint = function(composite, constraint, deep) {
        var position = Common.indexOf(composite.constraints, constraint);
        if (position !== -1) {
            Composite.removeConstraintAt(composite, position);
        }

        if (deep) {
            for (var i = 0; i < composite.composites.length; i++){
                Composite.removeConstraint(composite.composites[i], constraint, true);
            }
        }

        return composite;
    };

    /**
     * Removes a body from the given composite.
     * @private
     * @method removeConstraintAt
     * @param {composite} composite
     * @param {number} position
     * @return {composite} The original composite with the constraint removed
     */
    Composite.removeConstraintAt = function(composite, position) {
        composite.constraints.splice(position, 1);
        Composite.setModified(composite, true, true, false);
        return composite;
    };

    /**
     * Removes all bodies, constraints and composites from the given composite.
     * Optionally clearing its children recursively.
     * @method clear
     * @param {composite} composite
     * @param {boolean} keepStatic
     * @param {boolean} [deep=false]
     */
    Composite.clear = function(composite, keepStatic, deep) {
        if (deep) {
            for (var i = 0; i < composite.composites.length; i++){
                Composite.clear(composite.composites[i], keepStatic, true);
            }
        }
        
        if (keepStatic) {
            composite.bodies = composite.bodies.filter(function(body) { return body.isStatic; });
        } else {
            composite.bodies.length = 0;
        }

        composite.constraints.length = 0;
        composite.composites.length = 0;
        Composite.setModified(composite, true, true, false);

        return composite;
    };

    /**
     * Returns all bodies in the given composite, including all bodies in its children, recursively.
     * @method allBodies
     * @param {composite} composite
     * @return {body[]} All the bodies
     */
    Composite.allBodies = function(composite) {
        var bodies = [].concat(composite.bodies);

        for (var i = 0; i < composite.composites.length; i++)
            bodies = bodies.concat(Composite.allBodies(composite.composites[i]));

        return bodies;
    };

    /**
     * Returns all constraints in the given composite, including all constraints in its children, recursively.
     * @method allConstraints
     * @param {composite} composite
     * @return {constraint[]} All the constraints
     */
    Composite.allConstraints = function(composite) {
        var constraints = [].concat(composite.constraints);

        for (var i = 0; i < composite.composites.length; i++)
            constraints = constraints.concat(Composite.allConstraints(composite.composites[i]));

        return constraints;
    };

    /**
     * Returns all composites in the given composite, including all composites in its children, recursively.
     * @method allComposites
     * @param {composite} composite
     * @return {composite[]} All the composites
     */
    Composite.allComposites = function(composite) {
        var composites = [].concat(composite.composites);

        for (var i = 0; i < composite.composites.length; i++)
            composites = composites.concat(Composite.allComposites(composite.composites[i]));

        return composites;
    };

    /**
     * Searches the composite recursively for an object matching the type and id supplied, null if not found.
     * @method get
     * @param {composite} composite
     * @param {number} id
     * @param {string} type
     * @return {object} The requested object, if found
     */
    Composite.get = function(composite, id, type) {
        var objects,
            object;

        switch (type) {
        case 'body':
            objects = Composite.allBodies(composite);
            break;
        case 'constraint':
            objects = Composite.allConstraints(composite);
            break;
        case 'composite':
            objects = Composite.allComposites(composite).concat(composite);
            break;
        }

        if (!objects)
            return null;

        object = objects.filter(function(object) { 
            return object.id.toString() === id.toString(); 
        });

        return object.length === 0 ? null : object[0];
    };

    /**
     * Moves the given object(s) from compositeA to compositeB (equal to a remove followed by an add).
     * @method move
     * @param {compositeA} compositeA
     * @param {object[]} objects
     * @param {compositeB} compositeB
     * @return {composite} Returns compositeA
     */
    Composite.move = function(compositeA, objects, compositeB) {
        Composite.remove(compositeA, objects);
        Composite.add(compositeB, objects);
        return compositeA;
    };

    /**
     * Assigns new ids for all objects in the composite, recursively.
     * @method rebase
     * @param {composite} composite
     * @return {composite} Returns composite
     */
    Composite.rebase = function(composite) {
        var objects = Composite.allBodies(composite)
                        .concat(Composite.allConstraints(composite))
                        .concat(Composite.allComposites(composite));

        for (var i = 0; i < objects.length; i++) {
            objects[i].id = Common.nextId();
        }

        Composite.setModified(composite, true, true, false);

        return composite;
    };

    /**
     * Translates all children in the composite by a given vector relative to their current positions, 
     * without imparting any velocity.
     * @method translate
     * @param {composite} composite
     * @param {vector} translation
     * @param {bool} [recursive=true]
     */
    Composite.translate = function(composite, translation, recursive) {
        var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;

        for (var i = 0; i < bodies.length; i++) {
            Body.translate(bodies[i], translation);
        }

        Composite.setModified(composite, true, true, false);

        return composite;
    };

    /**
     * Rotates all children in the composite by a given angle about the given point, without imparting any angular velocity.
     * @method rotate
     * @param {composite} composite
     * @param {number} rotation
     * @param {vector} point
     * @param {bool} [recursive=true]
     */
    Composite.rotate = function(composite, rotation, point, recursive) {
        var cos = Math.cos(rotation),
            sin = Math.sin(rotation),
            bodies = recursive ? Composite.allBodies(composite) : composite.bodies;

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                dx = body.position.x - point.x,
                dy = body.position.y - point.y;
                
            Body.setPosition(body, {
                x: point.x + (dx * cos - dy * sin),
                y: point.y + (dx * sin + dy * cos)
            });

            Body.rotate(body, rotation);
        }

        Composite.setModified(composite, true, true, false);

        return composite;
    };

    /**
     * Scales all children in the composite, including updating physical properties (mass, area, axes, inertia), from a world-space point.
     * @method scale
     * @param {composite} composite
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {vector} point
     * @param {bool} [recursive=true]
     */
    Composite.scale = function(composite, scaleX, scaleY, point, recursive) {
        var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                dx = body.position.x - point.x,
                dy = body.position.y - point.y;
                
            Body.setPosition(body, {
                x: point.x + dx * scaleX,
                y: point.y + dy * scaleY
            });

            Body.scale(body, scaleX, scaleY);
        }

        Composite.setModified(composite, true, true, false);

        return composite;
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired when a call to `Composite.add` is made, before objects have been added.
    *
    * @event beforeAdd
    * @param {} event An event object
    * @param {} event.object The object(s) to be added (may be a single body, constraint, composite or a mixed array of these)
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when a call to `Composite.add` is made, after objects have been added.
    *
    * @event afterAdd
    * @param {} event An event object
    * @param {} event.object The object(s) that have been added (may be a single body, constraint, composite or a mixed array of these)
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when a call to `Composite.remove` is made, before objects have been removed.
    *
    * @event beforeRemove
    * @param {} event An event object
    * @param {} event.object The object(s) to be removed (may be a single body, constraint, composite or a mixed array of these)
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when a call to `Composite.remove` is made, after objects have been removed.
    *
    * @event afterRemove
    * @param {} event An event object
    * @param {} event.object The object(s) that have been removed (may be a single body, constraint, composite or a mixed array of these)
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * An integer `Number` uniquely identifying number generated in `Composite.create` by `Common.nextId`.
     *
     * @property id
     * @type number
     */

    /**
     * A `String` denoting the type of object.
     *
     * @property type
     * @type string
     * @default "composite"
     * @readOnly
     */

    /**
     * An arbitrary `String` name to help the user identify and manage composites.
     *
     * @property label
     * @type string
     * @default "Composite"
     */

    /**
     * A flag that specifies whether the composite has been modified during the current step.
     * Most `Matter.Composite` methods will automatically set this flag to `true` to inform the engine of changes to be handled.
     * If you need to change it manually, you should use the `Composite.setModified` method.
     *
     * @property isModified
     * @type boolean
     * @default false
     */

    /**
     * The `Composite` that is the parent of this composite. It is automatically managed by the `Matter.Composite` methods.
     *
     * @property parent
     * @type composite
     * @default null
     */

    /**
     * An array of `Body` that are _direct_ children of this composite.
     * To add or remove bodies you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.
     * If you wish to recursively find all descendants, you should use the `Composite.allBodies` method.
     *
     * @property bodies
     * @type body[]
     * @default []
     */

    /**
     * An array of `Constraint` that are _direct_ children of this composite.
     * To add or remove constraints you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.
     * If you wish to recursively find all descendants, you should use the `Composite.allConstraints` method.
     *
     * @property constraints
     * @type constraint[]
     * @default []
     */

    /**
     * An array of `Composite` that are _direct_ children of this composite.
     * To add or remove composites you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.
     * If you wish to recursively find all descendants, you should use the `Composite.allComposites` method.
     *
     * @property composites
     * @type composite[]
     * @default []
     */

})();

},{"../core/Common":14,"../core/Events":16,"./Body":1}],3:[function(_dereq_,module,exports){
/**
* The `Matter.World` module contains methods for creating and manipulating the world composite.
* A `Matter.World` is a `Matter.Composite` body, which is a collection of `Matter.Body`, `Matter.Constraint` and other `Matter.Composite`.
* A `Matter.World` has a few additional properties including `gravity` and `bounds`.
* It is important to use the functions in the `Matter.Composite` module to modify the world composite, rather than directly modifying its properties.
* There are also a few methods here that alias those in `Matter.Composite` for easier readability.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class World
* @extends Composite
*/

var World = {};

module.exports = World;

var Composite = _dereq_('./Composite');
var Constraint = _dereq_('../constraint/Constraint');
var Common = _dereq_('../core/Common');

(function() {

    /**
     * Creates a new world composite. The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @constructor
     * @param {} options
     * @return {world} A new world
     */
    World.create = function(options) {
        var composite = Composite.create();

        var defaults = {
            label: 'World',
            gravity: {
                x: 0,
                y: 1,
                scale: 0.001
            },
            bounds: { 
                min: { x: -Infinity, y: -Infinity }, 
                max: { x: Infinity, y: Infinity } 
            }
        };
        
        return Common.extend(composite, defaults, options);
    };

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * The gravity to apply on the world.
     *
     * @property gravity
     * @type object
     */

    /**
     * The gravity x component.
     *
     * @property gravity.x
     * @type object
     * @default 0
     */

    /**
     * The gravity y component.
     *
     * @property gravity.y
     * @type object
     * @default 1
     */

    /**
     * The gravity scale factor.
     *
     * @property gravity.scale
     * @type object
     * @default 0.001
     */

    /**
     * A `Bounds` object that defines the world bounds for collision detection.
     *
     * @property bounds
     * @type bounds
     * @default { min: { x: -Infinity, y: -Infinity }, max: { x: Infinity, y: Infinity } }
     */

    // World is a Composite body
    // see src/module/Outro.js for these aliases:
    
    /**
     * An alias for Composite.clear
     * @method clear
     * @param {world} world
     * @param {boolean} keepStatic
     */

    /**
     * An alias for Composite.add
     * @method addComposite
     * @param {world} world
     * @param {composite} composite
     * @return {world} The original world with the objects from composite added
     */
    
     /**
      * An alias for Composite.addBody
      * @method addBody
      * @param {world} world
      * @param {body} body
      * @return {world} The original world with the body added
      */

     /**
      * An alias for Composite.addConstraint
      * @method addConstraint
      * @param {world} world
      * @param {constraint} constraint
      * @return {world} The original world with the constraint added
      */

})();

},{"../constraint/Constraint":12,"../core/Common":14,"./Composite":2}],4:[function(_dereq_,module,exports){
/**
* The `Matter.Contact` module contains methods for creating and manipulating collision contacts.
*
* @class Contact
*/

var Contact = {};

module.exports = Contact;

(function() {

    /**
     * Creates a new contact.
     * @method create
     * @param {vertex} vertex
     * @return {contact} A new contact
     */
    Contact.create = function(vertex) {
        return {
            id: Contact.id(vertex),
            vertex: vertex,
            normalImpulse: 0,
            tangentImpulse: 0
        };
    };
    
    /**
     * Generates a contact id.
     * @method id
     * @param {vertex} vertex
     * @return {string} Unique contactID
     */
    Contact.id = function(vertex) {
        return vertex.body.id + '_' + vertex.index;
    };

})();

},{}],5:[function(_dereq_,module,exports){
/**
* The `Matter.Detector` module contains methods for detecting collisions given a set of pairs.
*
* @class Detector
*/

// TODO: speculative contacts

var Detector = {};

module.exports = Detector;

var SAT = _dereq_('./SAT');
var Pair = _dereq_('./Pair');
var Bounds = _dereq_('../geometry/Bounds');

(function() {

    /**
     * Finds all collisions given a list of pairs.
     * @method collisions
     * @param {pair[]} broadphasePairs
     * @param {engine} engine
     * @return {array} collisions
     */
    Detector.collisions = function(broadphasePairs, engine) {
        var collisions = [],
            pairsTable = engine.pairs.table;

        
        for (var i = 0; i < broadphasePairs.length; i++) {
            var bodyA = broadphasePairs[i][0], 
                bodyB = broadphasePairs[i][1];

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;
            
            if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
                continue;


            // mid phase
            if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
                for (var j = bodyA.parts.length > 1 ? 1 : 0; j < bodyA.parts.length; j++) {
                    var partA = bodyA.parts[j];

                    for (var k = bodyB.parts.length > 1 ? 1 : 0; k < bodyB.parts.length; k++) {
                        var partB = bodyB.parts[k];

                        if ((partA === bodyA && partB === bodyB) || Bounds.overlaps(partA.bounds, partB.bounds)) {
                            // find a previous collision we could reuse
                            var pairId = Pair.id(partA, partB),
                                pair = pairsTable[pairId],
                                previousCollision;

                            if (pair && pair.isActive) {
                                previousCollision = pair.collision;
                            } else {
                                previousCollision = null;
                            }

                            // narrow phase
                            var collision = SAT.collides(partA, partB, previousCollision);


                            if (collision.collided) {
                                collisions.push(collision);
                            }
                        }
                    }
                }
            }
        }

        return collisions;
    };

    /**
     * Returns `true` if both supplied collision filters will allow a collision to occur.
     * See `body.collisionFilter` for more information.
     * @method canCollide
     * @param {} filterA
     * @param {} filterB
     * @return {bool} `true` if collision can occur
     */
    Detector.canCollide = function(filterA, filterB) {
        if (filterA.group === filterB.group && filterA.group !== 0)
            return filterA.group > 0;

        return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
    };

})();

},{"../geometry/Bounds":26,"./Pair":7,"./SAT":11}],6:[function(_dereq_,module,exports){
/**
* The `Matter.Grid` module contains methods for creating and manipulating collision broadphase grid structures.
*
* @class Grid
*/

var Grid = {};

module.exports = Grid;

var Pair = _dereq_('./Pair');
var Detector = _dereq_('./Detector');
var Common = _dereq_('../core/Common');

(function() {

    /**
     * Creates a new grid.
     * @method create
     * @param {} options
     * @return {grid} A new grid
     */
    Grid.create = function(options) {
        var defaults = {
            controller: Grid,
            detector: Detector.collisions,
            buckets: {},
            pairs: {},
            pairsList: [],
            bucketWidth: 48,
            bucketHeight: 48
        };

        return Common.extend(defaults, options);
    };

    /**
     * The width of a single grid bucket.
     *
     * @property bucketWidth
     * @type number
     * @default 48
     */

    /**
     * The height of a single grid bucket.
     *
     * @property bucketHeight
     * @type number
     * @default 48
     */

    /**
     * Updates the grid.
     * @method update
     * @param {grid} grid
     * @param {body[]} bodies
     * @param {engine} engine
     * @param {boolean} forceUpdate
     */
    Grid.update = function(grid, bodies, engine, forceUpdate) {
        var i, col, row,
            world = engine.world,
            buckets = grid.buckets,
            bucket,
            bucketId,
            gridChanged = false;


        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isSleeping && !forceUpdate)
                continue;

            // don't update out of world bodies
            if (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x
                || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y)
                continue;

            var newRegion = _getRegion(grid, body);

            // if the body has changed grid region
            if (!body.region || newRegion.id !== body.region.id || forceUpdate) {


                if (!body.region || forceUpdate)
                    body.region = newRegion;

                var union = _regionUnion(newRegion, body.region);

                // update grid buckets affected by region change
                // iterate over the union of both regions
                for (col = union.startCol; col <= union.endCol; col++) {
                    for (row = union.startRow; row <= union.endRow; row++) {
                        bucketId = _getBucketId(col, row);
                        bucket = buckets[bucketId];

                        var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol
                                                && row >= newRegion.startRow && row <= newRegion.endRow);

                        var isInsideOldRegion = (col >= body.region.startCol && col <= body.region.endCol
                                                && row >= body.region.startRow && row <= body.region.endRow);

                        // remove from old region buckets
                        if (!isInsideNewRegion && isInsideOldRegion) {
                            if (isInsideOldRegion) {
                                if (bucket)
                                    _bucketRemoveBody(grid, bucket, body);
                            }
                        }

                        // add to new region buckets
                        if (body.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
                            if (!bucket)
                                bucket = _createBucket(buckets, bucketId);
                            _bucketAddBody(grid, bucket, body);
                        }
                    }
                }

                // set the new region
                body.region = newRegion;

                // flag changes so we can update pairs
                gridChanged = true;
            }
        }

        // update pairs list only if pairs changed (i.e. a body changed region)
        if (gridChanged)
            grid.pairsList = _createActivePairsList(grid);
    };

    /**
     * Clears the grid.
     * @method clear
     * @param {grid} grid
     */
    Grid.clear = function(grid) {
        grid.buckets = {};
        grid.pairs = {};
        grid.pairsList = [];
    };

    /**
     * Finds the union of two regions.
     * @method _regionUnion
     * @private
     * @param {} regionA
     * @param {} regionB
     * @return {} region
     */
    var _regionUnion = function(regionA, regionB) {
        var startCol = Math.min(regionA.startCol, regionB.startCol),
            endCol = Math.max(regionA.endCol, regionB.endCol),
            startRow = Math.min(regionA.startRow, regionB.startRow),
            endRow = Math.max(regionA.endRow, regionB.endRow);

        return _createRegion(startCol, endCol, startRow, endRow);
    };

    /**
     * Gets the region a given body falls in for a given grid.
     * @method _getRegion
     * @private
     * @param {} grid
     * @param {} body
     * @return {} region
     */
    var _getRegion = function(grid, body) {
        var bounds = body.bounds,
            startCol = Math.floor(bounds.min.x / grid.bucketWidth),
            endCol = Math.floor(bounds.max.x / grid.bucketWidth),
            startRow = Math.floor(bounds.min.y / grid.bucketHeight),
            endRow = Math.floor(bounds.max.y / grid.bucketHeight);

        return _createRegion(startCol, endCol, startRow, endRow);
    };

    /**
     * Creates a region.
     * @method _createRegion
     * @private
     * @param {} startCol
     * @param {} endCol
     * @param {} startRow
     * @param {} endRow
     * @return {} region
     */
    var _createRegion = function(startCol, endCol, startRow, endRow) {
        return { 
            id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,
            startCol: startCol, 
            endCol: endCol, 
            startRow: startRow, 
            endRow: endRow 
        };
    };

    /**
     * Gets the bucket id at the given position.
     * @method _getBucketId
     * @private
     * @param {} column
     * @param {} row
     * @return {string} bucket id
     */
    var _getBucketId = function(column, row) {
        return column + ',' + row;
    };

    /**
     * Creates a bucket.
     * @method _createBucket
     * @private
     * @param {} buckets
     * @param {} bucketId
     * @return {} bucket
     */
    var _createBucket = function(buckets, bucketId) {
        var bucket = buckets[bucketId] = [];
        return bucket;
    };

    /**
     * Adds a body to a bucket.
     * @method _bucketAddBody
     * @private
     * @param {} grid
     * @param {} bucket
     * @param {} body
     */
    var _bucketAddBody = function(grid, bucket, body) {
        // add new pairs
        for (var i = 0; i < bucket.length; i++) {
            var bodyB = bucket[i];

            if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))
                continue;

            // keep track of the number of buckets the pair exists in
            // important for Grid.update to work
            var pairId = Pair.id(body, bodyB),
                pair = grid.pairs[pairId];

            if (pair) {
                pair[2] += 1;
            } else {
                grid.pairs[pairId] = [body, bodyB, 1];
            }
        }

        // add to bodies (after pairs, otherwise pairs with self)
        bucket.push(body);
    };

    /**
     * Removes a body from a bucket.
     * @method _bucketRemoveBody
     * @private
     * @param {} grid
     * @param {} bucket
     * @param {} body
     */
    var _bucketRemoveBody = function(grid, bucket, body) {
        // remove from bucket
        bucket.splice(Common.indexOf(bucket, body), 1);

        // update pair counts
        for (var i = 0; i < bucket.length; i++) {
            // keep track of the number of buckets the pair exists in
            // important for _createActivePairsList to work
            var bodyB = bucket[i],
                pairId = Pair.id(body, bodyB),
                pair = grid.pairs[pairId];

            if (pair)
                pair[2] -= 1;
        }
    };

    /**
     * Generates a list of the active pairs in the grid.
     * @method _createActivePairsList
     * @private
     * @param {} grid
     * @return [] pairs
     */
    var _createActivePairsList = function(grid) {
        var pairKeys,
            pair,
            pairs = [];

        // grid.pairs is used as a hashmap
        pairKeys = Common.keys(grid.pairs);

        // iterate over grid.pairs
        for (var k = 0; k < pairKeys.length; k++) {
            pair = grid.pairs[pairKeys[k]];

            // if pair exists in at least one bucket
            // it is a pair that needs further collision testing so push it
            if (pair[2] > 0) {
                pairs.push(pair);
            } else {
                delete grid.pairs[pairKeys[k]];
            }
        }

        return pairs;
    };
    
})();

},{"../core/Common":14,"./Detector":5,"./Pair":7}],7:[function(_dereq_,module,exports){
/**
* The `Matter.Pair` module contains methods for creating and manipulating collision pairs.
*
* @class Pair
*/

var Pair = {};

module.exports = Pair;

var Contact = _dereq_('./Contact');

(function() {
    
    /**
     * Creates a pair.
     * @method create
     * @param {collision} collision
     * @param {number} timestamp
     * @return {pair} A new pair
     */
    Pair.create = function(collision, timestamp) {
        var bodyA = collision.bodyA,
            bodyB = collision.bodyB,
            parentA = collision.parentA,
            parentB = collision.parentB;

        var pair = {
            id: Pair.id(bodyA, bodyB),
            bodyA: bodyA,
            bodyB: bodyB,
            contacts: {},
            activeContacts: [],
            separation: 0,
            isActive: true,
            isSensor: bodyA.isSensor || bodyB.isSensor,
            timeCreated: timestamp,
            timeUpdated: timestamp,
            inverseMass: parentA.inverseMass + parentB.inverseMass,
            friction: Math.min(parentA.friction, parentB.friction),
            frictionStatic: Math.max(parentA.frictionStatic, parentB.frictionStatic),
            restitution: Math.max(parentA.restitution, parentB.restitution),
            slop: Math.max(parentA.slop, parentB.slop)
        };

        Pair.update(pair, collision, timestamp);

        return pair;
    };

    /**
     * Updates a pair given a collision.
     * @method update
     * @param {pair} pair
     * @param {collision} collision
     * @param {number} timestamp
     */
    Pair.update = function(pair, collision, timestamp) {
        var contacts = pair.contacts,
            supports = collision.supports,
            activeContacts = pair.activeContacts,
            parentA = collision.parentA,
            parentB = collision.parentB;
        
        pair.collision = collision;
        pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
        pair.friction = Math.min(parentA.friction, parentB.friction);
        pair.frictionStatic = Math.max(parentA.frictionStatic, parentB.frictionStatic);
        pair.restitution = Math.max(parentA.restitution, parentB.restitution);
        pair.slop = Math.max(parentA.slop, parentB.slop);
        activeContacts.length = 0;
        
        if (collision.collided) {
            for (var i = 0; i < supports.length; i++) {
                var support = supports[i],
                    contactId = Contact.id(support),
                    contact = contacts[contactId];

                if (contact) {
                    activeContacts.push(contact);
                } else {
                    activeContacts.push(contacts[contactId] = Contact.create(support));
                }
            }

            pair.separation = collision.depth;
            Pair.setActive(pair, true, timestamp);
        } else {
            if (pair.isActive === true)
                Pair.setActive(pair, false, timestamp);
        }
    };
    
    /**
     * Set a pair as active or inactive.
     * @method setActive
     * @param {pair} pair
     * @param {bool} isActive
     * @param {number} timestamp
     */
    Pair.setActive = function(pair, isActive, timestamp) {
        if (isActive) {
            pair.isActive = true;
            pair.timeUpdated = timestamp;
        } else {
            pair.isActive = false;
            pair.activeContacts.length = 0;
        }
    };

    /**
     * Get the id for the given pair.
     * @method id
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {string} Unique pairId
     */
    Pair.id = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + '_' + bodyB.id;
        } else {
            return bodyB.id + '_' + bodyA.id;
        }
    };

})();

},{"./Contact":4}],8:[function(_dereq_,module,exports){
/**
* The `Matter.Pairs` module contains methods for creating and manipulating collision pair sets.
*
* @class Pairs
*/

var Pairs = {};

module.exports = Pairs;

var Pair = _dereq_('./Pair');
var Common = _dereq_('../core/Common');

(function() {
    
    var _pairMaxIdleLife = 1000;

    /**
     * Creates a new pairs structure.
     * @method create
     * @param {object} options
     * @return {pairs} A new pairs structure
     */
    Pairs.create = function(options) {
        return Common.extend({ 
            table: {},
            list: [],
            collisionStart: [],
            collisionActive: [],
            collisionEnd: []
        }, options);
    };

    /**
     * Updates pairs given a list of collisions.
     * @method update
     * @param {object} pairs
     * @param {collision[]} collisions
     * @param {number} timestamp
     */
    Pairs.update = function(pairs, collisions, timestamp) {
        var pairsList = pairs.list,
            pairsTable = pairs.table,
            collisionStart = pairs.collisionStart,
            collisionEnd = pairs.collisionEnd,
            collisionActive = pairs.collisionActive,
            activePairIds = [],
            collision,
            pairId,
            pair,
            i;

        // clear collision state arrays, but maintain old reference
        collisionStart.length = 0;
        collisionEnd.length = 0;
        collisionActive.length = 0;

        for (i = 0; i < collisions.length; i++) {
            collision = collisions[i];

            if (collision.collided) {
                pairId = Pair.id(collision.bodyA, collision.bodyB);
                activePairIds.push(pairId);

                pair = pairsTable[pairId];
                
                if (pair) {
                    // pair already exists (but may or may not be active)
                    if (pair.isActive) {
                        // pair exists and is active
                        collisionActive.push(pair);
                    } else {
                        // pair exists but was inactive, so a collision has just started again
                        collisionStart.push(pair);
                    }

                    // update the pair
                    Pair.update(pair, collision, timestamp);
                } else {
                    // pair did not exist, create a new pair
                    pair = Pair.create(collision, timestamp);
                    pairsTable[pairId] = pair;

                    // push the new pair
                    collisionStart.push(pair);
                    pairsList.push(pair);
                }
            }
        }

        // deactivate previously active pairs that are now inactive
        for (i = 0; i < pairsList.length; i++) {
            pair = pairsList[i];
            if (pair.isActive && Common.indexOf(activePairIds, pair.id) === -1) {
                Pair.setActive(pair, false, timestamp);
                collisionEnd.push(pair);
            }
        }
    };
    
    /**
     * Finds and removes pairs that have been inactive for a set amount of time.
     * @method removeOld
     * @param {object} pairs
     * @param {number} timestamp
     */
    Pairs.removeOld = function(pairs, timestamp) {
        var pairsList = pairs.list,
            pairsTable = pairs.table,
            indexesToRemove = [],
            pair,
            collision,
            pairIndex,
            i;

        for (i = 0; i < pairsList.length; i++) {
            pair = pairsList[i];
            collision = pair.collision;
            
            // never remove sleeping pairs
            if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
                pair.timeUpdated = timestamp;
                continue;
            }

            // if pair is inactive for too long, mark it to be removed
            if (timestamp - pair.timeUpdated > _pairMaxIdleLife) {
                indexesToRemove.push(i);
            }
        }

        // remove marked pairs
        for (i = 0; i < indexesToRemove.length; i++) {
            pairIndex = indexesToRemove[i] - i;
            pair = pairsList[pairIndex];
            delete pairsTable[pair.id];
            pairsList.splice(pairIndex, 1);
        }
    };

    /**
     * Clears the given pairs structure.
     * @method clear
     * @param {pairs} pairs
     * @return {pairs} pairs
     */
    Pairs.clear = function(pairs) {
        pairs.table = {};
        pairs.list.length = 0;
        pairs.collisionStart.length = 0;
        pairs.collisionActive.length = 0;
        pairs.collisionEnd.length = 0;
        return pairs;
    };

})();

},{"../core/Common":14,"./Pair":7}],9:[function(_dereq_,module,exports){
/**
* The `Matter.Query` module contains methods for performing collision queries.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Query
*/

var Query = {};

module.exports = Query;

var Vector = _dereq_('../geometry/Vector');
var SAT = _dereq_('./SAT');
var Bounds = _dereq_('../geometry/Bounds');
var Bodies = _dereq_('../factory/Bodies');
var Vertices = _dereq_('../geometry/Vertices');

(function() {

    /**
     * Casts a ray segment against a set of bodies and returns all collisions, ray width is optional. Intersection points are not provided.
     * @method ray
     * @param {body[]} bodies
     * @param {vector} startPoint
     * @param {vector} endPoint
     * @param {number} [rayWidth]
     * @return {object[]} Collisions
     */
    Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
        rayWidth = rayWidth || 1e-100;

        var rayAngle = Vector.angle(startPoint, endPoint),
            rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)),
            rayX = (endPoint.x + startPoint.x) * 0.5,
            rayY = (endPoint.y + startPoint.y) * 0.5,
            ray = Bodies.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }),
            collisions = [];

        for (var i = 0; i < bodies.length; i++) {
            var bodyA = bodies[i];
            
            if (Bounds.overlaps(bodyA.bounds, ray.bounds)) {
                for (var j = bodyA.parts.length === 1 ? 0 : 1; j < bodyA.parts.length; j++) {
                    var part = bodyA.parts[j];

                    if (Bounds.overlaps(part.bounds, ray.bounds)) {
                        var collision = SAT.collides(part, ray);
                        if (collision.collided) {
                            collision.body = collision.bodyA = collision.bodyB = bodyA;
                            collisions.push(collision);
                            break;
                        }
                    }
                }
            }
        }

        return collisions;
    };

    /**
     * Returns all bodies whose bounds are inside (or outside if set) the given set of bounds, from the given set of bodies.
     * @method region
     * @param {body[]} bodies
     * @param {bounds} bounds
     * @param {bool} [outside=false]
     * @return {body[]} The bodies matching the query
     */
    Query.region = function(bodies, bounds, outside) {
        var result = [];

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                overlaps = Bounds.overlaps(body.bounds, bounds);
            if ((overlaps && !outside) || (!overlaps && outside))
                result.push(body);
        }

        return result;
    };

    /**
     * Returns all bodies whose vertices contain the given point, from the given set of bodies.
     * @method point
     * @param {body[]} bodies
     * @param {vector} point
     * @return {body[]} The bodies matching the query
     */
    Query.point = function(bodies, point) {
        var result = [];

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            
            if (Bounds.contains(body.bounds, point)) {
                for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
                    var part = body.parts[j];

                    if (Bounds.contains(part.bounds, point)
                        && Vertices.contains(part.vertices, point)) {
                        result.push(body);
                        break;
                    }
                }
            }
        }

        return result;
    };

})();

},{"../factory/Bodies":23,"../geometry/Bounds":26,"../geometry/Vector":28,"../geometry/Vertices":29,"./SAT":11}],10:[function(_dereq_,module,exports){
/**
* The `Matter.Resolver` module contains methods for resolving collision pairs.
*
* @class Resolver
*/

var Resolver = {};

module.exports = Resolver;

var Vertices = _dereq_('../geometry/Vertices');
var Vector = _dereq_('../geometry/Vector');
var Common = _dereq_('../core/Common');
var Bounds = _dereq_('../geometry/Bounds');

(function() {

    Resolver._restingThresh = 4;
    Resolver._restingThreshTangent = 6;
    Resolver._positionDampen = 0.9;
    Resolver._positionWarming = 0.8;
    Resolver._frictionNormalMultiplier = 5;

    /**
     * Prepare pairs for position solving.
     * @method preSolvePosition
     * @param {pair[]} pairs
     */
    Resolver.preSolvePosition = function(pairs) {
        var i,
            pair,
            activeCount;

        // find total contacts on each body
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            activeCount = pair.activeContacts.length;
            pair.collision.parentA.totalContacts += activeCount;
            pair.collision.parentB.totalContacts += activeCount;
        }
    };

    /**
     * Find a solution for pair positions.
     * @method solvePosition
     * @param {pair[]} pairs
     * @param {number} timeScale
     */
    Resolver.solvePosition = function(pairs, timeScale) {
        var i,
            pair,
            collision,
            bodyA,
            bodyB,
            normal,
            bodyBtoA,
            contactShare,
            positionImpulse,
            contactCount = {},
            tempA = Vector._temp[0],
            tempB = Vector._temp[1],
            tempC = Vector._temp[2],
            tempD = Vector._temp[3];

        // find impulses required to resolve penetration
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive || pair.isSensor)
                continue;

            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;

            // get current separation between body edges involved in collision
            bodyBtoA = Vector.sub(Vector.add(bodyB.positionImpulse, bodyB.position, tempA), 
                                    Vector.add(bodyA.positionImpulse, 
                                        Vector.sub(bodyB.position, collision.penetration, tempB), tempC), tempD);

            pair.separation = Vector.dot(normal, bodyBtoA);
        }
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive || pair.isSensor || pair.separation < 0)
                continue;
            
            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;
            positionImpulse = (pair.separation - pair.slop) * timeScale;

            if (bodyA.isStatic || bodyB.isStatic)
                positionImpulse *= 2;
            
            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                contactShare = Resolver._positionDampen / bodyA.totalContacts;
                bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                contactShare = Resolver._positionDampen / bodyB.totalContacts;
                bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
            }
        }
    };

    /**
     * Apply position resolution.
     * @method postSolvePosition
     * @param {body[]} bodies
     */
    Resolver.postSolvePosition = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            // reset contact count
            body.totalContacts = 0;

            if (body.positionImpulse.x !== 0 || body.positionImpulse.y !== 0) {
                // update body geometry
                for (var j = 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    Vertices.translate(part.vertices, body.positionImpulse);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                    part.position.x += body.positionImpulse.x;
                    part.position.y += body.positionImpulse.y;
                }

                // move the body without changing velocity
                body.positionPrev.x += body.positionImpulse.x;
                body.positionPrev.y += body.positionImpulse.y;

                if (Vector.dot(body.positionImpulse, body.velocity) < 0) {
                    // reset cached impulse if the body has velocity along it
                    body.positionImpulse.x = 0;
                    body.positionImpulse.y = 0;
                } else {
                    // warm the next iteration
                    body.positionImpulse.x *= Resolver._positionWarming;
                    body.positionImpulse.y *= Resolver._positionWarming;
                }
            }
        }
    };

    /**
     * Prepare pairs for velocity solving.
     * @method preSolveVelocity
     * @param {pair[]} pairs
     */
    Resolver.preSolveVelocity = function(pairs) {
        var i,
            j,
            pair,
            contacts,
            collision,
            bodyA,
            bodyB,
            normal,
            tangent,
            contact,
            contactVertex,
            normalImpulse,
            tangentImpulse,
            offset,
            impulse = Vector._temp[0],
            tempA = Vector._temp[1];
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive || pair.isSensor)
                continue;
            
            contacts = pair.activeContacts;
            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;
            tangent = collision.tangent;

            // resolve each contact
            for (j = 0; j < contacts.length; j++) {
                contact = contacts[j];
                contactVertex = contact.vertex;
                normalImpulse = contact.normalImpulse;
                tangentImpulse = contact.tangentImpulse;

                if (normalImpulse !== 0 || tangentImpulse !== 0) {
                    // total impulse from contact
                    impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                    impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                    
                    // apply impulse from contact
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        offset = Vector.sub(contactVertex, bodyA.position, tempA);
                        bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                        bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                    }

                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        offset = Vector.sub(contactVertex, bodyB.position, tempA);
                        bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                        bodyB.anglePrev -= Vector.cross(offset, impulse) * bodyB.inverseInertia;
                    }
                }
            }
        }
    };

    /**
     * Find a solution for pair velocities.
     * @method solveVelocity
     * @param {pair[]} pairs
     * @param {number} timeScale
     */
    Resolver.solveVelocity = function(pairs, timeScale) {
        var timeScaleSquared = timeScale * timeScale,
            impulse = Vector._temp[0],
            tempA = Vector._temp[1],
            tempB = Vector._temp[2],
            tempC = Vector._temp[3],
            tempD = Vector._temp[4],
            tempE = Vector._temp[5];
        
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            
            if (!pair.isActive || pair.isSensor)
                continue;
            
            var collision = pair.collision,
                bodyA = collision.parentA,
                bodyB = collision.parentB,
                normal = collision.normal,
                tangent = collision.tangent,
                contacts = pair.activeContacts,
                contactShare = 1 / contacts.length;

            // update body velocities
            bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
            bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
            bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
            bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;

            // resolve each contact
            for (var j = 0; j < contacts.length; j++) {
                var contact = contacts[j],
                    contactVertex = contact.vertex,
                    offsetA = Vector.sub(contactVertex, bodyA.position, tempA),
                    offsetB = Vector.sub(contactVertex, bodyB.position, tempB),
                    velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity), tempC),
                    velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity), tempD), 
                    relativeVelocity = Vector.sub(velocityPointA, velocityPointB, tempE),
                    normalVelocity = Vector.dot(normal, relativeVelocity);

                var tangentVelocity = Vector.dot(tangent, relativeVelocity),
                    tangentSpeed = Math.abs(tangentVelocity),
                    tangentVelocityDirection = Common.sign(tangentVelocity);

                // raw impulses
                var normalImpulse = (1 + pair.restitution) * normalVelocity,
                    normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1) * Resolver._frictionNormalMultiplier;

                // coulomb friction
                var tangentImpulse = tangentVelocity,
                    maxFriction = Infinity;

                if (tangentSpeed > pair.friction * pair.frictionStatic * normalForce * timeScaleSquared) {
                    maxFriction = tangentSpeed;
                    tangentImpulse = Common.clamp(
                        pair.friction * tangentVelocityDirection * timeScaleSquared,
                        -maxFriction, maxFriction
                    );
                }

                // modify impulses accounting for mass, inertia and offset
                var oAcN = Vector.cross(offsetA, normal),
                    oBcN = Vector.cross(offsetB, normal),
                    share = contactShare / (bodyA.inverseMass + bodyB.inverseMass + bodyA.inverseInertia * oAcN * oAcN  + bodyB.inverseInertia * oBcN * oBcN);

                normalImpulse *= share;
                tangentImpulse *= share;

                // handle high velocity and resting collisions separately
                if (normalVelocity < 0 && normalVelocity * normalVelocity > Resolver._restingThresh * timeScaleSquared) {
                    // high normal velocity so clear cached contact normal impulse
                    contact.normalImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // impulse constraint tends to 0
                    var contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                }

                // handle high velocity and resting collisions separately
                if (tangentVelocity * tangentVelocity > Resolver._restingThreshTangent * timeScaleSquared) {
                    // high tangent velocity so clear cached contact tangent impulse
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // tangent impulse tends to -tangentSpeed or +tangentSpeed
                    var contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -maxFriction, maxFriction);
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }

                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
                }
            }
        }
    };

})();

},{"../core/Common":14,"../geometry/Bounds":26,"../geometry/Vector":28,"../geometry/Vertices":29}],11:[function(_dereq_,module,exports){
/**
* The `Matter.SAT` module contains methods for detecting collisions using the Separating Axis Theorem.
*
* @class SAT
*/

// TODO: true circles and curves

var SAT = {};

module.exports = SAT;

var Vertices = _dereq_('../geometry/Vertices');
var Vector = _dereq_('../geometry/Vector');

(function() {

    /**
     * Detect collision between two bodies using the Separating Axis Theorem.
     * @method collides
     * @param {body} bodyA
     * @param {body} bodyB
     * @param {collision} previousCollision
     * @return {collision} collision
     */
    SAT.collides = function(bodyA, bodyB, previousCollision) {
        var overlapAB,
            overlapBA, 
            minOverlap,
            collision,
            prevCol = previousCollision,
            canReusePrevCol = false;

        if (prevCol) {
            // estimate total motion
            var parentA = bodyA.parent,
                parentB = bodyB.parent,
                motion = parentA.speed * parentA.speed + parentA.angularSpeed * parentA.angularSpeed
                       + parentB.speed * parentB.speed + parentB.angularSpeed * parentB.angularSpeed;

            // we may be able to (partially) reuse collision result 
            // but only safe if collision was resting
            canReusePrevCol = prevCol && prevCol.collided && motion < 0.2;

            // reuse collision object
            collision = prevCol;
        } else {
            collision = { collided: false, bodyA: bodyA, bodyB: bodyB };
        }

        if (prevCol && canReusePrevCol) {
            // if we can reuse the collision result
            // we only need to test the previously found axis
            var axisBodyA = collision.axisBody,
                axisBodyB = axisBodyA === bodyA ? bodyB : bodyA,
                axes = [axisBodyA.axes[prevCol.axisNumber]];

            minOverlap = _overlapAxes(axisBodyA.vertices, axisBodyB.vertices, axes);
            collision.reused = true;

            if (minOverlap.overlap <= 0) {
                collision.collided = false;
                return collision;
            }
        } else {
            // if we can't reuse a result, perform a full SAT test

            overlapAB = _overlapAxes(bodyA.vertices, bodyB.vertices, bodyA.axes);

            if (overlapAB.overlap <= 0) {
                collision.collided = false;
                return collision;
            }

            overlapBA = _overlapAxes(bodyB.vertices, bodyA.vertices, bodyB.axes);

            if (overlapBA.overlap <= 0) {
                collision.collided = false;
                return collision;
            }

            if (overlapAB.overlap < overlapBA.overlap) {
                minOverlap = overlapAB;
                collision.axisBody = bodyA;
            } else {
                minOverlap = overlapBA;
                collision.axisBody = bodyB;
            }

            // important for reuse later
            collision.axisNumber = minOverlap.axisNumber;
        }

        collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
        collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
        collision.collided = true;
        collision.normal = minOverlap.axis;
        collision.depth = minOverlap.overlap;
        collision.parentA = collision.bodyA.parent;
        collision.parentB = collision.bodyB.parent;
        
        bodyA = collision.bodyA;
        bodyB = collision.bodyB;

        // ensure normal is facing away from bodyA
        if (Vector.dot(collision.normal, Vector.sub(bodyB.position, bodyA.position)) > 0) 
            collision.normal = Vector.neg(collision.normal);

        collision.tangent = Vector.perp(collision.normal);

        collision.penetration = { 
            x: collision.normal.x * collision.depth, 
            y: collision.normal.y * collision.depth 
        };

        // find support points, there is always either exactly one or two
        var verticesB = _findSupports(bodyA, bodyB, collision.normal),
            supports = collision.supports || [];
        supports.length = 0;

        // find the supports from bodyB that are inside bodyA
        if (Vertices.contains(bodyA.vertices, verticesB[0]))
            supports.push(verticesB[0]);

        if (Vertices.contains(bodyA.vertices, verticesB[1]))
            supports.push(verticesB[1]);

        // find the supports from bodyA that are inside bodyB
        if (supports.length < 2) {
            var verticesA = _findSupports(bodyB, bodyA, Vector.neg(collision.normal));
                
            if (Vertices.contains(bodyB.vertices, verticesA[0]))
                supports.push(verticesA[0]);

            if (supports.length < 2 && Vertices.contains(bodyB.vertices, verticesA[1]))
                supports.push(verticesA[1]);
        }

        // account for the edge case of overlapping but no vertex containment
        if (supports.length < 1)
            supports = [verticesB[0]];
        
        collision.supports = supports;

        return collision;
    };

    /**
     * Find the overlap between two sets of vertices.
     * @method _overlapAxes
     * @private
     * @param {} verticesA
     * @param {} verticesB
     * @param {} axes
     * @return result
     */
    var _overlapAxes = function(verticesA, verticesB, axes) {
        var projectionA = Vector._temp[0], 
            projectionB = Vector._temp[1],
            result = { overlap: Number.MAX_VALUE },
            overlap,
            axis;

        for (var i = 0; i < axes.length; i++) {
            axis = axes[i];

            _projectToAxis(projectionA, verticesA, axis);
            _projectToAxis(projectionB, verticesB, axis);

            overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);

            if (overlap <= 0) {
                result.overlap = overlap;
                return result;
            }

            if (overlap < result.overlap) {
                result.overlap = overlap;
                result.axis = axis;
                result.axisNumber = i;
            }
        }

        return result;
    };

    /**
     * Projects vertices on an axis and returns an interval.
     * @method _projectToAxis
     * @private
     * @param {} projection
     * @param {} vertices
     * @param {} axis
     */
    var _projectToAxis = function(projection, vertices, axis) {
        var min = Vector.dot(vertices[0], axis),
            max = min;

        for (var i = 1; i < vertices.length; i += 1) {
            var dot = Vector.dot(vertices[i], axis);

            if (dot > max) { 
                max = dot; 
            } else if (dot < min) { 
                min = dot; 
            }
        }

        projection.min = min;
        projection.max = max;
    };
    
    /**
     * Finds supporting vertices given two bodies along a given direction using hill-climbing.
     * @method _findSupports
     * @private
     * @param {} bodyA
     * @param {} bodyB
     * @param {} normal
     * @return [vector]
     */
    var _findSupports = function(bodyA, bodyB, normal) {
        var nearestDistance = Number.MAX_VALUE,
            vertexToBody = Vector._temp[0],
            vertices = bodyB.vertices,
            bodyAPosition = bodyA.position,
            distance,
            vertex,
            vertexA,
            vertexB;

        // find closest vertex on bodyB
        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            vertexToBody.x = vertex.x - bodyAPosition.x;
            vertexToBody.y = vertex.y - bodyAPosition.y;
            distance = -Vector.dot(normal, vertexToBody);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                vertexA = vertex;
            }
        }

        // find next closest vertex using the two connected to it
        var prevIndex = vertexA.index - 1 >= 0 ? vertexA.index - 1 : vertices.length - 1;
        vertex = vertices[prevIndex];
        vertexToBody.x = vertex.x - bodyAPosition.x;
        vertexToBody.y = vertex.y - bodyAPosition.y;
        nearestDistance = -Vector.dot(normal, vertexToBody);
        vertexB = vertex;

        var nextIndex = (vertexA.index + 1) % vertices.length;
        vertex = vertices[nextIndex];
        vertexToBody.x = vertex.x - bodyAPosition.x;
        vertexToBody.y = vertex.y - bodyAPosition.y;
        distance = -Vector.dot(normal, vertexToBody);
        if (distance < nearestDistance) {
            vertexB = vertex;
        }

        return [vertexA, vertexB];
    };

})();

},{"../geometry/Vector":28,"../geometry/Vertices":29}],12:[function(_dereq_,module,exports){
/**
* The `Matter.Constraint` module contains methods for creating and manipulating constraints.
* Constraints are used for specifying that a fixed distance must be maintained between two bodies (or a body and a fixed world-space position).
* The stiffness of constraints can be modified to create springs or elastic.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Constraint
*/

// TODO: fix instability issues with torque
// TODO: linked constraints
// TODO: breakable constraints
// TODO: collision constraints
// TODO: allow constrained bodies to sleep
// TODO: handle 0 length constraints properly
// TODO: impulse caching and warming

var Constraint = {};

module.exports = Constraint;

var Vertices = _dereq_('../geometry/Vertices');
var Vector = _dereq_('../geometry/Vector');
var Sleeping = _dereq_('../core/Sleeping');
var Bounds = _dereq_('../geometry/Bounds');
var Axes = _dereq_('../geometry/Axes');
var Common = _dereq_('../core/Common');

(function() {

    var _minLength = 0.000001,
        _minDifference = 0.001;

    /**
     * Creates a new constraint.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {} options
     * @return {constraint} constraint
     */
    Constraint.create = function(options) {
        var constraint = options;

        // if bodies defined but no points, use body centre
        if (constraint.bodyA && !constraint.pointA)
            constraint.pointA = { x: 0, y: 0 };
        if (constraint.bodyB && !constraint.pointB)
            constraint.pointB = { x: 0, y: 0 };

        // calculate static length using initial world space points
        var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA,
            initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB,
            length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
    
        constraint.length = constraint.length || length || _minLength;

        // render
        var render = {
            visible: true,
            lineWidth: 2,
            strokeStyle: '#666'
        };
        
        constraint.render = Common.extend(render, constraint.render);

        // option defaults
        constraint.id = constraint.id || Common.nextId();
        constraint.label = constraint.label || 'Constraint';
        constraint.type = 'constraint';
        constraint.stiffness = constraint.stiffness || 1;
        constraint.angularStiffness = constraint.angularStiffness || 0;
        constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
        constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;

        return constraint;
    };

    /**
     * Solves all constraints in a list of collisions.
     * @private
     * @method solveAll
     * @param {constraint[]} constraints
     * @param {number} timeScale
     */
    Constraint.solveAll = function(constraints, timeScale) {
        for (var i = 0; i < constraints.length; i++) {
            Constraint.solve(constraints[i], timeScale);
        }
    };

    /**
     * Solves a distance constraint with Gauss-Siedel method.
     * @private
     * @method solve
     * @param {constraint} constraint
     * @param {number} timeScale
     */
    Constraint.solve = function(constraint, timeScale) {
        var bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB;

        // update reference angle
        if (bodyA && !bodyA.isStatic) {
            constraint.pointA = Vector.rotate(pointA, bodyA.angle - constraint.angleA);
            constraint.angleA = bodyA.angle;
        }
        
        // update reference angle
        if (bodyB && !bodyB.isStatic) {
            constraint.pointB = Vector.rotate(pointB, bodyB.angle - constraint.angleB);
            constraint.angleB = bodyB.angle;
        }

        var pointAWorld = pointA,
            pointBWorld = pointB;

        if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
        if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);

        if (!pointAWorld || !pointBWorld)
            return;

        var delta = Vector.sub(pointAWorld, pointBWorld),
            currentLength = Vector.magnitude(delta);

        // prevent singularity
        if (currentLength === 0)
            currentLength = _minLength;

        // solve distance constraint with Gauss-Siedel method
        var difference = (currentLength - constraint.length) / currentLength,
            normal = Vector.div(delta, currentLength),
            force = Vector.mult(delta, difference * 0.5 * constraint.stiffness * timeScale * timeScale);
        
        // if difference is very small, we can skip
        if (Math.abs(1 - (currentLength / constraint.length)) < _minDifference * timeScale)
            return;

        var velocityPointA,
            velocityPointB,
            offsetA,
            offsetB,
            oAn,
            oBn,
            bodyADenom,
            bodyBDenom;
    
        if (bodyA && !bodyA.isStatic) {
            // point body offset
            offsetA = { 
                x: pointAWorld.x - bodyA.position.x + force.x, 
                y: pointAWorld.y - bodyA.position.y + force.y
            };
            
            // update velocity
            bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
            bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
            
            // find point velocity and body mass
            velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity));
            oAn = Vector.dot(offsetA, normal);
            bodyADenom = bodyA.inverseMass + bodyA.inverseInertia * oAn * oAn;
        } else {
            velocityPointA = { x: 0, y: 0 };
            bodyADenom = bodyA ? bodyA.inverseMass : 0;
        }
            
        if (bodyB && !bodyB.isStatic) {
            // point body offset
            offsetB = { 
                x: pointBWorld.x - bodyB.position.x - force.x, 
                y: pointBWorld.y - bodyB.position.y - force.y 
            };
            
            // update velocity
            bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
            bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;

            // find point velocity and body mass
            velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity));
            oBn = Vector.dot(offsetB, normal);
            bodyBDenom = bodyB.inverseMass + bodyB.inverseInertia * oBn * oBn;
        } else {
            velocityPointB = { x: 0, y: 0 };
            bodyBDenom = bodyB ? bodyB.inverseMass : 0;
        }
        
        var relativeVelocity = Vector.sub(velocityPointB, velocityPointA),
            normalImpulse = Vector.dot(normal, relativeVelocity) / (bodyADenom + bodyBDenom);
    
        if (normalImpulse > 0) normalImpulse = 0;
    
        var normalVelocity = {
            x: normal.x * normalImpulse, 
            y: normal.y * normalImpulse
        };

        var torque;
 
        if (bodyA && !bodyA.isStatic) {
            torque = Vector.cross(offsetA, normalVelocity) * bodyA.inverseInertia * (1 - constraint.angularStiffness);

            // keep track of applied impulses for post solving
            bodyA.constraintImpulse.x -= force.x;
            bodyA.constraintImpulse.y -= force.y;
            bodyA.constraintImpulse.angle += torque;

            // apply forces
            bodyA.position.x -= force.x;
            bodyA.position.y -= force.y;
            bodyA.angle += torque;
        }

        if (bodyB && !bodyB.isStatic) {
            torque = Vector.cross(offsetB, normalVelocity) * bodyB.inverseInertia * (1 - constraint.angularStiffness);

            // keep track of applied impulses for post solving
            bodyB.constraintImpulse.x += force.x;
            bodyB.constraintImpulse.y += force.y;
            bodyB.constraintImpulse.angle -= torque;
            
            // apply forces
            bodyB.position.x += force.x;
            bodyB.position.y += force.y;
            bodyB.angle -= torque;
        }

    };

    /**
     * Performs body updates required after solving constraints.
     * @private
     * @method postSolveAll
     * @param {body[]} bodies
     */
    Constraint.postSolveAll = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                impulse = body.constraintImpulse;

            if (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                continue;
            }

            Sleeping.set(body, false);

            // update geometry and reset
            for (var j = 0; j < body.parts.length; j++) {
                var part = body.parts[j];
                
                Vertices.translate(part.vertices, impulse);

                if (j > 0) {
                    part.position.x += impulse.x;
                    part.position.y += impulse.y;
                }

                if (impulse.angle !== 0) {
                    Vertices.rotate(part.vertices, impulse.angle, body.position);
                    Axes.rotate(part.axes, impulse.angle);
                    if (j > 0) {
                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                    }
                }

                Bounds.update(part.bounds, part.vertices, body.velocity);
            }

            impulse.angle = 0;
            impulse.x = 0;
            impulse.y = 0;
        }
    };

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * An integer `Number` uniquely identifying number generated in `Composite.create` by `Common.nextId`.
     *
     * @property id
     * @type number
     */

    /**
     * A `String` denoting the type of object.
     *
     * @property type
     * @type string
     * @default "constraint"
     * @readOnly
     */

    /**
     * An arbitrary `String` name to help the user identify and manage bodies.
     *
     * @property label
     * @type string
     * @default "Constraint"
     */

    /**
     * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.
     *
     * @property render
     * @type object
     */

    /**
     * A flag that indicates if the constraint should be rendered.
     *
     * @property render.visible
     * @type boolean
     * @default true
     */

    /**
     * A `Number` that defines the line width to use when rendering the constraint outline.
     * A value of `0` means no outline will be rendered.
     *
     * @property render.lineWidth
     * @type number
     * @default 2
     */

    /**
     * A `String` that defines the stroke style to use when rendering the constraint outline.
     * It is the same as when using a canvas, so it accepts CSS style property values.
     *
     * @property render.strokeStyle
     * @type string
     * @default a random colour
     */

    /**
     * The first possible `Body` that this constraint is attached to.
     *
     * @property bodyA
     * @type body
     * @default null
     */

    /**
     * The second possible `Body` that this constraint is attached to.
     *
     * @property bodyB
     * @type body
     * @default null
     */

    /**
     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyA` if defined, otherwise a world-space position.
     *
     * @property pointA
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyA` if defined, otherwise a world-space position.
     *
     * @property pointB
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Number` that specifies the stiffness of the constraint, i.e. the rate at which it returns to its resting `constraint.length`.
     * A value of `1` means the constraint should be very stiff.
     * A value of `0.2` means the constraint acts like a soft spring.
     *
     * @property stiffness
     * @type number
     * @default 1
     */

    /**
     * A `Number` that specifies the target resting length of the constraint. 
     * It is calculated automatically in `Constraint.create` from initial positions of the `constraint.bodyA` and `constraint.bodyB`.
     *
     * @property length
     * @type number
     */

})();

},{"../core/Common":14,"../core/Sleeping":22,"../geometry/Axes":25,"../geometry/Bounds":26,"../geometry/Vector":28,"../geometry/Vertices":29}],13:[function(_dereq_,module,exports){
/**
* The `Matter.MouseConstraint` module contains methods for creating mouse constraints.
* Mouse constraints are used for allowing user interaction, providing the ability to move bodies via the mouse or touch.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class MouseConstraint
*/

var MouseConstraint = {};

module.exports = MouseConstraint;

var Vertices = _dereq_('../geometry/Vertices');
var Sleeping = _dereq_('../core/Sleeping');
var Mouse = _dereq_('../core/Mouse');
var Events = _dereq_('../core/Events');
var Detector = _dereq_('../collision/Detector');
var Constraint = _dereq_('./Constraint');
var Composite = _dereq_('../body/Composite');
var Common = _dereq_('../core/Common');
var Bounds = _dereq_('../geometry/Bounds');

(function() {

    /**
     * Creates a new mouse constraint.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {engine} engine
     * @param {} options
     * @return {MouseConstraint} A new MouseConstraint
     */
    MouseConstraint.create = function(engine, options) {
        var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);

        if (!mouse) {
            if (engine && engine.render && engine.render.canvas) {
                mouse = Mouse.create(engine.render.canvas);
            } else if (options && options.element) {
                mouse = Mouse.create(options.element);
            } else {
                mouse = Mouse.create();
                Common.warn('MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected');
            }
        }

        var constraint = Constraint.create({ 
            label: 'Mouse Constraint',
            pointA: mouse.position,
            pointB: { x: 0, y: 0 },
            length: 0.01, 
            stiffness: 0.1,
            angularStiffness: 1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            }
        });

        var defaults = {
            type: 'mouseConstraint',
            mouse: mouse,
            element: null,
            body: null,
            constraint: constraint,
            collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
                group: 0
            }
        };

        var mouseConstraint = Common.extend(defaults, options);

        Events.on(engine, 'tick', function() {
            var allBodies = Composite.allBodies(engine.world);
            MouseConstraint.update(mouseConstraint, allBodies);
            _triggerEvents(mouseConstraint);
        });

        return mouseConstraint;
    };

    /**
     * Updates the given mouse constraint.
     * @private
     * @method update
     * @param {MouseConstraint} mouseConstraint
     * @param {body[]} bodies
     */
    MouseConstraint.update = function(mouseConstraint, bodies) {
        var mouse = mouseConstraint.mouse,
            constraint = mouseConstraint.constraint,
            body = mouseConstraint.body;

        if (mouse.button === 0) {
            if (!constraint.bodyB) {
                for (var i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (Bounds.contains(body.bounds, mouse.position) 
                            && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                            var part = body.parts[j];
                            if (Vertices.contains(part.vertices, mouse.position)) {
                                constraint.pointA = mouse.position;
                                constraint.bodyB = mouseConstraint.body = body;
                                constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                                constraint.angleB = body.angle;

                                Sleeping.set(body, false);
                                Events.trigger(mouseConstraint, 'startdrag', { mouse: mouse, body: body });

                                break;
                            }
                        }
                    }
                }
            } else {
                Sleeping.set(constraint.bodyB, false);
                constraint.pointA = mouse.position;
            }
        } else {
            constraint.bodyB = mouseConstraint.body = null;
            constraint.pointB = null;

            if (body)
                Events.trigger(mouseConstraint, 'enddrag', { mouse: mouse, body: body });
        }
    };

    /**
     * Triggers mouse constraint events.
     * @method _triggerEvents
     * @private
     * @param {mouse} mouseConstraint
     */
    var _triggerEvents = function(mouseConstraint) {
        var mouse = mouseConstraint.mouse,
            mouseEvents = mouse.sourceEvents;

        if (mouseEvents.mousemove)
            Events.trigger(mouseConstraint, 'mousemove', { mouse: mouse });

        if (mouseEvents.mousedown)
            Events.trigger(mouseConstraint, 'mousedown', { mouse: mouse });

        if (mouseEvents.mouseup)
            Events.trigger(mouseConstraint, 'mouseup', { mouse: mouse });

        // reset the mouse state ready for the next step
        Mouse.clearSourceEvents(mouse);
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired when the mouse has moved (or a touch moves) during the last step
    *
    * @event mousemove
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the mouse is down (or a touch has started) during the last step
    *
    * @event mousedown
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the mouse is up (or a touch has ended) during the last step
    *
    * @event mouseup
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the user starts dragging a body
    *
    * @event startdrag
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {body} event.body The body being dragged
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the user ends dragging a body
    *
    * @event enddrag
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {body} event.body The body that has stopped being dragged
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * A `String` denoting the type of object.
     *
     * @property type
     * @type string
     * @default "constraint"
     * @readOnly
     */

    /**
     * The `Mouse` instance in use. If not supplied in `MouseConstraint.create`, one will be created.
     *
     * @property mouse
     * @type mouse
     * @default mouse
     */

    /**
     * The `Body` that is currently being moved by the user, or `null` if no body.
     *
     * @property body
     * @type body
     * @default null
     */

    /**
     * The `Constraint` object that is used to move the body during interaction.
     *
     * @property constraint
     * @type constraint
     */

    /**
     * An `Object` that specifies the collision filter properties.
     * The collision filter allows the user to define which types of body this mouse constraint can interact with.
     * See `body.collisionFilter` for more information.
     *
     * @property collisionFilter
     * @type object
     */

})();

},{"../body/Composite":2,"../collision/Detector":5,"../core/Common":14,"../core/Events":16,"../core/Mouse":19,"../core/Sleeping":22,"../geometry/Bounds":26,"../geometry/Vertices":29,"./Constraint":12}],14:[function(_dereq_,module,exports){
/**
* The `Matter.Common` module contains utility functions that are common to all modules.
*
* @class Common
*/

var Common = {};

module.exports = Common;

(function() {

    Common._nextId = 0;
    Common._seed = 0;

    /**
     * Extends the object in the first argument using the object in the second argument.
     * @method extend
     * @param {} obj
     * @param {boolean} deep
     * @return {} obj extended
     */
    Common.extend = function(obj, deep) {
        var argsStart,
            args,
            deepClone;

        if (typeof deep === 'boolean') {
            argsStart = 2;
            deepClone = deep;
        } else {
            argsStart = 1;
            deepClone = true;
        }

        args = Array.prototype.slice.call(arguments, argsStart);

        for (var i = 0; i < args.length; i++) {
            var source = args[i];

            if (source) {
                for (var prop in source) {
                    if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }
        
        return obj;
    };

    /**
     * Creates a new clone of the object, if deep is true references will also be cloned.
     * @method clone
     * @param {} obj
     * @param {bool} deep
     * @return {} obj cloned
     */
    Common.clone = function(obj, deep) {
        return Common.extend({}, deep, obj);
    };

    /**
     * Returns the list of keys for the given object.
     * @method keys
     * @param {} obj
     * @return {string[]} keys
     */
    Common.keys = function(obj) {
        if (Object.keys)
            return Object.keys(obj);

        // avoid hasOwnProperty for performance
        var keys = [];
        for (var key in obj)
            keys.push(key);
        return keys;
    };

    /**
     * Returns the list of values for the given object.
     * @method values
     * @param {} obj
     * @return {array} Array of the objects property values
     */
    Common.values = function(obj) {
        var values = [];
        
        if (Object.keys) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]]);
            }
            return values;
        }
        
        // avoid hasOwnProperty for performance
        for (var key in obj)
            values.push(obj[key]);
        return values;
    };

    /**
     * Gets a value from `base` relative to the `path` string.
     * @method get
     * @param {} obj The base object
     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'
     * @param {number} [begin] Path slice begin
     * @param {number} [end] Path slice end
     * @return {} The object at the given path
     */
    Common.get = function(obj, path, begin, end) {
        path = path.split('.').slice(begin, end);

        for (var i = 0; i < path.length; i += 1) {
            obj = obj[path[i]];
        }

        return obj;
    };

    /**
     * Sets a value on `base` relative to the given `path` string.
     * @method set
     * @param {} obj The base object
     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'
     * @param {} val The value to set
     * @param {number} [begin] Path slice begin
     * @param {number} [end] Path slice end
     * @return {} Pass through `val` for chaining
     */
    Common.set = function(obj, path, val, begin, end) {
        var parts = path.split('.').slice(begin, end);
        Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
        return val;
    };

    /**
     * Returns a hex colour string made by lightening or darkening color by percent.
     * @method shadeColor
     * @param {string} color
     * @param {number} percent
     * @return {string} A hex colour
     */
    Common.shadeColor = function(color, percent) {   
        // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
        var colorInteger = parseInt(color.slice(1),16), 
            amount = Math.round(2.55 * percent), 
            R = (colorInteger >> 16) + amount, 
            B = (colorInteger >> 8 & 0x00FF) + amount, 
            G = (colorInteger & 0x0000FF) + amount;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R :255) * 0x10000 
                + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 
                + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    };

    /**
     * Shuffles the given array in-place.
     * The function uses a seeded random generator.
     * @method shuffle
     * @param {array} array
     * @return {array} array shuffled randomly
     */
    Common.shuffle = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Common.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    /**
     * Randomly chooses a value from a list with equal probability.
     * The function uses a seeded random generator.
     * @method choose
     * @param {array} choices
     * @return {object} A random choice object from the array
     */
    Common.choose = function(choices) {
        return choices[Math.floor(Common.random() * choices.length)];
    };

    /**
     * Returns true if the object is a HTMLElement, otherwise false.
     * @method isElement
     * @param {object} obj
     * @return {boolean} True if the object is a HTMLElement, otherwise false
     */
    Common.isElement = function(obj) {
        // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        try {
            return obj instanceof HTMLElement;
        }
        catch(e){
            return (typeof obj==="object") &&
              (obj.nodeType===1) && (typeof obj.style === "object") &&
              (typeof obj.ownerDocument ==="object");
        }
    };

    /**
     * Returns true if the object is an array.
     * @method isArray
     * @param {object} obj
     * @return {boolean} True if the object is an array, otherwise false
     */
    Common.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    /**
     * Returns true if the object is a function.
     * @method isFunction
     * @param {object} obj
     * @return {boolean} True if the object is a function, otherwise false
     */
    Common.isFunction = function(obj) {
        return typeof obj === "function";
    };

    /**
     * Returns true if the object is a plain object.
     * @method isPlainObject
     * @param {object} obj
     * @return {boolean} True if the object is a plain object, otherwise false
     */
    Common.isPlainObject = function(obj) {
        return typeof obj === 'object' && obj.constructor === Object;
    };

    /**
     * Returns true if the object is a string.
     * @method isString
     * @param {object} obj
     * @return {boolean} True if the object is a string, otherwise false
     */
    Common.isString = function(obj) {
        return toString.call(obj) === '[object String]';
    };
    
    /**
     * Returns the given value clamped between a minimum and maximum value.
     * @method clamp
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @return {number} The value clamped between min and max inclusive
     */
    Common.clamp = function(value, min, max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    };
    
    /**
     * Returns the sign of the given value.
     * @method sign
     * @param {number} value
     * @return {number} -1 if negative, +1 if 0 or positive
     */
    Common.sign = function(value) {
        return value < 0 ? -1 : 1;
    };
    
    /**
     * Returns the current timestamp (high-res if available).
     * @method now
     * @return {number} the current timestamp (high-res if available)
     */
    Common.now = function() {
        // http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
        // https://gist.github.com/davidwaterston/2982531

        var performance = window.performance || {};

        performance.now = (function() {
            return performance.now    ||
            performance.webkitNow     ||
            performance.msNow         ||
            performance.oNow          ||
            performance.mozNow        ||
            function() { return +(new Date()); };
        })();
              
        return performance.now();
    };
    
    /**
     * Returns a random value between a minimum and a maximum value inclusive.
     * The function uses a seeded random generator.
     * @method random
     * @param {number} min
     * @param {number} max
     * @return {number} A random number between min and max inclusive
     */
    Common.random = function(min, max) {
        min = (typeof min !== "undefined") ? min : 0;
        max = (typeof max !== "undefined") ? max : 1;
        return min + _seededRandom() * (max - min);
    };

    var _seededRandom = function() {
        // https://gist.github.com/ngryman/3830489
        Common._seed = (Common._seed * 9301 + 49297) % 233280;
        return Common._seed / 233280;
    };

    /**
     * Converts a CSS hex colour string into an integer.
     * @method colorToNumber
     * @param {string} colorString
     * @return {number} An integer representing the CSS hex string
     */
    Common.colorToNumber = function(colorString) {
        colorString = colorString.replace('#','');

        if (colorString.length == 3) {
            colorString = colorString.charAt(0) + colorString.charAt(0)
                        + colorString.charAt(1) + colorString.charAt(1)
                        + colorString.charAt(2) + colorString.charAt(2);
        }

        return parseInt(colorString, 16);
    };

    /**
     * The console logging level to use, where each level includes all levels above and excludes the levels below.
     * The default level is 'debug' which shows all console messages.  
     *
     * Possible level values are:
     * - 0 = None
     * - 1 = Debug
     * - 2 = Info
     * - 3 = Warn
     * - 4 = Error
     * @property Common.logLevel
     * @type {Number}
     * @default 1
     */
    Common.logLevel = 1;

    /**
     * Shows a `console.log` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method log
     * @param ...objs {} The objects to log.
     */
    Common.log = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.log.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
        }
    };

    /**
     * Shows a `console.info` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method info
     * @param ...objs {} The objects to log.
     */
    Common.info = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
            console.info.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
        }
    };

    /**
     * Shows a `console.warn` message only if the current `Common.logLevel` allows it.
     * The message will be prefixed with 'matter-js' to make it easily identifiable.
     * @method warn
     * @param ...objs {} The objects to log.
     */
    Common.warn = function() {
        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
            console.warn.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
        }
    };

    /**
     * Returns the next unique sequential ID.
     * @method nextId
     * @return {Number} Unique sequential ID
     */
    Common.nextId = function() {
        return Common._nextId++;
    };

    /**
     * A cross browser compatible indexOf implementation.
     * @method indexOf
     * @param {array} haystack
     * @param {object} needle
     * @return {number} The position of needle in haystack, otherwise -1.
     */
    Common.indexOf = function(haystack, needle) {
        if (haystack.indexOf)
            return haystack.indexOf(needle);

        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] === needle)
                return i;
        }

        return -1;
    };

    /**
     * A cross browser compatible array map implementation.
     * @method map
     * @param {array} list
     * @param {function} func
     * @return {array} Values from list transformed by func.
     */
    Common.map = function(list, func) {
        if (list.map) {
            return list.map(func);
        }

        var mapped = [];

        for (var i = 0; i < list.length; i += 1) {
            mapped.push(func(list[i]));
        }

        return mapped;
    };

    /**
     * Takes a directed graph and returns the partially ordered set of vertices in topological order.
     * Circular dependencies are allowed.
     * @method topologicalSort
     * @param {object} graph
     * @return {array} Partially ordered set of vertices in topological order.
     */
    Common.topologicalSort = function(graph) {
        // https://mgechev.github.io/javascript-algorithms/graphs_others_topological-sort.js.html
        var result = [],
            visited = [],
            temp = [];

        for (var node in graph) {
            if (!visited[node] && !temp[node]) {
                _topologicalSort(node, visited, temp, graph, result);
            }
        }

        return result;
    };

    var _topologicalSort = function(node, visited, temp, graph, result) {
        var neighbors = graph[node] || [];
        temp[node] = true;

        for (var i = 0; i < neighbors.length; i += 1) {
            var neighbor = neighbors[i];

            if (temp[neighbor]) {
                // skip circular dependencies
                continue;
            }

            if (!visited[neighbor]) {
                _topologicalSort(neighbor, visited, temp, graph, result);
            }
        }

        temp[node] = false;
        visited[node] = true;

        result.push(node);
    };

    /**
     * Takes _n_ functions as arguments and returns a new function that calls them in order.
     * The arguments applied when calling the new function will also be applied to every function passed.
     * The value of `this` refers to the last value returned in the chain that was not `undefined`.
     * Therefore if a passed function does not return a value, the previously returned value is maintained.
     * After all passed functions have been called the new function returns the last returned value (if any).
     * If any of the passed functions are a chain, then the chain will be flattened.
     * @method chain
     * @param ...funcs {function} The functions to chain.
     * @return {function} A new function that calls the passed functions in order.
     */
    Common.chain = function() {
        var args = Array.prototype.slice.call(arguments),
            funcs = [];

        for (var i = 0; i < args.length; i += 1) {
            var func = args[i];

            if (func._chained) {
                // flatten already chained functions
                funcs.push.apply(funcs, func._chained);
            } else {
                funcs.push(func);
            }
        }

        var chain = function() {
            var lastResult;

            for (var i = 0; i < funcs.length; i += 1) {
                var result = funcs[i].apply(lastResult, arguments);

                if (typeof result !== 'undefined') {
                    lastResult = result;
                }
            }

            return lastResult;
        };

        chain._chained = funcs;

        return chain;
    };

    /**
     * Chains a function to excute before the original function on the given `path` relative to `base`.
     * See also docs for `Common.chain`.
     * @method chainPathBefore
     * @param {} base The base object
     * @param {string} path The path relative to `base`
     * @param {function} func The function to chain before the original
     * @return {function} The chained function that replaced the original
     */
    Common.chainPathBefore = function(base, path, func) {
        return Common.set(base, path, Common.chain(
            func,
            Common.get(base, path)
        ));
    };

    /**
     * Chains a function to excute after the original function on the given `path` relative to `base`.
     * See also docs for `Common.chain`.
     * @method chainPathAfter
     * @param {} base The base object
     * @param {string} path The path relative to `base`
     * @param {function} func The function to chain after the original
     * @return {function} The chained function that replaced the original
     */
    Common.chainPathAfter = function(base, path, func) {
        return Common.set(base, path, Common.chain(
            Common.get(base, path),
            func
        ));
    };

})();

},{}],15:[function(_dereq_,module,exports){
/**
* The `Matter.Engine` module contains methods for creating and manipulating engines.
* An engine is a controller that manages updating the simulation of the world.
* See `Matter.Runner` for an optional game loop utility.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Engine
*/

var Engine = {};

module.exports = Engine;

var World = _dereq_('../body/World');
var Sleeping = _dereq_('./Sleeping');
var Resolver = _dereq_('../collision/Resolver');
var Render = _dereq_('../render/Render');
var Pairs = _dereq_('../collision/Pairs');
var Metrics = _dereq_('./Metrics');
var Grid = _dereq_('../collision/Grid');
var Events = _dereq_('./Events');
var Composite = _dereq_('../body/Composite');
var Constraint = _dereq_('../constraint/Constraint');
var Common = _dereq_('./Common');
var Body = _dereq_('../body/Body');

(function() {

    /**
     * Creates a new engine. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {object} [options]
     * @return {engine} engine
     */
    Engine.create = function(element, options) {
        // options may be passed as the first (and only) argument
        options = Common.isElement(element) ? options : element;
        element = Common.isElement(element) ? element : null;
        options = options || {};

        if (element || options.render) {
            Common.warn('Engine.create: engine.render is deprecated (see docs)');
        }

        var defaults = {
            positionIterations: 6,
            velocityIterations: 4,
            constraintIterations: 2,
            enableSleeping: false,
            events: [],
            timing: {
                timestamp: 0,
                timeScale: 1
            },
            broadphase: {
                controller: Grid
            }
        };

        var engine = Common.extend(defaults, options);

        // @deprecated
        if (element || engine.render) {
            var renderDefaults = {
                element: element,
                controller: Render
            };
            
            engine.render = Common.extend(renderDefaults, engine.render);
        }

        // @deprecated
        if (engine.render && engine.render.controller) {
            engine.render = engine.render.controller.create(engine.render);
        }

        // @deprecated
        if (engine.render) {
            engine.render.engine = engine;
        }

        engine.world = options.world || World.create(engine.world);
        engine.pairs = Pairs.create();
        engine.broadphase = engine.broadphase.controller.create(engine.broadphase);
        engine.metrics = engine.metrics || { extended: false };


        return engine;
    };

    /**
     * Moves the simulation forward in time by `delta` ms.
     * The `correction` argument is an optional `Number` that specifies the time correction factor to apply to the update.
     * This can help improve the accuracy of the simulation in cases where `delta` is changing between updates.
     * The value of `correction` is defined as `delta / lastDelta`, i.e. the percentage change of `delta` over the last step.
     * Therefore the value is always `1` (no correction) when `delta` constant (or when no correction is desired, which is the default).
     * See the paper on <a href="http://lonesock.net/article/verlet.html">Time Corrected Verlet</a> for more information.
     *
     * Triggers `beforeUpdate` and `afterUpdate` events.
     * Triggers `collisionStart`, `collisionActive` and `collisionEnd` events.
     * @method update
     * @param {engine} engine
     * @param {number} [delta=16.666]
     * @param {number} [correction=1]
     */
    Engine.update = function(engine, delta, correction) {
        delta = delta || 1000 / 60;
        correction = correction || 1;

        var world = engine.world,
            timing = engine.timing,
            broadphase = engine.broadphase,
            broadphasePairs = [],
            i;

        // increment timestamp
        timing.timestamp += delta * timing.timeScale;

        // create an event object
        var event = {
            timestamp: timing.timestamp
        };

        Events.trigger(engine, 'beforeUpdate', event);

        // get lists of all bodies and constraints, no matter what composites they are in
        var allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world);


        // if sleeping enabled, call the sleeping controller
        if (engine.enableSleeping)
            Sleeping.update(allBodies, timing.timeScale);

        // applies gravity to all bodies
        _bodiesApplyGravity(allBodies, world.gravity);

        // update all body position and rotation by integration
        _bodiesUpdate(allBodies, delta, timing.timeScale, correction, world.bounds);

        // update all constraints
        for (i = 0; i < engine.constraintIterations; i++) {
            Constraint.solveAll(allConstraints, timing.timeScale);
        }
        Constraint.postSolveAll(allBodies);

        // broadphase pass: find potential collision pairs
        if (broadphase.controller) {

            // if world is dirty, we must flush the whole grid
            if (world.isModified)
                broadphase.controller.clear(broadphase);

            // update the grid buckets based on current bodies
            broadphase.controller.update(broadphase, allBodies, engine, world.isModified);
            broadphasePairs = broadphase.pairsList;
        } else {

            // if no broadphase set, we just pass all bodies
            broadphasePairs = allBodies;
        }

        // clear all composite modified flags
        if (world.isModified) {
            Composite.setModified(world, false, false, true);
        }

        // narrowphase pass: find actual collisions, then create or update collision pairs
        var collisions = broadphase.detector(broadphasePairs, engine);

        // update collision pairs
        var pairs = engine.pairs,
            timestamp = timing.timestamp;
        Pairs.update(pairs, collisions, timestamp);
        Pairs.removeOld(pairs, timestamp);

        // wake up bodies involved in collisions
        if (engine.enableSleeping)
            Sleeping.afterCollisions(pairs.list, timing.timeScale);

        // trigger collision events
        if (pairs.collisionStart.length > 0)
            Events.trigger(engine, 'collisionStart', { pairs: pairs.collisionStart });

        // iteratively resolve position between collisions
        Resolver.preSolvePosition(pairs.list);
        for (i = 0; i < engine.positionIterations; i++) {
            Resolver.solvePosition(pairs.list, timing.timeScale);
        }
        Resolver.postSolvePosition(allBodies);

        // iteratively resolve velocity between collisions
        Resolver.preSolveVelocity(pairs.list);
        for (i = 0; i < engine.velocityIterations; i++) {
            Resolver.solveVelocity(pairs.list, timing.timeScale);
        }

        // trigger collision events
        if (pairs.collisionActive.length > 0)
            Events.trigger(engine, 'collisionActive', { pairs: pairs.collisionActive });

        if (pairs.collisionEnd.length > 0)
            Events.trigger(engine, 'collisionEnd', { pairs: pairs.collisionEnd });


        // clear force buffers
        _bodiesClearForces(allBodies);

        Events.trigger(engine, 'afterUpdate', event);

        return engine;
    };
    
    /**
     * Merges two engines by keeping the configuration of `engineA` but replacing the world with the one from `engineB`.
     * @method merge
     * @param {engine} engineA
     * @param {engine} engineB
     */
    Engine.merge = function(engineA, engineB) {
        Common.extend(engineA, engineB);
        
        if (engineB.world) {
            engineA.world = engineB.world;

            Engine.clear(engineA);

            var bodies = Composite.allBodies(engineA.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                Sleeping.set(body, false);
                body.id = Common.nextId();
            }
        }
    };

    /**
     * Clears the engine including the world, pairs and broadphase.
     * @method clear
     * @param {engine} engine
     */
    Engine.clear = function(engine) {
        var world = engine.world;
        
        Pairs.clear(engine.pairs);

        var broadphase = engine.broadphase;
        if (broadphase.controller) {
            var bodies = Composite.allBodies(world);
            broadphase.controller.clear(broadphase);
            broadphase.controller.update(broadphase, bodies, engine, true);
        }
    };

    /**
     * Zeroes the `body.force` and `body.torque` force buffers.
     * @method bodiesClearForces
     * @private
     * @param {body[]} bodies
     */
    var _bodiesClearForces = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            // reset force buffers
            body.force.x = 0;
            body.force.y = 0;
            body.torque = 0;
        }
    };

    /**
     * Applys a mass dependant force to all given bodies.
     * @method bodiesApplyGravity
     * @private
     * @param {body[]} bodies
     * @param {vector} gravity
     */
    var _bodiesApplyGravity = function(bodies, gravity) {
        var gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;

        if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {
            return;
        }
        
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            // apply gravity
            body.force.y += body.mass * gravity.y * gravityScale;
            body.force.x += body.mass * gravity.x * gravityScale;
        }
    };

    /**
     * Applys `Body.update` to all given `bodies`.
     * @method updateAll
     * @private
     * @param {body[]} bodies
     * @param {number} deltaTime 
     * The amount of time elapsed between updates
     * @param {number} timeScale
     * @param {number} correction 
     * The Verlet correction factor (deltaTime / lastDeltaTime)
     * @param {bounds} worldBounds
     */
    var _bodiesUpdate = function(bodies, deltaTime, timeScale, correction, worldBounds) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            Body.update(body, deltaTime, timeScale, correction);
        }
    };

    /**
     * An alias for `Runner.run`, see `Matter.Runner` for more information.
     * @method run
     * @param {engine} engine
     */

    /**
    * Fired just before an update
    *
    * @event beforeUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update and all collision events
    *
    * @event afterUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that have started to collide in the current tick (if any)
    *
    * @event collisionStart
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that are colliding in the current tick (if any)
    *
    * @event collisionActive
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that have ended collision in the current tick (if any)
    *
    * @event collisionEnd
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * An integer `Number` that specifies the number of position iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     *
     * @property positionIterations
     * @type number
     * @default 6
     */

    /**
     * An integer `Number` that specifies the number of velocity iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     *
     * @property velocityIterations
     * @type number
     * @default 4
     */

    /**
     * An integer `Number` that specifies the number of constraint iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     * The default value of `2` is usually very adequate.
     *
     * @property constraintIterations
     * @type number
     * @default 2
     */

    /**
     * A flag that specifies whether the engine should allow sleeping via the `Matter.Sleeping` module.
     * Sleeping can improve stability and performance, but often at the expense of accuracy.
     *
     * @property enableSleeping
     * @type boolean
     * @default false
     */

    /**
     * An `Object` containing properties regarding the timing systems of the engine. 
     *
     * @property timing
     * @type object
     */

    /**
     * A `Number` that specifies the global scaling factor of time for all bodies.
     * A value of `0` freezes the simulation.
     * A value of `0.1` gives a slow-motion effect.
     * A value of `1.2` gives a speed-up effect.
     *
     * @property timing.timeScale
     * @type number
     * @default 1
     */

    /**
     * A `Number` that specifies the current simulation-time in milliseconds starting from `0`. 
     * It is incremented on every `Engine.update` by the given `delta` argument. 
     *
     * @property timing.timestamp
     * @type number
     * @default 0
     */

    /**
     * An instance of a `Render` controller. The default value is a `Matter.Render` instance created by `Engine.create`.
     * One may also develop a custom renderer module based on `Matter.Render` and pass an instance of it to `Engine.create` via `options.render`.
     *
     * A minimal custom renderer object must define at least three functions: `create`, `clear` and `world` (see `Matter.Render`).
     * It is also possible to instead pass the _module_ reference via `options.render.controller` and `Engine.create` will instantiate one for you.
     *
     * @property render
     * @type render
     * @deprecated see Demo.js for an example of creating a renderer
     * @default a Matter.Render instance
     */

    /**
     * An instance of a broadphase controller. The default value is a `Matter.Grid` instance created by `Engine.create`.
     *
     * @property broadphase
     * @type grid
     * @default a Matter.Grid instance
     */

    /**
     * A `World` composite object that will contain all simulated bodies and constraints.
     *
     * @property world
     * @type world
     * @default a Matter.World instance
     */

})();

},{"../body/Body":1,"../body/Composite":2,"../body/World":3,"../collision/Grid":6,"../collision/Pairs":8,"../collision/Resolver":10,"../constraint/Constraint":12,"../render/Render":31,"./Common":14,"./Events":16,"./Metrics":18,"./Sleeping":22}],16:[function(_dereq_,module,exports){
/**
* The `Matter.Events` module contains methods to fire and listen to events on other objects.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Events
*/

var Events = {};

module.exports = Events;

var Common = _dereq_('./Common');

(function() {

    /**
     * Subscribes a callback function to the given object's `eventName`.
     * @method on
     * @param {} object
     * @param {string} eventNames
     * @param {function} callback
     */
    Events.on = function(object, eventNames, callback) {
        var names = eventNames.split(' '),
            name;

        for (var i = 0; i < names.length; i++) {
            name = names[i];
            object.events = object.events || {};
            object.events[name] = object.events[name] || [];
            object.events[name].push(callback);
        }

        return callback;
    };

    /**
     * Removes the given event callback. If no callback, clears all callbacks in `eventNames`. If no `eventNames`, clears all events.
     * @method off
     * @param {} object
     * @param {string} eventNames
     * @param {function} callback
     */
    Events.off = function(object, eventNames, callback) {
        if (!eventNames) {
            object.events = {};
            return;
        }

        // handle Events.off(object, callback)
        if (typeof eventNames === 'function') {
            callback = eventNames;
            eventNames = Common.keys(object.events).join(' ');
        }

        var names = eventNames.split(' ');

        for (var i = 0; i < names.length; i++) {
            var callbacks = object.events[names[i]],
                newCallbacks = [];

            if (callback && callbacks) {
                for (var j = 0; j < callbacks.length; j++) {
                    if (callbacks[j] !== callback)
                        newCallbacks.push(callbacks[j]);
                }
            }

            object.events[names[i]] = newCallbacks;
        }
    };

    /**
     * Fires all the callbacks subscribed to the given object's `eventName`, in the order they subscribed, if any.
     * @method trigger
     * @param {} object
     * @param {string} eventNames
     * @param {} event
     */
    Events.trigger = function(object, eventNames, event) {
        var names,
            name,
            callbacks,
            eventClone;

        if (object.events) {
            if (!event)
                event = {};

            names = eventNames.split(' ');

            for (var i = 0; i < names.length; i++) {
                name = names[i];
                callbacks = object.events[name];

                if (callbacks) {
                    eventClone = Common.clone(event, false);
                    eventClone.name = name;
                    eventClone.source = object;

                    for (var j = 0; j < callbacks.length; j++) {
                        callbacks[j].apply(object, [eventClone]);
                    }
                }
            }
        }
    };

})();

},{"./Common":14}],17:[function(_dereq_,module,exports){
/**
* The `Matter` module is the top level namespace. It also includes a function for installing plugins on top of the library.
*
* @class Matter
*/

var Matter = {};

module.exports = Matter;

var Plugin = _dereq_('./Plugin');
var Common = _dereq_('./Common');

(function() {

    /**
     * The library name.
     * @property name
     * @readOnly
     * @type {String}
     */
    Matter.name = 'matter-js';

    /**
     * The library version.
     * @property version
     * @readOnly
     * @type {String}
     */
    Matter.version = '0.11.1';

    /**
     * A list of plugin dependencies to be installed. These are normally set and installed through `Matter.use`.
     * Alternatively you may set `Matter.uses` manually and install them by calling `Plugin.use(Matter)`.
     * @property uses
     * @type {Array}
     */
    Matter.uses = [];

    /**
     * The plugins that have been installed through `Matter.Plugin.install`. Read only.
     * @property used
     * @readOnly
     * @type {Array}
     */
    Matter.used = [];

    /**
     * Installs the given plugins on the `Matter` namespace.
     * This is a short-hand for `Plugin.use`, see it for more information.
     * Call this function once at the start of your code, with all of the plugins you wish to install as arguments.
     * Avoid calling this function multiple times unless you intend to manually control installation order.
     * @method use
     * @param ...plugin {Function} The plugin(s) to install on `base` (multi-argument).
     */
    Matter.use = function() {
        Plugin.use(Matter, Array.prototype.slice.call(arguments));
    };

    /**
     * Chains a function to excute before the original function on the given `path` relative to `Matter`.
     * See also docs for `Common.chain`.
     * @method before
     * @param {string} path The path relative to `Matter`
     * @param {function} func The function to chain before the original
     * @return {function} The chained function that replaced the original
     */
    Matter.before = function(path, func) {
        path = path.replace(/^Matter./, '');
        return Common.chainPathBefore(Matter, path, func);
    };

    /**
     * Chains a function to excute after the original function on the given `path` relative to `Matter`.
     * See also docs for `Common.chain`.
     * @method after
     * @param {string} path The path relative to `Matter`
     * @param {function} func The function to chain after the original
     * @return {function} The chained function that replaced the original
     */
    Matter.after = function(path, func) {
        path = path.replace(/^Matter./, '');
        return Common.chainPathAfter(Matter, path, func);
    };

})();

},{"./Common":14,"./Plugin":20}],18:[function(_dereq_,module,exports){

},{"../body/Composite":2,"./Common":14}],19:[function(_dereq_,module,exports){
/**
* The `Matter.Mouse` module contains methods for creating and manipulating mouse inputs.
*
* @class Mouse
*/

var Mouse = {};

module.exports = Mouse;

var Common = _dereq_('../core/Common');

(function() {

    /**
     * Creates a mouse input.
     * @method create
     * @param {HTMLElement} element
     * @return {mouse} A new mouse
     */
    Mouse.create = function(element) {
        var mouse = {};

        if (!element) {
            Common.log('Mouse.create: element was undefined, defaulting to document.body', 'warn');
        }
        
        mouse.element = element || document.body;
        mouse.absolute = { x: 0, y: 0 };
        mouse.position = { x: 0, y: 0 };
        mouse.mousedownPosition = { x: 0, y: 0 };
        mouse.mouseupPosition = { x: 0, y: 0 };
        mouse.offset = { x: 0, y: 0 };
        mouse.scale = { x: 1, y: 1 };
        mouse.wheelDelta = 0;
        mouse.button = -1;
        mouse.pixelRatio = mouse.element.getAttribute('data-pixel-ratio') || 1;

        mouse.sourceEvents = {
            mousemove: null,
            mousedown: null,
            mouseup: null,
            mousewheel: null
        };
        
        mouse.mousemove = function(event) { 
            var position = _getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            }

            mouse.absolute.x = position.x;
            mouse.absolute.y = position.y;
            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
            mouse.sourceEvents.mousemove = event;
        };
        
        mouse.mousedown = function(event) {
            var position = _getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            } else {
                mouse.button = event.button;
            }

            mouse.absolute.x = position.x;
            mouse.absolute.y = position.y;
            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
            mouse.mousedownPosition.x = mouse.position.x;
            mouse.mousedownPosition.y = mouse.position.y;
            mouse.sourceEvents.mousedown = event;
        };
        
        mouse.mouseup = function(event) {
            var position = _getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),
                touches = event.changedTouches;

            if (touches) {
                event.preventDefault();
            }
            
            mouse.button = -1;
            mouse.absolute.x = position.x;
            mouse.absolute.y = position.y;
            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
            mouse.mouseupPosition.x = mouse.position.x;
            mouse.mouseupPosition.y = mouse.position.y;
            mouse.sourceEvents.mouseup = event;
        };

        mouse.mousewheel = function(event) {
            mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
            event.preventDefault();
        };

        Mouse.setElement(mouse, mouse.element);

        return mouse;
    };

    /**
     * Sets the element the mouse is bound to (and relative to).
     * @method setElement
     * @param {mouse} mouse
     * @param {HTMLElement} element
     */
    Mouse.setElement = function(mouse, element) {
        mouse.element = element;

        element.addEventListener('mousemove', mouse.mousemove);
        element.addEventListener('mousedown', mouse.mousedown);
        element.addEventListener('mouseup', mouse.mouseup);
        
        element.addEventListener('mousewheel', mouse.mousewheel);
        element.addEventListener('DOMMouseScroll', mouse.mousewheel);

        element.addEventListener('touchmove', mouse.mousemove);
        element.addEventListener('touchstart', mouse.mousedown);
        element.addEventListener('touchend', mouse.mouseup);
    };

    /**
     * Clears all captured source events.
     * @method clearSourceEvents
     * @param {mouse} mouse
     */
    Mouse.clearSourceEvents = function(mouse) {
        mouse.sourceEvents.mousemove = null;
        mouse.sourceEvents.mousedown = null;
        mouse.sourceEvents.mouseup = null;
        mouse.sourceEvents.mousewheel = null;
        mouse.wheelDelta = 0;
    };

    /**
     * Sets the mouse position offset.
     * @method setOffset
     * @param {mouse} mouse
     * @param {vector} offset
     */
    Mouse.setOffset = function(mouse, offset) {
        mouse.offset.x = offset.x;
        mouse.offset.y = offset.y;
        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
    };

    /**
     * Sets the mouse position scale.
     * @method setScale
     * @param {mouse} mouse
     * @param {vector} scale
     */
    Mouse.setScale = function(mouse, scale) {
        mouse.scale.x = scale.x;
        mouse.scale.y = scale.y;
        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
    };
    
    /**
     * Gets the mouse position relative to an element given a screen pixel ratio.
     * @method _getRelativeMousePosition
     * @private
     * @param {} event
     * @param {} element
     * @param {number} pixelRatio
     * @return {}
     */
    var _getRelativeMousePosition = function(event, element, pixelRatio) {
        var elementBounds = element.getBoundingClientRect(),
            rootNode = (document.documentElement || document.body.parentNode || document.body),
            scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : rootNode.scrollLeft,
            scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : rootNode.scrollTop,
            touches = event.changedTouches,
            x, y;
        
        if (touches) {
            x = touches[0].pageX - elementBounds.left - scrollX;
            y = touches[0].pageY - elementBounds.top - scrollY;
        } else {
            x = event.pageX - elementBounds.left - scrollX;
            y = event.pageY - elementBounds.top - scrollY;
        }

        return { 
            x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
            y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
        };
    };

})();

},{"../core/Common":14}],20:[function(_dereq_,module,exports){
/**
* The `Matter.Plugin` module contains functions for registering and installing plugins on modules.
*
* @class Plugin
*/

var Plugin = {};

module.exports = Plugin;

var Common = _dereq_('./Common');

(function() {

    Plugin._registry = {};

    /**
     * Registers a plugin object so it can be resolved later by name.
     * @method register
     * @param plugin {} The plugin to register.
     * @return {object} The plugin.
     */
    Plugin.register = function(plugin) {
        if (!Plugin.isPlugin(plugin)) {
            Common.warn('Plugin.register:', Plugin.toString(plugin), 'does not implement all required fields.');
        }

        if (plugin.name in Plugin._registry) {
            var registered = Plugin._registry[plugin.name],
                pluginVersion = Plugin.versionParse(plugin.version).number,
                registeredVersion = Plugin.versionParse(registered.version).number;

            if (pluginVersion > registeredVersion) {
                Common.warn('Plugin.register:', Plugin.toString(registered), 'was upgraded to', Plugin.toString(plugin));
                Plugin._registry[plugin.name] = plugin;
            } else if (pluginVersion < registeredVersion) {
                Common.warn('Plugin.register:', Plugin.toString(registered), 'can not be downgraded to', Plugin.toString(plugin));
            } else if (plugin !== registered) {
                Common.warn('Plugin.register:', Plugin.toString(plugin), 'is already registered to different plugin object');
            }
        } else {
            Plugin._registry[plugin.name] = plugin;
        }

        return plugin;
    };

    /**
     * Resolves a dependency to a plugin object from the registry if it exists. 
     * The `dependency` may contain a version, but only the name matters when resolving.
     * @method resolve
     * @param dependency {string} The dependency.
     * @return {object} The plugin if resolved, otherwise `undefined`.
     */
    Plugin.resolve = function(dependency) {
        return Plugin._registry[Plugin.dependencyParse(dependency).name];
    };

    /**
     * Returns a pretty printed plugin name and version.
     * @method toString
     * @param plugin {} The plugin.
     * @return {string} Pretty printed plugin name and version.
     */
    Plugin.toString = function(plugin) {
        return typeof plugin === 'string' ? plugin : (plugin.name || 'anonymous') + '@' + (plugin.version || plugin.range || '0.0.0');
    };

    /**
     * Returns `true` if the object meets the minimum standard to be considered a plugin.
     * This means it must define the following properties:
     * - `name`
     * - `version`
     * - `install`
     * @method isPlugin
     * @param obj {} The obj to test.
     * @return {boolean} `true` if the object can be considered a plugin otherwise `false`.
     */
    Plugin.isPlugin = function(obj) {
        return obj && obj.name && obj.version && obj.install;
    };

    /**
     * Returns `true` if a plugin with the given `name` been installed on `module`.
     * @method isUsed
     * @param module {} The module.
     * @param name {string} The plugin name.
     * @return {boolean} `true` if a plugin with the given `name` been installed on `module`, otherwise `false`.
     */
    Plugin.isUsed = function(module, name) {
        return module.used.indexOf(name) > -1;
    };

    /**
     * Returns `true` if `plugin.for` is applicable to `module` by comparing against `module.name` and `module.version`.
     * If `plugin.for` is not specified then it is assumed to be applicable.
     * The value of `plugin.for` is a string of the format `'module-name'` or `'module-name@version'`.
     * @method isFor
     * @param plugin {} The plugin.
     * @param module {} The module.
     * @return {boolean} `true` if `plugin.for` is applicable to `module`, otherwise `false`.
     */
    Plugin.isFor = function(plugin, module) {
        var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
        return !plugin.for || (module.name === parsed.name && Plugin.versionSatisfies(module.version, parsed.range));
    };

    /**
     * Installs the plugins by calling `plugin.install` on each plugin specified in `plugins` if passed, otherwise `module.uses`.
     * For installing plugins on `Matter` see the convenience function `Matter.use`.
     * Plugins may be specified either by their name or a reference to the plugin object.
     * Plugins themselves may specify further dependencies, but each plugin is installed only once.
     * Order is important, a topological sort is performed to find the best resulting order of installation.
     * This sorting attempts to satisfy every dependency's requested ordering, but may not be exact in all cases.
     * This function logs the resulting status of each dependency in the console, along with any warnings.
     * - A green tick ✅ indicates a dependency was resolved and installed.
     * - An orange diamond 🔶 indicates a dependency was resolved but a warning was thrown for it or one if its dependencies.
     * - A red cross ❌ indicates a dependency could not be resolved.
     * Avoid calling this function multiple times on the same module unless you intend to manually control installation order.
     * @method use
     * @param module {} The module install plugins on.
     * @param [plugins=module.uses] {} The plugins to install on module (optional, defaults to `module.uses`).
     */
    Plugin.use = function(module, plugins) {
        module.uses = (module.uses || []).concat(plugins || []);

        if (module.uses.length === 0) {
            Common.warn('Plugin.use:', Plugin.toString(module), 'does not specify any dependencies to install.');
            return;
        }

        var dependencies = Plugin.dependencies(module),
            sortedDependencies = Common.topologicalSort(dependencies),
            status = [];

        for (var i = 0; i < sortedDependencies.length; i += 1) {
            if (sortedDependencies[i] === module.name) {
                continue;
            }

            var plugin = Plugin.resolve(sortedDependencies[i]);

            if (!plugin) {
                status.push('❌ ' + sortedDependencies[i]);
                continue;
            }

            if (Plugin.isUsed(module, plugin.name)) {
                continue;
            }

            if (!Plugin.isFor(plugin, module)) {
                Common.warn('Plugin.use:', Plugin.toString(plugin), 'is for', plugin.for, 'but installed on', Plugin.toString(module) + '.');
                plugin._warned = true;
            }

            if (plugin.install) {
                plugin.install(module);
            } else {
                Common.warn('Plugin.use:', Plugin.toString(plugin), 'does not specify an install function.');
                plugin._warned = true;
            }

            if (plugin._warned) {
                status.push('🔶 ' + Plugin.toString(plugin));
                delete plugin._warned;
            } else {
                status.push('✅ ' + Plugin.toString(plugin));
            }

            module.used.push(plugin.name);
        }

        if (status.length > 0) {
            Common.info(status.join('  '));
        }
    };

    /**
     * Recursively finds all of a module's dependencies and returns a flat dependency graph.
     * @method dependencies
     * @param module {} The module.
     * @return {object} A dependency graph.
     */
    Plugin.dependencies = function(module, tracked) {
        var parsedBase = Plugin.dependencyParse(module),
            name = parsedBase.name;

        tracked = tracked || {};

        if (name in tracked) {
            return;
        }

        module = Plugin.resolve(module) || module;

        tracked[name] = Common.map(module.uses || [], function(dependency) {
            if (Plugin.isPlugin(dependency)) {
                Plugin.register(dependency);
            }

            var parsed = Plugin.dependencyParse(dependency),
                resolved = Plugin.resolve(dependency);

            if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                Common.warn(
                    'Plugin.dependencies:', Plugin.toString(resolved), 'does not satisfy',
                    Plugin.toString(parsed), 'used by', Plugin.toString(parsedBase) + '.'
                );

                resolved._warned = true;
                module._warned = true;
            } else if (!resolved) {
                Common.warn(
                    'Plugin.dependencies:', Plugin.toString(dependency), 'used by',
                    Plugin.toString(parsedBase), 'could not be resolved.'
                );

                module._warned = true;
            }

            return parsed.name;
        });

        for (var i = 0; i < tracked[name].length; i += 1) {
            Plugin.dependencies(tracked[name][i], tracked);
        }

        return tracked;
    };

    /**
     * Parses a dependency string into its components.
     * The `dependency` is a string of the format `'module-name'` or `'module-name@version'`.
     * See documentation for `Plugin.versionParse` for a description of the format.
     * This function can also handle dependencies that are already resolved (e.g. a module object).
     * @method dependencyParse
     * @param dependency {string} The dependency of the format `'module-name'` or `'module-name@version'`.
     * @return {object} The dependency parsed into its components.
     */
    Plugin.dependencyParse = function(dependency) {
        if (Common.isString(dependency)) {
            var pattern = /^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-]+)?))?$/;

            if (!pattern.test(dependency)) {
                Common.warn('Plugin.dependencyParse:', dependency, 'is not a valid dependency string.');
            }

            return {
                name: dependency.split('@')[0],
                range: dependency.split('@')[1] || '*'
            };
        }

        return {
            name: dependency.name,
            range: dependency.range || dependency.version
        };
    };

    /**
     * Parses a version string into its components.  
     * Versions are strictly of the format `x.y.z` (as in [semver](http://semver.org/)).
     * Versions may optionally have a prerelease tag in the format `x.y.z-alpha`.
     * Ranges are a strict subset of [npm ranges](https://docs.npmjs.com/misc/semver#advanced-range-syntax).
     * Only the following range types are supported:
     * - Tilde ranges e.g. `~1.2.3`
     * - Caret ranges e.g. `^1.2.3`
     * - Exact version e.g. `1.2.3`
     * - Any version `*`
     * @method versionParse
     * @param range {string} The version string.
     * @return {object} The version range parsed into its components.
     */
    Plugin.versionParse = function(range) {
        var pattern = /^\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-]+)?$/;

        if (!pattern.test(range)) {
            Common.warn('Plugin.versionParse:', range, 'is not a valid version or range.');
        }

        var identifiers = range.split('-');
        range = identifiers[0];

        var isRange = isNaN(Number(range[0])),
            version = isRange ? range.substr(1) : range,
            parts = Common.map(version.split('.'), function(part) {
                return Number(part);
            });

        return {
            isRange: isRange,
            version: version,
            range: range,
            operator: isRange ? range[0] : '',
            parts: parts,
            prerelease: identifiers[1],
            number: parts[0] * 1e8 + parts[1] * 1e4 + parts[2]
        };
    };

    /**
     * Returns `true` if `version` satisfies the given `range`.
     * See documentation for `Plugin.versionParse` for a description of the format.
     * If a version or range is not specified, then any version (`*`) is assumed to satisfy.
     * @method versionSatisfies
     * @param version {string} The version string.
     * @param range {string} The range string.
     * @return {boolean} `true` if `version` satisfies `range`, otherwise `false`.
     */
    Plugin.versionSatisfies = function(version, range) {
        range = range || '*';

        var rangeParsed = Plugin.versionParse(range),
            rangeParts = rangeParsed.parts,
            versionParsed = Plugin.versionParse(version),
            versionParts = versionParsed.parts;

        if (rangeParsed.isRange) {
            if (rangeParsed.operator === '*' || version === '*') {
                return true;
            }

            if (rangeParsed.operator === '~') {
                return versionParts[0] === rangeParts[0] && versionParts[1] === rangeParts[1] && versionParts[2] >= rangeParts[2];
            }

            if (rangeParsed.operator === '^') {
                if (rangeParts[0] > 0) {
                    return versionParts[0] === rangeParts[0] && versionParsed.number >= rangeParsed.number;
                }

                if (rangeParts[1] > 0) {
                    return versionParts[1] === rangeParts[1] && versionParts[2] >= rangeParts[2];
                }

                return versionParts[2] === rangeParts[2];
            }
        }

        return version === range || version === '*';
    };

})();

},{"./Common":14}],21:[function(_dereq_,module,exports){
/**
* The `Matter.Runner` module is an optional utility which provides a game loop, 
* that handles continuously updating a `Matter.Engine` for you within a browser.
* It is intended for development and debugging purposes, but may also be suitable for simple games.
* If you are using your own game loop instead, then you do not need the `Matter.Runner` module.
* Instead just call `Engine.update(engine, delta)` in your own loop.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Runner
*/

var Runner = {};

module.exports = Runner;

var Events = _dereq_('./Events');
var Engine = _dereq_('./Engine');
var Common = _dereq_('./Common');

(function() {

    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (typeof window !== 'undefined') {
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
   
        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }

    if (!_requestAnimationFrame) {
        var _frameTimeout;

        _requestAnimationFrame = function(callback){ 
            _frameTimeout = setTimeout(function() { 
                callback(Common.now()); 
            }, 1000 / 60);
        };

        _cancelAnimationFrame = function() {
            clearTimeout(_frameTimeout);
        };
    }

    /**
     * Creates a new Runner. The options parameter is an object that specifies any properties you wish to override the defaults.
     * @method create
     * @param {} options
     */
    Runner.create = function(options) {
        var defaults = {
            fps: 60,
            correction: 1,
            deltaSampleSize: 60,
            counterTimestamp: 0,
            frameCounter: 0,
            deltaHistory: [],
            timePrev: null,
            timeScalePrev: 1,
            frameRequestId: null,
            isFixed: false,
            enabled: true
        };

        var runner = Common.extend(defaults, options);

        runner.delta = runner.delta || 1000 / runner.fps;
        runner.deltaMin = runner.deltaMin || 1000 / runner.fps;
        runner.deltaMax = runner.deltaMax || 1000 / (runner.fps * 0.5);
        runner.fps = 1000 / runner.delta;

        return runner;
    };

    /**
     * Continuously ticks a `Matter.Engine` by calling `Runner.tick` on the `requestAnimationFrame` event.
     * @method run
     * @param {engine} engine
     */
    Runner.run = function(runner, engine) {
        // create runner if engine is first argument
        if (typeof runner.positionIterations !== 'undefined') {
            engine = runner;
            runner = Runner.create();
        }

        (function render(time){
            runner.frameRequestId = _requestAnimationFrame(render);

            if (time && runner.enabled) {
                Runner.tick(runner, engine, time);
            }
        })();

        return runner;
    };

    /**
     * A game loop utility that updates the engine and renderer by one step (a 'tick').
     * Features delta smoothing, time correction and fixed or dynamic timing.
     * Triggers `beforeTick`, `tick` and `afterTick` events on the engine.
     * Consider just `Engine.update(engine, delta)` if you're using your own loop.
     * @method tick
     * @param {runner} runner
     * @param {engine} engine
     * @param {number} time
     */
    Runner.tick = function(runner, engine, time) {
        var timing = engine.timing,
            correction = 1,
            delta;

        // create an event object
        var event = {
            timestamp: timing.timestamp
        };

        Events.trigger(runner, 'beforeTick', event);
        Events.trigger(engine, 'beforeTick', event); // @deprecated

        if (runner.isFixed) {
            // fixed timestep
            delta = runner.delta;
        } else {
            // dynamic timestep based on wall clock between calls
            delta = (time - runner.timePrev) || runner.delta;
            runner.timePrev = time;

            // optimistically filter delta over a few frames, to improve stability
            runner.deltaHistory.push(delta);
            runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);
            delta = Math.min.apply(null, runner.deltaHistory);
            
            // limit delta
            delta = delta < runner.deltaMin ? runner.deltaMin : delta;
            delta = delta > runner.deltaMax ? runner.deltaMax : delta;

            // correction for delta
            correction = delta / runner.delta;

            // update engine timing object
            runner.delta = delta;
        }

        // time correction for time scaling
        if (runner.timeScalePrev !== 0)
            correction *= timing.timeScale / runner.timeScalePrev;

        if (timing.timeScale === 0)
            correction = 0;

        runner.timeScalePrev = timing.timeScale;
        runner.correction = correction;

        // fps counter
        runner.frameCounter += 1;
        if (time - runner.counterTimestamp >= 1000) {
            runner.fps = runner.frameCounter * ((time - runner.counterTimestamp) / 1000);
            runner.counterTimestamp = time;
            runner.frameCounter = 0;
        }

        Events.trigger(runner, 'tick', event);
        Events.trigger(engine, 'tick', event); // @deprecated

        // if world has been modified, clear the render scene graph
        if (engine.world.isModified 
            && engine.render
            && engine.render.controller
            && engine.render.controller.clear) {
            engine.render.controller.clear(engine.render); // @deprecated
        }

        // update
        Events.trigger(runner, 'beforeUpdate', event);
        Engine.update(engine, delta, correction);
        Events.trigger(runner, 'afterUpdate', event);

        // render
        // @deprecated
        if (engine.render && engine.render.controller) {
            Events.trigger(runner, 'beforeRender', event);
            Events.trigger(engine, 'beforeRender', event); // @deprecated

            engine.render.controller.world(engine.render);

            Events.trigger(runner, 'afterRender', event);
            Events.trigger(engine, 'afterRender', event); // @deprecated
        }

        Events.trigger(runner, 'afterTick', event);
        Events.trigger(engine, 'afterTick', event); // @deprecated
    };

    /**
     * Ends execution of `Runner.run` on the given `runner`, by canceling the animation frame request event loop.
     * If you wish to only temporarily pause the engine, see `engine.enabled` instead.
     * @method stop
     * @param {runner} runner
     */
    Runner.stop = function(runner) {
        _cancelAnimationFrame(runner.frameRequestId);
    };

    /**
     * Alias for `Runner.run`.
     * @method start
     * @param {runner} runner
     * @param {engine} engine
     */
    Runner.start = function(runner, engine) {
        Runner.run(runner, engine);
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired at the start of a tick, before any updates to the engine or timing
    *
    * @event beforeTick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine timing updated, but just before update
    *
    * @event tick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired at the end of a tick, after engine update and after rendering
    *
    * @event afterTick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired before update
    *
    * @event beforeUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after update
    *
    * @event afterUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired before rendering
    *
    * @event beforeRender
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    * @deprecated
    */

    /**
    * Fired after rendering
    *
    * @event afterRender
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    * @deprecated
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * A flag that specifies whether the runner is running or not.
     *
     * @property enabled
     * @type boolean
     * @default true
     */

    /**
     * A `Boolean` that specifies if the runner should use a fixed timestep (otherwise it is variable).
     * If timing is fixed, then the apparent simulation speed will change depending on the frame rate (but behaviour will be deterministic).
     * If the timing is variable, then the apparent simulation speed will be constant (approximately, but at the cost of determininism).
     *
     * @property isFixed
     * @type boolean
     * @default false
     */

    /**
     * A `Number` that specifies the time step between updates in milliseconds.
     * If `engine.timing.isFixed` is set to `true`, then `delta` is fixed.
     * If it is `false`, then `delta` can dynamically change to maintain the correct apparent simulation speed.
     *
     * @property delta
     * @type number
     * @default 1000 / 60
     */

})();

},{"./Common":14,"./Engine":15,"./Events":16}],22:[function(_dereq_,module,exports){
/**
* The `Matter.Sleeping` module contains methods to manage the sleeping state of bodies.
*
* @class Sleeping
*/

var Sleeping = {};

module.exports = Sleeping;

var Events = _dereq_('./Events');

(function() {

    Sleeping._motionWakeThreshold = 0.18;
    Sleeping._motionSleepThreshold = 0.08;
    Sleeping._minBias = 0.9;

    /**
     * Puts bodies to sleep or wakes them up depending on their motion.
     * @method update
     * @param {body[]} bodies
     * @param {number} timeScale
     */
    Sleeping.update = function(bodies, timeScale) {
        var timeFactor = timeScale * timeScale * timeScale;

        // update bodies sleeping status
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;

            // wake up bodies if they have a force applied
            if (body.force.x !== 0 || body.force.y !== 0) {
                Sleeping.set(body, false);
                continue;
            }

            var minMotion = Math.min(body.motion, motion),
                maxMotion = Math.max(body.motion, motion);
        
            // biased average motion estimation between frames
            body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
            
            if (body.sleepThreshold > 0 && body.motion < Sleeping._motionSleepThreshold * timeFactor) {
                body.sleepCounter += 1;
                
                if (body.sleepCounter >= body.sleepThreshold)
                    Sleeping.set(body, true);
            } else if (body.sleepCounter > 0) {
                body.sleepCounter -= 1;
            }
        }
    };

    /**
     * Given a set of colliding pairs, wakes the sleeping bodies involved.
     * @method afterCollisions
     * @param {pair[]} pairs
     * @param {number} timeScale
     */
    Sleeping.afterCollisions = function(pairs, timeScale) {
        var timeFactor = timeScale * timeScale * timeScale;

        // wake up bodies involved in collisions
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            
            // don't wake inactive pairs
            if (!pair.isActive)
                continue;

            var collision = pair.collision,
                bodyA = collision.bodyA.parent, 
                bodyB = collision.bodyB.parent;
        
            // don't wake if at least one body is static
            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
                continue;
        
            if (bodyA.isSleeping || bodyB.isSleeping) {
                var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;

                if (!sleepingBody.isStatic && movingBody.motion > Sleeping._motionWakeThreshold * timeFactor) {
                    Sleeping.set(sleepingBody, false);
                }
            }
        }
    };
  
    /**
     * Set a body as sleeping or awake.
     * @method set
     * @param {body} body
     * @param {boolean} isSleeping
     */
    Sleeping.set = function(body, isSleeping) {
        var wasSleeping = body.isSleeping;

        if (isSleeping) {
            body.isSleeping = true;
            body.sleepCounter = body.sleepThreshold;

            body.positionImpulse.x = 0;
            body.positionImpulse.y = 0;

            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;

            body.anglePrev = body.angle;
            body.speed = 0;
            body.angularSpeed = 0;
            body.motion = 0;

            if (!wasSleeping) {
                Events.trigger(body, 'sleepStart');
            }
        } else {
            body.isSleeping = false;
            body.sleepCounter = 0;

            if (wasSleeping) {
                Events.trigger(body, 'sleepEnd');
            }
        }
    };

})();

},{"./Events":16}],23:[function(_dereq_,module,exports){
/**
* The `Matter.Bodies` module contains factory methods for creating rigid body models 
* with commonly used body configurations (such as rectangles, circles and other polygons).
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Bodies
*/

// TODO: true circle bodies

var Bodies = {};

module.exports = Bodies;

var Vertices = _dereq_('../geometry/Vertices');
var Common = _dereq_('../core/Common');
var Body = _dereq_('../body/Body');
var Bounds = _dereq_('../geometry/Bounds');
var Vector = _dereq_('../geometry/Vector');

(function() {

    /**
     * Creates a new rigid body model with a rectangle hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method rectangle
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {object} [options]
     * @return {body} A new rectangle body
     */
    Bodies.rectangle = function(x, y, width, height, options) {
        options = options || {};

        var rectangle = { 
            label: 'Rectangle Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            rectangle.vertices = Vertices.chamfer(rectangle.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, rectangle, options));
    };
    
    /**
     * Creates a new rigid body model with a trapezoid hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method trapezoid
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} slope
     * @param {object} [options]
     * @return {body} A new trapezoid body
     */
    Bodies.trapezoid = function(x, y, width, height, slope, options) {
        options = options || {};

        slope *= 0.5;
        var roof = (1 - (slope * 2)) * width;
        
        var x1 = width * slope,
            x2 = x1 + roof,
            x3 = x2 + x1,
            verticesPath;

        if (slope < 0.5) {
            verticesPath = 'L 0 0 L ' + x1 + ' ' + (-height) + ' L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';
        } else {
            verticesPath = 'L 0 0 L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';
        }

        var trapezoid = { 
            label: 'Trapezoid Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath(verticesPath)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            trapezoid.vertices = Vertices.chamfer(trapezoid.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, trapezoid, options));
    };

    /**
     * Creates a new rigid body model with a circle hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method circle
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {object} [options]
     * @param {number} [maxSides]
     * @return {body} A new circle body
     */
    Bodies.circle = function(x, y, radius, options, maxSides) {
        options = options || {};

        var circle = {
            label: 'Circle Body',
            circleRadius: radius
        };
        
        // approximate circles with polygons until true circles implemented in SAT
        maxSides = maxSides || 25;
        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

        // optimisation: always use even number of sides (half the number of unique axes)
        if (sides % 2 === 1)
            sides += 1;

        return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
    };

    /**
     * Creates a new rigid body model with a regular polygon hull with the given number of sides. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method polygon
     * @param {number} x
     * @param {number} y
     * @param {number} sides
     * @param {number} radius
     * @param {object} [options]
     * @return {body} A new regular polygon body
     */
    Bodies.polygon = function(x, y, sides, radius, options) {
        options = options || {};

        if (sides < 3)
            return Bodies.circle(x, y, radius, options);

        var theta = 2 * Math.PI / sides,
            path = '',
            offset = theta * 0.5;

        for (var i = 0; i < sides; i += 1) {
            var angle = offset + (i * theta),
                xx = Math.cos(angle) * radius,
                yy = Math.sin(angle) * radius;

            path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
        }

        var polygon = { 
            label: 'Polygon Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath(path)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, polygon, options));
    };

    /**
     * Creates a body using the supplied vertices (or an array containing multiple sets of vertices).
     * If the vertices are convex, they will pass through as supplied.
     * Otherwise if the vertices are concave, they will be decomposed if [poly-decomp.js](https://github.com/schteppe/poly-decomp.js) is available.
     * Note that this process is not guaranteed to support complex sets of vertices (e.g. those with holes may fail).
     * By default the decomposition will discard collinear edges (to improve performance).
     * It can also optionally discard any parts that have an area less than `minimumArea`.
     * If the vertices can not be decomposed, the result will fall back to using the convex hull.
     * The options parameter is an object that specifies any `Matter.Body` properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method fromVertices
     * @param {number} x
     * @param {number} y
     * @param [[vector]] vertexSets
     * @param {object} [options]
     * @param {bool} [flagInternal=false]
     * @param {number} [removeCollinear=0.01]
     * @param {number} [minimumArea=10]
     * @return {body}
     */
    Bodies.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea) {
        var body,
            parts,
            isConvex,
            vertices,
            i,
            j,
            k,
            v,
            z;

        options = options || {};
        parts = [];

        flagInternal = typeof flagInternal !== 'undefined' ? flagInternal : false;
        removeCollinear = typeof removeCollinear !== 'undefined' ? removeCollinear : 0.01;
        minimumArea = typeof minimumArea !== 'undefined' ? minimumArea : 10;

        if (!window.decomp) {
            Common.warn('Bodies.fromVertices: poly-decomp.js required. Could not decompose vertices. Fallback to convex hull.');
        }

        // ensure vertexSets is an array of arrays
        if (!Common.isArray(vertexSets[0])) {
            vertexSets = [vertexSets];
        }

        for (v = 0; v < vertexSets.length; v += 1) {
            vertices = vertexSets[v];
            isConvex = Vertices.isConvex(vertices);

            if (isConvex || !window.decomp) {
                if (isConvex) {
                    vertices = Vertices.clockwiseSort(vertices);
                } else {
                    // fallback to convex hull when decomposition is not possible
                    vertices = Vertices.hull(vertices);
                }

                parts.push({
                    position: { x: x, y: y },
                    vertices: vertices
                });
            } else {
                // initialise a decomposition
                var concave = new decomp.Polygon();
                for (i = 0; i < vertices.length; i++) {
                    concave.vertices.push([vertices[i].x, vertices[i].y]);
                }

                // vertices are concave and simple, we can decompose into parts
                concave.makeCCW();
                if (removeCollinear !== false)
                    concave.removeCollinearPoints(removeCollinear);

                // use the quick decomposition algorithm (Bayazit)
                var decomposed = concave.quickDecomp();

                // for each decomposed chunk
                for (i = 0; i < decomposed.length; i++) {
                    var chunk = decomposed[i],
                        chunkVertices = [];

                    // convert vertices into the correct structure
                    for (j = 0; j < chunk.vertices.length; j++) {
                        chunkVertices.push({ x: chunk.vertices[j][0], y: chunk.vertices[j][1] });
                    }

                    // skip small chunks
                    if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
                        continue;

                    // create a compound part
                    parts.push({
                        position: Vertices.centre(chunkVertices),
                        vertices: chunkVertices
                    });
                }
            }
        }

        // create body parts
        for (i = 0; i < parts.length; i++) {
            parts[i] = Body.create(Common.extend(parts[i], options));
        }

        // flag internal edges (coincident part edges)
        if (flagInternal) {
            var coincident_max_dist = 5;

            for (i = 0; i < parts.length; i++) {
                var partA = parts[i];

                for (j = i + 1; j < parts.length; j++) {
                    var partB = parts[j];

                    if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                        var pav = partA.vertices,
                            pbv = partB.vertices;

                        // iterate vertices of both parts
                        for (k = 0; k < partA.vertices.length; k++) {
                            for (z = 0; z < partB.vertices.length; z++) {
                                // find distances between the vertices
                                var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])),
                                    db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));

                                // if both vertices are very close, consider the edge concident (internal)
                                if (da < coincident_max_dist && db < coincident_max_dist) {
                                    pav[k].isInternal = true;
                                    pbv[z].isInternal = true;
                                }
                            }
                        }

                    }
                }
            }
        }

        if (parts.length > 1) {
            // create the parent body to be returned, that contains generated compound parts
            body = Body.create(Common.extend({ parts: parts.slice(0) }, options));
            Body.setPosition(body, { x: x, y: y });

            return body;
        } else {
            return parts[0];
        }
    };

})();
},{"../body/Body":1,"../core/Common":14,"../geometry/Bounds":26,"../geometry/Vector":28,"../geometry/Vertices":29}],24:[function(_dereq_,module,exports){
/**
* The `Matter.Composites` module contains factory methods for creating composite bodies
* with commonly used configurations (such as stacks and chains).
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Composites
*/

var Composites = {};

module.exports = Composites;

var Composite = _dereq_('../body/Composite');
var Constraint = _dereq_('../constraint/Constraint');
var Common = _dereq_('../core/Common');
var Body = _dereq_('../body/Body');
var Bodies = _dereq_('./Bodies');

(function() {

    /**
     * Create a new composite containing bodies created in the callback in a grid arrangement.
     * This function uses the body's bounds to prevent overlaps.
     * @method stack
     * @param {number} xx
     * @param {number} yy
     * @param {number} columns
     * @param {number} rows
     * @param {number} columnGap
     * @param {number} rowGap
     * @param {function} callback
     * @return {composite} A new composite containing objects created in the callback
     */
    Composites.stack = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
        var stack = Composite.create({ label: 'Stack' }),
            x = xx,
            y = yy,
            lastBody,
            i = 0;

        for (var row = 0; row < rows; row++) {
            var maxHeight = 0;
            
            for (var column = 0; column < columns; column++) {
                var body = callback(x, y, column, row, lastBody, i);
                    
                if (body) {
                    var bodyHeight = body.bounds.max.y - body.bounds.min.y,
                        bodyWidth = body.bounds.max.x - body.bounds.min.x; 

                    if (bodyHeight > maxHeight)
                        maxHeight = bodyHeight;
                    
                    Body.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });

                    x = body.bounds.max.x + columnGap;

                    Composite.addBody(stack, body);
                    
                    lastBody = body;
                    i += 1;
                } else {
                    x += columnGap;
                }
            }
            
            y += maxHeight + rowGap;
            x = xx;
        }

        return stack;
    };
    
    /**
     * Chains all bodies in the given composite together using constraints.
     * @method chain
     * @param {composite} composite
     * @param {number} xOffsetA
     * @param {number} yOffsetA
     * @param {number} xOffsetB
     * @param {number} yOffsetB
     * @param {object} options
     * @return {composite} A new composite containing objects chained together with constraints
     */
    Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
        var bodies = composite.bodies;
        
        for (var i = 1; i < bodies.length; i++) {
            var bodyA = bodies[i - 1],
                bodyB = bodies[i],
                bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,
                bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, 
                bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,
                bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
        
            var defaults = {
                bodyA: bodyA,
                pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                bodyB: bodyB,
                pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
            };
            
            var constraint = Common.extend(defaults, options);
        
            Composite.addConstraint(composite, Constraint.create(constraint));
        }

        composite.label += ' Chain';
        
        return composite;
    };

    /**
     * Connects bodies in the composite with constraints in a grid pattern, with optional cross braces.
     * @method mesh
     * @param {composite} composite
     * @param {number} columns
     * @param {number} rows
     * @param {boolean} crossBrace
     * @param {object} options
     * @return {composite} The composite containing objects meshed together with constraints
     */
    Composites.mesh = function(composite, columns, rows, crossBrace, options) {
        var bodies = composite.bodies,
            row,
            col,
            bodyA,
            bodyB,
            bodyC;
        
        for (row = 0; row < rows; row++) {
            for (col = 1; col < columns; col++) {
                bodyA = bodies[(col - 1) + (row * columns)];
                bodyB = bodies[col + (row * columns)];
                Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));
            }

            if (row > 0) {
                for (col = 0; col < columns; col++) {
                    bodyA = bodies[col + ((row - 1) * columns)];
                    bodyB = bodies[col + (row * columns)];
                    Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));

                    if (crossBrace && col > 0) {
                        bodyC = bodies[(col - 1) + ((row - 1) * columns)];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));
                    }

                    if (crossBrace && col < columns - 1) {
                        bodyC = bodies[(col + 1) + ((row - 1) * columns)];
                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));
                    }
                }
            }
        }

        composite.label += ' Mesh';
        
        return composite;
    };
    
    /**
     * Create a new composite containing bodies created in the callback in a pyramid arrangement.
     * This function uses the body's bounds to prevent overlaps.
     * @method pyramid
     * @param {number} xx
     * @param {number} yy
     * @param {number} columns
     * @param {number} rows
     * @param {number} columnGap
     * @param {number} rowGap
     * @param {function} callback
     * @return {composite} A new composite containing objects created in the callback
     */
    Composites.pyramid = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
        return Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y, column, row, lastBody, i) {
            var actualRows = Math.min(rows, Math.ceil(columns / 2)),
                lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
            
            if (row > actualRows)
                return;
            
            // reverse row order
            row = actualRows - row;
            
            var start = row,
                end = columns - 1 - row;

            if (column < start || column > end)
                return;
            
            // retroactively fix the first body's position, since width was unknown
            if (i === 1) {
                Body.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
            }

            var xOffset = lastBody ? column * lastBodyWidth : 0;
            
            return callback(xx + xOffset + column * columnGap, y, column, row, lastBody, i);
        });
    };

    /**
     * Creates a composite with a Newton's Cradle setup of bodies and constraints.
     * @method newtonsCradle
     * @param {number} xx
     * @param {number} yy
     * @param {number} number
     * @param {number} size
     * @param {number} length
     * @return {composite} A new composite newtonsCradle body
     */
    Composites.newtonsCradle = function(xx, yy, number, size, length) {
        var newtonsCradle = Composite.create({ label: 'Newtons Cradle' });

        for (var i = 0; i < number; i++) {
            var separation = 1.9,
                circle = Bodies.circle(xx + i * (size * separation), yy + length, size, 
                            { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0.0001, slop: 1 }),
                constraint = Constraint.create({ pointA: { x: xx + i * (size * separation), y: yy }, bodyB: circle });

            Composite.addBody(newtonsCradle, circle);
            Composite.addConstraint(newtonsCradle, constraint);
        }

        return newtonsCradle;
    };
    
    /**
     * Creates a composite with simple car setup of bodies and constraints.
     * @method car
     * @param {number} xx
     * @param {number} yy
     * @param {number} width
     * @param {number} height
     * @param {number} wheelSize
     * @return {composite} A new composite car body
     */
    Composites.car = function(xx, yy, width, height, wheelSize) {
        var group = Body.nextGroup(true),
            wheelBase = -20,
            wheelAOffset = -width * 0.5 + wheelBase,
            wheelBOffset = width * 0.5 - wheelBase,
            wheelYOffset = 0;
    
        var car = Composite.create({ label: 'Car' }),
            body = Bodies.trapezoid(xx, yy, width, height, 0.3, { 
                collisionFilter: {
                    group: group
                },
                friction: 0.01,
                chamfer: {
                    radius: 10
                }
            });
    
        var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { 
            collisionFilter: {
                group: group
            },
            friction: 0.8,
            density: 0.01
        });
                    
        var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { 
            collisionFilter: {
                group: group
            },
            friction: 0.8,
            density: 0.01
        });
                    
        var axelA = Constraint.create({
            bodyA: body,
            pointA: { x: wheelAOffset, y: wheelYOffset },
            bodyB: wheelA,
            stiffness: 0.2
        });
                        
        var axelB = Constraint.create({
            bodyA: body,
            pointA: { x: wheelBOffset, y: wheelYOffset },
            bodyB: wheelB,
            stiffness: 0.2
        });
        
        Composite.addBody(car, body);
        Composite.addBody(car, wheelA);
        Composite.addBody(car, wheelB);
        Composite.addConstraint(car, axelA);
        Composite.addConstraint(car, axelB);

        return car;
    };

    /**
     * Creates a simple soft body like object.
     * @method softBody
     * @param {number} xx
     * @param {number} yy
     * @param {number} columns
     * @param {number} rows
     * @param {number} columnGap
     * @param {number} rowGap
     * @param {boolean} crossBrace
     * @param {number} particleRadius
     * @param {} particleOptions
     * @param {} constraintOptions
     * @return {composite} A new composite softBody
     */
    Composites.softBody = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
        particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
        constraintOptions = Common.extend({ stiffness: 0.4 }, constraintOptions);

        var softBody = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y) {
            return Bodies.circle(x, y, particleRadius, particleOptions);
        });

        Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);

        softBody.label = 'Soft Body';

        return softBody;
    };

})();

},{"../body/Body":1,"../body/Composite":2,"../constraint/Constraint":12,"../core/Common":14,"./Bodies":23}],25:[function(_dereq_,module,exports){
/**
* The `Matter.Axes` module contains methods for creating and manipulating sets of axes.
*
* @class Axes
*/

var Axes = {};

module.exports = Axes;

var Vector = _dereq_('../geometry/Vector');
var Common = _dereq_('../core/Common');

(function() {

    /**
     * Creates a new set of axes from the given vertices.
     * @method fromVertices
     * @param {vertices} vertices
     * @return {axes} A new axes from the given vertices
     */
    Axes.fromVertices = function(vertices) {
        var axes = {};

        // find the unique axes, using edge normal gradients
        for (var i = 0; i < vertices.length; i++) {
            var j = (i + 1) % vertices.length, 
                normal = Vector.normalise({ 
                    x: vertices[j].y - vertices[i].y, 
                    y: vertices[i].x - vertices[j].x
                }),
                gradient = (normal.y === 0) ? Infinity : (normal.x / normal.y);
            
            // limit precision
            gradient = gradient.toFixed(3).toString();
            axes[gradient] = normal;
        }

        return Common.values(axes);
    };

    /**
     * Rotates a set of axes by the given angle.
     * @method rotate
     * @param {axes} axes
     * @param {number} angle
     */
    Axes.rotate = function(axes, angle) {
        if (angle === 0)
            return;
        
        var cos = Math.cos(angle),
            sin = Math.sin(angle);

        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i],
                xx;
            xx = axis.x * cos - axis.y * sin;
            axis.y = axis.x * sin + axis.y * cos;
            axis.x = xx;
        }
    };

})();

},{"../core/Common":14,"../geometry/Vector":28}],26:[function(_dereq_,module,exports){
/**
* The `Matter.Bounds` module contains methods for creating and manipulating axis-aligned bounding boxes (AABB).
*
* @class Bounds
*/

var Bounds = {};

module.exports = Bounds;

(function() {

    /**
     * Creates a new axis-aligned bounding box (AABB) for the given vertices.
     * @method create
     * @param {vertices} vertices
     * @return {bounds} A new bounds object
     */
    Bounds.create = function(vertices) {
        var bounds = { 
            min: { x: 0, y: 0 }, 
            max: { x: 0, y: 0 }
        };

        if (vertices)
            Bounds.update(bounds, vertices);
        
        return bounds;
    };

    /**
     * Updates bounds using the given vertices and extends the bounds given a velocity.
     * @method update
     * @param {bounds} bounds
     * @param {vertices} vertices
     * @param {vector} velocity
     */
    Bounds.update = function(bounds, vertices, velocity) {
        bounds.min.x = Infinity;
        bounds.max.x = -Infinity;
        bounds.min.y = Infinity;
        bounds.max.y = -Infinity;

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
            if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
            if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
            if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
        }
        
        if (velocity) {
            if (velocity.x > 0) {
                bounds.max.x += velocity.x;
            } else {
                bounds.min.x += velocity.x;
            }
            
            if (velocity.y > 0) {
                bounds.max.y += velocity.y;
            } else {
                bounds.min.y += velocity.y;
            }
        }
    };

    /**
     * Returns true if the bounds contains the given point.
     * @method contains
     * @param {bounds} bounds
     * @param {vector} point
     * @return {boolean} True if the bounds contain the point, otherwise false
     */
    Bounds.contains = function(bounds, point) {
        return point.x >= bounds.min.x && point.x <= bounds.max.x 
               && point.y >= bounds.min.y && point.y <= bounds.max.y;
    };

    /**
     * Returns true if the two bounds intersect.
     * @method overlaps
     * @param {bounds} boundsA
     * @param {bounds} boundsB
     * @return {boolean} True if the bounds overlap, otherwise false
     */
    Bounds.overlaps = function(boundsA, boundsB) {
        return (boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x
                && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y);
    };

    /**
     * Translates the bounds by the given vector.
     * @method translate
     * @param {bounds} bounds
     * @param {vector} vector
     */
    Bounds.translate = function(bounds, vector) {
        bounds.min.x += vector.x;
        bounds.max.x += vector.x;
        bounds.min.y += vector.y;
        bounds.max.y += vector.y;
    };

    /**
     * Shifts the bounds to the given position.
     * @method shift
     * @param {bounds} bounds
     * @param {vector} position
     */
    Bounds.shift = function(bounds, position) {
        var deltaX = bounds.max.x - bounds.min.x,
            deltaY = bounds.max.y - bounds.min.y;
            
        bounds.min.x = position.x;
        bounds.max.x = position.x + deltaX;
        bounds.min.y = position.y;
        bounds.max.y = position.y + deltaY;
    };
    
})();

},{}],27:[function(_dereq_,module,exports){
/**
* The `Matter.Svg` module contains methods for converting SVG images into an array of vector points.
*
* To use this module you also need the SVGPathSeg polyfill: https://github.com/progers/pathseg
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Svg
*/

var Svg = {};

module.exports = Svg;

var Bounds = _dereq_('../geometry/Bounds');

(function() {

    /**
     * Converts an SVG path into an array of vector points.
     * If the input path forms a concave shape, you must decompose the result into convex parts before use.
     * See `Bodies.fromVertices` which provides support for this.
     * Note that this function is not guaranteed to support complex paths (such as those with holes).
     * @method pathToVertices
     * @param {SVGPathElement} path
     * @param {Number} [sampleLength=15]
     * @return {Vector[]} points
     */
    Svg.pathToVertices = function(path, sampleLength) {
        // https://github.com/wout/svg.topoly.js/blob/master/svg.topoly.js
        var i, il, total, point, segment, segments, 
            segmentsQueue, lastSegment, 
            lastPoint, segmentIndex, points = [],
            lx, ly, length = 0, x = 0, y = 0;

        sampleLength = sampleLength || 15;

        var addPoint = function(px, py, pathSegType) {
            // all odd-numbered path types are relative except PATHSEG_CLOSEPATH (1)
            var isRelative = pathSegType % 2 === 1 && pathSegType > 1;

            // when the last point doesn't equal the current point add the current point
            if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {
                if (lastPoint && isRelative) {
                    lx = lastPoint.x;
                    ly = lastPoint.y;
                } else {
                    lx = 0;
                    ly = 0;
                }

                var point = {
                    x: lx + px,
                    y: ly + py
                };

                // set last point
                if (isRelative || !lastPoint) {
                    lastPoint = point;
                }

                points.push(point);

                x = lx + px;
                y = ly + py;
            }
        };

        var addSegmentPoint = function(segment) {
            var segType = segment.pathSegTypeAsLetter.toUpperCase();

            // skip path ends
            if (segType === 'Z') 
                return;

            // map segment to x and y
            switch (segType) {

            case 'M':
            case 'L':
            case 'T':
            case 'C':
            case 'S':
            case 'Q':
                x = segment.x;
                y = segment.y;
                break;
            case 'H':
                x = segment.x;
                break;
            case 'V':
                y = segment.y;
                break;
            }

            addPoint(x, y, segment.pathSegType);
        };

        // ensure path is absolute
        _svgPathToAbsolute(path);

        // get total length
        total = path.getTotalLength();

        // queue segments
        segments = [];
        for (i = 0; i < path.pathSegList.numberOfItems; i += 1)
            segments.push(path.pathSegList.getItem(i));

        segmentsQueue = segments.concat();

        // sample through path
        while (length < total) {
            // get segment at position
            segmentIndex = path.getPathSegAtLength(length);
            segment = segments[segmentIndex];

            // new segment
            if (segment != lastSegment) {
                while (segmentsQueue.length && segmentsQueue[0] != segment)
                    addSegmentPoint(segmentsQueue.shift());

                lastSegment = segment;
            }

            // add points in between when curving
            // TODO: adaptive sampling
            switch (segment.pathSegTypeAsLetter.toUpperCase()) {

            case 'C':
            case 'T':
            case 'S':
            case 'Q':
            case 'A':
                point = path.getPointAtLength(length);
                addPoint(point.x, point.y, 0);
                break;

            }

            // increment by sample value
            length += sampleLength;
        }

        // add remaining segments not passed by sampling
        for (i = 0, il = segmentsQueue.length; i < il; ++i)
            addSegmentPoint(segmentsQueue[i]);

        return points;
    };

    var _svgPathToAbsolute = function(path) {
        // http://phrogz.net/convert-svg-path-to-all-absolute-commands
        var x0, y0, x1, y1, x2, y2, segs = path.pathSegList,
            x = 0, y = 0, len = segs.numberOfItems;

        for (var i = 0; i < len; ++i) {
            var seg = segs.getItem(i),
                segType = seg.pathSegTypeAsLetter;

            if (/[MLHVCSQTA]/.test(segType)) {
                if ('x' in seg) x = seg.x;
                if ('y' in seg) y = seg.y;
            } else {
                if ('x1' in seg) x1 = x + seg.x1;
                if ('x2' in seg) x2 = x + seg.x2;
                if ('y1' in seg) y1 = y + seg.y1;
                if ('y2' in seg) y2 = y + seg.y2;
                if ('x' in seg) x += seg.x;
                if ('y' in seg) y += seg.y;

                switch (segType) {

                case 'm':
                    segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);
                    break;
                case 'l':
                    segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);
                    break;
                case 'h':
                    segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);
                    break;
                case 'v':
                    segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);
                    break;
                case 'c':
                    segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);
                    break;
                case 's':
                    segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);
                    break;
                case 'q':
                    segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);
                    break;
                case 't':
                    segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);
                    break;
                case 'a':
                    segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);
                    break;
                case 'z':
                case 'Z':
                    x = x0;
                    y = y0;
                    break;

                }
            }

            if (segType == 'M' || segType == 'm') {
                x0 = x;
                y0 = y;
            }
        }
    };

})();
},{"../geometry/Bounds":26}],28:[function(_dereq_,module,exports){
/**
* The `Matter.Vector` module contains methods for creating and manipulating vectors.
* Vectors are the basis of all the geometry related operations in the engine.
* A `Matter.Vector` object is of the form `{ x: 0, y: 0 }`.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Vector
*/

// TODO: consider params for reusing vector objects

var Vector = {};

module.exports = Vector;

(function() {

    /**
     * Creates a new vector.
     * @method create
     * @param {number} x
     * @param {number} y
     * @return {vector} A new vector
     */
    Vector.create = function(x, y) {
        return { x: x || 0, y: y || 0 };
    };

    /**
     * Returns a new vector with `x` and `y` copied from the given `vector`.
     * @method clone
     * @param {vector} vector
     * @return {vector} A new cloned vector
     */
    Vector.clone = function(vector) {
        return { x: vector.x, y: vector.y };
    };

    /**
     * Returns the magnitude (length) of a vector.
     * @method magnitude
     * @param {vector} vector
     * @return {number} The magnitude of the vector
     */
    Vector.magnitude = function(vector) {
        return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
    };

    /**
     * Returns the magnitude (length) of a vector (therefore saving a `sqrt` operation).
     * @method magnitudeSquared
     * @param {vector} vector
     * @return {number} The squared magnitude of the vector
     */
    Vector.magnitudeSquared = function(vector) {
        return (vector.x * vector.x) + (vector.y * vector.y);
    };

    /**
     * Rotates the vector about (0, 0) by specified angle.
     * @method rotate
     * @param {vector} vector
     * @param {number} angle
     * @return {vector} A new vector rotated about (0, 0)
     */
    Vector.rotate = function(vector, angle) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return {
            x: vector.x * cos - vector.y * sin,
            y: vector.x * sin + vector.y * cos
        };
    };

    /**
     * Rotates the vector about a specified point by specified angle.
     * @method rotateAbout
     * @param {vector} vector
     * @param {number} angle
     * @param {vector} point
     * @param {vector} [output]
     * @return {vector} A new vector rotated about the point
     */
    Vector.rotateAbout = function(vector, angle, point, output) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        if (!output) output = {};
        var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);
        output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);
        output.x = x;
        return output;
    };

    /**
     * Normalises a vector (such that its magnitude is `1`).
     * @method normalise
     * @param {vector} vector
     * @return {vector} A new vector normalised
     */
    Vector.normalise = function(vector) {
        var magnitude = Vector.magnitude(vector);
        if (magnitude === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / magnitude, y: vector.y / magnitude };
    };

    /**
     * Returns the dot-product of two vectors.
     * @method dot
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @return {number} The dot product of the two vectors
     */
    Vector.dot = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
    };

    /**
     * Returns the cross-product of two vectors.
     * @method cross
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @return {number} The cross product of the two vectors
     */
    Vector.cross = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);
    };

    /**
     * Returns the cross-product of three vectors.
     * @method cross3
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @param {vector} vectorC
     * @return {number} The cross product of the three vectors
     */
    Vector.cross3 = function(vectorA, vectorB, vectorC) {
        return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
    };

    /**
     * Adds the two vectors.
     * @method add
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @param {vector} [output]
     * @return {vector} A new vector of vectorA and vectorB added
     */
    Vector.add = function(vectorA, vectorB, output) {
        if (!output) output = {};
        output.x = vectorA.x + vectorB.x;
        output.y = vectorA.y + vectorB.y;
        return output;
    };

    /**
     * Subtracts the two vectors.
     * @method sub
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @param {vector} [output]
     * @return {vector} A new vector of vectorA and vectorB subtracted
     */
    Vector.sub = function(vectorA, vectorB, output) {
        if (!output) output = {};
        output.x = vectorA.x - vectorB.x;
        output.y = vectorA.y - vectorB.y;
        return output;
    };

    /**
     * Multiplies a vector and a scalar.
     * @method mult
     * @param {vector} vector
     * @param {number} scalar
     * @return {vector} A new vector multiplied by scalar
     */
    Vector.mult = function(vector, scalar) {
        return { x: vector.x * scalar, y: vector.y * scalar };
    };

    /**
     * Divides a vector and a scalar.
     * @method div
     * @param {vector} vector
     * @param {number} scalar
     * @return {vector} A new vector divided by scalar
     */
    Vector.div = function(vector, scalar) {
        return { x: vector.x / scalar, y: vector.y / scalar };
    };

    /**
     * Returns the perpendicular vector. Set `negate` to true for the perpendicular in the opposite direction.
     * @method perp
     * @param {vector} vector
     * @param {bool} [negate=false]
     * @return {vector} The perpendicular vector
     */
    Vector.perp = function(vector, negate) {
        negate = negate === true ? -1 : 1;
        return { x: negate * -vector.y, y: negate * vector.x };
    };

    /**
     * Negates both components of a vector such that it points in the opposite direction.
     * @method neg
     * @param {vector} vector
     * @return {vector} The negated vector
     */
    Vector.neg = function(vector) {
        return { x: -vector.x, y: -vector.y };
    };

    /**
     * Returns the angle in radians between the two vectors relative to the x-axis.
     * @method angle
     * @param {vector} vectorA
     * @param {vector} vectorB
     * @return {number} The angle in radians
     */
    Vector.angle = function(vectorA, vectorB) {
        return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
    };

    /**
     * Temporary vector pool (not thread-safe).
     * @property _temp
     * @type {vector[]}
     * @private
     */
    Vector._temp = [Vector.create(), Vector.create(), 
                    Vector.create(), Vector.create(), 
                    Vector.create(), Vector.create()];

})();
},{}],29:[function(_dereq_,module,exports){
/**
* The `Matter.Vertices` module contains methods for creating and manipulating sets of vertices.
* A set of vertices is an array of `Matter.Vector` with additional indexing properties inserted by `Vertices.create`.
* A `Matter.Body` maintains a set of vertices to represent the shape of the object (its convex hull).
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Vertices
*/

var Vertices = {};

module.exports = Vertices;

var Vector = _dereq_('../geometry/Vector');
var Common = _dereq_('../core/Common');

(function() {

    /**
     * Creates a new set of `Matter.Body` compatible vertices.
     * The `points` argument accepts an array of `Matter.Vector` points orientated around the origin `(0, 0)`, for example:
     *
     *     [{ x: 0, y: 0 }, { x: 25, y: 50 }, { x: 50, y: 0 }]
     *
     * The `Vertices.create` method returns a new array of vertices, which are similar to Matter.Vector objects,
     * but with some additional references required for efficient collision detection routines.
     *
     * Vertices must be specified in clockwise order.
     *
     * Note that the `body` argument is not optional, a `Matter.Body` reference must be provided.
     *
     * @method create
     * @param {vector[]} points
     * @param {body} body
     */
    Vertices.create = function(points, body) {
        var vertices = [];

        for (var i = 0; i < points.length; i++) {
            var point = points[i],
                vertex = {
                    x: point.x,
                    y: point.y,
                    index: i,
                    body: body,
                    isInternal: false
                };

            vertices.push(vertex);
        }

        return vertices;
    };

    /**
     * Parses a string containing ordered x y pairs separated by spaces (and optionally commas), 
     * into a `Matter.Vertices` object for the given `Matter.Body`.
     * For parsing SVG paths, see `Svg.pathToVertices`.
     * @method fromPath
     * @param {string} path
     * @param {body} body
     * @return {vertices} vertices
     */
    Vertices.fromPath = function(path, body) {
        var pathPattern = /L?\s*([\-\d\.e]+)[\s,]*([\-\d\.e]+)*/ig,
            points = [];

        path.replace(pathPattern, function(match, x, y) {
            points.push({ x: parseFloat(x), y: parseFloat(y) });
        });

        return Vertices.create(points, body);
    };

    /**
     * Returns the centre (centroid) of the set of vertices.
     * @method centre
     * @param {vertices} vertices
     * @return {vector} The centre point
     */
    Vertices.centre = function(vertices) {
        var area = Vertices.area(vertices, true),
            centre = { x: 0, y: 0 },
            cross,
            temp,
            j;

        for (var i = 0; i < vertices.length; i++) {
            j = (i + 1) % vertices.length;
            cross = Vector.cross(vertices[i], vertices[j]);
            temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
            centre = Vector.add(centre, temp);
        }

        return Vector.div(centre, 6 * area);
    };

    /**
     * Returns the average (mean) of the set of vertices.
     * @method mean
     * @param {vertices} vertices
     * @return {vector} The average point
     */
    Vertices.mean = function(vertices) {
        var average = { x: 0, y: 0 };

        for (var i = 0; i < vertices.length; i++) {
            average.x += vertices[i].x;
            average.y += vertices[i].y;
        }

        return Vector.div(average, vertices.length);
    };

    /**
     * Returns the area of the set of vertices.
     * @method area
     * @param {vertices} vertices
     * @param {bool} signed
     * @return {number} The area
     */
    Vertices.area = function(vertices, signed) {
        var area = 0,
            j = vertices.length - 1;

        for (var i = 0; i < vertices.length; i++) {
            area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
            j = i;
        }

        if (signed)
            return area / 2;

        return Math.abs(area) / 2;
    };

    /**
     * Returns the moment of inertia (second moment of area) of the set of vertices given the total mass.
     * @method inertia
     * @param {vertices} vertices
     * @param {number} mass
     * @return {number} The polygon's moment of inertia
     */
    Vertices.inertia = function(vertices, mass) {
        var numerator = 0,
            denominator = 0,
            v = vertices,
            cross,
            j;

        // find the polygon's moment of inertia, using second moment of area
        // http://www.physicsforums.com/showthread.php?t=25293
        for (var n = 0; n < v.length; n++) {
            j = (n + 1) % v.length;
            cross = Math.abs(Vector.cross(v[j], v[n]));
            numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
            denominator += cross;
        }

        return (mass / 6) * (numerator / denominator);
    };

    /**
     * Translates the set of vertices in-place.
     * @method translate
     * @param {vertices} vertices
     * @param {vector} vector
     * @param {number} scalar
     */
    Vertices.translate = function(vertices, vector, scalar) {
        var i;
        if (scalar) {
            for (i = 0; i < vertices.length; i++) {
                vertices[i].x += vector.x * scalar;
                vertices[i].y += vector.y * scalar;
            }
        } else {
            for (i = 0; i < vertices.length; i++) {
                vertices[i].x += vector.x;
                vertices[i].y += vector.y;
            }
        }

        return vertices;
    };

    /**
     * Rotates the set of vertices in-place.
     * @method rotate
     * @param {vertices} vertices
     * @param {number} angle
     * @param {vector} point
     */
    Vertices.rotate = function(vertices, angle, point) {
        if (angle === 0)
            return;

        var cos = Math.cos(angle),
            sin = Math.sin(angle);

        for (var i = 0; i < vertices.length; i++) {
            var vertice = vertices[i],
                dx = vertice.x - point.x,
                dy = vertice.y - point.y;
                
            vertice.x = point.x + (dx * cos - dy * sin);
            vertice.y = point.y + (dx * sin + dy * cos);
        }

        return vertices;
    };

    /**
     * Returns `true` if the `point` is inside the set of `vertices`.
     * @method contains
     * @param {vertices} vertices
     * @param {vector} point
     * @return {boolean} True if the vertices contains point, otherwise false
     */
    Vertices.contains = function(vertices, point) {
        for (var i = 0; i < vertices.length; i++) {
            var vertice = vertices[i],
                nextVertice = vertices[(i + 1) % vertices.length];
            if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
                return false;
            }
        }

        return true;
    };

    /**
     * Scales the vertices from a point (default is centre) in-place.
     * @method scale
     * @param {vertices} vertices
     * @param {number} scaleX
     * @param {number} scaleY
     * @param {vector} point
     */
    Vertices.scale = function(vertices, scaleX, scaleY, point) {
        if (scaleX === 1 && scaleY === 1)
            return vertices;

        point = point || Vertices.centre(vertices);

        var vertex,
            delta;

        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            delta = Vector.sub(vertex, point);
            vertices[i].x = point.x + delta.x * scaleX;
            vertices[i].y = point.y + delta.y * scaleY;
        }

        return vertices;
    };

    /**
     * Chamfers a set of vertices by giving them rounded corners, returns a new set of vertices.
     * The radius parameter is a single number or an array to specify the radius for each vertex.
     * @method chamfer
     * @param {vertices} vertices
     * @param {number[]} radius
     * @param {number} quality
     * @param {number} qualityMin
     * @param {number} qualityMax
     */
    Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {
        radius = radius || [8];

        if (!radius.length)
            radius = [radius];

        // quality defaults to -1, which is auto
        quality = (typeof quality !== 'undefined') ? quality : -1;
        qualityMin = qualityMin || 2;
        qualityMax = qualityMax || 14;

        var newVertices = [];

        for (var i = 0; i < vertices.length; i++) {
            var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1],
                vertex = vertices[i],
                nextVertex = vertices[(i + 1) % vertices.length],
                currentRadius = radius[i < radius.length ? i : radius.length - 1];

            if (currentRadius === 0) {
                newVertices.push(vertex);
                continue;
            }

            var prevNormal = Vector.normalise({ 
                x: vertex.y - prevVertex.y, 
                y: prevVertex.x - vertex.x
            });

            var nextNormal = Vector.normalise({ 
                x: nextVertex.y - vertex.y, 
                y: vertex.x - nextVertex.x
            });

            var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)),
                radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius),
                midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)),
                scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));

            var precision = quality;

            if (quality === -1) {
                // automatically decide precision
                precision = Math.pow(currentRadius, 0.32) * 1.75;
            }

            precision = Common.clamp(precision, qualityMin, qualityMax);

            // use an even value for precision, more likely to reduce axes by using symmetry
            if (precision % 2 === 1)
                precision += 1;

            var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)),
                theta = alpha / precision;

            for (var j = 0; j < precision; j++) {
                newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
            }
        }

        return newVertices;
    };

    /**
     * Sorts the input vertices into clockwise order in place.
     * @method clockwiseSort
     * @param {vertices} vertices
     * @return {vertices} vertices
     */
    Vertices.clockwiseSort = function(vertices) {
        var centre = Vertices.mean(vertices);

        vertices.sort(function(vertexA, vertexB) {
            return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
        });

        return vertices;
    };

    /**
     * Returns true if the vertices form a convex shape (vertices must be in clockwise order).
     * @method isConvex
     * @param {vertices} vertices
     * @return {bool} `true` if the `vertices` are convex, `false` if not (or `null` if not computable).
     */
    Vertices.isConvex = function(vertices) {
        // http://paulbourke.net/geometry/polygonmesh/

        var flag = 0,
            n = vertices.length,
            i,
            j,
            k,
            z;

        if (n < 3)
            return null;

        for (i = 0; i < n; i++) {
            j = (i + 1) % n;
            k = (i + 2) % n;
            z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
            z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);

            if (z < 0) {
                flag |= 1;
            } else if (z > 0) {
                flag |= 2;
            }

            if (flag === 3) {
                return false;
            }
        }

        if (flag !== 0){
            return true;
        } else {
            return null;
        }
    };

    /**
     * Returns the convex hull of the input vertices as a new array of points.
     * @method hull
     * @param {vertices} vertices
     * @return [vertex] vertices
     */
    Vertices.hull = function(vertices) {
        // http://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain

        var upper = [],
            lower = [], 
            vertex,
            i;

        // sort vertices on x-axis (y-axis for ties)
        vertices = vertices.slice(0);
        vertices.sort(function(vertexA, vertexB) {
            var dx = vertexA.x - vertexB.x;
            return dx !== 0 ? dx : vertexA.y - vertexB.y;
        });

        // build lower hull
        for (i = 0; i < vertices.length; i++) {
            vertex = vertices[i];

            while (lower.length >= 2 
                   && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
                lower.pop();
            }

            lower.push(vertex);
        }

        // build upper hull
        for (i = vertices.length - 1; i >= 0; i--) {
            vertex = vertices[i];

            while (upper.length >= 2 
                   && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
                upper.pop();
            }

            upper.push(vertex);
        }

        // concatenation of the lower and upper hulls gives the convex hull
        // omit last points because they are repeated at the beginning of the other list
        upper.pop();
        lower.pop();

        return upper.concat(lower);
    };

})();

},{"../core/Common":14,"../geometry/Vector":28}],30:[function(_dereq_,module,exports){
var Matter = module.exports = _dereq_('../core/Matter');

Matter.Body = _dereq_('../body/Body');
Matter.Composite = _dereq_('../body/Composite');
Matter.World = _dereq_('../body/World');

Matter.Contact = _dereq_('../collision/Contact');
Matter.Detector = _dereq_('../collision/Detector');
Matter.Grid = _dereq_('../collision/Grid');
Matter.Pairs = _dereq_('../collision/Pairs');
Matter.Pair = _dereq_('../collision/Pair');
Matter.Query = _dereq_('../collision/Query');
Matter.Resolver = _dereq_('../collision/Resolver');
Matter.SAT = _dereq_('../collision/SAT');

Matter.Constraint = _dereq_('../constraint/Constraint');
Matter.MouseConstraint = _dereq_('../constraint/MouseConstraint');

Matter.Common = _dereq_('../core/Common');
Matter.Engine = _dereq_('../core/Engine');
Matter.Events = _dereq_('../core/Events');
Matter.Mouse = _dereq_('../core/Mouse');
Matter.Runner = _dereq_('../core/Runner');
Matter.Sleeping = _dereq_('../core/Sleeping');
Matter.Plugin = _dereq_('../core/Plugin');


Matter.Bodies = _dereq_('../factory/Bodies');
Matter.Composites = _dereq_('../factory/Composites');

Matter.Axes = _dereq_('../geometry/Axes');
Matter.Bounds = _dereq_('../geometry/Bounds');
Matter.Svg = _dereq_('../geometry/Svg');
Matter.Vector = _dereq_('../geometry/Vector');
Matter.Vertices = _dereq_('../geometry/Vertices');

Matter.Render = _dereq_('../render/Render');
Matter.RenderPixi = _dereq_('../render/RenderPixi');

// aliases

Matter.World.add = Matter.Composite.add;
Matter.World.remove = Matter.Composite.remove;
Matter.World.addComposite = Matter.Composite.addComposite;
Matter.World.addBody = Matter.Composite.addBody;
Matter.World.addConstraint = Matter.Composite.addConstraint;
Matter.World.clear = Matter.Composite.clear;
Matter.Engine.run = Matter.Runner.run;

},{"../body/Body":1,"../body/Composite":2,"../body/World":3,"../collision/Contact":4,"../collision/Detector":5,"../collision/Grid":6,"../collision/Pair":7,"../collision/Pairs":8,"../collision/Query":9,"../collision/Resolver":10,"../collision/SAT":11,"../constraint/Constraint":12,"../constraint/MouseConstraint":13,"../core/Common":14,"../core/Engine":15,"../core/Events":16,"../core/Matter":17,"../core/Metrics":18,"../core/Mouse":19,"../core/Plugin":20,"../core/Runner":21,"../core/Sleeping":22,"../factory/Bodies":23,"../factory/Composites":24,"../geometry/Axes":25,"../geometry/Bounds":26,"../geometry/Svg":27,"../geometry/Vector":28,"../geometry/Vertices":29,"../render/Render":31,"../render/RenderPixi":32}],31:[function(_dereq_,module,exports){
/**
* The `Matter.Render` module is a simple HTML5 canvas based renderer for visualising instances of `Matter.Engine`.
* It is intended for development and debugging purposes, but may also be suitable for simple games.
* It includes a number of drawing options including wireframe, vector with support for sprites and viewports.
*
* @class Render
*/

var Render = {};

module.exports = Render;

var Common = _dereq_('../core/Common');
var Composite = _dereq_('../body/Composite');
var Bounds = _dereq_('../geometry/Bounds');
var Events = _dereq_('../core/Events');
var Grid = _dereq_('../collision/Grid');
var Vector = _dereq_('../geometry/Vector');

(function() {
    
    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (typeof window !== 'undefined') {
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };
   
        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }

    /**
     * Creates a new renderer. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {object} [options]
     * @return {render} A new renderer
     */
    Render.create = function(options) {
        var defaults = {
            controller: Render,
            engine: null,
            element: null,
            canvas: null,
            mouse: null,
            frameRequestId: null,
            options: {
                width: 800,
                height: 600,
                pixelRatio: 1,
                background: '#fafafa',
                wireframeBackground: '#222',
                hasBounds: !!options.bounds,
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showSeparations: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false,
                showVertexNumbers: false,
                showConvexHulls: false,
                showInternalEdges: false,
                showMousePosition: false
            }
        };

        var render = Common.extend(defaults, options);

        if (render.canvas) {
            render.canvas.width = render.options.width || render.canvas.width;
            render.canvas.height = render.options.height || render.canvas.height;
        }

        render.mouse = options.mouse;
        render.engine = options.engine;
        render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
        render.context = render.canvas.getContext('2d');
        render.textures = {};

        render.bounds = render.bounds || { 
            min: { 
                x: 0,
                y: 0
            }, 
            max: { 
                x: render.canvas.width,
                y: render.canvas.height
            }
        };

        if (render.options.pixelRatio !== 1) {
            Render.setPixelRatio(render, render.options.pixelRatio);
        }

        if (Common.isElement(render.element)) {
            render.element.appendChild(render.canvas);
        } else {
            Common.log('Render.create: options.element was undefined, render.canvas was created but not appended', 'warn');
        }

        return render;
    };

    /**
     * Continuously updates the render canvas on the `requestAnimationFrame` event.
     * @method run
     * @param {render} render
     */
    Render.run = function(render) {
        (function loop(time){
            render.frameRequestId = _requestAnimationFrame(loop);
            Render.world(render);
        })();
    };

    /**
     * Ends execution of `Render.run` on the given `render`, by canceling the animation frame request event loop.
     * @method stop
     * @param {render} render
     */
    Render.stop = function(render) {
        _cancelAnimationFrame(render.frameRequestId);
    };

    /**
     * Sets the pixel ratio of the renderer and updates the canvas.
     * To automatically detect the correct ratio, pass the string `'auto'` for `pixelRatio`.
     * @method setPixelRatio
     * @param {render} render
     * @param {number} pixelRatio
     */
    Render.setPixelRatio = function(render, pixelRatio) {
        var options = render.options,
            canvas = render.canvas;

        if (pixelRatio === 'auto') {
            pixelRatio = _getPixelRatio(canvas);
        }

        options.pixelRatio = pixelRatio;
        canvas.setAttribute('data-pixel-ratio', pixelRatio);
        canvas.width = options.width * pixelRatio;
        canvas.height = options.height * pixelRatio;
        canvas.style.width = options.width + 'px';
        canvas.style.height = options.height + 'px';
        render.context.scale(pixelRatio, pixelRatio);
    };

    /**
     * Renders the given `engine`'s `Matter.World` object.
     * This is the entry point for all rendering and should be called every time the scene changes.
     * @method world
     * @param {render} render
     */
    Render.world = function(render) {
        var engine = render.engine,
            world = engine.world,
            canvas = render.canvas,
            context = render.context,
            options = render.options,
            allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world),
            background = options.wireframes ? options.wireframeBackground : options.background,
            bodies = [],
            constraints = [],
            i;

        var event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(render, 'beforeRender', event);

        // apply background if it has changed
        if (render.currentBackground !== background)
            _applyBackground(render, background);

        // clear the canvas with a transparent fill, to allow the canvas background to show
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';

        // handle bounds
        if (options.hasBounds) {
            var boundsWidth = render.bounds.max.x - render.bounds.min.x,
                boundsHeight = render.bounds.max.y - render.bounds.min.y,
                boundsScaleX = boundsWidth / options.width,
                boundsScaleY = boundsHeight / options.height;

            // filter out bodies that are not in view
            for (i = 0; i < allBodies.length; i++) {
                var body = allBodies[i];
                if (Bounds.overlaps(body.bounds, render.bounds))
                    bodies.push(body);
            }

            // filter out constraints that are not in view
            for (i = 0; i < allConstraints.length; i++) {
                var constraint = allConstraints[i],
                    bodyA = constraint.bodyA,
                    bodyB = constraint.bodyB,
                    pointAWorld = constraint.pointA,
                    pointBWorld = constraint.pointB;

                if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                if (!pointAWorld || !pointBWorld)
                    continue;

                if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                    constraints.push(constraint);
            }

            // transform the view
            context.scale(1 / boundsScaleX, 1 / boundsScaleY);
            context.translate(-render.bounds.min.x, -render.bounds.min.y);
        } else {
            constraints = allConstraints;
            bodies = allBodies;
        }

        if (!options.wireframes || (engine.enableSleeping && options.showSleeping)) {
            // fully featured rendering of bodies
            Render.bodies(render, bodies, context);
        } else {
            if (options.showConvexHulls)
                Render.bodyConvexHulls(render, bodies, context);

            // optimised method for wireframes only
            Render.bodyWireframes(render, bodies, context);
        }

        if (options.showBounds)
            Render.bodyBounds(render, bodies, context);

        if (options.showAxes || options.showAngleIndicator)
            Render.bodyAxes(render, bodies, context);
        
        if (options.showPositions)
            Render.bodyPositions(render, bodies, context);

        if (options.showVelocity)
            Render.bodyVelocity(render, bodies, context);

        if (options.showIds)
            Render.bodyIds(render, bodies, context);

        if (options.showSeparations)
            Render.separations(render, engine.pairs.list, context);

        if (options.showCollisions)
            Render.collisions(render, engine.pairs.list, context);

        if (options.showVertexNumbers)
            Render.vertexNumbers(render, bodies, context);

        if (options.showMousePosition)
            Render.mousePosition(render, render.mouse, context);

        Render.constraints(constraints, context);

        if (options.showBroadphase && engine.broadphase.controller === Grid)
            Render.grid(render, engine.broadphase, context);

        if (options.showDebug)
            Render.debug(render, context);

        if (options.hasBounds) {
            // revert view transforms
            context.setTransform(options.pixelRatio, 0, 0, options.pixelRatio, 0, 0);
        }

        Events.trigger(render, 'afterRender', event);
    };

    /**
     * Description
     * @private
     * @method debug
     * @param {render} render
     * @param {RenderingContext} context
     */
    Render.debug = function(render, context) {
        var c = context,
            engine = render.engine,
            world = engine.world,
            metrics = engine.metrics,
            options = render.options,
            bodies = Composite.allBodies(world),
            space = "    ";

        if (engine.timing.timestamp - (render.debugTimestamp || 0) >= 500) {
            var text = "";

            if (metrics.timing) {
                text += "fps: " + Math.round(metrics.timing.fps) + space;
            }


            render.debugString = text;
            render.debugTimestamp = engine.timing.timestamp;
        }

        if (render.debugString) {
            c.font = "12px Arial";

            if (options.wireframes) {
                c.fillStyle = 'rgba(255,255,255,0.5)';
            } else {
                c.fillStyle = 'rgba(0,0,0,0.5)';
            }

            var split = render.debugString.split('\n');

            for (var i = 0; i < split.length; i++) {
                c.fillText(split[i], 50, 50 + i * 18);
            }
        }
    };

    /**
     * Description
     * @private
     * @method constraints
     * @param {constraint[]} constraints
     * @param {RenderingContext} context
     */
    Render.constraints = function(constraints, context) {
        var c = context;

        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];

            if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                continue;

            var bodyA = constraint.bodyA,
                bodyB = constraint.bodyB;

            if (bodyA) {
                c.beginPath();
                c.moveTo(bodyA.position.x + constraint.pointA.x, bodyA.position.y + constraint.pointA.y);
            } else {
                c.beginPath();
                c.moveTo(constraint.pointA.x, constraint.pointA.y);
            }

            if (bodyB) {
                c.lineTo(bodyB.position.x + constraint.pointB.x, bodyB.position.y + constraint.pointB.y);
            } else {
                c.lineTo(constraint.pointB.x, constraint.pointB.y);
            }

            c.lineWidth = constraint.render.lineWidth;
            c.strokeStyle = constraint.render.strokeStyle;
            c.stroke();
        }
    };
    
    /**
     * Description
     * @private
     * @method bodyShadows
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyShadows = function(render, bodies, context) {
        var c = context,
            engine = render.engine;

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.render.visible)
                continue;

            if (body.circleRadius) {
                c.beginPath();
                c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
                c.closePath();
            } else {
                c.beginPath();
                c.moveTo(body.vertices[0].x, body.vertices[0].y);
                for (var j = 1; j < body.vertices.length; j++) {
                    c.lineTo(body.vertices[j].x, body.vertices[j].y);
                }
                c.closePath();
            }

            var distanceX = body.position.x - render.options.width * 0.5,
                distanceY = body.position.y - render.options.height * 0.2,
                distance = Math.abs(distanceX) + Math.abs(distanceY);

            c.shadowColor = 'rgba(0,0,0,0.15)';
            c.shadowOffsetX = 0.05 * distanceX;
            c.shadowOffsetY = 0.05 * distanceY;
            c.shadowBlur = 1 + 12 * Math.min(1, distance / 1000);

            c.fill();

            c.shadowColor = null;
            c.shadowOffsetX = null;
            c.shadowOffsetY = null;
            c.shadowBlur = null;
        }
    };

    /**
     * Description
     * @private
     * @method bodies
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodies = function(render, bodies, context) {
        var c = context,
            engine = render.engine,
            options = render.options,
            showInternalEdges = options.showInternalEdges || !options.wireframes,
            body,
            part,
            i,
            k;

        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                part = body.parts[k];

                if (!part.render.visible)
                    continue;

                if (options.showSleeping && body.isSleeping) {
                    c.globalAlpha = 0.5 * part.render.opacity;
                } else if (part.render.opacity !== 1) {
                    c.globalAlpha = part.render.opacity;
                }

                if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                    // part sprite
                    var sprite = part.render.sprite,
                        texture = _getTexture(render, sprite.texture);

                    c.translate(part.position.x, part.position.y); 
                    c.rotate(part.angle);

                    c.drawImage(
                        texture,
                        texture.width * -sprite.xOffset * sprite.xScale, 
                        texture.height * -sprite.yOffset * sprite.yScale, 
                        texture.width * sprite.xScale, 
                        texture.height * sprite.yScale
                    );

                    // revert translation, hopefully faster than save / restore
                    c.rotate(-part.angle);
                    c.translate(-part.position.x, -part.position.y); 
                } else {
                    // part polygon
                    if (part.circleRadius) {
                        c.beginPath();
                        c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                    } else {
                        c.beginPath();
                        c.moveTo(part.vertices[0].x, part.vertices[0].y);

                        for (var j = 1; j < part.vertices.length; j++) {
                            if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                                c.lineTo(part.vertices[j].x, part.vertices[j].y);
                            } else {
                                c.moveTo(part.vertices[j].x, part.vertices[j].y);
                            }

                            if (part.vertices[j].isInternal && !showInternalEdges) {
                                c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                            }
                        }
                        
                        c.lineTo(part.vertices[0].x, part.vertices[0].y);
                        c.closePath();
                    }

                    if (!options.wireframes) {
                        c.fillStyle = part.render.fillStyle;
                        c.lineWidth = part.render.lineWidth;
                        c.strokeStyle = part.render.strokeStyle;
                        c.fill();
                    } else {
                        c.lineWidth = 1;
                        c.strokeStyle = '#bbb';
                    }

                    c.stroke();
                }

                c.globalAlpha = 1;
            }
        }
    };

    /**
     * Optimised method for drawing body wireframes in one pass
     * @private
     * @method bodyWireframes
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyWireframes = function(render, bodies, context) {
        var c = context,
            showInternalEdges = render.options.showInternalEdges,
            body,
            part,
            i,
            j,
            k;

        c.beginPath();

        // render all bodies
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                part = body.parts[k];

                c.moveTo(part.vertices[0].x, part.vertices[0].y);

                for (j = 1; j < part.vertices.length; j++) {
                    if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                        c.lineTo(part.vertices[j].x, part.vertices[j].y);
                    } else {
                        c.moveTo(part.vertices[j].x, part.vertices[j].y);
                    }

                    if (part.vertices[j].isInternal && !showInternalEdges) {
                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                    }
                }
                
                c.lineTo(part.vertices[0].x, part.vertices[0].y);
            }
        }

        c.lineWidth = 1;
        c.strokeStyle = '#bbb';
        c.stroke();
    };

    /**
     * Optimised method for drawing body convex hull wireframes in one pass
     * @private
     * @method bodyConvexHulls
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyConvexHulls = function(render, bodies, context) {
        var c = context,
            body,
            part,
            i,
            j,
            k;

        c.beginPath();

        // render convex hulls
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible || body.parts.length === 1)
                continue;

            c.moveTo(body.vertices[0].x, body.vertices[0].y);

            for (j = 1; j < body.vertices.length; j++) {
                c.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            
            c.lineTo(body.vertices[0].x, body.vertices[0].y);
        }

        c.lineWidth = 1;
        c.strokeStyle = 'rgba(255,255,255,0.2)';
        c.stroke();
    };

    /**
     * Renders body vertex numbers.
     * @private
     * @method vertexNumbers
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.vertexNumbers = function(render, bodies, context) {
        var c = context,
            i,
            j,
            k;

        for (i = 0; i < bodies.length; i++) {
            var parts = bodies[i].parts;
            for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                var part = parts[k];
                for (j = 0; j < part.vertices.length; j++) {
                    c.fillStyle = 'rgba(255,255,255,0.2)';
                    c.fillText(i + '_' + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                }
            }
        }
    };

    /**
     * Renders mouse position.
     * @private
     * @method mousePosition
     * @param {render} render
     * @param {mouse} mouse
     * @param {RenderingContext} context
     */
    Render.mousePosition = function(render, mouse, context) {
        var c = context;
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.fillText(mouse.position.x + '  ' + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
    };

    /**
     * Draws body bounds
     * @private
     * @method bodyBounds
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyBounds = function(render, bodies, context) {
        var c = context,
            engine = render.engine,
            options = render.options;

        c.beginPath();

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.render.visible) {
                var parts = bodies[i].parts;
                for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    var part = parts[j];
                    c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                }
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,255,255,0.08)';
        } else {
            c.strokeStyle = 'rgba(0,0,0,0.1)';
        }

        c.lineWidth = 1;
        c.stroke();
    };

    /**
     * Draws body angle indicators and axes
     * @private
     * @method bodyAxes
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyAxes = function(render, bodies, context) {
        var c = context,
            engine = render.engine,
            options = render.options,
            part,
            i,
            j,
            k;

        c.beginPath();

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                parts = body.parts;

            if (!body.render.visible)
                continue;

            if (options.showAxes) {
                // render all axes
                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    part = parts[j];
                    for (k = 0; k < part.axes.length; k++) {
                        var axis = part.axes[k];
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                    }
                }
            } else {
                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    part = parts[j];
                    for (k = 0; k < part.axes.length; k++) {
                        // render a single axis indicator
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo((part.vertices[0].x + part.vertices[part.vertices.length-1].x) / 2, 
                                 (part.vertices[0].y + part.vertices[part.vertices.length-1].y) / 2);
                    }
                }
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'indianred';
        } else {
            c.strokeStyle = 'rgba(0,0,0,0.8)';
            c.globalCompositeOperation = 'overlay';
        }

        c.lineWidth = 1;
        c.stroke();
        c.globalCompositeOperation = 'source-over';
    };

    /**
     * Draws body positions
     * @private
     * @method bodyPositions
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyPositions = function(render, bodies, context) {
        var c = context,
            engine = render.engine,
            options = render.options,
            body,
            part,
            i,
            k;

        c.beginPath();

        // render current positions
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];

            if (!body.render.visible)
                continue;

            // handle compound parts
            for (k = 0; k < body.parts.length; k++) {
                part = body.parts[k];
                c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                c.closePath();
            }
        }

        if (options.wireframes) {
            c.fillStyle = 'indianred';
        } else {
            c.fillStyle = 'rgba(0,0,0,0.5)';
        }
        c.fill();

        c.beginPath();

        // render previous positions
        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];
            if (body.render.visible) {
                c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                c.closePath();
            }
        }

        c.fillStyle = 'rgba(255,165,0,0.8)';
        c.fill();
    };

    /**
     * Draws body velocity
     * @private
     * @method bodyVelocity
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyVelocity = function(render, bodies, context) {
        var c = context;

        c.beginPath();

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.render.visible)
                continue;

            c.moveTo(body.position.x, body.position.y);
            c.lineTo(body.position.x + (body.position.x - body.positionPrev.x) * 2, body.position.y + (body.position.y - body.positionPrev.y) * 2);
        }

        c.lineWidth = 3;
        c.strokeStyle = 'cornflowerblue';
        c.stroke();
    };

    /**
     * Draws body ids
     * @private
     * @method bodyIds
     * @param {render} render
     * @param {body[]} bodies
     * @param {RenderingContext} context
     */
    Render.bodyIds = function(render, bodies, context) {
        var c = context,
            i,
            j;

        for (i = 0; i < bodies.length; i++) {
            if (!bodies[i].render.visible)
                continue;

            var parts = bodies[i].parts;
            for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                var part = parts[j];
                c.font = "12px Arial";
                c.fillStyle = 'rgba(255,255,255,0.5)';
                c.fillText(part.id, part.position.x + 10, part.position.y - 10);
            }
        }
    };

    /**
     * Description
     * @private
     * @method collisions
     * @param {render} render
     * @param {pair[]} pairs
     * @param {RenderingContext} context
     */
    Render.collisions = function(render, pairs, context) {
        var c = context,
            options = render.options,
            pair,
            collision,
            corrected,
            bodyA,
            bodyB,
            i,
            j;

        c.beginPath();

        // render collision positions
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;
            for (j = 0; j < pair.activeContacts.length; j++) {
                var contact = pair.activeContacts[j],
                    vertex = contact.vertex;
                c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
            }
        }

        if (options.wireframes) {
            c.fillStyle = 'rgba(255,255,255,0.7)';
        } else {
            c.fillStyle = 'orange';
        }
        c.fill();

        c.beginPath();
            
        // render collision normals
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;

            if (pair.activeContacts.length > 0) {
                var normalPosX = pair.activeContacts[0].vertex.x,
                    normalPosY = pair.activeContacts[0].vertex.y;

                if (pair.activeContacts.length === 2) {
                    normalPosX = (pair.activeContacts[0].vertex.x + pair.activeContacts[1].vertex.x) / 2;
                    normalPosY = (pair.activeContacts[0].vertex.y + pair.activeContacts[1].vertex.y) / 2;
                }
                
                if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                    c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                } else {
                    c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                }

                c.lineTo(normalPosX, normalPosY);
            }
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,165,0,0.7)';
        } else {
            c.strokeStyle = 'orange';
        }

        c.lineWidth = 1;
        c.stroke();
    };

    /**
     * Description
     * @private
     * @method separations
     * @param {render} render
     * @param {pair[]} pairs
     * @param {RenderingContext} context
     */
    Render.separations = function(render, pairs, context) {
        var c = context,
            options = render.options,
            pair,
            collision,
            corrected,
            bodyA,
            bodyB,
            i,
            j;

        c.beginPath();

        // render separations
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            if (!pair.isActive)
                continue;

            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;

            var k = 1;

            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
            if (bodyB.isStatic) k = 0;

            c.moveTo(bodyB.position.x, bodyB.position.y);
            c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);

            k = 1;

            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
            if (bodyA.isStatic) k = 0;

            c.moveTo(bodyA.position.x, bodyA.position.y);
            c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
        }

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,165,0,0.5)';
        } else {
            c.strokeStyle = 'orange';
        }
        c.stroke();
    };

    /**
     * Description
     * @private
     * @method grid
     * @param {render} render
     * @param {grid} grid
     * @param {RenderingContext} context
     */
    Render.grid = function(render, grid, context) {
        var c = context,
            options = render.options;

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,180,0,0.1)';
        } else {
            c.strokeStyle = 'rgba(255,180,0,0.5)';
        }

        c.beginPath();

        var bucketKeys = Common.keys(grid.buckets);

        for (var i = 0; i < bucketKeys.length; i++) {
            var bucketId = bucketKeys[i];

            if (grid.buckets[bucketId].length < 2)
                continue;

            var region = bucketId.split(',');
            c.rect(0.5 + parseInt(region[0], 10) * grid.bucketWidth, 
                    0.5 + parseInt(region[1], 10) * grid.bucketHeight, 
                    grid.bucketWidth, 
                    grid.bucketHeight);
        }

        c.lineWidth = 1;
        c.stroke();
    };

    /**
     * Description
     * @private
     * @method inspector
     * @param {inspector} inspector
     * @param {RenderingContext} context
     */
    Render.inspector = function(inspector, context) {
        var engine = inspector.engine,
            selected = inspector.selected,
            render = inspector.render,
            options = render.options,
            bounds;

        if (options.hasBounds) {
            var boundsWidth = render.bounds.max.x - render.bounds.min.x,
                boundsHeight = render.bounds.max.y - render.bounds.min.y,
                boundsScaleX = boundsWidth / render.options.width,
                boundsScaleY = boundsHeight / render.options.height;
            
            context.scale(1 / boundsScaleX, 1 / boundsScaleY);
            context.translate(-render.bounds.min.x, -render.bounds.min.y);
        }

        for (var i = 0; i < selected.length; i++) {
            var item = selected[i].data;

            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,165,0,0.9)';
            context.setLineDash([1,2]);

            switch (item.type) {

            case 'body':

                // render body selections
                bounds = item.bounds;
                context.beginPath();
                context.rect(Math.floor(bounds.min.x - 3), Math.floor(bounds.min.y - 3), 
                             Math.floor(bounds.max.x - bounds.min.x + 6), Math.floor(bounds.max.y - bounds.min.y + 6));
                context.closePath();
                context.stroke();

                break;

            case 'constraint':

                // render constraint selections
                var point = item.pointA;
                if (item.bodyA)
                    point = item.pointB;
                context.beginPath();
                context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                context.closePath();
                context.stroke();

                break;

            }

            context.setLineDash([]);
            context.translate(-0.5, -0.5);
        }

        // render selection region
        if (inspector.selectStart !== null) {
            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,165,0,0.6)';
            context.fillStyle = 'rgba(255,165,0,0.1)';
            bounds = inspector.selectBounds;
            context.beginPath();
            context.rect(Math.floor(bounds.min.x), Math.floor(bounds.min.y), 
                         Math.floor(bounds.max.x - bounds.min.x), Math.floor(bounds.max.y - bounds.min.y));
            context.closePath();
            context.stroke();
            context.fill();
            context.translate(-0.5, -0.5);
        }

        if (options.hasBounds)
            context.setTransform(1, 0, 0, 1, 0, 0);
    };

    /**
     * Description
     * @method _createCanvas
     * @private
     * @param {} width
     * @param {} height
     * @return canvas
     */
    var _createCanvas = function(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.oncontextmenu = function() { return false; };
        canvas.onselectstart = function() { return false; };
        return canvas;
    };

    /**
     * Gets the pixel ratio of the canvas.
     * @method _getPixelRatio
     * @private
     * @param {HTMLElement} canvas
     * @return {Number} pixel ratio
     */
    var _getPixelRatio = function(canvas) {
        var context = canvas.getContext('2d'),
            devicePixelRatio = window.devicePixelRatio || 1,
            backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio
                                      || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio
                                      || context.backingStorePixelRatio || 1;

        return devicePixelRatio / backingStorePixelRatio;
    };

    /**
     * Gets the requested texture (an Image) via its path
     * @method _getTexture
     * @private
     * @param {render} render
     * @param {string} imagePath
     * @return {Image} texture
     */
    var _getTexture = function(render, imagePath) {
        var image = render.textures[imagePath];

        if (image)
            return image;

        image = render.textures[imagePath] = new Image();
        image.src = imagePath;

        return image;
    };

    /**
     * Applies the background to the canvas using CSS.
     * @method applyBackground
     * @private
     * @param {render} render
     * @param {string} background
     */
    var _applyBackground = function(render, background) {
        var cssBackground = background;

        if (/(jpg|gif|png)$/.test(background))
            cssBackground = 'url(' + background + ')';

        render.canvas.style.background = cssBackground;
        render.canvas.style.backgroundSize = "contain";
        render.currentBackground = background;
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired before rendering
    *
    * @event beforeRender
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after rendering
    *
    * @event afterRender
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * A back-reference to the `Matter.Render` module.
     *
     * @property controller
     * @type render
     */

    /**
     * A reference to the `Matter.Engine` instance to be used.
     *
     * @property engine
     * @type engine
     */

    /**
     * A reference to the element where the canvas is to be inserted (if `render.canvas` has not been specified)
     *
     * @property element
     * @type HTMLElement
     * @default null
     */

    /**
     * The canvas element to render to. If not specified, one will be created if `render.element` has been specified.
     *
     * @property canvas
     * @type HTMLCanvasElement
     * @default null
     */

    /**
     * The configuration options of the renderer.
     *
     * @property options
     * @type {}
     */

    /**
     * The target width in pixels of the `render.canvas` to be created.
     *
     * @property options.width
     * @type number
     * @default 800
     */

    /**
     * The target height in pixels of the `render.canvas` to be created.
     *
     * @property options.height
     * @type number
     * @default 600
     */

    /**
     * A flag that specifies if `render.bounds` should be used when rendering.
     *
     * @property options.hasBounds
     * @type boolean
     * @default false
     */

    /**
     * A `Bounds` object that specifies the drawing view region. 
     * Rendering will be automatically transformed and scaled to fit within the canvas size (`render.options.width` and `render.options.height`).
     * This allows for creating views that can pan or zoom around the scene.
     * You must also set `render.options.hasBounds` to `true` to enable bounded rendering.
     *
     * @property bounds
     * @type bounds
     */

    /**
     * The 2d rendering context from the `render.canvas` element.
     *
     * @property context
     * @type CanvasRenderingContext2D
     */

    /**
     * The sprite texture cache.
     *
     * @property textures
     * @type {}
     */

})();

},{"../body/Composite":2,"../collision/Grid":6,"../core/Common":14,"../core/Events":16,"../geometry/Bounds":26,"../geometry/Vector":28}],32:[function(_dereq_,module,exports){
/**
* The `Matter.RenderPixi` module is an example renderer using pixi.js.
* See also `Matter.Render` for a canvas based renderer.
*
* @class RenderPixi
* @deprecated the Matter.RenderPixi module will soon be removed from the Matter.js core.
* It will likely be moved to its own repository (but maintenance will be limited).
*/

var RenderPixi = {};

module.exports = RenderPixi;

var Bounds = _dereq_('../geometry/Bounds');
var Composite = _dereq_('../body/Composite');
var Common = _dereq_('../core/Common');
var Events = _dereq_('../core/Events');
var Vector = _dereq_('../geometry/Vector');

(function() {

    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (typeof window !== 'undefined') {
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, 1000 / 60); };
   
        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }
    
    /**
     * Creates a new Pixi.js WebGL renderer
     * @method create
     * @param {object} options
     * @return {RenderPixi} A new renderer
     * @deprecated
     */
    RenderPixi.create = function(options) {
        Common.warn('RenderPixi.create: Matter.RenderPixi is deprecated (see docs)');

        var defaults = {
            controller: RenderPixi,
            engine: null,
            element: null,
            frameRequestId: null,
            canvas: null,
            renderer: null,
            container: null,
            spriteContainer: null,
            pixiOptions: null,
            options: {
                width: 800,
                height: 600,
                background: '#fafafa',
                wireframeBackground: '#222',
                hasBounds: false,
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false
            }
        };

        var render = Common.extend(defaults, options),
            transparent = !render.options.wireframes && render.options.background === 'transparent';

        // init pixi
        render.pixiOptions = render.pixiOptions || {
            view: render.canvas,
            transparent: transparent,
            antialias: true,
            backgroundColor: options.background
        };

        render.mouse = options.mouse;
        render.engine = options.engine;
        render.renderer = render.renderer || new PIXI.WebGLRenderer(render.options.width, render.options.height, render.pixiOptions);
        render.container = render.container || new PIXI.Container();
        render.spriteContainer = render.spriteContainer || new PIXI.Container();
        render.canvas = render.canvas || render.renderer.view;
        render.bounds = render.bounds || { 
            min: {
                x: 0,
                y: 0
            }, 
            max: { 
                x: render.options.width,
                y: render.options.height
            }
        };

        // event listeners
        Events.on(render.engine, 'beforeUpdate', function() {
            RenderPixi.clear(render);
        });

        // caches
        render.textures = {};
        render.sprites = {};
        render.primitives = {};

        // use a sprite batch for performance
        render.container.addChild(render.spriteContainer);

        // insert canvas
        if (Common.isElement(render.element)) {
            render.element.appendChild(render.canvas);
        } else {
            Common.warn('No "render.element" passed, "render.canvas" was not inserted into document.');
        }

        // prevent menus on canvas
        render.canvas.oncontextmenu = function() { return false; };
        render.canvas.onselectstart = function() { return false; };

        return render;
    };

    /**
     * Continuously updates the render canvas on the `requestAnimationFrame` event.
     * @method run
     * @param {render} render
     * @deprecated
     */
    RenderPixi.run = function(render) {
        (function loop(time){
            render.frameRequestId = _requestAnimationFrame(loop);
            RenderPixi.world(render);
        })();
    };

    /**
     * Ends execution of `Render.run` on the given `render`, by canceling the animation frame request event loop.
     * @method stop
     * @param {render} render
     * @deprecated
     */
    RenderPixi.stop = function(render) {
        _cancelAnimationFrame(render.frameRequestId);
    };

    /**
     * Clears the scene graph
     * @method clear
     * @param {RenderPixi} render
     * @deprecated
     */
    RenderPixi.clear = function(render) {
        var container = render.container,
            spriteContainer = render.spriteContainer;

        // clear stage container
        while (container.children[0]) { 
            container.removeChild(container.children[0]); 
        }

        // clear sprite batch
        while (spriteContainer.children[0]) { 
            spriteContainer.removeChild(spriteContainer.children[0]); 
        }

        var bgSprite = render.sprites['bg-0'];

        // clear caches
        render.textures = {};
        render.sprites = {};
        render.primitives = {};

        // set background sprite
        render.sprites['bg-0'] = bgSprite;
        if (bgSprite)
            container.addChildAt(bgSprite, 0);

        // add sprite batch back into container
        render.container.addChild(render.spriteContainer);

        // reset background state
        render.currentBackground = null;

        // reset bounds transforms
        container.scale.set(1, 1);
        container.position.set(0, 0);
    };

    /**
     * Sets the background of the canvas 
     * @method setBackground
     * @param {RenderPixi} render
     * @param {string} background
     * @deprecated
     */
    RenderPixi.setBackground = function(render, background) {
        if (render.currentBackground !== background) {
            var isColor = background.indexOf && background.indexOf('#') !== -1,
                bgSprite = render.sprites['bg-0'];

            if (isColor) {
                // if solid background color
                var color = Common.colorToNumber(background);
                render.renderer.backgroundColor = color;

                // remove background sprite if existing
                if (bgSprite)
                    render.container.removeChild(bgSprite); 
            } else {
                // initialise background sprite if needed
                if (!bgSprite) {
                    var texture = _getTexture(render, background);

                    bgSprite = render.sprites['bg-0'] = new PIXI.Sprite(texture);
                    bgSprite.position.x = 0;
                    bgSprite.position.y = 0;
                    render.container.addChildAt(bgSprite, 0);
                }
            }

            render.currentBackground = background;
        }
    };

    /**
     * Description
     * @method world
     * @param {engine} engine
     * @deprecated
     */
    RenderPixi.world = function(render) {
        var engine = render.engine,
            world = engine.world,
            renderer = render.renderer,
            container = render.container,
            options = render.options,
            bodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world),
            constraints = [],
            i;

        if (options.wireframes) {
            RenderPixi.setBackground(render, options.wireframeBackground);
        } else {
            RenderPixi.setBackground(render, options.background);
        }

        // handle bounds
        var boundsWidth = render.bounds.max.x - render.bounds.min.x,
            boundsHeight = render.bounds.max.y - render.bounds.min.y,
            boundsScaleX = boundsWidth / render.options.width,
            boundsScaleY = boundsHeight / render.options.height;

        if (options.hasBounds) {
            // Hide bodies that are not in view
            for (i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                body.render.sprite.visible = Bounds.overlaps(body.bounds, render.bounds);
            }

            // filter out constraints that are not in view
            for (i = 0; i < allConstraints.length; i++) {
                var constraint = allConstraints[i],
                    bodyA = constraint.bodyA,
                    bodyB = constraint.bodyB,
                    pointAWorld = constraint.pointA,
                    pointBWorld = constraint.pointB;

                if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                if (!pointAWorld || !pointBWorld)
                    continue;

                if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                    constraints.push(constraint);
            }

            // transform the view
            container.scale.set(1 / boundsScaleX, 1 / boundsScaleY);
            container.position.set(-render.bounds.min.x * (1 / boundsScaleX), -render.bounds.min.y * (1 / boundsScaleY));
        } else {
            constraints = allConstraints;
        }

        for (i = 0; i < bodies.length; i++)
            RenderPixi.body(render, bodies[i]);

        for (i = 0; i < constraints.length; i++)
            RenderPixi.constraint(render, constraints[i]);

        renderer.render(container);
    };


    /**
     * Description
     * @method constraint
     * @param {engine} engine
     * @param {constraint} constraint
     * @deprecated
     */
    RenderPixi.constraint = function(render, constraint) {
        var engine = render.engine,
            bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB,
            container = render.container,
            constraintRender = constraint.render,
            primitiveId = 'c-' + constraint.id,
            primitive = render.primitives[primitiveId];

        // initialise constraint primitive if not existing
        if (!primitive)
            primitive = render.primitives[primitiveId] = new PIXI.Graphics();

        // don't render if constraint does not have two end points
        if (!constraintRender.visible || !constraint.pointA || !constraint.pointB) {
            primitive.clear();
            return;
        }

        // add to scene graph if not already there
        if (Common.indexOf(container.children, primitive) === -1)
            container.addChild(primitive);

        // render the constraint on every update, since they can change dynamically
        primitive.clear();
        primitive.beginFill(0, 0);
        primitive.lineStyle(constraintRender.lineWidth, Common.colorToNumber(constraintRender.strokeStyle), 1);
        
        if (bodyA) {
            primitive.moveTo(bodyA.position.x + pointA.x, bodyA.position.y + pointA.y);
        } else {
            primitive.moveTo(pointA.x, pointA.y);
        }

        if (bodyB) {
            primitive.lineTo(bodyB.position.x + pointB.x, bodyB.position.y + pointB.y);
        } else {
            primitive.lineTo(pointB.x, pointB.y);
        }

        primitive.endFill();
    };
    
    /**
     * Description
     * @method body
     * @param {engine} engine
     * @param {body} body
     * @deprecated
     */
    RenderPixi.body = function(render, body) {
        var engine = render.engine,
            bodyRender = body.render;

        if (!bodyRender.visible)
            return;

        if (bodyRender.sprite && bodyRender.sprite.texture) {
            var spriteId = 'b-' + body.id,
                sprite = render.sprites[spriteId],
                spriteContainer = render.spriteContainer;

            // initialise body sprite if not existing
            if (!sprite)
                sprite = render.sprites[spriteId] = _createBodySprite(render, body);

            // add to scene graph if not already there
            if (Common.indexOf(spriteContainer.children, sprite) === -1)
                spriteContainer.addChild(sprite);

            // update body sprite
            sprite.position.x = body.position.x;
            sprite.position.y = body.position.y;
            sprite.rotation = body.angle;
            sprite.scale.x = bodyRender.sprite.xScale || 1;
            sprite.scale.y = bodyRender.sprite.yScale || 1;
        } else {
            var primitiveId = 'b-' + body.id,
                primitive = render.primitives[primitiveId],
                container = render.container;

            // initialise body primitive if not existing
            if (!primitive) {
                primitive = render.primitives[primitiveId] = _createBodyPrimitive(render, body);
                primitive.initialAngle = body.angle;
            }

            // add to scene graph if not already there
            if (Common.indexOf(container.children, primitive) === -1)
                container.addChild(primitive);

            // update body primitive
            primitive.position.x = body.position.x;
            primitive.position.y = body.position.y;
            primitive.rotation = body.angle - primitive.initialAngle;
        }
    };

    /**
     * Creates a body sprite
     * @method _createBodySprite
     * @private
     * @param {RenderPixi} render
     * @param {body} body
     * @return {PIXI.Sprite} sprite
     * @deprecated
     */
    var _createBodySprite = function(render, body) {
        var bodyRender = body.render,
            texturePath = bodyRender.sprite.texture,
            texture = _getTexture(render, texturePath),
            sprite = new PIXI.Sprite(texture);

        sprite.anchor.x = body.render.sprite.xOffset;
        sprite.anchor.y = body.render.sprite.yOffset;

        return sprite;
    };

    /**
     * Creates a body primitive
     * @method _createBodyPrimitive
     * @private
     * @param {RenderPixi} render
     * @param {body} body
     * @return {PIXI.Graphics} graphics
     * @deprecated
     */
    var _createBodyPrimitive = function(render, body) {
        var bodyRender = body.render,
            options = render.options,
            primitive = new PIXI.Graphics(),
            fillStyle = Common.colorToNumber(bodyRender.fillStyle),
            strokeStyle = Common.colorToNumber(bodyRender.strokeStyle),
            strokeStyleIndicator = Common.colorToNumber(bodyRender.strokeStyle),
            strokeStyleWireframe = Common.colorToNumber('#bbb'),
            strokeStyleWireframeIndicator = Common.colorToNumber('#CD5C5C'),
            part;

        primitive.clear();

        // handle compound parts
        for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
            part = body.parts[k];

            if (!options.wireframes) {
                primitive.beginFill(fillStyle, 1);
                primitive.lineStyle(bodyRender.lineWidth, strokeStyle, 1);
            } else {
                primitive.beginFill(0, 0);
                primitive.lineStyle(1, strokeStyleWireframe, 1);
            }

            primitive.moveTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);

            for (var j = 1; j < part.vertices.length; j++) {
                primitive.lineTo(part.vertices[j].x - body.position.x, part.vertices[j].y - body.position.y);
            }

            primitive.lineTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);

            primitive.endFill();

            // angle indicator
            if (options.showAngleIndicator || options.showAxes) {
                primitive.beginFill(0, 0);

                if (options.wireframes) {
                    primitive.lineStyle(1, strokeStyleWireframeIndicator, 1);
                } else {
                    primitive.lineStyle(1, strokeStyleIndicator);
                }

                primitive.moveTo(part.position.x - body.position.x, part.position.y - body.position.y);
                primitive.lineTo(((part.vertices[0].x + part.vertices[part.vertices.length-1].x) / 2 - body.position.x), 
                                 ((part.vertices[0].y + part.vertices[part.vertices.length-1].y) / 2 - body.position.y));

                primitive.endFill();
            }
        }

        return primitive;
    };

    /**
     * Gets the requested texture (a PIXI.Texture) via its path
     * @method _getTexture
     * @private
     * @param {RenderPixi} render
     * @param {string} imagePath
     * @return {PIXI.Texture} texture
     * @deprecated
     */
    var _getTexture = function(render, imagePath) {
        var texture = render.textures[imagePath];

        if (!texture)
            texture = render.textures[imagePath] = PIXI.Texture.fromImage(imagePath);

        return texture;
    };

})();

},{"../body/Composite":2,"../core/Common":14,"../core/Events":16,"../geometry/Bounds":26,"../geometry/Vector":28}]},{},[30])(30)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
exports = module.exports = Victor;

/**
 * # Victor - A JavaScript 2D vector class with methods for common vector operations
 */

/**
 * Constructor. Will also work without the `new` keyword
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = Victor(42, 1337);
 *
 * @param {Number} x Value of the x axis
 * @param {Number} y Value of the y axis
 * @return {Victor}
 * @api public
 */
function Victor (x, y) {
	if (!(this instanceof Victor)) {
		return new Victor(x, y);
	}

	/**
	 * The X axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.x;
	 *     // => 42
	 *
	 * @api public
	 */
	this.x = x || 0;

	/**
	 * The Y axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.y;
	 *     // => 21
	 *
	 * @api public
	 */
	this.y = y || 0;
};

/**
 * # Static
 */

/**
 * Creates a new instance from an array
 *
 * ### Examples:
 *     var vec = Victor.fromArray([42, 21]);
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromArray
 * @param {Array} array Array with the x and y values at index 0 and 1 respectively
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromArray = function (arr) {
	return new Victor(arr[0] || 0, arr[1] || 0);
};

/**
 * Creates a new instance from an object
 *
 * ### Examples:
 *     var vec = Victor.fromObject({ x: 42, y: 21 });
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromObject
 * @param {Object} obj Object with the values for x and y
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromObject = function (obj) {
	return new Victor(obj.x || 0, obj.y || 0);
};

/**
 * # Manipulation
 *
 * These functions are chainable.
 */

/**
 * Adds another vector's X axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addX(vec2);
 *     vec1.toString();
 *     // => x:30, y:10
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addX = function (vec) {
	this.x += vec.x;
	return this;
};

/**
 * Adds another vector's Y axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addY(vec2);
 *     vec1.toString();
 *     // => x:10, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addY = function (vec) {
	this.y += vec.y;
	return this;
};

/**
 * Adds another vector to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.add(vec2);
 *     vec1.toString();
 *     // => x:30, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

/**
 * Adds the given scalar to both vector axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalar(2);
 *     vec.toString();
 *     // => x: 3, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalar = function (scalar) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

/**
 * Adds the given scalar to the X axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarX(2);
 *     vec.toString();
 *     // => x: 3, y: 2
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarX = function (scalar) {
	this.x += scalar;
	return this;
};

/**
 * Adds the given scalar to the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarY(2);
 *     vec.toString();
 *     // => x: 1, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarY = function (scalar) {
	this.y += scalar;
	return this;
};

/**
 * Subtracts the X axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractX(vec2);
 *     vec1.toString();
 *     // => x:80, y:50
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractX = function (vec) {
	this.x -= vec.x;
	return this;
};

/**
 * Subtracts the Y axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractY(vec2);
 *     vec1.toString();
 *     // => x:100, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractY = function (vec) {
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtract(vec2);
 *     vec1.toString();
 *     // => x:80, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts the given scalar from both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalar(20);
 *     vec.toString();
 *     // => x: 80, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalar = function (scalar) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarX(20);
 *     vec.toString();
 *     // => x: 80, y: 200
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarX = function (scalar) {
	this.x -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarY(20);
 *     vec.toString();
 *     // => x: 100, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarY = function (scalar) {
	this.y -= scalar;
	return this;
};

/**
 * Divides the X axis by the x component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.divideX(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideX = function (vector) {
	this.x /= vector.x;
	return this;
};

/**
 * Divides the Y axis by the y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.divideY(vec2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideY = function (vector) {
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by a axis values of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.divide(vec2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Victor} vector The vector to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divide = function (vector) {
	this.x /= vector.x;
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalar(2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalar = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
		this.y /= scalar;
	} else {
		this.x = 0;
		this.y = 0;
	}

	return this;
};

/**
 * Divides the X axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarX(2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarX = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
	} else {
		this.x = 0;
	}
	return this;
};

/**
 * Divides the Y axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarY(2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarY = function (scalar) {
	if (scalar !== 0) {
		this.y /= scalar;
	} else {
		this.y = 0;
	}
	return this;
};

/**
 * Inverts the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertX();
 *     vec.toString();
 *     // => x:-100, y:50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertX = function () {
	this.x *= -1;
	return this;
};

/**
 * Inverts the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertY();
 *     vec.toString();
 *     // => x:100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertY = function () {
	this.y *= -1;
	return this;
};

/**
 * Inverts both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invert();
 *     vec.toString();
 *     // => x:-100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invert = function () {
	this.invertX();
	this.invertY();
	return this;
};

/**
 * Multiplies the X axis by X component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyX = function (vector) {
	this.x *= vector.x;
	return this;
};

/**
 * Multiplies the Y axis by Y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyY = function (vector) {
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by values from a given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.multiply(vec2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Victor} vector The vector to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiply = function (vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalar(2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Number} The scalar to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalar = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

/**
 * Multiplies the X axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarX(2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarX = function (scalar) {
	this.x *= scalar;
	return this;
};

/**
 * Multiplies the Y axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarY(2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarY = function (scalar) {
	this.y *= scalar;
	return this;
};

/**
 * Normalize
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.normalize = function () {
	var length = this.length();

	if (length === 0) {
		this.x = 1;
		this.y = 0;
	} else {
		this.divide(Victor(length, length));
	}
	return this;
};

Victor.prototype.norm = Victor.prototype.normalize;

/**
 * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.limit(80, 0.9);
 *     vec.toString();
 *     // => x:90, y:50
 *
 * @param {Number} max The maximum value for both x and y axis
 * @param {Number} factor Factor by which the axis are to be multiplied with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.limit = function (max, factor) {
	if (Math.abs(this.x) > max){ this.x *= factor; }
	if (Math.abs(this.y) > max){ this.y *= factor; }
	return this;
};

/**
 * Randomizes both vector axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:67, y:73
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomize = function (topLeft, bottomRight) {
	this.randomizeX(topLeft, bottomRight);
	this.randomizeY(topLeft, bottomRight);

	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:55, y:50
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeX = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.x, bottomRight.x);
	var max = Math.max(topLeft.x, bottomRight.x);
	this.x = random(min, max);
	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:100, y:66
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeY = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.y, bottomRight.y);
	var max = Math.max(topLeft.y, bottomRight.y);
	this.y = random(min, max);
	return this;
};

/**
 * Randomly randomizes either axis between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
 *     vec.toString();
 *     // => x:100, y:77
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
	if (!! Math.round(Math.random())) {
		this.randomizeX(topLeft, bottomRight);
	} else {
		this.randomizeY(topLeft, bottomRight);
	}
	return this;
};

/**
 * Rounds both axis to an integer value
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.unfloat = function () {
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};

/**
 * Rounds both axis to a certain precision
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @param {Number} Precision (default: 8)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.toFixed = function (precision) {
	if (typeof precision === 'undefined') { precision = 8; }
	this.x = this.x.toFixed(precision);
	this.y = this.y.toFixed(precision);
	return this;
};

/**
 * Performs a linear blend / interpolation of the X axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixX(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:100
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixX = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.x = (1 - amount) * this.x + amount * vec.x;
	return this;
};

/**
 * Performs a linear blend / interpolation of the Y axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixY(vec2, 0.5);
 *     vec.toString();
 *     // => x:100, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixY = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.y = (1 - amount) * this.y + amount * vec.y;
	return this;
};

/**
 * Performs a linear blend / interpolation towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mix(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mix = function (vec, amount) {
	this.mixX(vec, amount);
	this.mixY(vec, amount);
	return this;
};

/**
 * # Products
 */

/**
 * Creates a clone of this vector
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = vec1.clone();
 *
 *     vec2.toString();
 *     // => x:10, y:10
 *
 * @return {Victor} A clone of the vector
 * @api public
 */
Victor.prototype.clone = function () {
	return new Victor(this.x, this.y);
};

/**
 * Copies another vector's X component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyX(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:10
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyX = function (vec) {
	this.x = vec.x;
	return this;
};

/**
 * Copies another vector's Y component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyY(vec1);
 *
 *     vec2.toString();
 *     // => x:10, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyY = function (vec) {
	this.y = vec.y;
	return this;
};

/**
 * Copies another vector's X and Y components in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copy(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copy = function (vec) {
	this.copyX(vec);
	this.copyY(vec);
	return this;
};

/**
 * Sets the vector to zero (0,0)
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *		 var1.zero();
 *     vec1.toString();
 *     // => x:0, y:0
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.zero = function () {
	this.x = this.y = 0;
	return this;
};

/**
 * Calculates the dot product of this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.dot(vec2);
 *     // => 23000
 *
 * @param {Victor} vector The second vector
 * @return {Number} Dot product
 * @api public
 */
Victor.prototype.dot = function (vec2) {
	return this.x * vec2.x + this.y * vec2.y;
};

Victor.prototype.cross = function (vec2) {
	return (this.x * vec2.y ) - (this.y * vec2.x );
};

/**
 * Projects a vector onto another vector, setting itself to the result.
 *
 * ### Examples:
 *     var vec = new Victor(100, 0);
 *     var vec2 = new Victor(100, 100);
 *
 *     vec.projectOnto(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want to project this vector onto
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.projectOnto = function (vec2) {
    var coeff = ( (this.x * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
    this.x = coeff * vec2.x;
    this.y = coeff * vec2.y;
    return this;
};


Victor.prototype.horizontalAngle = function () {
	return Math.atan2(this.y, this.x);
};

Victor.prototype.horizontalAngleDeg = function () {
	return radian2degrees(this.horizontalAngle());
};

Victor.prototype.verticalAngle = function () {
	return Math.atan2(this.x, this.y);
};

Victor.prototype.verticalAngleDeg = function () {
	return radian2degrees(this.verticalAngle());
};

Victor.prototype.angle = Victor.prototype.horizontalAngle;
Victor.prototype.angleDeg = Victor.prototype.horizontalAngleDeg;
Victor.prototype.direction = Victor.prototype.horizontalAngle;

Victor.prototype.rotate = function (angle) {
	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

	this.x = nx;
	this.y = ny;

	return this;
};

Victor.prototype.rotateDeg = function (angle) {
	angle = degrees2radian(angle);
	return this.rotate(angle);
};

Victor.prototype.rotateTo = function(rotation) {
	return this.rotate(rotation-this.angle());
};

Victor.prototype.rotateToDeg = function(rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateTo(rotation);
};

Victor.prototype.rotateBy = function (rotation) {
	var angle = this.angle() + rotation;

	return this.rotate(angle);
};

Victor.prototype.rotateByDeg = function (rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateBy(rotation);
};

/**
 * Calculates the distance of the X axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceX(vec2);
 *     // => -100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceX = function (vec) {
	return this.x - vec.x;
};

/**
 * Same as `distanceX()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.absDistanceX(vec2);
 *     // => 100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceX = function (vec) {
	return Math.abs(this.distanceX(vec));
};

/**
 * Calculates the distance of the Y axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => -10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceY = function (vec) {
	return this.y - vec.y;
};

/**
 * Same as `distanceY()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => 10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceY = function (vec) {
	return Math.abs(this.distanceY(vec));
};

/**
 * Calculates the euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distance(vec2);
 *     // => 100.4987562112089
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distance = function (vec) {
	return Math.sqrt(this.distanceSq(vec));
};

/**
 * Calculates the squared euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceSq(vec2);
 *     // => 10100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceSq = function (vec) {
	var dx = this.distanceX(vec),
		dy = this.distanceY(vec);

	return dx * dx + dy * dy;
};

/**
 * Calculates the length or magnitude of the vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.length();
 *     // => 111.80339887498948
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.length = function () {
	return Math.sqrt(this.lengthSq());
};

/**
 * Squared length / magnitude
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.lengthSq();
 *     // => 12500
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.lengthSq = function () {
	return this.x * this.x + this.y * this.y;
};

Victor.prototype.magnitude = Victor.prototype.length;

/**
 * Returns a true if vector is (0, 0)
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.zero();
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
};

/**
 * Returns a true if this vector is the same as another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(100, 50);
 *     vec1.isEqualTo(vec2);
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isEqualTo = function(vec2) {
	return this.x === vec2.x && this.y === vec2.y;
};

/**
 * # Utility Methods
 */

/**
 * Returns an string representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toString();
 *     // => x:10, y:20
 *
 * @return {String}
 * @api public
 */
Victor.prototype.toString = function () {
	return 'x:' + this.x + ', y:' + this.y;
};

/**
 * Returns an array representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toArray();
 *     // => [10, 20]
 *
 * @return {Array}
 * @api public
 */
Victor.prototype.toArray = function () {
	return [ this.x, this.y ];
};

/**
 * Returns an object representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toObject();
 *     // => { x: 10, y: 20 }
 *
 * @return {Object}
 * @api public
 */
Victor.prototype.toObject = function () {
	return { x: this.x, y: this.y };
};


var degrees = 180 / Math.PI;

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function radian2degrees (rad) {
	return rad * degrees;
}

function degrees2radian (deg) {
	return deg / degrees;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9hcHAvY2xpZW50LmpzIiwiLi4vYXBwL3BoeXNpY3MuanMiLCIuLi9ub2RlX21vZHVsZXMvbWF0dGVyLWpzL2J1aWxkL21hdHRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy92aWN0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBQ0EsSUFBSSxhQUFKO0FBQUEsSUFBVSxxQkFBVjtBQUFBLElBQXdCLGNBQXhCO0FBQUEsSUFBK0IsYUFBL0I7QUFBQSxJQUFxQyx1QkFBckM7O0FBRUEsSUFBTSxTQUFTLFNBQVQsTUFBUyxHQUFNO0FBQ3BCLEtBQU0scUNBQVksU0FBUyxzQkFBVCxDQUFnQywwQkFBaEMsQ0FBWixFQUFOO0FBQ0EsS0FBTSxxQ0FBWSxTQUFTLG9CQUFULENBQThCLEdBQTlCLENBQVosRUFBTjtBQUNBLGdCQUFlLFNBQVMsc0JBQVQsQ0FBZ0MscUJBQWhDLEVBQXVELENBQXZELENBQWY7QUFDQSxRQUFPLFNBQVMsc0JBQVQsQ0FBZ0MsYUFBaEMsRUFBK0MsQ0FBL0MsQ0FBUDtBQUNBLFFBQU8sU0FBUyxzQkFBVCxDQUFnQyxNQUFoQyxFQUF3QyxDQUF4QyxDQUFQO0FBQ0Esa0JBQWlCLFNBQVMsc0JBQVQsQ0FBZ0MsbUJBQWhDLEVBQXFELENBQXJELENBQWpCOztBQUVBLE9BQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3ZCLE9BQUssZ0JBQUwsQ0FBc0IsWUFBdEIsRUFBb0MsZUFBcEM7QUFDQSxPQUFLLGdCQUFMLENBQXNCLFlBQXRCLEVBQW9DLGVBQXBDO0FBQ0EsT0FBSyxLQUFMLENBQVcsU0FBWCxHQUF1QixJQUF2QjtBQUNBLEVBSkQ7QUFLQSxPQUFNLE9BQU4sQ0FBYyxVQUFDLElBQUQsRUFBVTtBQUN2QixPQUFLLGdCQUFMLENBQXNCLFlBQXRCLEVBQW9DLFdBQXBDLEVBQWlELEtBQWpEO0FBQ0EsT0FBSyxnQkFBTCxDQUFzQixZQUF0QixFQUFvQyxXQUFwQyxFQUFpRCxLQUFqRDs7QUFFQSxPQUFLLGdCQUFMLENBQXNCLFlBQXRCLEVBQW9DLFdBQXBDLEVBQWlELEtBQWpEO0FBQ0EsT0FBSyxnQkFBTCxDQUFzQixVQUF0QixFQUFrQyxXQUFsQyxFQUErQyxLQUEvQztBQUNBLEVBTkQ7QUFPQSxnQkFBZSxnQkFBZixDQUFnQyxPQUFoQyxFQUF5QyxRQUF6QyxFQUFtRCxLQUFuRDs7QUFFQSx1QkFBc0IsWUFBTTtBQUMzQjtBQUNBLEVBRkQ7QUFHQSxLQUFJLE9BQU8sVUFBUCxHQUFvQixHQUF4QixFQUE2QjtBQUM1QixTQUFPLGdCQUFQLENBQXdCLFdBQXhCLEVBQXFDLFdBQXJDLEVBQWtELEtBQWxEO0FBQ0EsU0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxZQUFNO0FBQ3ZDLHlCQUFzQixZQUFNO0FBQzNCO0FBQ0EsSUFGRDtBQUdBLEdBSkQ7QUFLQSxFQVBELE1BT087QUFDTixTQUFPLGdCQUFQLENBQXdCLG1CQUF4QixFQUE2QyxZQUFNO0FBQ2xELHlCQUFzQixZQUFNO0FBQzNCO0FBQ0EsSUFGRDtBQUdBLEdBSkQ7QUFLQTtBQUNELENBdkNEOztBQXlDQSxJQUFNLGNBQWMsU0FBZCxXQUFjLENBQUMsQ0FBRCxFQUFPO0FBQzFCLE1BQUssS0FBTCxDQUFXLFNBQVgsb0JBQXNDLEVBQUUsT0FBeEMsWUFBc0QsRUFBRSxPQUF4RDtBQUNBLENBRkQ7O0FBSUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBQyxDQUFELEVBQU87QUFDOUIsY0FBYSxTQUFiLENBQXVCLEdBQXZCLENBQTJCLDJCQUEzQjtBQUNBLENBRkQ7O0FBSUEsSUFBTSxjQUFjLFNBQWQsV0FBYyxDQUFDLENBQUQsRUFBTztBQUMxQixHQUFFLGVBQUY7QUFDQSxHQUFFLGFBQUYsQ0FBZ0IsU0FBaEIsQ0FBMEIsR0FBMUIsQ0FBOEIsT0FBOUI7QUFDQSxDQUhEOztBQUtBLElBQU0sY0FBYyxTQUFkLFdBQWMsQ0FBQyxDQUFELEVBQU87QUFDMUIsR0FBRSxhQUFGLENBQWdCLFNBQWhCLENBQTBCLE1BQTFCLENBQWlDLE9BQWpDO0FBQ0EsQ0FGRDs7QUFJQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixHQUFNO0FBQzdCLGNBQWEsU0FBYixDQUF1QixNQUF2QixDQUE4QiwyQkFBOUI7QUFDQSxDQUZEOztBQUlBLElBQU0sV0FBVyxTQUFYLFFBQVcsR0FBTTtBQUN0QixNQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLGVBQXRCO0FBQ0EsQ0FGRDs7QUFLQSxJQUFJLFNBQVMsZ0JBQWIsRUFBK0I7QUFDOUIsVUFBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsTUFBOUM7QUFDQSxDQUZELE1BRU87QUFDTixRQUFPLFdBQVAsQ0FBbUIsUUFBbkIsRUFBNkIsTUFBN0I7QUFDQTs7Ozs7Ozs7Ozs7O0FDMUVEOztBQUNBOzs7Ozs7Ozs7O0FBQ0EsSUFBSSxZQUFKO0FBQUEsSUFBUyxhQUFUO0FBQUEsSUFBZSxZQUFmO0FBQUEsSUFBb0IsY0FBcEI7QUFDQSxJQUFJLGVBQUo7QUFBQSxJQUFZLGVBQVo7QUFDQSxJQUFJLGFBQUo7QUFBQSxJQUFVLGNBQVY7QUFBQSxJQUFpQixlQUFqQjtBQUFBLElBQXlCLGFBQXpCO0FBQ0EsSUFBSSxZQUFZLEVBQWhCO0FBQUEsSUFBb0IsUUFBUSxFQUE1QjtBQUFBLElBQWdDLHdCQUFoQztBQUFBLElBQWlELGNBQWpEOztBQUVBLElBQUksdUJBQUo7QUFDQSxJQUFNLG1CQUFtQixHQUF6QjtBQUNBLElBQU0sb0JBQW9CLEdBQTFCO0FBQ0EsSUFBTSxtQkFBbUIsR0FBekI7QUFDQSxJQUFNLG1CQUFtQixDQUF6Qjs7SUFHTSxRO0FBQ0wsbUJBQVksRUFBWixFQUFnQixJQUFoQixFQUFzQixPQUF0QixFQUErQjtBQUFBOztBQUM5QixNQUFNLFdBQVcsS0FBSyxxQkFBTCxFQUFqQjtBQUNBLE9BQUssRUFBTCxHQUFVLEVBQVY7QUFDQSxPQUFLLFFBQUwsR0FBZ0IsVUFBVSxRQUFRLFFBQWxCLEdBQTZCLEtBQTdDO0FBQ0EsT0FBSyxXQUFMLEdBQW1CLFVBQVUsUUFBUSxPQUFsQixHQUE0QixnQkFBL0M7QUFDQSxPQUFLLElBQUwsR0FBWSxHQUFHLHFCQUFILEVBQVo7QUFDQSxPQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsT0FBSyw2QkFBTCxHQUFxQztBQUNwQyxNQUFHLEdBQUcsVUFBSCxHQUFpQixHQUFHLFdBQUgsR0FBaUIsR0FBbEMsR0FBeUMsU0FBUyxLQUFULEdBQWlCLENBRHpCO0FBRXBDLE1BQUcsR0FBRyxTQUFILEdBQWdCLEdBQUcsWUFBSCxHQUFrQixHQUFsQyxHQUF5QyxTQUFTLE1BQVQsR0FBa0I7QUFGMUIsR0FBckM7O0FBS0E7O0FBRUEsT0FBSyxTQUFMOztBQUVBLE9BQUssT0FBTCxHQUFlLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBZjtBQUNBOztBQUVEO0FBQ0E7QUFDQTs7Ozs4QkFFWTtBQUNYLE9BQU0sTUFBTSxLQUFLLDZCQUFqQjtBQUNBLE9BQU0sVUFBVTtBQUNmLGlCQUFhLEtBQUssV0FESDtBQUVmLGNBQVUsQ0FGSztBQUdmLGlCQUFhLENBSEU7QUFJZixvQkFBZ0IsQ0FKRDtBQUtmLGNBQVUsS0FBSztBQUxBLElBQWhCOztBQVFBLFFBQUssSUFBTCxHQUFZLGlCQUFPLFNBQVAsQ0FBaUIsSUFBSSxDQUFyQixFQUF3QixJQUFJLENBQTVCLEVBQStCLEtBQUssSUFBTCxDQUFVLEtBQXpDLEVBQWdELEtBQUssSUFBTCxDQUFVLE1BQTFELEVBQWtFLE9BQWxFLENBQVo7QUFDQTtBQUNBOzs7MEJBRU8sQyxFQUFHLEMsRUFBRztBQUNiLE9BQU0sS0FBSyxxQkFBVyxDQUFYLEVBQWMsQ0FBZCxDQUFYO0FBQ0EsT0FBTSxPQUFPLEdBQUcsUUFBSCxDQUFZLHFCQUFXLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBOUIsRUFBaUMsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFwRCxDQUFaLENBQWI7QUFDQSxPQUFJLE9BQU8sY0FBWCxFQUEyQjtBQUMzQixPQUFNLFFBQVEsSUFBSSxPQUFPLGNBQXpCO0FBQ0EsT0FBTSxRQUFRLHFCQUNiLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBbkIsR0FBdUIsR0FBRyxDQURiLEVBRWIsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFuQixHQUF1QixHQUFHLENBRmIsRUFHWixJQUhZLEdBR0wsUUFISyxDQUdJLHFCQUFXLEtBQVgsRUFBa0IsS0FBbEIsQ0FISixDQUFkOztBQUtBLGtCQUFLLFVBQUwsQ0FBZ0IsS0FBSyxJQUFyQixFQUEyQixFQUFFLEdBQUcsR0FBRyxDQUFSLEVBQVcsR0FBRyxHQUFHLENBQWpCLEVBQTNCLEVBQWlELEtBQWpEO0FBQ0E7Ozt5QkFFTSxJLEVBQU07QUFDWixPQUFNLElBQUksS0FBSyxHQUFMLENBQVMsSUFBVCxJQUFpQixJQUEzQjtBQUNBLE9BQU0sSUFBSSxLQUFLLEdBQUwsQ0FBUyxJQUFULElBQWlCLElBQTNCO0FBQ0Esa0JBQUssVUFBTCxDQUFnQixLQUFLLElBQXJCLEVBQTJCLEVBQUUsR0FBRyxDQUFMLEVBQVEsR0FBRyxDQUFYLEVBQTNCLEVBQTJDLEVBQUUsSUFBRixFQUFLLElBQUwsRUFBM0M7O0FBRUEsUUFBSyxFQUFMLENBQVEsS0FBUixDQUFjLFNBQWQsMkJBQ2EsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFuQixHQUF1QixLQUFLLDZCQUFMLENBQW1DLENBRHZFLGNBQytFLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsQ0FBbkIsR0FBdUIsS0FBSyw2QkFBTCxDQUFtQyxDQUR6SSwyQkFFVSxLQUFLLElBQUwsQ0FBVSxLQUFWLEdBQWtCLE9BRjVCO0FBSUE7Ozs7OztBQUdLLElBQU0sc0JBQU8sU0FBUCxJQUFPLEdBQU07QUFDekI7QUFDQSxrQkFBaUIsT0FBTyxVQUFQLEdBQW9CLElBQXBCLEdBQTJCLEdBQTNCLEdBQWlDLEdBQWxEOztBQUVBLFFBQU8sU0FBUyxzQkFBVCxDQUFnQyxxQkFBaEMsRUFBdUQsQ0FBdkQsQ0FBUDtBQUNBLHNDQUFZLFNBQVMsc0JBQVQsQ0FBZ0MsMEJBQWhDLENBQVo7QUFDQSx1Q0FBYSxTQUFTLHNCQUFULENBQWdDLHNCQUFoQyxDQUFiO0FBQ0EscUNBQVcsU0FBUyxzQkFBVCxDQUFnQyxhQUFoQyxDQUFYO0FBQ0EsS0FBTSxPQUFPLEtBQUsscUJBQUwsRUFBYjs7QUFFQSxLQUFJLE1BQUosRUFBWTtBQUNYLG1CQUFPLEtBQVAsQ0FBYSxNQUFiO0FBQ0EsV0FBUyxTQUFUO0FBQ0EsY0FBWSxFQUFaO0FBQ0EsT0FBSyxPQUFMLENBQWEsVUFBQyxDQUFEO0FBQUEsVUFBTyxFQUFFLGFBQUYsQ0FBZ0IsV0FBaEIsQ0FBNEIsQ0FBNUIsQ0FBUDtBQUFBLEdBQWI7QUFDQTs7QUFFRCxVQUFTLGlCQUFPLE1BQVAsRUFBVDtBQUNBLFFBQU8sS0FBUCxDQUFhLE9BQWIsQ0FBcUIsQ0FBckIsR0FBeUIsQ0FBekI7QUFDQSxRQUFPLEtBQVAsQ0FBYSxPQUFiLENBQXFCLENBQXJCLEdBQXlCLENBQXpCOztBQUVBLEtBQU0sVUFBVTtBQUNmLFlBQVUsSUFESztBQUVmLGVBQWE7QUFGRSxFQUFoQjs7QUFLQSxLQUFNLFNBQVMsT0FBTyxVQUFQLElBQXFCLEdBQXJCLEdBQTJCLEVBQTNCLEdBQWdDLEVBQS9DO0FBQ0EsU0FBUSxDQUNQLGlCQUFPLFNBQVAsQ0FBaUIsQ0FBakIsRUFBcUIsS0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUFoQixHQUFzQixTQUFTLENBQW5ELEVBQXVELEtBQUssS0FBNUQsRUFBbUUsTUFBbkUsRUFBMkUsT0FBM0UsQ0FETyxFQUVQLGlCQUFPLFNBQVAsQ0FBaUIsQ0FBakIsRUFBcUIsS0FBSyxNQUFMLEdBQWMsQ0FBZixHQUFxQixTQUFTLENBQWxELEVBQXNELEtBQUssS0FBM0QsRUFBa0UsTUFBbEUsRUFBMEUsT0FBMUUsQ0FGTyxFQUlQLGlCQUFPLFNBQVAsQ0FBa0IsS0FBSyxLQUFMLEdBQWEsQ0FBQyxDQUFmLEdBQXFCLFNBQVMsQ0FBL0MsRUFBbUQsQ0FBbkQsRUFBc0QsTUFBdEQsRUFBOEQsS0FBSyxNQUFuRSxFQUEyRSxPQUEzRSxDQUpPLEVBS1AsaUJBQU8sU0FBUCxDQUFrQixLQUFLLEtBQUwsR0FBYSxDQUFkLEdBQW9CLFNBQVMsQ0FBOUMsRUFBa0QsQ0FBbEQsRUFBcUQsTUFBckQsRUFBNkQsS0FBSyxNQUFsRSxFQUEwRSxPQUExRSxDQUxPLENBQVI7O0FBUUEsT0FBTSxPQUFOLENBQWM7QUFBQSxTQUFRLFVBQVUsSUFBVixDQUFlLElBQUksUUFBSixDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBZixDQUFSO0FBQUEsRUFBZDtBQUNBLFFBQU8sT0FBUCxDQUFlO0FBQUEsU0FBUyxVQUFVLElBQVYsQ0FBZSxJQUFJLFFBQUosQ0FBYSxLQUFiLEVBQW9CLElBQXBCLEVBQTBCLEVBQUUsVUFBVSxJQUFaLEVBQWtCLGFBQWEsaUJBQS9CLEVBQTFCLENBQWYsQ0FBVDtBQUFBLEVBQWY7QUFDQTtBQUNBLEtBQU0sc0NBQWEsS0FBYixzQkFBdUIsVUFBVSxHQUFWLENBQWM7QUFBQSxTQUFRLEtBQUssSUFBYjtBQUFBLEVBQWQsQ0FBdkIsRUFBTjs7QUFFQSxTQUFRLGdCQUFNLE1BQU4sQ0FBYSxJQUFiLENBQVI7QUFDQSxPQUFNLE9BQU4sQ0FBYyxtQkFBZCxDQUFrQyxZQUFsQyxFQUFnRCxNQUFNLFVBQXREO0FBQ0EsT0FBTSxPQUFOLENBQWMsbUJBQWQsQ0FBa0MsZ0JBQWxDLEVBQW9ELE1BQU0sVUFBMUQ7QUFDQSxPQUFNLE9BQU4sQ0FBYyxtQkFBZCxDQUFrQyxXQUFsQyxFQUErQyxNQUFNLFNBQXJEO0FBQ0EsT0FBTSxPQUFOLENBQWMsbUJBQWQsQ0FBa0MsWUFBbEMsRUFBZ0QsTUFBTSxTQUF0RDtBQUNBLE9BQU0sT0FBTixDQUFjLG1CQUFkLENBQWtDLFVBQWxDLEVBQThDLE1BQU0sT0FBcEQ7QUFDQSxpQkFBTSxTQUFOLENBQWdCLEtBQWhCLEVBQXVCLEVBQUUsR0FBRyxLQUFLLEtBQUwsR0FBYSxDQUFDLENBQW5CLEVBQXNCLEdBQUcsS0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUF4QyxFQUF2QjtBQUNBLG1CQUFrQiwwQkFBZ0IsTUFBaEIsQ0FBdUIsTUFBdkIsRUFBK0I7QUFDaEQ7QUFEZ0QsRUFBL0IsQ0FBbEI7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBSyxtQkFBTCxDQUF5QixPQUF6QixFQUFrQyxPQUFsQztBQUNBLE1BQUssbUJBQUwsQ0FBeUIsWUFBekIsRUFBdUMsT0FBdkM7QUFDQSxNQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLE9BQS9CO0FBQ0EsTUFBSyxnQkFBTCxDQUFzQixZQUF0QixFQUFvQyxPQUFwQzs7QUFHQSxpQkFBTSxHQUFOLENBQVUsT0FBTyxLQUFqQixFQUF3QixNQUF4QjtBQUNBLGlCQUFNLEdBQU4sQ0FBVSxPQUFPLEtBQWpCLEVBQXdCLGVBQXhCO0FBQ0Esa0JBQU8sR0FBUCxDQUFXLE1BQVg7O0FBRUEsa0JBQU8sRUFBUCxDQUFVLE1BQVYsRUFBa0IsYUFBbEIsRUFBaUMsWUFBTTtBQUN0QyxNQUFNLE1BQU8sSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFiO0FBQ0EsWUFBVSxPQUFWLENBQWtCO0FBQUEsVUFBSyxFQUFFLE1BQUYsQ0FBVSxHQUFWLENBQUw7QUFBQSxHQUFsQjtBQUNHLEVBSEo7QUFJQSxDQXRFTTs7QUF5RVAsSUFBTSxVQUFVLFNBQVYsT0FBVSxDQUFDLENBQUQsRUFBTztBQUN0QixLQUFNLE9BQU8sS0FBSyxxQkFBTCxFQUFiO0FBQ0EsS0FBTSxJQUFJLEVBQUUsT0FBRixHQUFZLEVBQUUsT0FBRixDQUFVLENBQVYsRUFBYSxPQUF6QixHQUFtQyxFQUFFLE9BQS9DO0FBQ0EsS0FBTSxJQUFJLEVBQUUsT0FBRixHQUFZLEVBQUUsT0FBRixDQUFVLENBQVYsRUFBYSxPQUF6QixHQUFtQyxFQUFFLE9BQS9DOztBQUVBLEtBQU0sTUFBTSxDQUFaO0FBQ0EsS0FBTSxNQUFNLElBQUksS0FBSyxHQUFyQjs7QUFFQSxLQUFNLFNBQVMsTUFBTyxLQUFLLEtBQUwsR0FBYSxDQUFuQztBQUNBLEtBQU0sU0FBUyxNQUFPLEtBQUssTUFBTCxHQUFjLENBQXBDOztBQUVBO0FBQ0E7O0FBRUEsV0FBVSxPQUFWLENBQWtCO0FBQUEsU0FBSyxFQUFFLE9BQUYsQ0FBVSxNQUFWLEVBQWtCLE1BQWxCLENBQUw7QUFBQSxFQUFsQjs7QUFFQSxLQUFNLE9BQU8sU0FBUyxhQUFULENBQXVCLE1BQXZCLENBQWI7QUFDQSxNQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxNQUFLLFNBQUwsR0FBaUIsbUJBQWpCO0FBQ0EsTUFBSyxLQUFMLENBQVcsSUFBWCxHQUFxQixNQUFNLEVBQTNCO0FBQ0EsTUFBSyxLQUFMLENBQVcsR0FBWCxHQUFvQixNQUFNLEVBQTFCOztBQUVBLEtBQU0sYUFBYSxTQUFTLHNCQUFULENBQWdDLGVBQWhDLEVBQWlELENBQWpELENBQW5CO0FBQ0EsTUFBSyxZQUFMLENBQWtCLElBQWxCLEVBQXdCLFVBQXhCOztBQUVBLHVCQUFzQixZQUFNO0FBQzNCLE1BQU0sSUFBSSxJQUFJLFFBQUosQ0FBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLEVBQUUsVUFBVSxJQUFaLEVBQWtCLGFBQWEsZ0JBQS9CLEVBQXpCLENBQVY7QUFDQSxZQUFVLElBQVYsQ0FBZSxDQUFmO0FBQ0Esa0JBQU0sR0FBTixDQUFVLE9BQU8sS0FBakIsRUFBd0IsRUFBRSxJQUExQjtBQUNBLE1BQU0sUUFBUSxJQUFJLEtBQUosQ0FBVSw0QkFBVixDQUFkO0FBQ0EsUUFBTSxNQUFOLEdBQWUsSUFBZjtBQUNBLFFBQU0sSUFBTjtBQUNBLEVBUEQ7QUFRQSxDQWpDRDs7OztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3B2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBpbml0IGFzIGluaXRQaHlzaWNzIH0gZnJvbSAnLi9waHlzaWNzLmpzJztcbmxldCBib21iLCBzZWxlY3RlZFdvcmssIGxpbmtzLCBtZW51LCBtZW51RmxpcEJ1dHRvbjtcblxuY29uc3Qga2lja0l0ID0gKCkgPT4ge1xuXHRjb25zdCBpdGVtcyA9IFsuLi5kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZC13b3JrX19saXN0LWl0ZW0nKV07XG5cdGNvbnN0IGxpbmtzID0gWy4uLmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJyldO1xuXHRzZWxlY3RlZFdvcmsgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZW51X19zZWxlY3RlZC13b3JrJylbMF07XG5cdGJvbWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdlbW9qaS0tYm9tYicpWzBdO1xuXHRtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWVudScpWzBdO1xuXHRtZW51RmxpcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lbnVfX2ZsaXAtYnV0dG9uJylbMF07XG5cblx0aXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uRW50ZXJMaXN0SXRlbSk7XG5cdFx0aXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25MZWF2ZUxpc3RJdGVtKTtcblx0XHRpdGVtLnN0eWxlLnRyYW5zZm9ybSA9IG51bGxcblx0fSk7XG5cdGxpbmtzLmZvckVhY2goKGxpbmspID0+IHtcblx0XHRsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbkxpbmtFbnRlciwgZmFsc2UpO1xuXHRcdGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uTGlua0xlYXZlLCBmYWxzZSk7XG5cblx0XHRsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbkxpbmtFbnRlciwgZmFsc2UpO1xuXHRcdGxpbmsuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvbkxpbmtMZWF2ZSwgZmFsc2UpO1xuXHR9KTtcblx0bWVudUZsaXBCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwTWVudSwgZmFsc2UpO1xuXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0aW5pdFBoeXNpY3MoKTtcblx0fSk7XG5cdGlmICh3aW5kb3cuaW5uZXJXaWR0aCA+IDc2OCkge1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0XHRpbml0UGh5c2ljcygpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFx0aW5pdFBoeXNpY3MoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG59XG5cbmNvbnN0IG9uTW91c2VNb3ZlID0gKGUpID0+IHtcblx0Ym9tYi5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoJHtlLmNsaWVudFh9cHgsICR7ZS5jbGllbnRZfXB4LCAwKWA7XG59XG5cbmNvbnN0IG9uRW50ZXJMaXN0SXRlbSA9IChlKSA9PiB7XG5cdHNlbGVjdGVkV29yay5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZC13b3JrLS1pdGVtLWhvdmVyJyk7XG59XG5cbmNvbnN0IG9uTGlua0VudGVyID0gKGUpID0+IHtcblx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0ZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG59XG5cbmNvbnN0IG9uTGlua0xlYXZlID0gKGUpID0+IHtcblx0ZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJyk7XG59XG5cbmNvbnN0IG9uTGVhdmVMaXN0SXRlbSA9ICgpID0+IHtcblx0c2VsZWN0ZWRXb3JrLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkLXdvcmstLWl0ZW0taG92ZXInKTtcbn1cblxuY29uc3QgZmxpcE1lbnUgPSAoKSA9PiB7XG5cdG1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnbWVudS0tZmxpcHBlZCcpO1xufVxuXG5cbmlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBraWNrSXQpO1xufSBlbHNlIHtcblx0d2luZG93LmF0dGFjaEV2ZW50KCdvbmxvYWQnLCBraWNrSXQpO1xufSIsImltcG9ydCB7IEV2ZW50cywgRW5naW5lLCBXb3JsZCwgQm9kaWVzLCBCb2R5LCBSZW5kZXIsIE1vdXNlQ29uc3RyYWludCwgTW91c2UgfSBmcm9tICdtYXR0ZXItanMnO1xuaW1wb3J0IFZpY3RvciBmcm9tICd2aWN0b3InO1xubGV0IHJhZiwgdGhlbiwgbm93LCBkZWx0YTtcbmxldCBlbmdpbmUsIHJlbmRlcjtcbmxldCBsaXN0LCBpdGVtcywgdGl0bGVzLCBmaXJlO1xubGV0IHBhcnRpY2xlcyA9IFtdLCB3YWxscyA9IFtdLCBtb3VzZUNvbnN0cmFpbnQsIG1vdXNlO1xuXG5sZXQgQk9NQl9USFJFU0hPTEQ7XG5jb25zdCBCT01CX1JFU1RJVFVUSU9OID0gMS41O1xuY29uc3QgVElUTEVfUkVTVElUVVRJT04gPSAwLjg7XG5jb25zdCBJVEVNX1JFU1RJVFVUSU9OID0gMC41O1xuY29uc3QgV0FMTF9SRVNUSVRVVElPTiA9IDE7XG5cblxuY2xhc3MgUGFydGljbGUge1xuXHRjb25zdHJ1Y3RvcihlbCwgbGlzdCwgb3B0aW9ucykge1xuXHRcdGNvbnN0IGxpc3RSZWN0ID0gbGlzdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHR0aGlzLmVsID0gZWw7XG5cdFx0dGhpcy5pc1N0YXRpYyA9IG9wdGlvbnMgPyBvcHRpb25zLmlzU3RhdGljIDogZmFsc2U7XG5cdFx0dGhpcy5yZXN0aXR1dGlvbiA9IG9wdGlvbnMgPyBvcHRpb25zLm9wdGlvbnMgOiBJVEVNX1JFU1RJVFVUSU9OO1xuXHRcdHRoaXMucmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHRoaXMuYm9keSA9IG51bGw7XG5cdFx0dGhpcy5vcmlnaW5Qb3NpdGlvblJlbGF0aXZlVG9Xb3JsZCA9IHtcblx0XHRcdHg6IGVsLm9mZnNldExlZnQgKyAoZWwuY2xpZW50V2lkdGggKiAwLjUpIC0gbGlzdFJlY3Qud2lkdGggLyAyLFxuXHRcdFx0eTogZWwub2Zmc2V0VG9wICsgKGVsLmNsaWVudEhlaWdodCAqIDAuNSkgLSBsaXN0UmVjdC5oZWlnaHQgLyAyLFxuXHRcdH1cblxuXHRcdC8vIGlmICghaXNTdGF0aWMpIHRoaXMub3JpZ2luUG9zaXRpb25SZWxhdGl2ZVRvV29ybGQueSArPSA0MDtcblxuXHRcdHRoaXMuc2V0dXBCb2R5KCk7XG5cdFx0XG5cdFx0dGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQodGhpcyk7XG5cdH1cblxuXHQvLyBraWxsKCkge1xuXHQvLyBcdHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2spO1xuXHQvLyB9XG5cblx0c2V0dXBCb2R5KCkge1xuXHRcdGNvbnN0IHBvcyA9IHRoaXMub3JpZ2luUG9zaXRpb25SZWxhdGl2ZVRvV29ybGQ7XG5cdFx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRcdHJlc3RpdHV0aW9uOiB0aGlzLnJlc3RpdHV0aW9uLFxuXHRcdFx0ZnJpY3Rpb246IDAsXG5cdFx0XHRmcmljdGlvbkFpcjogMCxcblx0XHRcdGZyaWN0aW9uU3RhdGljOiAwLFxuXHRcdFx0aXNTdGF0aWM6IHRoaXMuaXNTdGF0aWMsXG5cdFx0fVxuXG5cdFx0dGhpcy5ib2R5ID0gQm9kaWVzLnJlY3RhbmdsZShwb3MueCwgcG9zLnksIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCwgb3B0aW9ucyk7XG5cdFx0Ly8gdGhpcy5ib2R5LnBvc2l0aW9uID0gbmV3IFZpY3Rvcihwb3MueCwgcG9zLnkpO1xuXHR9XG5cblx0b25DbGljayh4LCB5KSB7XG5cdFx0Y29uc3QgbVAgPSBuZXcgVmljdG9yKHgsIHkpO1xuXHRcdGNvbnN0IGRpc3QgPSBtUC5kaXN0YW5jZShuZXcgVmljdG9yKHRoaXMuYm9keS5wb3NpdGlvbi54LCB0aGlzLmJvZHkucG9zaXRpb24ueSkpO1xuXHRcdGlmIChkaXN0ID4gQk9NQl9USFJFU0hPTEQpIHJldHVybjtcblx0XHRjb25zdCBzY2FsZSA9IDEgLSBkaXN0IC8gQk9NQl9USFJFU0hPTEQ7XG5cdFx0Y29uc3QgZm9yY2UgPSBuZXcgVmljdG9yKFxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnggLSBtUC54LFxuXHRcdFx0dGhpcy5ib2R5LnBvc2l0aW9uLnkgLSBtUC55LFxuXHRcdCkubm9ybSgpLm11bHRpcGx5KG5ldyBWaWN0b3Ioc2NhbGUsIHNjYWxlKSk7XG5cblx0XHRCb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB7IHg6IG1QLngsIHk6IG1QLnkgfSwgZm9yY2UpO1xuXHR9XG5cdFxuXHR1cGRhdGUodGltZSkge1xuXHRcdGNvbnN0IHggPSBNYXRoLmNvcyh0aW1lKSAvIDIwMDA7XG5cdFx0Y29uc3QgeSA9IE1hdGguc2luKHRpbWUpIC8gMjAwMDtcblx0XHRCb2R5LmFwcGx5Rm9yY2UodGhpcy5ib2R5LCB7IHg6IDAsIHk6IDAgfSwgeyB4LCB5IH0pO1xuXG5cdFx0dGhpcy5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgXG5cdFx0XHR0cmFuc2xhdGUoJHt0aGlzLmJvZHkucG9zaXRpb24ueCAtIHRoaXMub3JpZ2luUG9zaXRpb25SZWxhdGl2ZVRvV29ybGQueH1weCwgJHt0aGlzLmJvZHkucG9zaXRpb24ueSAtIHRoaXMub3JpZ2luUG9zaXRpb25SZWxhdGl2ZVRvV29ybGQueX1weClcblx0XHRcdHJvdGF0ZSgke3RoaXMuYm9keS5hbmdsZSAqIDU3LjI5NTh9ZGVnKVxuXHRcdGA7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSAoKSA9PiB7XG5cdC8vIHJldHVybjtcblx0Qk9NQl9USFJFU0hPTEQgPSB3aW5kb3cuaW5uZXJXaWR0aCA+IDE0NDAgPyA2MDAgOiA0MDA7XG5cblx0bGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lbnVfX3NlbGVjdGVkLXdvcmsnKVswXTtcblx0aXRlbXMgPSBbLi4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQtd29ya19fbGlzdC1pdGVtJyldO1xuXHR0aXRsZXMgPSBbLi4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2VsZWN0ZWQtd29ya19fdGl0bGUnKV07XG5cdGZpcmUgPSBbLi4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZW1vamktLWZpcmUnKV07XG5cdGNvbnN0IHJlY3QgPSBsaXN0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdGlmIChlbmdpbmUpIHtcblx0XHRFbmdpbmUuY2xlYXIoZW5naW5lKTtcblx0XHRlbmdpbmUgPSB1bmRlZmluZWQ7XG5cdFx0cGFydGljbGVzID0gW107XG5cdFx0ZmlyZS5mb3JFYWNoKChmKSA9PiBmLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZikpO1xuXHR9XG5cblx0ZW5naW5lID0gRW5naW5lLmNyZWF0ZSgpO1xuXHRlbmdpbmUud29ybGQuZ3Jhdml0eS54ID0gMDtcblx0ZW5naW5lLndvcmxkLmdyYXZpdHkueSA9IDA7XG5cblx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRpc1N0YXRpYzogdHJ1ZSxcblx0XHRyZXN0aXR1dGlvbjogV0FMTF9SRVNUSVRVVElPTixcblx0fVxuXG5cdGNvbnN0IGJvcmRlciA9IHdpbmRvdy5pbm5lcldpZHRoIDw9IDc2OCA/IDI1IDogMzU7XG5cdHdhbGxzID0gW1xuXHRcdEJvZGllcy5yZWN0YW5nbGUoMCwgKHJlY3QuaGVpZ2h0IC8gLTIpICsgKGJvcmRlciAvIDIpLCByZWN0LndpZHRoLCBib3JkZXIsIG9wdGlvbnMpLFxuXHRcdEJvZGllcy5yZWN0YW5nbGUoMCwgKHJlY3QuaGVpZ2h0IC8gMikgLSAoYm9yZGVyIC8gMiksIHJlY3Qud2lkdGgsIGJvcmRlciwgb3B0aW9ucyksXG5cblx0XHRCb2RpZXMucmVjdGFuZ2xlKChyZWN0LndpZHRoIC8gLTIpICsgKGJvcmRlciAvIDIpLCAwLCBib3JkZXIsIHJlY3QuaGVpZ2h0LCBvcHRpb25zKSxcblx0XHRCb2RpZXMucmVjdGFuZ2xlKChyZWN0LndpZHRoIC8gMikgLSAoYm9yZGVyIC8gMiksIDAsIGJvcmRlciwgcmVjdC5oZWlnaHQsIG9wdGlvbnMpLFxuXHRdXG5cblx0aXRlbXMuZm9yRWFjaChpdGVtID0+IHBhcnRpY2xlcy5wdXNoKG5ldyBQYXJ0aWNsZShpdGVtLCBsaXN0KSkpO1xuXHR0aXRsZXMuZm9yRWFjaCh0aXRsZSA9PiBwYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUodGl0bGUsIGxpc3QsIHsgaXNTdGF0aWM6IHRydWUsIHJlc3RpdHV0aW9uOiBUSVRMRV9SRVNUSVRVVElPTiB9KSkpO1xuXHQvLyBwYXJ0aWNsZXMucHVzaChuZXcgUGFydGljbGUodGl0bGUsIGxpc3QsIHRydWUpKVxuXHRjb25zdCBib2RpZXMgPSBbLi4ud2FsbHMsIC4uLnBhcnRpY2xlcy5tYXAoaXRlbSA9PiBpdGVtLmJvZHkpXTtcblxuXHRtb3VzZSA9IE1vdXNlLmNyZWF0ZShsaXN0KTtcblx0bW91c2UuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V3aGVlbFwiLCBtb3VzZS5tb3VzZXdoZWVsKTtcblx0bW91c2UuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiRE9NTW91c2VTY3JvbGxcIiwgbW91c2UubW91c2V3aGVlbCk7XG5cdG1vdXNlLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBtb3VzZS5tb3VzZW1vdmUpO1xuXHRtb3VzZS5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIG1vdXNlLm1vdXNlZG93bik7XG5cdG1vdXNlLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIG1vdXNlLm1vdXNldXApO1xuXHRNb3VzZS5zZXRPZmZzZXQobW91c2UsIHsgeDogcmVjdC53aWR0aCAvIC0yLCB5OiByZWN0LmhlaWdodCAvIC0yIH0pO1xuXHRtb3VzZUNvbnN0cmFpbnQgPSBNb3VzZUNvbnN0cmFpbnQuY3JlYXRlKGVuZ2luZSwge1xuXHRcdG1vdXNlLFxuXHR9KTtcblx0XG5cdC8vIEV2ZW50cy5vbihtb3VzZUNvbnN0cmFpbnQsICdtb3VzZWRvd24nLCAoZSkgPT4ge1xuXHQvLyBcdGFkZEZpcmUoZSk7XG5cdC8vIH0pO1xuXHQvLyBcblx0XG5cdGxpc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRGaXJlKTtcblx0bGlzdC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgYWRkRmlyZSk7XG5cdGxpc3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRGaXJlKTtcblx0bGlzdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgYWRkRmlyZSk7XG5cblxuXHRXb3JsZC5hZGQoZW5naW5lLndvcmxkLCBib2RpZXMpO1xuXHRXb3JsZC5hZGQoZW5naW5lLndvcmxkLCBtb3VzZUNvbnN0cmFpbnQpO1xuXHRFbmdpbmUucnVuKGVuZ2luZSk7XG5cblx0RXZlbnRzLm9uKGVuZ2luZSwgJ2FmdGVyVXBkYXRlJywgKCkgPT4ge1xuXHRcdGNvbnN0IG5vdyA9ICBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRwYXJ0aWNsZXMuZm9yRWFjaChwID0+IHAudXBkYXRlKCBub3cgKSk7XG4gICAgfSk7XG59XG5cblxuY29uc3QgYWRkRmlyZSA9IChlKSA9PiB7XG5cdGNvbnN0IHJlY3QgPSBsaXN0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRjb25zdCB4ID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdLmNsaWVudFggOiBlLmNsaWVudFg7XG5cdGNvbnN0IHkgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0uY2xpZW50WSA6IGUuY2xpZW50WTtcblxuXHRjb25zdCBlbFggPSB4O1xuXHRjb25zdCBlbFkgPSB5IC0gcmVjdC50b3A7XG5cblx0Y29uc3Qgd29ybGRYID0gZWxYIC0gKHJlY3Qud2lkdGggLyAyKTtcblx0Y29uc3Qgd29ybGRZID0gZWxZIC0gKHJlY3QuaGVpZ2h0IC8gMik7XG5cblx0Ly8gY29uc3QgeyB4LCB5IH0gPSBlLm1vdXNlLmFic29sdXRlO1xuXHQvLyBjb25zdCB7IHg6IG9mZnNldFgsIHk6IG9mZnNldFkgfSA9IGUubW91c2UubW91c2Vkb3duUG9zaXRpb247XG5cblx0cGFydGljbGVzLmZvckVhY2gocCA9PiBwLm9uQ2xpY2sod29ybGRYLCB3b3JsZFkpKTtcblxuXHRjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRzcGFuLmlubmVySFRNTCA9ICfwn5SlJztcblx0c3Bhbi5jbGFzc05hbWUgPSAnZW1vamkgZW1vamktLWZpcmUnO1xuXHRzcGFuLnN0eWxlLmxlZnQgPSBgJHtlbFggLSA0M31weGA7XG5cdHNwYW4uc3R5bGUudG9wID0gYCR7ZWxZIC0gMjN9cHhgO1xuXG5cdGNvbnN0IGZpcnN0Q2hpbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzZWxlY3RlZC13b3JrJylbMF07XG5cdGxpc3QuaW5zZXJ0QmVmb3JlKHNwYW4sIGZpcnN0Q2hpbGQpO1xuXG5cdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0Y29uc3QgcCA9IG5ldyBQYXJ0aWNsZShzcGFuLCBsaXN0LCB7IGlzU3RhdGljOiB0cnVlLCByZXN0aXR1dGlvbjogQk9NQl9SRVNUSVRVVElPTiB9KTtcblx0XHRwYXJ0aWNsZXMucHVzaChwKTtcblx0XHRXb3JsZC5hZGQoZW5naW5lLndvcmxkLCBwLmJvZHkpO1xuXHRcdGNvbnN0IHNvdW5kID0gbmV3IEF1ZGlvKCdhc3NldHMvc291bmQvZ3VuLXNob3J0Lm1wMycpO1xuXHRcdHNvdW5kLnZvbHVtZSA9IDAuMjI7XG5cdFx0c291bmQucGxheSgpO1xuXHR9KTtcbn1cblxuXG5cblxuXG4iLCIvKipcbiogbWF0dGVyLWpzIDAuMTEuMSBieSBAbGlhYnJ1IDIwMTYtMTEtMDlcbiogaHR0cDovL2JybS5pby9tYXR0ZXItanMvXG4qIExpY2Vuc2UgTUlUXG4qL1xuXG4vKipcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICogXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgTGlhbSBCcnVtbWl0dFxuICogXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKiBcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqIFxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuTWF0dGVyID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLkJvZHlgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIGJvZHkgbW9kZWxzLlxuKiBBIGBNYXR0ZXIuQm9keWAgaXMgYSByaWdpZCBib2R5IHRoYXQgY2FuIGJlIHNpbXVsYXRlZCBieSBhIGBNYXR0ZXIuRW5naW5lYC5cbiogRmFjdG9yaWVzIGZvciBjb21tb25seSB1c2VkIGJvZHkgY29uZmlndXJhdGlvbnMgKHN1Y2ggYXMgcmVjdGFuZ2xlcywgY2lyY2xlcyBhbmQgb3RoZXIgcG9seWdvbnMpIGNhbiBiZSBmb3VuZCBpbiB0aGUgbW9kdWxlIGBNYXR0ZXIuQm9kaWVzYC5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cblxuKiBAY2xhc3MgQm9keVxuKi9cblxudmFyIEJvZHkgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb2R5O1xuXG52YXIgVmVydGljZXMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9WZXJ0aWNlcycpO1xudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xudmFyIFNsZWVwaW5nID0gX2RlcmVxXygnLi4vY29yZS9TbGVlcGluZycpO1xudmFyIFJlbmRlciA9IF9kZXJlcV8oJy4uL3JlbmRlci9SZW5kZXInKTtcbnZhciBDb21tb24gPSBfZGVyZXFfKCcuLi9jb3JlL0NvbW1vbicpO1xudmFyIEJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xudmFyIEF4ZXMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9BeGVzJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIEJvZHkuX2luZXJ0aWFTY2FsZSA9IDQ7XG4gICAgQm9keS5fbmV4dENvbGxpZGluZ0dyb3VwSWQgPSAxO1xuICAgIEJvZHkuX25leHROb25Db2xsaWRpbmdHcm91cElkID0gLTE7XG4gICAgQm9keS5fbmV4dENhdGVnb3J5ID0gMHgwMDAxO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByaWdpZCBib2R5IG1vZGVsLiBUaGUgb3B0aW9ucyBwYXJhbWV0ZXIgaXMgYW4gb2JqZWN0IHRoYXQgc3BlY2lmaWVzIGFueSBwcm9wZXJ0aWVzIHlvdSB3aXNoIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0cy5cbiAgICAgKiBBbGwgcHJvcGVydGllcyBoYXZlIGRlZmF1bHQgdmFsdWVzLCBhbmQgbWFueSBhcmUgcHJlLWNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSBiYXNlZCBvbiBvdGhlciBwcm9wZXJ0aWVzLlxuICAgICAqIFZlcnRpY2VzIG11c3QgYmUgc3BlY2lmaWVkIGluIGNsb2Nrd2lzZSBvcmRlci5cbiAgICAgKiBTZWUgdGhlIHByb3BlcnRpZXMgc2VjdGlvbiBiZWxvdyBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gd2hhdCB5b3UgY2FuIHBhc3MgdmlhIHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHt9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtib2R5fSBib2R5XG4gICAgICovXG4gICAgQm9keS5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGlkOiBDb21tb24ubmV4dElkKCksXG4gICAgICAgICAgICB0eXBlOiAnYm9keScsXG4gICAgICAgICAgICBsYWJlbDogJ0JvZHknLFxuICAgICAgICAgICAgcGFydHM6IFtdLFxuICAgICAgICAgICAgYW5nbGU6IDAsXG4gICAgICAgICAgICB2ZXJ0aWNlczogVmVydGljZXMuZnJvbVBhdGgoJ0wgMCAwIEwgNDAgMCBMIDQwIDQwIEwgMCA0MCcpLFxuICAgICAgICAgICAgcG9zaXRpb246IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgZm9yY2U6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgdG9ycXVlOiAwLFxuICAgICAgICAgICAgcG9zaXRpb25JbXB1bHNlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIGNvbnN0cmFpbnRJbXB1bHNlOiB7IHg6IDAsIHk6IDAsIGFuZ2xlOiAwIH0sXG4gICAgICAgICAgICB0b3RhbENvbnRhY3RzOiAwLFxuICAgICAgICAgICAgc3BlZWQ6IDAsXG4gICAgICAgICAgICBhbmd1bGFyU3BlZWQ6IDAsXG4gICAgICAgICAgICB2ZWxvY2l0eTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICBhbmd1bGFyVmVsb2NpdHk6IDAsXG4gICAgICAgICAgICBpc1NlbnNvcjogZmFsc2UsXG4gICAgICAgICAgICBpc1N0YXRpYzogZmFsc2UsXG4gICAgICAgICAgICBpc1NsZWVwaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIG1vdGlvbjogMCxcbiAgICAgICAgICAgIHNsZWVwVGhyZXNob2xkOiA2MCxcbiAgICAgICAgICAgIGRlbnNpdHk6IDAuMDAxLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IDAsXG4gICAgICAgICAgICBmcmljdGlvbjogMC4xLFxuICAgICAgICAgICAgZnJpY3Rpb25TdGF0aWM6IDAuNSxcbiAgICAgICAgICAgIGZyaWN0aW9uQWlyOiAwLjAxLFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IDB4MDAwMSxcbiAgICAgICAgICAgICAgICBtYXNrOiAweEZGRkZGRkZGLFxuICAgICAgICAgICAgICAgIGdyb3VwOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2xvcDogMC4wNSxcbiAgICAgICAgICAgIHRpbWVTY2FsZTogMSxcbiAgICAgICAgICAgIHJlbmRlcjoge1xuICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICBzcHJpdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgeFNjYWxlOiAxLFxuICAgICAgICAgICAgICAgICAgICB5U2NhbGU6IDEsXG4gICAgICAgICAgICAgICAgICAgIHhPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHlPZmZzZXQ6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMS41XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGJvZHkgPSBDb21tb24uZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICBfaW5pdFByb3BlcnRpZXMoYm9keSwgb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdW5pcXVlIGdyb3VwIGluZGV4IGZvciB3aGljaCBib2RpZXMgd2lsbCBjb2xsaWRlLlxuICAgICAqIElmIGBpc05vbkNvbGxpZGluZ2AgaXMgYHRydWVgLCByZXR1cm5zIHRoZSBuZXh0IHVuaXF1ZSBncm91cCBpbmRleCBmb3Igd2hpY2ggYm9kaWVzIHdpbGwgX25vdF8gY29sbGlkZS5cbiAgICAgKiBTZWUgYGJvZHkuY29sbGlzaW9uRmlsdGVyYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKiBAbWV0aG9kIG5leHRHcm91cFxuICAgICAqIEBwYXJhbSB7Ym9vbH0gW2lzTm9uQ29sbGlkaW5nPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVW5pcXVlIGdyb3VwIGluZGV4XG4gICAgICovXG4gICAgQm9keS5uZXh0R3JvdXAgPSBmdW5jdGlvbihpc05vbkNvbGxpZGluZykge1xuICAgICAgICBpZiAoaXNOb25Db2xsaWRpbmcpXG4gICAgICAgICAgICByZXR1cm4gQm9keS5fbmV4dE5vbkNvbGxpZGluZ0dyb3VwSWQtLTtcblxuICAgICAgICByZXR1cm4gQm9keS5fbmV4dENvbGxpZGluZ0dyb3VwSWQrKztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCB1bmlxdWUgY2F0ZWdvcnkgYml0ZmllbGQgKHN0YXJ0aW5nIGFmdGVyIHRoZSBpbml0aWFsIGRlZmF1bHQgY2F0ZWdvcnkgYDB4MDAwMWApLlxuICAgICAqIFRoZXJlIGFyZSAzMiBhdmFpbGFibGUuIFNlZSBgYm9keS5jb2xsaXNpb25GaWx0ZXJgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqIEBtZXRob2QgbmV4dENhdGVnb3J5XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBVbmlxdWUgY2F0ZWdvcnkgYml0ZmllbGRcbiAgICAgKi9cbiAgICBCb2R5Lm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBCb2R5Ll9uZXh0Q2F0ZWdvcnkgPSBCb2R5Ll9uZXh0Q2F0ZWdvcnkgPDwgMTtcbiAgICAgICAgcmV0dXJuIEJvZHkuX25leHRDYXRlZ29yeTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGlzZXMgYm9keSBwcm9wZXJ0aWVzLlxuICAgICAqIEBtZXRob2QgX2luaXRQcm9wZXJ0aWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge30gW29wdGlvbnNdXG4gICAgICovXG4gICAgdmFyIF9pbml0UHJvcGVydGllcyA9IGZ1bmN0aW9uKGJvZHksIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgLy8gaW5pdCByZXF1aXJlZCBwcm9wZXJ0aWVzIChvcmRlciBpcyBpbXBvcnRhbnQpXG4gICAgICAgIEJvZHkuc2V0KGJvZHksIHtcbiAgICAgICAgICAgIGJvdW5kczogYm9keS5ib3VuZHMgfHwgQm91bmRzLmNyZWF0ZShib2R5LnZlcnRpY2VzKSxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJldjogYm9keS5wb3NpdGlvblByZXYgfHwgVmVjdG9yLmNsb25lKGJvZHkucG9zaXRpb24pLFxuICAgICAgICAgICAgYW5nbGVQcmV2OiBib2R5LmFuZ2xlUHJldiB8fCBib2R5LmFuZ2xlLFxuICAgICAgICAgICAgdmVydGljZXM6IGJvZHkudmVydGljZXMsXG4gICAgICAgICAgICBwYXJ0czogYm9keS5wYXJ0cyB8fCBbYm9keV0sXG4gICAgICAgICAgICBpc1N0YXRpYzogYm9keS5pc1N0YXRpYyxcbiAgICAgICAgICAgIGlzU2xlZXBpbmc6IGJvZHkuaXNTbGVlcGluZyxcbiAgICAgICAgICAgIHBhcmVudDogYm9keS5wYXJlbnQgfHwgYm9keVxuICAgICAgICB9KTtcblxuICAgICAgICBWZXJ0aWNlcy5yb3RhdGUoYm9keS52ZXJ0aWNlcywgYm9keS5hbmdsZSwgYm9keS5wb3NpdGlvbik7XG4gICAgICAgIEF4ZXMucm90YXRlKGJvZHkuYXhlcywgYm9keS5hbmdsZSk7XG4gICAgICAgIEJvdW5kcy51cGRhdGUoYm9keS5ib3VuZHMsIGJvZHkudmVydGljZXMsIGJvZHkudmVsb2NpdHkpO1xuXG4gICAgICAgIC8vIGFsbG93IG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCBwcm9wZXJ0aWVzXG4gICAgICAgIEJvZHkuc2V0KGJvZHksIHtcbiAgICAgICAgICAgIGF4ZXM6IG9wdGlvbnMuYXhlcyB8fCBib2R5LmF4ZXMsXG4gICAgICAgICAgICBhcmVhOiBvcHRpb25zLmFyZWEgfHwgYm9keS5hcmVhLFxuICAgICAgICAgICAgbWFzczogb3B0aW9ucy5tYXNzIHx8IGJvZHkubWFzcyxcbiAgICAgICAgICAgIGluZXJ0aWE6IG9wdGlvbnMuaW5lcnRpYSB8fCBib2R5LmluZXJ0aWFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHByb3BlcnRpZXNcbiAgICAgICAgdmFyIGRlZmF1bHRGaWxsU3R5bGUgPSAoYm9keS5pc1N0YXRpYyA/ICcjZWVlZWVlJyA6IENvbW1vbi5jaG9vc2UoWycjNTU2MjcwJywgJyM0RUNEQzQnLCAnI0M3RjQ2NCcsICcjRkY2QjZCJywgJyNDNDRENTgnXSkpLFxuICAgICAgICAgICAgZGVmYXVsdFN0cm9rZVN0eWxlID0gQ29tbW9uLnNoYWRlQ29sb3IoZGVmYXVsdEZpbGxTdHlsZSwgLTIwKTtcbiAgICAgICAgYm9keS5yZW5kZXIuZmlsbFN0eWxlID0gYm9keS5yZW5kZXIuZmlsbFN0eWxlIHx8IGRlZmF1bHRGaWxsU3R5bGU7XG4gICAgICAgIGJvZHkucmVuZGVyLnN0cm9rZVN0eWxlID0gYm9keS5yZW5kZXIuc3Ryb2tlU3R5bGUgfHwgZGVmYXVsdFN0cm9rZVN0eWxlO1xuICAgICAgICBib2R5LnJlbmRlci5zcHJpdGUueE9mZnNldCArPSAtKGJvZHkuYm91bmRzLm1pbi54IC0gYm9keS5wb3NpdGlvbi54KSAvIChib2R5LmJvdW5kcy5tYXgueCAtIGJvZHkuYm91bmRzLm1pbi54KTtcbiAgICAgICAgYm9keS5yZW5kZXIuc3ByaXRlLnlPZmZzZXQgKz0gLShib2R5LmJvdW5kcy5taW4ueSAtIGJvZHkucG9zaXRpb24ueSkgLyAoYm9keS5ib3VuZHMubWF4LnkgLSBib2R5LmJvdW5kcy5taW4ueSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgcHJvcGVydHkgYW5kIGEgdmFsdWUgKG9yIG1hcCBvZiksIHNldHMgdGhlIHByb3BlcnR5KHMpIG9uIHRoZSBib2R5LCB1c2luZyB0aGUgYXBwcm9wcmlhdGUgc2V0dGVyIGZ1bmN0aW9ucyBpZiB0aGV5IGV4aXN0LlxuICAgICAqIFByZWZlciB0byB1c2UgdGhlIGFjdHVhbCBzZXR0ZXIgZnVuY3Rpb25zIGluIHBlcmZvcm1hbmNlIGNyaXRpY2FsIHNpdHVhdGlvbnMuXG4gICAgICogQG1ldGhvZCBzZXRcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge30gc2V0dGluZ3MgQSBwcm9wZXJ0eSBuYW1lIChvciBtYXAgb2YgcHJvcGVydGllcyBhbmQgdmFsdWVzKSB0byBzZXQgb24gdGhlIGJvZHkuXG4gICAgICogQHBhcmFtIHt9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQgaWYgYHNldHRpbmdzYCBpcyBhIHNpbmdsZSBwcm9wZXJ0eSBuYW1lLlxuICAgICAqL1xuICAgIEJvZHkuc2V0ID0gZnVuY3Rpb24oYm9keSwgc2V0dGluZ3MsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eTtcblxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHJvcGVydHkgPSBzZXR0aW5ncztcbiAgICAgICAgICAgIHNldHRpbmdzID0ge307XG4gICAgICAgICAgICBzZXR0aW5nc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAocHJvcGVydHkgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHZhbHVlID0gc2V0dGluZ3NbcHJvcGVydHldO1xuXG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eSkge1xuXG4gICAgICAgICAgICBjYXNlICdpc1N0YXRpYyc6XG4gICAgICAgICAgICAgICAgQm9keS5zZXRTdGF0aWMoYm9keSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaXNTbGVlcGluZyc6XG4gICAgICAgICAgICAgICAgU2xlZXBpbmcuc2V0KGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21hc3MnOlxuICAgICAgICAgICAgICAgIEJvZHkuc2V0TWFzcyhib2R5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZW5zaXR5JzpcbiAgICAgICAgICAgICAgICBCb2R5LnNldERlbnNpdHkoYm9keSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5lcnRpYSc6XG4gICAgICAgICAgICAgICAgQm9keS5zZXRJbmVydGlhKGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZlcnRpY2VzJzpcbiAgICAgICAgICAgICAgICBCb2R5LnNldFZlcnRpY2VzKGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Bvc2l0aW9uJzpcbiAgICAgICAgICAgICAgICBCb2R5LnNldFBvc2l0aW9uKGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FuZ2xlJzpcbiAgICAgICAgICAgICAgICBCb2R5LnNldEFuZ2xlKGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZlbG9jaXR5JzpcbiAgICAgICAgICAgICAgICBCb2R5LnNldFZlbG9jaXR5KGJvZHksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FuZ3VsYXJWZWxvY2l0eSc6XG4gICAgICAgICAgICAgICAgQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkoYm9keSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGFydHMnOlxuICAgICAgICAgICAgICAgIEJvZHkuc2V0UGFydHMoYm9keSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBib2R5W3Byb3BlcnR5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYm9keSBhcyBzdGF0aWMsIGluY2x1ZGluZyBpc1N0YXRpYyBmbGFnIGFuZCBzZXR0aW5nIG1hc3MgYW5kIGluZXJ0aWEgdG8gSW5maW5pdHkuXG4gICAgICogQG1ldGhvZCBzZXRTdGF0aWNcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IGlzU3RhdGljXG4gICAgICovXG4gICAgQm9keS5zZXRTdGF0aWMgPSBmdW5jdGlvbihib2R5LCBpc1N0YXRpYykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZHkucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keS5wYXJ0c1tpXTtcbiAgICAgICAgICAgIHBhcnQuaXNTdGF0aWMgPSBpc1N0YXRpYztcblxuICAgICAgICAgICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICAgICAgICAgICAgcGFydC5yZXN0aXR1dGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgcGFydC5mcmljdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgcGFydC5tYXNzID0gcGFydC5pbmVydGlhID0gcGFydC5kZW5zaXR5ID0gSW5maW5pdHk7XG4gICAgICAgICAgICAgICAgcGFydC5pbnZlcnNlTWFzcyA9IHBhcnQuaW52ZXJzZUluZXJ0aWEgPSAwO1xuXG4gICAgICAgICAgICAgICAgcGFydC5wb3NpdGlvblByZXYueCA9IHBhcnQucG9zaXRpb24ueDtcbiAgICAgICAgICAgICAgICBwYXJ0LnBvc2l0aW9uUHJldi55ID0gcGFydC5wb3NpdGlvbi55O1xuICAgICAgICAgICAgICAgIHBhcnQuYW5nbGVQcmV2ID0gcGFydC5hbmdsZTtcbiAgICAgICAgICAgICAgICBwYXJ0LmFuZ3VsYXJWZWxvY2l0eSA9IDA7XG4gICAgICAgICAgICAgICAgcGFydC5zcGVlZCA9IDA7XG4gICAgICAgICAgICAgICAgcGFydC5hbmd1bGFyU3BlZWQgPSAwO1xuICAgICAgICAgICAgICAgIHBhcnQubW90aW9uID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtYXNzIG9mIHRoZSBib2R5LiBJbnZlcnNlIG1hc3MgYW5kIGRlbnNpdHkgYXJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCB0byByZWZsZWN0IHRoZSBjaGFuZ2UuXG4gICAgICogQG1ldGhvZCBzZXRNYXNzXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1hc3NcbiAgICAgKi9cbiAgICBCb2R5LnNldE1hc3MgPSBmdW5jdGlvbihib2R5LCBtYXNzKSB7XG4gICAgICAgIGJvZHkubWFzcyA9IG1hc3M7XG4gICAgICAgIGJvZHkuaW52ZXJzZU1hc3MgPSAxIC8gYm9keS5tYXNzO1xuICAgICAgICBib2R5LmRlbnNpdHkgPSBib2R5Lm1hc3MgLyBib2R5LmFyZWE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlbnNpdHkgb2YgdGhlIGJvZHkuIE1hc3MgaXMgYXV0b21hdGljYWxseSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIGNoYW5nZS5cbiAgICAgKiBAbWV0aG9kIHNldERlbnNpdHlcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVuc2l0eVxuICAgICAqL1xuICAgIEJvZHkuc2V0RGVuc2l0eSA9IGZ1bmN0aW9uKGJvZHksIGRlbnNpdHkpIHtcbiAgICAgICAgQm9keS5zZXRNYXNzKGJvZHksIGRlbnNpdHkgKiBib2R5LmFyZWEpO1xuICAgICAgICBib2R5LmRlbnNpdHkgPSBkZW5zaXR5O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtb21lbnQgb2YgaW5lcnRpYSAoaS5lLiBzZWNvbmQgbW9tZW50IG9mIGFyZWEpIG9mIHRoZSBib2R5IG9mIHRoZSBib2R5LiBcbiAgICAgKiBJbnZlcnNlIGluZXJ0aWEgaXMgYXV0b21hdGljYWxseSB1cGRhdGVkIHRvIHJlZmxlY3QgdGhlIGNoYW5nZS4gTWFzcyBpcyBub3QgY2hhbmdlZC5cbiAgICAgKiBAbWV0aG9kIHNldEluZXJ0aWFcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5lcnRpYVxuICAgICAqL1xuICAgIEJvZHkuc2V0SW5lcnRpYSA9IGZ1bmN0aW9uKGJvZHksIGluZXJ0aWEpIHtcbiAgICAgICAgYm9keS5pbmVydGlhID0gaW5lcnRpYTtcbiAgICAgICAgYm9keS5pbnZlcnNlSW5lcnRpYSA9IDEgLyBib2R5LmluZXJ0aWE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGJvZHkncyB2ZXJ0aWNlcyBhbmQgdXBkYXRlcyBib2R5IHByb3BlcnRpZXMgYWNjb3JkaW5nbHksIGluY2x1ZGluZyBpbmVydGlhLCBhcmVhIGFuZCBtYXNzICh3aXRoIHJlc3BlY3QgdG8gYGJvZHkuZGVuc2l0eWApLlxuICAgICAqIFZlcnRpY2VzIHdpbGwgYmUgYXV0b21hdGljYWxseSB0cmFuc2Zvcm1lZCB0byBiZSBvcmllbnRhdGVkIGFyb3VuZCB0aGVpciBjZW50cmUgb2YgbWFzcyBhcyB0aGUgb3JpZ2luLlxuICAgICAqIFRoZXkgYXJlIHRoZW4gYXV0b21hdGljYWxseSB0cmFuc2xhdGVkIHRvIHdvcmxkIHNwYWNlIGJhc2VkIG9uIGBib2R5LnBvc2l0aW9uYC5cbiAgICAgKlxuICAgICAqIFRoZSBgdmVydGljZXNgIGFyZ3VtZW50IHNob3VsZCBiZSBwYXNzZWQgYXMgYW4gYXJyYXkgb2YgYE1hdHRlci5WZWN0b3JgIHBvaW50cyAob3IgYSBgTWF0dGVyLlZlcnRpY2VzYCBhcnJheSkuXG4gICAgICogVmVydGljZXMgbXVzdCBmb3JtIGEgY29udmV4IGh1bGwsIGNvbmNhdmUgaHVsbHMgYXJlIG5vdCBzdXBwb3J0ZWQuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHNldFZlcnRpY2VzXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHt2ZWN0b3JbXX0gdmVydGljZXNcbiAgICAgKi9cbiAgICBCb2R5LnNldFZlcnRpY2VzID0gZnVuY3Rpb24oYm9keSwgdmVydGljZXMpIHtcbiAgICAgICAgLy8gY2hhbmdlIHZlcnRpY2VzXG4gICAgICAgIGlmICh2ZXJ0aWNlc1swXS5ib2R5ID09PSBib2R5KSB7XG4gICAgICAgICAgICBib2R5LnZlcnRpY2VzID0gdmVydGljZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5LnZlcnRpY2VzID0gVmVydGljZXMuY3JlYXRlKHZlcnRpY2VzLCBib2R5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBwcm9wZXJ0aWVzXG4gICAgICAgIGJvZHkuYXhlcyA9IEF4ZXMuZnJvbVZlcnRpY2VzKGJvZHkudmVydGljZXMpO1xuICAgICAgICBib2R5LmFyZWEgPSBWZXJ0aWNlcy5hcmVhKGJvZHkudmVydGljZXMpO1xuICAgICAgICBCb2R5LnNldE1hc3MoYm9keSwgYm9keS5kZW5zaXR5ICogYm9keS5hcmVhKTtcblxuICAgICAgICAvLyBvcmllbnQgdmVydGljZXMgYXJvdW5kIHRoZSBjZW50cmUgb2YgbWFzcyBhdCBvcmlnaW4gKDAsIDApXG4gICAgICAgIHZhciBjZW50cmUgPSBWZXJ0aWNlcy5jZW50cmUoYm9keS52ZXJ0aWNlcyk7XG4gICAgICAgIFZlcnRpY2VzLnRyYW5zbGF0ZShib2R5LnZlcnRpY2VzLCBjZW50cmUsIC0xKTtcblxuICAgICAgICAvLyB1cGRhdGUgaW5lcnRpYSB3aGlsZSB2ZXJ0aWNlcyBhcmUgYXQgb3JpZ2luICgwLCAwKVxuICAgICAgICBCb2R5LnNldEluZXJ0aWEoYm9keSwgQm9keS5faW5lcnRpYVNjYWxlICogVmVydGljZXMuaW5lcnRpYShib2R5LnZlcnRpY2VzLCBib2R5Lm1hc3MpKTtcblxuICAgICAgICAvLyB1cGRhdGUgZ2VvbWV0cnlcbiAgICAgICAgVmVydGljZXMudHJhbnNsYXRlKGJvZHkudmVydGljZXMsIGJvZHkucG9zaXRpb24pO1xuICAgICAgICBCb3VuZHMudXBkYXRlKGJvZHkuYm91bmRzLCBib2R5LnZlcnRpY2VzLCBib2R5LnZlbG9jaXR5KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgcGFydHMgb2YgdGhlIGBib2R5YCBhbmQgdXBkYXRlcyBtYXNzLCBpbmVydGlhIGFuZCBjZW50cm9pZC5cbiAgICAgKiBFYWNoIHBhcnQgd2lsbCBoYXZlIGl0cyBwYXJlbnQgc2V0IHRvIGBib2R5YC5cbiAgICAgKiBCeSBkZWZhdWx0IHRoZSBjb252ZXggaHVsbCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgY29tcHV0ZWQgYW5kIHNldCBvbiBgYm9keWAsIHVubGVzcyBgYXV0b0h1bGxgIGlzIHNldCB0byBgZmFsc2UuYFxuICAgICAqIE5vdGUgdGhhdCB0aGlzIG1ldGhvZCB3aWxsIGVuc3VyZSB0aGF0IHRoZSBmaXJzdCBwYXJ0IGluIGBib2R5LnBhcnRzYCB3aWxsIGFsd2F5cyBiZSB0aGUgYGJvZHlgLlxuICAgICAqIEBtZXRob2Qgc2V0UGFydHNcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0gW2JvZHldIHBhcnRzXG4gICAgICogQHBhcmFtIHtib29sfSBbYXV0b0h1bGw9dHJ1ZV1cbiAgICAgKi9cbiAgICBCb2R5LnNldFBhcnRzID0gZnVuY3Rpb24oYm9keSwgcGFydHMsIGF1dG9IdWxsKSB7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIC8vIGFkZCBhbGwgdGhlIHBhcnRzLCBlbnN1cmluZyB0aGF0IHRoZSBmaXJzdCBwYXJ0IGlzIGFsd2F5cyB0aGUgcGFyZW50IGJvZHlcbiAgICAgICAgcGFydHMgPSBwYXJ0cy5zbGljZSgwKTtcbiAgICAgICAgYm9keS5wYXJ0cy5sZW5ndGggPSAwO1xuICAgICAgICBib2R5LnBhcnRzLnB1c2goYm9keSk7XG4gICAgICAgIGJvZHkucGFyZW50ID0gYm9keTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgICBpZiAocGFydCAhPT0gYm9keSkge1xuICAgICAgICAgICAgICAgIHBhcnQucGFyZW50ID0gYm9keTtcbiAgICAgICAgICAgICAgICBib2R5LnBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keS5wYXJ0cy5sZW5ndGggPT09IDEpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgYXV0b0h1bGwgPSB0eXBlb2YgYXV0b0h1bGwgIT09ICd1bmRlZmluZWQnID8gYXV0b0h1bGwgOiB0cnVlO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIGNvbnZleCBodWxsIG9mIGFsbCBwYXJ0cyB0byBzZXQgb24gdGhlIHBhcmVudCBib2R5XG4gICAgICAgIGlmIChhdXRvSHVsbCkge1xuICAgICAgICAgICAgdmFyIHZlcnRpY2VzID0gW107XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLmNvbmNhdChwYXJ0c1tpXS52ZXJ0aWNlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFZlcnRpY2VzLmNsb2Nrd2lzZVNvcnQodmVydGljZXMpO1xuXG4gICAgICAgICAgICB2YXIgaHVsbCA9IFZlcnRpY2VzLmh1bGwodmVydGljZXMpLFxuICAgICAgICAgICAgICAgIGh1bGxDZW50cmUgPSBWZXJ0aWNlcy5jZW50cmUoaHVsbCk7XG5cbiAgICAgICAgICAgIEJvZHkuc2V0VmVydGljZXMoYm9keSwgaHVsbCk7XG4gICAgICAgICAgICBWZXJ0aWNlcy50cmFuc2xhdGUoYm9keS52ZXJ0aWNlcywgaHVsbENlbnRyZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdW0gdGhlIHByb3BlcnRpZXMgb2YgYWxsIGNvbXBvdW5kIHBhcnRzIG9mIHRoZSBwYXJlbnQgYm9keVxuICAgICAgICB2YXIgdG90YWwgPSBfdG90YWxQcm9wZXJ0aWVzKGJvZHkpO1xuXG4gICAgICAgIGJvZHkuYXJlYSA9IHRvdGFsLmFyZWE7XG4gICAgICAgIGJvZHkucGFyZW50ID0gYm9keTtcbiAgICAgICAgYm9keS5wb3NpdGlvbi54ID0gdG90YWwuY2VudHJlLng7XG4gICAgICAgIGJvZHkucG9zaXRpb24ueSA9IHRvdGFsLmNlbnRyZS55O1xuICAgICAgICBib2R5LnBvc2l0aW9uUHJldi54ID0gdG90YWwuY2VudHJlLng7XG4gICAgICAgIGJvZHkucG9zaXRpb25QcmV2LnkgPSB0b3RhbC5jZW50cmUueTtcblxuICAgICAgICBCb2R5LnNldE1hc3MoYm9keSwgdG90YWwubWFzcyk7XG4gICAgICAgIEJvZHkuc2V0SW5lcnRpYShib2R5LCB0b3RhbC5pbmVydGlhKTtcbiAgICAgICAgQm9keS5zZXRQb3NpdGlvbihib2R5LCB0b3RhbC5jZW50cmUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgYm9keSBpbnN0YW50bHkuIFZlbG9jaXR5LCBhbmdsZSwgZm9yY2UgZXRjLiBhcmUgdW5jaGFuZ2VkLlxuICAgICAqIEBtZXRob2Qgc2V0UG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gcG9zaXRpb25cbiAgICAgKi9cbiAgICBCb2R5LnNldFBvc2l0aW9uID0gZnVuY3Rpb24oYm9keSwgcG9zaXRpb24pIHtcbiAgICAgICAgdmFyIGRlbHRhID0gVmVjdG9yLnN1Yihwb3NpdGlvbiwgYm9keS5wb3NpdGlvbik7XG4gICAgICAgIGJvZHkucG9zaXRpb25QcmV2LnggKz0gZGVsdGEueDtcbiAgICAgICAgYm9keS5wb3NpdGlvblByZXYueSArPSBkZWx0YS55O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9keS5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBhcnQgPSBib2R5LnBhcnRzW2ldO1xuICAgICAgICAgICAgcGFydC5wb3NpdGlvbi54ICs9IGRlbHRhLng7XG4gICAgICAgICAgICBwYXJ0LnBvc2l0aW9uLnkgKz0gZGVsdGEueTtcbiAgICAgICAgICAgIFZlcnRpY2VzLnRyYW5zbGF0ZShwYXJ0LnZlcnRpY2VzLCBkZWx0YSk7XG4gICAgICAgICAgICBCb3VuZHMudXBkYXRlKHBhcnQuYm91bmRzLCBwYXJ0LnZlcnRpY2VzLCBib2R5LnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhbmdsZSBvZiB0aGUgYm9keSBpbnN0YW50bHkuIEFuZ3VsYXIgdmVsb2NpdHksIHBvc2l0aW9uLCBmb3JjZSBldGMuIGFyZSB1bmNoYW5nZWQuXG4gICAgICogQG1ldGhvZCBzZXRBbmdsZVxuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIEJvZHkuc2V0QW5nbGUgPSBmdW5jdGlvbihib2R5LCBhbmdsZSkge1xuICAgICAgICB2YXIgZGVsdGEgPSBhbmdsZSAtIGJvZHkuYW5nbGU7XG4gICAgICAgIGJvZHkuYW5nbGVQcmV2ICs9IGRlbHRhO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9keS5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBhcnQgPSBib2R5LnBhcnRzW2ldO1xuICAgICAgICAgICAgcGFydC5hbmdsZSArPSBkZWx0YTtcbiAgICAgICAgICAgIFZlcnRpY2VzLnJvdGF0ZShwYXJ0LnZlcnRpY2VzLCBkZWx0YSwgYm9keS5wb3NpdGlvbik7XG4gICAgICAgICAgICBBeGVzLnJvdGF0ZShwYXJ0LmF4ZXMsIGRlbHRhKTtcbiAgICAgICAgICAgIEJvdW5kcy51cGRhdGUocGFydC5ib3VuZHMsIHBhcnQudmVydGljZXMsIGJvZHkudmVsb2NpdHkpO1xuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgVmVjdG9yLnJvdGF0ZUFib3V0KHBhcnQucG9zaXRpb24sIGRlbHRhLCBib2R5LnBvc2l0aW9uLCBwYXJ0LnBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBsaW5lYXIgdmVsb2NpdHkgb2YgdGhlIGJvZHkgaW5zdGFudGx5LiBQb3NpdGlvbiwgYW5nbGUsIGZvcmNlIGV0Yy4gYXJlIHVuY2hhbmdlZC4gU2VlIGFsc28gYEJvZHkuYXBwbHlGb3JjZWAuXG4gICAgICogQG1ldGhvZCBzZXRWZWxvY2l0eVxuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWxvY2l0eVxuICAgICAqL1xuICAgIEJvZHkuc2V0VmVsb2NpdHkgPSBmdW5jdGlvbihib2R5LCB2ZWxvY2l0eSkge1xuICAgICAgICBib2R5LnBvc2l0aW9uUHJldi54ID0gYm9keS5wb3NpdGlvbi54IC0gdmVsb2NpdHkueDtcbiAgICAgICAgYm9keS5wb3NpdGlvblByZXYueSA9IGJvZHkucG9zaXRpb24ueSAtIHZlbG9jaXR5Lnk7XG4gICAgICAgIGJvZHkudmVsb2NpdHkueCA9IHZlbG9jaXR5Lng7XG4gICAgICAgIGJvZHkudmVsb2NpdHkueSA9IHZlbG9jaXR5Lnk7XG4gICAgICAgIGJvZHkuc3BlZWQgPSBWZWN0b3IubWFnbml0dWRlKGJvZHkudmVsb2NpdHkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhbmd1bGFyIHZlbG9jaXR5IG9mIHRoZSBib2R5IGluc3RhbnRseS4gUG9zaXRpb24sIGFuZ2xlLCBmb3JjZSBldGMuIGFyZSB1bmNoYW5nZWQuIFNlZSBhbHNvIGBCb2R5LmFwcGx5Rm9yY2VgLlxuICAgICAqIEBtZXRob2Qgc2V0QW5ndWxhclZlbG9jaXR5XG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZlbG9jaXR5XG4gICAgICovXG4gICAgQm9keS5zZXRBbmd1bGFyVmVsb2NpdHkgPSBmdW5jdGlvbihib2R5LCB2ZWxvY2l0eSkge1xuICAgICAgICBib2R5LmFuZ2xlUHJldiA9IGJvZHkuYW5nbGUgLSB2ZWxvY2l0eTtcbiAgICAgICAgYm9keS5hbmd1bGFyVmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICAgICAgYm9keS5hbmd1bGFyU3BlZWQgPSBNYXRoLmFicyhib2R5LmFuZ3VsYXJWZWxvY2l0eSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1vdmVzIGEgYm9keSBieSBhIGdpdmVuIHZlY3RvciByZWxhdGl2ZSB0byBpdHMgY3VycmVudCBwb3NpdGlvbiwgd2l0aG91dCBpbXBhcnRpbmcgYW55IHZlbG9jaXR5LlxuICAgICAqIEBtZXRob2QgdHJhbnNsYXRlXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHRyYW5zbGF0aW9uXG4gICAgICovXG4gICAgQm9keS50cmFuc2xhdGUgPSBmdW5jdGlvbihib2R5LCB0cmFuc2xhdGlvbikge1xuICAgICAgICBCb2R5LnNldFBvc2l0aW9uKGJvZHksIFZlY3Rvci5hZGQoYm9keS5wb3NpdGlvbiwgdHJhbnNsYXRpb24pKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUm90YXRlcyBhIGJvZHkgYnkgYSBnaXZlbiBhbmdsZSByZWxhdGl2ZSB0byBpdHMgY3VycmVudCBhbmdsZSwgd2l0aG91dCBpbXBhcnRpbmcgYW55IGFuZ3VsYXIgdmVsb2NpdHkuXG4gICAgICogQG1ldGhvZCByb3RhdGVcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcm90YXRpb25cbiAgICAgKi9cbiAgICBCb2R5LnJvdGF0ZSA9IGZ1bmN0aW9uKGJvZHksIHJvdGF0aW9uKSB7XG4gICAgICAgIEJvZHkuc2V0QW5nbGUoYm9keSwgYm9keS5hbmdsZSArIHJvdGF0aW9uKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2NhbGVzIHRoZSBib2R5LCBpbmNsdWRpbmcgdXBkYXRpbmcgcGh5c2ljYWwgcHJvcGVydGllcyAobWFzcywgYXJlYSwgYXhlcywgaW5lcnRpYSksIGZyb20gYSB3b3JsZC1zcGFjZSBwb2ludCAoZGVmYXVsdCBpcyBib2R5IGNlbnRyZSkuXG4gICAgICogQG1ldGhvZCBzY2FsZVxuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZVhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGVZXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IFtwb2ludF1cbiAgICAgKi9cbiAgICBCb2R5LnNjYWxlID0gZnVuY3Rpb24oYm9keSwgc2NhbGVYLCBzY2FsZVksIHBvaW50KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9keS5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBhcnQgPSBib2R5LnBhcnRzW2ldO1xuXG4gICAgICAgICAgICAvLyBzY2FsZSB2ZXJ0aWNlc1xuICAgICAgICAgICAgVmVydGljZXMuc2NhbGUocGFydC52ZXJ0aWNlcywgc2NhbGVYLCBzY2FsZVksIGJvZHkucG9zaXRpb24pO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgcHJvcGVydGllc1xuICAgICAgICAgICAgcGFydC5heGVzID0gQXhlcy5mcm9tVmVydGljZXMocGFydC52ZXJ0aWNlcyk7XG5cbiAgICAgICAgICAgIGlmICghYm9keS5pc1N0YXRpYykge1xuICAgICAgICAgICAgICAgIHBhcnQuYXJlYSA9IFZlcnRpY2VzLmFyZWEocGFydC52ZXJ0aWNlcyk7XG4gICAgICAgICAgICAgICAgQm9keS5zZXRNYXNzKHBhcnQsIGJvZHkuZGVuc2l0eSAqIHBhcnQuYXJlYSk7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgaW5lcnRpYSAocmVxdWlyZXMgdmVydGljZXMgdG8gYmUgYXQgb3JpZ2luKVxuICAgICAgICAgICAgICAgIFZlcnRpY2VzLnRyYW5zbGF0ZShwYXJ0LnZlcnRpY2VzLCB7IHg6IC1wYXJ0LnBvc2l0aW9uLngsIHk6IC1wYXJ0LnBvc2l0aW9uLnkgfSk7XG4gICAgICAgICAgICAgICAgQm9keS5zZXRJbmVydGlhKHBhcnQsIFZlcnRpY2VzLmluZXJ0aWEocGFydC52ZXJ0aWNlcywgcGFydC5tYXNzKSk7XG4gICAgICAgICAgICAgICAgVmVydGljZXMudHJhbnNsYXRlKHBhcnQudmVydGljZXMsIHsgeDogcGFydC5wb3NpdGlvbi54LCB5OiBwYXJ0LnBvc2l0aW9uLnkgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBib3VuZHNcbiAgICAgICAgICAgIEJvdW5kcy51cGRhdGUocGFydC5ib3VuZHMsIHBhcnQudmVydGljZXMsIGJvZHkudmVsb2NpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIGNpcmNsZXNcbiAgICAgICAgaWYgKGJvZHkuY2lyY2xlUmFkaXVzKSB7IFxuICAgICAgICAgICAgaWYgKHNjYWxlWCA9PT0gc2NhbGVZKSB7XG4gICAgICAgICAgICAgICAgYm9keS5jaXJjbGVSYWRpdXMgKj0gc2NhbGVYO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBib2R5IGlzIG5vIGxvbmdlciBhIGNpcmNsZVxuICAgICAgICAgICAgICAgIGJvZHkuY2lyY2xlUmFkaXVzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYm9keS5pc1N0YXRpYykge1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gX3RvdGFsUHJvcGVydGllcyhib2R5KTtcbiAgICAgICAgICAgIGJvZHkuYXJlYSA9IHRvdGFsLmFyZWE7XG4gICAgICAgICAgICBCb2R5LnNldE1hc3MoYm9keSwgdG90YWwubWFzcyk7XG4gICAgICAgICAgICBCb2R5LnNldEluZXJ0aWEoYm9keSwgdG90YWwuaW5lcnRpYSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSBzaW11bGF0aW9uIHN0ZXAgZm9yIHRoZSBnaXZlbiBgYm9keWAsIGluY2x1ZGluZyB1cGRhdGluZyBwb3NpdGlvbiBhbmQgYW5nbGUgdXNpbmcgVmVybGV0IGludGVncmF0aW9uLlxuICAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhVGltZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lU2NhbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29ycmVjdGlvblxuICAgICAqL1xuICAgIEJvZHkudXBkYXRlID0gZnVuY3Rpb24oYm9keSwgZGVsdGFUaW1lLCB0aW1lU2NhbGUsIGNvcnJlY3Rpb24pIHtcbiAgICAgICAgdmFyIGRlbHRhVGltZVNxdWFyZWQgPSBNYXRoLnBvdyhkZWx0YVRpbWUgKiB0aW1lU2NhbGUgKiBib2R5LnRpbWVTY2FsZSwgMik7XG5cbiAgICAgICAgLy8gZnJvbSB0aGUgcHJldmlvdXMgc3RlcFxuICAgICAgICB2YXIgZnJpY3Rpb25BaXIgPSAxIC0gYm9keS5mcmljdGlvbkFpciAqIHRpbWVTY2FsZSAqIGJvZHkudGltZVNjYWxlLFxuICAgICAgICAgICAgdmVsb2NpdHlQcmV2WCA9IGJvZHkucG9zaXRpb24ueCAtIGJvZHkucG9zaXRpb25QcmV2LngsXG4gICAgICAgICAgICB2ZWxvY2l0eVByZXZZID0gYm9keS5wb3NpdGlvbi55IC0gYm9keS5wb3NpdGlvblByZXYueTtcblxuICAgICAgICAvLyB1cGRhdGUgdmVsb2NpdHkgd2l0aCBWZXJsZXQgaW50ZWdyYXRpb25cbiAgICAgICAgYm9keS52ZWxvY2l0eS54ID0gKHZlbG9jaXR5UHJldlggKiBmcmljdGlvbkFpciAqIGNvcnJlY3Rpb24pICsgKGJvZHkuZm9yY2UueCAvIGJvZHkubWFzcykgKiBkZWx0YVRpbWVTcXVhcmVkO1xuICAgICAgICBib2R5LnZlbG9jaXR5LnkgPSAodmVsb2NpdHlQcmV2WSAqIGZyaWN0aW9uQWlyICogY29ycmVjdGlvbikgKyAoYm9keS5mb3JjZS55IC8gYm9keS5tYXNzKSAqIGRlbHRhVGltZVNxdWFyZWQ7XG5cbiAgICAgICAgYm9keS5wb3NpdGlvblByZXYueCA9IGJvZHkucG9zaXRpb24ueDtcbiAgICAgICAgYm9keS5wb3NpdGlvblByZXYueSA9IGJvZHkucG9zaXRpb24ueTtcbiAgICAgICAgYm9keS5wb3NpdGlvbi54ICs9IGJvZHkudmVsb2NpdHkueDtcbiAgICAgICAgYm9keS5wb3NpdGlvbi55ICs9IGJvZHkudmVsb2NpdHkueTtcblxuICAgICAgICAvLyB1cGRhdGUgYW5ndWxhciB2ZWxvY2l0eSB3aXRoIFZlcmxldCBpbnRlZ3JhdGlvblxuICAgICAgICBib2R5LmFuZ3VsYXJWZWxvY2l0eSA9ICgoYm9keS5hbmdsZSAtIGJvZHkuYW5nbGVQcmV2KSAqIGZyaWN0aW9uQWlyICogY29ycmVjdGlvbikgKyAoYm9keS50b3JxdWUgLyBib2R5LmluZXJ0aWEpICogZGVsdGFUaW1lU3F1YXJlZDtcbiAgICAgICAgYm9keS5hbmdsZVByZXYgPSBib2R5LmFuZ2xlO1xuICAgICAgICBib2R5LmFuZ2xlICs9IGJvZHkuYW5ndWxhclZlbG9jaXR5O1xuXG4gICAgICAgIC8vIHRyYWNrIHNwZWVkIGFuZCBhY2NlbGVyYXRpb25cbiAgICAgICAgYm9keS5zcGVlZCA9IFZlY3Rvci5tYWduaXR1ZGUoYm9keS52ZWxvY2l0eSk7XG4gICAgICAgIGJvZHkuYW5ndWxhclNwZWVkID0gTWF0aC5hYnMoYm9keS5hbmd1bGFyVmVsb2NpdHkpO1xuXG4gICAgICAgIC8vIHRyYW5zZm9ybSB0aGUgYm9keSBnZW9tZXRyeVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZHkucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keS5wYXJ0c1tpXTtcblxuICAgICAgICAgICAgVmVydGljZXMudHJhbnNsYXRlKHBhcnQudmVydGljZXMsIGJvZHkudmVsb2NpdHkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBwYXJ0LnBvc2l0aW9uLnggKz0gYm9keS52ZWxvY2l0eS54O1xuICAgICAgICAgICAgICAgIHBhcnQucG9zaXRpb24ueSArPSBib2R5LnZlbG9jaXR5Lnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChib2R5LmFuZ3VsYXJWZWxvY2l0eSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIFZlcnRpY2VzLnJvdGF0ZShwYXJ0LnZlcnRpY2VzLCBib2R5LmFuZ3VsYXJWZWxvY2l0eSwgYm9keS5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgQXhlcy5yb3RhdGUocGFydC5heGVzLCBib2R5LmFuZ3VsYXJWZWxvY2l0eSk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5yb3RhdGVBYm91dChwYXJ0LnBvc2l0aW9uLCBib2R5LmFuZ3VsYXJWZWxvY2l0eSwgYm9keS5wb3NpdGlvbiwgcGFydC5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBCb3VuZHMudXBkYXRlKHBhcnQuYm91bmRzLCBwYXJ0LnZlcnRpY2VzLCBib2R5LnZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGEgZm9yY2UgdG8gYSBib2R5IGZyb20gYSBnaXZlbiB3b3JsZC1zcGFjZSBwb3NpdGlvbiwgaW5jbHVkaW5nIHJlc3VsdGluZyB0b3JxdWUuXG4gICAgICogQG1ldGhvZCBhcHBseUZvcmNlXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IGZvcmNlXG4gICAgICovXG4gICAgQm9keS5hcHBseUZvcmNlID0gZnVuY3Rpb24oYm9keSwgcG9zaXRpb24sIGZvcmNlKSB7XG4gICAgICAgIGJvZHkuZm9yY2UueCArPSBmb3JjZS54O1xuICAgICAgICBib2R5LmZvcmNlLnkgKz0gZm9yY2UueTtcbiAgICAgICAgdmFyIG9mZnNldCA9IHsgeDogcG9zaXRpb24ueCAtIGJvZHkucG9zaXRpb24ueCwgeTogcG9zaXRpb24ueSAtIGJvZHkucG9zaXRpb24ueSB9O1xuICAgICAgICBib2R5LnRvcnF1ZSArPSBvZmZzZXQueCAqIGZvcmNlLnkgLSBvZmZzZXQueSAqIGZvcmNlLng7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1bXMgb2YgdGhlIHByb3BlcnRpZXMgb2YgYWxsIGNvbXBvdW5kIHBhcnRzIG9mIHRoZSBwYXJlbnQgYm9keS5cbiAgICAgKiBAbWV0aG9kIF90b3RhbFByb3BlcnRpZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAqIEByZXR1cm4ge31cbiAgICAgKi9cbiAgICB2YXIgX3RvdGFsUHJvcGVydGllcyA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9lY291cnNlcy5vdS5lZHUvY2dpLWJpbi9lYm9vay5jZ2k/ZG9jPSZ0b3BpYz1zdCZjaGFwX3NlYz0wNy4yJnBhZ2U9dGhlb3J5XG4gICAgICAgIC8vIGh0dHA6Ly9vdXRwdXQudG8vc2lkZXdheS9kZWZhdWx0LmFzcD9xbm89MTIxMTAwMDg3XG5cbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICBtYXNzOiAwLFxuICAgICAgICAgICAgYXJlYTogMCxcbiAgICAgICAgICAgIGluZXJ0aWE6IDAsXG4gICAgICAgICAgICBjZW50cmU6IHsgeDogMCwgeTogMCB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3VtIHRoZSBwcm9wZXJ0aWVzIG9mIGFsbCBjb21wb3VuZCBwYXJ0cyBvZiB0aGUgcGFyZW50IGJvZHlcbiAgICAgICAgZm9yICh2YXIgaSA9IGJvZHkucGFydHMubGVuZ3RoID09PSAxID8gMCA6IDE7IGkgPCBib2R5LnBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFydCA9IGJvZHkucGFydHNbaV07XG4gICAgICAgICAgICBwcm9wZXJ0aWVzLm1hc3MgKz0gcGFydC5tYXNzO1xuICAgICAgICAgICAgcHJvcGVydGllcy5hcmVhICs9IHBhcnQuYXJlYTtcbiAgICAgICAgICAgIHByb3BlcnRpZXMuaW5lcnRpYSArPSBwYXJ0LmluZXJ0aWE7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzLmNlbnRyZSA9IFZlY3Rvci5hZGQocHJvcGVydGllcy5jZW50cmUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlY3Rvci5tdWx0KHBhcnQucG9zaXRpb24sIHBhcnQubWFzcyAhPT0gSW5maW5pdHkgPyBwYXJ0Lm1hc3MgOiAxKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9wZXJ0aWVzLmNlbnRyZSA9IFZlY3Rvci5kaXYocHJvcGVydGllcy5jZW50cmUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5tYXNzICE9PSBJbmZpbml0eSA/IHByb3BlcnRpZXMubWFzcyA6IGJvZHkucGFydHMubGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gcHJvcGVydGllcztcbiAgICB9O1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgRXZlbnRzIERvY3VtZW50YXRpb25cbiAgICAqXG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgd2hlbiBhIGJvZHkgc3RhcnRzIHNsZWVwaW5nICh3aGVyZSBgdGhpc2AgaXMgdGhlIGJvZHkpLlxuICAgICpcbiAgICAqIEBldmVudCBzbGVlcFN0YXJ0XG4gICAgKiBAdGhpcyB7Ym9keX0gVGhlIGJvZHkgdGhhdCBoYXMgc3RhcnRlZCBzbGVlcGluZ1xuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIHdoZW4gYSBib2R5IGVuZHMgc2xlZXBpbmcgKHdoZXJlIGB0aGlzYCBpcyB0aGUgYm9keSkuXG4gICAgKlxuICAgICogQGV2ZW50IHNsZWVwRW5kXG4gICAgKiBAdGhpcyB7Ym9keX0gVGhlIGJvZHkgdGhhdCBoYXMgZW5kZWQgc2xlZXBpbmdcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgUHJvcGVydGllcyBEb2N1bWVudGF0aW9uXG4gICAgKlxuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlZ2VyIGBOdW1iZXJgIHVuaXF1ZWx5IGlkZW50aWZ5aW5nIG51bWJlciBnZW5lcmF0ZWQgaW4gYEJvZHkuY3JlYXRlYCBieSBgQ29tbW9uLm5leHRJZGAuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYFN0cmluZ2AgZGVub3RpbmcgdGhlIHR5cGUgb2Ygb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHR5cGVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBcImJvZHlcIlxuICAgICAqIEByZWFkT25seVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJiaXRyYXJ5IGBTdHJpbmdgIG5hbWUgdG8gaGVscCB0aGUgdXNlciBpZGVudGlmeSBhbmQgbWFuYWdlIGJvZGllcy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBsYWJlbFxuICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAqIEBkZWZhdWx0IFwiQm9keVwiXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBhcnJheSBvZiBib2RpZXMgdGhhdCBtYWtlIHVwIHRoaXMgYm9keS4gXG4gICAgICogVGhlIGZpcnN0IGJvZHkgaW4gdGhlIGFycmF5IG11c3QgYWx3YXlzIGJlIGEgc2VsZiByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgYm9keSBpbnN0YW5jZS5cbiAgICAgKiBBbGwgYm9kaWVzIGluIHRoZSBgcGFydHNgIGFycmF5IHRvZ2V0aGVyIGZvcm0gYSBzaW5nbGUgcmlnaWQgY29tcG91bmQgYm9keS5cbiAgICAgKiBQYXJ0cyBhcmUgYWxsb3dlZCB0byBvdmVybGFwLCBoYXZlIGdhcHMgb3IgaG9sZXMgb3IgZXZlbiBmb3JtIGNvbmNhdmUgYm9kaWVzLlxuICAgICAqIFBhcnRzIHRoZW1zZWx2ZXMgc2hvdWxkIG5ldmVyIGJlIGFkZGVkIHRvIGEgYFdvcmxkYCwgb25seSB0aGUgcGFyZW50IGJvZHkgc2hvdWxkIGJlLlxuICAgICAqIFVzZSBgQm9keS5zZXRQYXJ0c2Agd2hlbiBzZXR0aW5nIHBhcnRzIHRvIGVuc3VyZSBjb3JyZWN0IHVwZGF0ZXMgb2YgYWxsIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcGFydHNcbiAgICAgKiBAdHlwZSBib2R5W11cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgc2VsZiByZWZlcmVuY2UgaWYgdGhlIGJvZHkgaXMgX25vdF8gYSBwYXJ0IG9mIGFub3RoZXIgYm9keS5cbiAgICAgKiBPdGhlcndpc2UgdGhpcyBpcyBhIHJlZmVyZW5jZSB0byB0aGUgYm9keSB0aGF0IHRoaXMgaXMgYSBwYXJ0IG9mLlxuICAgICAqIFNlZSBgYm9keS5wYXJ0c2AuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcGFyZW50XG4gICAgICogQHR5cGUgYm9keVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCBzcGVjaWZ5aW5nIHRoZSBhbmdsZSBvZiB0aGUgYm9keSwgaW4gcmFkaWFucy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBhbmdsZVxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGFycmF5IG9mIGBWZWN0b3JgIG9iamVjdHMgdGhhdCBzcGVjaWZ5IHRoZSBjb252ZXggaHVsbCBvZiB0aGUgcmlnaWQgYm9keS5cbiAgICAgKiBUaGVzZSBzaG91bGQgYmUgcHJvdmlkZWQgYWJvdXQgdGhlIG9yaWdpbiBgKDAsIDApYC4gRS5nLlxuICAgICAqXG4gICAgICogICAgIFt7IHg6IDAsIHk6IDAgfSwgeyB4OiAyNSwgeTogNTAgfSwgeyB4OiA1MCwgeTogMCB9XVxuICAgICAqXG4gICAgICogV2hlbiBwYXNzZWQgdmlhIGBCb2R5LmNyZWF0ZWAsIHRoZSB2ZXJ0aWNlcyBhcmUgdHJhbnNsYXRlZCByZWxhdGl2ZSB0byBgYm9keS5wb3NpdGlvbmAgKGkuZS4gd29ybGQtc3BhY2UsIGFuZCBjb25zdGFudGx5IHVwZGF0ZWQgYnkgYEJvZHkudXBkYXRlYCBkdXJpbmcgc2ltdWxhdGlvbikuXG4gICAgICogVGhlIGBWZWN0b3JgIG9iamVjdHMgYXJlIGFsc28gYXVnbWVudGVkIHdpdGggYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHJlcXVpcmVkIGZvciBlZmZpY2llbnQgY29sbGlzaW9uIGRldGVjdGlvbi4gXG4gICAgICpcbiAgICAgKiBPdGhlciBwcm9wZXJ0aWVzIHN1Y2ggYXMgYGluZXJ0aWFgIGFuZCBgYm91bmRzYCBhcmUgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGZyb20gdGhlIHBhc3NlZCB2ZXJ0aWNlcyAodW5sZXNzIHByb3ZpZGVkIHZpYSBgb3B0aW9uc2ApLlxuICAgICAqIENvbmNhdmUgaHVsbHMgYXJlIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkLiBUaGUgbW9kdWxlIGBNYXR0ZXIuVmVydGljZXNgIGNvbnRhaW5zIHVzZWZ1bCBtZXRob2RzIGZvciB3b3JraW5nIHdpdGggdmVydGljZXMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgdmVydGljZXNcbiAgICAgKiBAdHlwZSB2ZWN0b3JbXVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgVmVjdG9yYCB0aGF0IHNwZWNpZmllcyB0aGUgY3VycmVudCB3b3JsZC1zcGFjZSBwb3NpdGlvbiBvZiB0aGUgYm9keS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBwb3NpdGlvblxuICAgICAqIEB0eXBlIHZlY3RvclxuICAgICAqIEBkZWZhdWx0IHsgeDogMCwgeTogMCB9XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBWZWN0b3JgIHRoYXQgc3BlY2lmaWVzIHRoZSBmb3JjZSB0byBhcHBseSBpbiB0aGUgY3VycmVudCBzdGVwLiBJdCBpcyB6ZXJvZWQgYWZ0ZXIgZXZlcnkgYEJvZHkudXBkYXRlYC4gU2VlIGFsc28gYEJvZHkuYXBwbHlGb3JjZWAuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZm9yY2VcbiAgICAgKiBAdHlwZSB2ZWN0b3JcbiAgICAgKiBAZGVmYXVsdCB7IHg6IDAsIHk6IDAgfVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IHNwZWNpZmllcyB0aGUgdG9ycXVlICh0dXJuaW5nIGZvcmNlKSB0byBhcHBseSBpbiB0aGUgY3VycmVudCBzdGVwLiBJdCBpcyB6ZXJvZWQgYWZ0ZXIgZXZlcnkgYEJvZHkudXBkYXRlYC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB0b3JxdWVcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgX21lYXN1cmVzXyB0aGUgY3VycmVudCBzcGVlZCBvZiB0aGUgYm9keSBhZnRlciB0aGUgbGFzdCBgQm9keS51cGRhdGVgLiBJdCBpcyByZWFkLW9ubHkgYW5kIGFsd2F5cyBwb3NpdGl2ZSAoaXQncyB0aGUgbWFnbml0dWRlIG9mIGBib2R5LnZlbG9jaXR5YCkuXG4gICAgICpcbiAgICAgKiBAcmVhZE9ubHlcbiAgICAgKiBAcHJvcGVydHkgc3BlZWRcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgX21lYXN1cmVzXyB0aGUgY3VycmVudCBhbmd1bGFyIHNwZWVkIG9mIHRoZSBib2R5IGFmdGVyIHRoZSBsYXN0IGBCb2R5LnVwZGF0ZWAuIEl0IGlzIHJlYWQtb25seSBhbmQgYWx3YXlzIHBvc2l0aXZlIChpdCdzIHRoZSBtYWduaXR1ZGUgb2YgYGJvZHkuYW5ndWxhclZlbG9jaXR5YCkuXG4gICAgICpcbiAgICAgKiBAcmVhZE9ubHlcbiAgICAgKiBAcHJvcGVydHkgYW5ndWxhclNwZWVkXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgVmVjdG9yYCB0aGF0IF9tZWFzdXJlc18gdGhlIGN1cnJlbnQgdmVsb2NpdHkgb2YgdGhlIGJvZHkgYWZ0ZXIgdGhlIGxhc3QgYEJvZHkudXBkYXRlYC4gSXQgaXMgcmVhZC1vbmx5LiBcbiAgICAgKiBJZiB5b3UgbmVlZCB0byBtb2RpZnkgYSBib2R5J3MgdmVsb2NpdHkgZGlyZWN0bHksIHlvdSBzaG91bGQgZWl0aGVyIGFwcGx5IGEgZm9yY2Ugb3Igc2ltcGx5IGNoYW5nZSB0aGUgYm9keSdzIGBwb3NpdGlvbmAgKGFzIHRoZSBlbmdpbmUgdXNlcyBwb3NpdGlvbi1WZXJsZXQgaW50ZWdyYXRpb24pLlxuICAgICAqXG4gICAgICogQHJlYWRPbmx5XG4gICAgICogQHByb3BlcnR5IHZlbG9jaXR5XG4gICAgICogQHR5cGUgdmVjdG9yXG4gICAgICogQGRlZmF1bHQgeyB4OiAwLCB5OiAwIH1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBfbWVhc3VyZXNfIHRoZSBjdXJyZW50IGFuZ3VsYXIgdmVsb2NpdHkgb2YgdGhlIGJvZHkgYWZ0ZXIgdGhlIGxhc3QgYEJvZHkudXBkYXRlYC4gSXQgaXMgcmVhZC1vbmx5LiBcbiAgICAgKiBJZiB5b3UgbmVlZCB0byBtb2RpZnkgYSBib2R5J3MgYW5ndWxhciB2ZWxvY2l0eSBkaXJlY3RseSwgeW91IHNob3VsZCBhcHBseSBhIHRvcnF1ZSBvciBzaW1wbHkgY2hhbmdlIHRoZSBib2R5J3MgYGFuZ2xlYCAoYXMgdGhlIGVuZ2luZSB1c2VzIHBvc2l0aW9uLVZlcmxldCBpbnRlZ3JhdGlvbikuXG4gICAgICpcbiAgICAgKiBAcmVhZE9ubHlcbiAgICAgKiBAcHJvcGVydHkgYW5ndWxhclZlbG9jaXR5XG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgYSBib2R5IGlzIGNvbnNpZGVyZWQgc3RhdGljLiBBIHN0YXRpYyBib2R5IGNhbiBuZXZlciBjaGFuZ2UgcG9zaXRpb24gb3IgYW5nbGUgYW5kIGlzIGNvbXBsZXRlbHkgZml4ZWQuXG4gICAgICogSWYgeW91IG5lZWQgdG8gc2V0IGEgYm9keSBhcyBzdGF0aWMgYWZ0ZXIgaXRzIGNyZWF0aW9uLCB5b3Ugc2hvdWxkIHVzZSBgQm9keS5zZXRTdGF0aWNgIGFzIHRoaXMgcmVxdWlyZXMgbW9yZSB0aGFuIGp1c3Qgc2V0dGluZyB0aGlzIGZsYWcuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgaXNTdGF0aWNcbiAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGEgYm9keSBpcyBhIHNlbnNvci4gU2Vuc29yIHRyaWdnZXJzIGNvbGxpc2lvbiBldmVudHMsIGJ1dCBkb2Vzbid0IHJlYWN0IHdpdGggY29sbGlkaW5nIGJvZHkgcGh5c2ljYWxseS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBpc1NlbnNvclxuICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGJvZHkgaXMgY29uc2lkZXJlZCBzbGVlcGluZy4gQSBzbGVlcGluZyBib2R5IGFjdHMgc2ltaWxhciB0byBhIHN0YXRpYyBib2R5LCBleGNlcHQgaXQgaXMgb25seSB0ZW1wb3JhcnkgYW5kIGNhbiBiZSBhd29rZW4uXG4gICAgICogSWYgeW91IG5lZWQgdG8gc2V0IGEgYm9keSBhcyBzbGVlcGluZywgeW91IHNob3VsZCB1c2UgYFNsZWVwaW5nLnNldGAgYXMgdGhpcyByZXF1aXJlcyBtb3JlIHRoYW4ganVzdCBzZXR0aW5nIHRoaXMgZmxhZy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBpc1NsZWVwaW5nXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgX21lYXN1cmVzXyB0aGUgYW1vdW50IG9mIG1vdmVtZW50IGEgYm9keSBjdXJyZW50bHkgaGFzIChhIGNvbWJpbmF0aW9uIG9mIGBzcGVlZGAgYW5kIGBhbmd1bGFyU3BlZWRgKS4gSXQgaXMgcmVhZC1vbmx5IGFuZCBhbHdheXMgcG9zaXRpdmUuXG4gICAgICogSXQgaXMgdXNlZCBhbmQgdXBkYXRlZCBieSB0aGUgYE1hdHRlci5TbGVlcGluZ2AgbW9kdWxlIGR1cmluZyBzaW11bGF0aW9uIHRvIGRlY2lkZSBpZiBhIGJvZHkgaGFzIGNvbWUgdG8gcmVzdC5cbiAgICAgKlxuICAgICAqIEByZWFkT25seVxuICAgICAqIEBwcm9wZXJ0eSBtb3Rpb25cbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgZGVmaW5lcyB0aGUgbnVtYmVyIG9mIHVwZGF0ZXMgaW4gd2hpY2ggdGhpcyBib2R5IG11c3QgaGF2ZSBuZWFyLXplcm8gdmVsb2NpdHkgYmVmb3JlIGl0IGlzIHNldCBhcyBzbGVlcGluZyBieSB0aGUgYE1hdHRlci5TbGVlcGluZ2AgbW9kdWxlIChpZiBzbGVlcGluZyBpcyBlbmFibGVkIGJ5IHRoZSBlbmdpbmUpLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHNsZWVwVGhyZXNob2xkXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgNjBcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBkZWZpbmVzIHRoZSBkZW5zaXR5IG9mIHRoZSBib2R5LCB0aGF0IGlzIGl0cyBtYXNzIHBlciB1bml0IGFyZWEuXG4gICAgICogSWYgeW91IHBhc3MgdGhlIGRlbnNpdHkgdmlhIGBCb2R5LmNyZWF0ZWAgdGhlIGBtYXNzYCBwcm9wZXJ0eSBpcyBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgZm9yIHlvdSBiYXNlZCBvbiB0aGUgc2l6ZSAoYXJlYSkgb2YgdGhlIG9iamVjdC5cbiAgICAgKiBUaGlzIGlzIGdlbmVyYWxseSBwcmVmZXJhYmxlIHRvIHNpbXBseSBzZXR0aW5nIG1hc3MgYW5kIGFsbG93cyBmb3IgbW9yZSBpbnR1aXRpdmUgZGVmaW5pdGlvbiBvZiBtYXRlcmlhbHMgKGUuZy4gcm9jayBoYXMgYSBoaWdoZXIgZGVuc2l0eSB0aGFuIHdvb2QpLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGRlbnNpdHlcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAwLjAwMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIG1hc3Mgb2YgdGhlIGJvZHksIGFsdGhvdWdoIGl0IG1heSBiZSBtb3JlIGFwcHJvcHJpYXRlIHRvIHNwZWNpZnkgdGhlIGBkZW5zaXR5YCBwcm9wZXJ0eSBpbnN0ZWFkLlxuICAgICAqIElmIHlvdSBtb2RpZnkgdGhpcyB2YWx1ZSwgeW91IG11c3QgYWxzbyBtb2RpZnkgdGhlIGBib2R5LmludmVyc2VNYXNzYCBwcm9wZXJ0eSAoYDEgLyBtYXNzYCkuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgbWFzc1xuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIGludmVyc2UgbWFzcyBvZiB0aGUgYm9keSAoYDEgLyBtYXNzYCkuXG4gICAgICogSWYgeW91IG1vZGlmeSB0aGlzIHZhbHVlLCB5b3UgbXVzdCBhbHNvIG1vZGlmeSB0aGUgYGJvZHkubWFzc2AgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgaW52ZXJzZU1hc3NcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBkZWZpbmVzIHRoZSBtb21lbnQgb2YgaW5lcnRpYSAoaS5lLiBzZWNvbmQgbW9tZW50IG9mIGFyZWEpIG9mIHRoZSBib2R5LlxuICAgICAqIEl0IGlzIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCBmcm9tIHRoZSBnaXZlbiBjb252ZXggaHVsbCAoYHZlcnRpY2VzYCBhcnJheSkgYW5kIGRlbnNpdHkgaW4gYEJvZHkuY3JlYXRlYC5cbiAgICAgKiBJZiB5b3UgbW9kaWZ5IHRoaXMgdmFsdWUsIHlvdSBtdXN0IGFsc28gbW9kaWZ5IHRoZSBgYm9keS5pbnZlcnNlSW5lcnRpYWAgcHJvcGVydHkgKGAxIC8gaW5lcnRpYWApLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGluZXJ0aWFcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBkZWZpbmVzIHRoZSBpbnZlcnNlIG1vbWVudCBvZiBpbmVydGlhIG9mIHRoZSBib2R5IChgMSAvIGluZXJ0aWFgKS5cbiAgICAgKiBJZiB5b3UgbW9kaWZ5IHRoaXMgdmFsdWUsIHlvdSBtdXN0IGFsc28gbW9kaWZ5IHRoZSBgYm9keS5pbmVydGlhYCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBpbnZlcnNlSW5lcnRpYVxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIHJlc3RpdHV0aW9uIChlbGFzdGljaXR5KSBvZiB0aGUgYm9keS4gVGhlIHZhbHVlIGlzIGFsd2F5cyBwb3NpdGl2ZSBhbmQgaXMgaW4gdGhlIHJhbmdlIGAoMCwgMSlgLlxuICAgICAqIEEgdmFsdWUgb2YgYDBgIG1lYW5zIGNvbGxpc2lvbnMgbWF5IGJlIHBlcmZlY3RseSBpbmVsYXN0aWMgYW5kIG5vIGJvdW5jaW5nIG1heSBvY2N1ci4gXG4gICAgICogQSB2YWx1ZSBvZiBgMC44YCBtZWFucyB0aGUgYm9keSBtYXkgYm91bmNlIGJhY2sgd2l0aCBhcHByb3hpbWF0ZWx5IDgwJSBvZiBpdHMga2luZXRpYyBlbmVyZ3kuXG4gICAgICogTm90ZSB0aGF0IGNvbGxpc2lvbiByZXNwb25zZSBpcyBiYXNlZCBvbiBfcGFpcnNfIG9mIGJvZGllcywgYW5kIHRoYXQgYHJlc3RpdHV0aW9uYCB2YWx1ZXMgYXJlIF9jb21iaW5lZF8gd2l0aCB0aGUgZm9sbG93aW5nIGZvcm11bGE6XG4gICAgICpcbiAgICAgKiAgICAgTWF0aC5tYXgoYm9keUEucmVzdGl0dXRpb24sIGJvZHlCLnJlc3RpdHV0aW9uKVxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHJlc3RpdHV0aW9uXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIGZyaWN0aW9uIG9mIHRoZSBib2R5LiBUaGUgdmFsdWUgaXMgYWx3YXlzIHBvc2l0aXZlIGFuZCBpcyBpbiB0aGUgcmFuZ2UgYCgwLCAxKWAuXG4gICAgICogQSB2YWx1ZSBvZiBgMGAgbWVhbnMgdGhhdCB0aGUgYm9keSBtYXkgc2xpZGUgaW5kZWZpbml0ZWx5LlxuICAgICAqIEEgdmFsdWUgb2YgYDFgIG1lYW5zIHRoZSBib2R5IG1heSBjb21lIHRvIGEgc3RvcCBhbG1vc3QgaW5zdGFudGx5IGFmdGVyIGEgZm9yY2UgaXMgYXBwbGllZC5cbiAgICAgKlxuICAgICAqIFRoZSBlZmZlY3RzIG9mIHRoZSB2YWx1ZSBtYXkgYmUgbm9uLWxpbmVhci4gXG4gICAgICogSGlnaCB2YWx1ZXMgbWF5IGJlIHVuc3RhYmxlIGRlcGVuZGluZyBvbiB0aGUgYm9keS5cbiAgICAgKiBUaGUgZW5naW5lIHVzZXMgYSBDb3Vsb21iIGZyaWN0aW9uIG1vZGVsIGluY2x1ZGluZyBzdGF0aWMgYW5kIGtpbmV0aWMgZnJpY3Rpb24uXG4gICAgICogTm90ZSB0aGF0IGNvbGxpc2lvbiByZXNwb25zZSBpcyBiYXNlZCBvbiBfcGFpcnNfIG9mIGJvZGllcywgYW5kIHRoYXQgYGZyaWN0aW9uYCB2YWx1ZXMgYXJlIF9jb21iaW5lZF8gd2l0aCB0aGUgZm9sbG93aW5nIGZvcm11bGE6XG4gICAgICpcbiAgICAgKiAgICAgTWF0aC5taW4oYm9keUEuZnJpY3Rpb24sIGJvZHlCLmZyaWN0aW9uKVxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGZyaWN0aW9uXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMC4xXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgZGVmaW5lcyB0aGUgc3RhdGljIGZyaWN0aW9uIG9mIHRoZSBib2R5IChpbiB0aGUgQ291bG9tYiBmcmljdGlvbiBtb2RlbCkuIFxuICAgICAqIEEgdmFsdWUgb2YgYDBgIG1lYW5zIHRoZSBib2R5IHdpbGwgbmV2ZXIgJ3N0aWNrJyB3aGVuIGl0IGlzIG5lYXJseSBzdGF0aW9uYXJ5IGFuZCBvbmx5IGR5bmFtaWMgYGZyaWN0aW9uYCBpcyB1c2VkLlxuICAgICAqIFRoZSBoaWdoZXIgdGhlIHZhbHVlIChlLmcuIGAxMGApLCB0aGUgbW9yZSBmb3JjZSBpdCB3aWxsIHRha2UgdG8gaW5pdGlhbGx5IGdldCB0aGUgYm9keSBtb3Zpbmcgd2hlbiBuZWFybHkgc3RhdGlvbmFyeS5cbiAgICAgKiBUaGlzIHZhbHVlIGlzIG11bHRpcGxpZWQgd2l0aCB0aGUgYGZyaWN0aW9uYCBwcm9wZXJ0eSB0byBtYWtlIGl0IGVhc2llciB0byBjaGFuZ2UgYGZyaWN0aW9uYCBhbmQgbWFpbnRhaW4gYW4gYXBwcm9wcmlhdGUgYW1vdW50IG9mIHN0YXRpYyBmcmljdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBmcmljdGlvblN0YXRpY1xuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDAuNVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIGFpciBmcmljdGlvbiBvZiB0aGUgYm9keSAoYWlyIHJlc2lzdGFuY2UpLiBcbiAgICAgKiBBIHZhbHVlIG9mIGAwYCBtZWFucyB0aGUgYm9keSB3aWxsIG5ldmVyIHNsb3cgYXMgaXQgbW92ZXMgdGhyb3VnaCBzcGFjZS5cbiAgICAgKiBUaGUgaGlnaGVyIHRoZSB2YWx1ZSwgdGhlIGZhc3RlciBhIGJvZHkgc2xvd3Mgd2hlbiBtb3ZpbmcgdGhyb3VnaCBzcGFjZS5cbiAgICAgKiBUaGUgZWZmZWN0cyBvZiB0aGUgdmFsdWUgYXJlIG5vbi1saW5lYXIuIFxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGZyaWN0aW9uQWlyXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMC4wMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gYE9iamVjdGAgdGhhdCBzcGVjaWZpZXMgdGhlIGNvbGxpc2lvbiBmaWx0ZXJpbmcgcHJvcGVydGllcyBvZiB0aGlzIGJvZHkuXG4gICAgICpcbiAgICAgKiBDb2xsaXNpb25zIGJldHdlZW4gdHdvIGJvZGllcyB3aWxsIG9iZXkgdGhlIGZvbGxvd2luZyBydWxlczpcbiAgICAgKiAtIElmIHRoZSB0d28gYm9kaWVzIGhhdmUgdGhlIHNhbWUgbm9uLXplcm8gdmFsdWUgb2YgYGNvbGxpc2lvbkZpbHRlci5ncm91cGAsXG4gICAgICogICB0aGV5IHdpbGwgYWx3YXlzIGNvbGxpZGUgaWYgdGhlIHZhbHVlIGlzIHBvc2l0aXZlLCBhbmQgdGhleSB3aWxsIG5ldmVyIGNvbGxpZGVcbiAgICAgKiAgIGlmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZS5cbiAgICAgKiAtIElmIHRoZSB0d28gYm9kaWVzIGhhdmUgZGlmZmVyZW50IHZhbHVlcyBvZiBgY29sbGlzaW9uRmlsdGVyLmdyb3VwYCBvciBpZiBvbmVcbiAgICAgKiAgIChvciBib3RoKSBvZiB0aGUgYm9kaWVzIGhhcyBhIHZhbHVlIG9mIDAsIHRoZW4gdGhlIGNhdGVnb3J5L21hc2sgcnVsZXMgYXBwbHkgYXMgZm9sbG93czpcbiAgICAgKlxuICAgICAqIEVhY2ggYm9keSBiZWxvbmdzIHRvIGEgY29sbGlzaW9uIGNhdGVnb3J5LCBnaXZlbiBieSBgY29sbGlzaW9uRmlsdGVyLmNhdGVnb3J5YC4gVGhpc1xuICAgICAqIHZhbHVlIGlzIHVzZWQgYXMgYSBiaXQgZmllbGQgYW5kIHRoZSBjYXRlZ29yeSBzaG91bGQgaGF2ZSBvbmx5IG9uZSBiaXQgc2V0LCBtZWFuaW5nIHRoYXRcbiAgICAgKiB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eSBpcyBhIHBvd2VyIG9mIHR3byBpbiB0aGUgcmFuZ2UgWzEsIDJeMzFdLiBUaHVzLCB0aGVyZSBhcmUgMzJcbiAgICAgKiBkaWZmZXJlbnQgY29sbGlzaW9uIGNhdGVnb3JpZXMgYXZhaWxhYmxlLlxuICAgICAqXG4gICAgICogRWFjaCBib2R5IGFsc28gZGVmaW5lcyBhIGNvbGxpc2lvbiBiaXRtYXNrLCBnaXZlbiBieSBgY29sbGlzaW9uRmlsdGVyLm1hc2tgIHdoaWNoIHNwZWNpZmllc1xuICAgICAqIHRoZSBjYXRlZ29yaWVzIGl0IGNvbGxpZGVzIHdpdGggKHRoZSB2YWx1ZSBpcyB0aGUgYml0d2lzZSBBTkQgdmFsdWUgb2YgYWxsIHRoZXNlIGNhdGVnb3JpZXMpLlxuICAgICAqXG4gICAgICogVXNpbmcgdGhlIGNhdGVnb3J5L21hc2sgcnVsZXMsIHR3byBib2RpZXMgYEFgIGFuZCBgQmAgY29sbGlkZSBpZiBlYWNoIGluY2x1ZGVzIHRoZSBvdGhlcidzXG4gICAgICogY2F0ZWdvcnkgaW4gaXRzIG1hc2ssIGkuZS4gYChjYXRlZ29yeUEgJiBtYXNrQikgIT09IDBgIGFuZCBgKGNhdGVnb3J5QiAmIG1hc2tBKSAhPT0gMGBcbiAgICAgKiBhcmUgYm90aCB0cnVlLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGNvbGxpc2lvbkZpbHRlclxuICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gSW50ZWdlciBgTnVtYmVyYCwgdGhhdCBzcGVjaWZpZXMgdGhlIGNvbGxpc2lvbiBncm91cCB0aGlzIGJvZHkgYmVsb25ncyB0by5cbiAgICAgKiBTZWUgYGJvZHkuY29sbGlzaW9uRmlsdGVyYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBjb2xsaXNpb25GaWx0ZXIuZ3JvdXBcbiAgICAgKiBAdHlwZSBvYmplY3RcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGJpdCBmaWVsZCB0aGF0IHNwZWNpZmllcyB0aGUgY29sbGlzaW9uIGNhdGVnb3J5IHRoaXMgYm9keSBiZWxvbmdzIHRvLlxuICAgICAqIFRoZSBjYXRlZ29yeSB2YWx1ZSBzaG91bGQgaGF2ZSBvbmx5IG9uZSBiaXQgc2V0LCBmb3IgZXhhbXBsZSBgMHgwMDAxYC5cbiAgICAgKiBUaGlzIG1lYW5zIHRoZXJlIGFyZSB1cCB0byAzMiB1bmlxdWUgY29sbGlzaW9uIGNhdGVnb3JpZXMgYXZhaWxhYmxlLlxuICAgICAqIFNlZSBgYm9keS5jb2xsaXNpb25GaWx0ZXJgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGNvbGxpc2lvbkZpbHRlci5jYXRlZ29yeVxuICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYml0IG1hc2sgdGhhdCBzcGVjaWZpZXMgdGhlIGNvbGxpc2lvbiBjYXRlZ29yaWVzIHRoaXMgYm9keSBtYXkgY29sbGlkZSB3aXRoLlxuICAgICAqIFNlZSBgYm9keS5jb2xsaXNpb25GaWx0ZXJgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGNvbGxpc2lvbkZpbHRlci5tYXNrXG4gICAgICogQHR5cGUgb2JqZWN0XG4gICAgICogQGRlZmF1bHQgLTFcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBzcGVjaWZpZXMgYSB0b2xlcmFuY2Ugb24gaG93IGZhciBhIGJvZHkgaXMgYWxsb3dlZCB0byAnc2luaycgb3Igcm90YXRlIGludG8gb3RoZXIgYm9kaWVzLlxuICAgICAqIEF2b2lkIGNoYW5naW5nIHRoaXMgdmFsdWUgdW5sZXNzIHlvdSB1bmRlcnN0YW5kIHRoZSBwdXJwb3NlIG9mIGBzbG9wYCBpbiBwaHlzaWNzIGVuZ2luZXMuXG4gICAgICogVGhlIGRlZmF1bHQgc2hvdWxkIGdlbmVyYWxseSBzdWZmaWNlLCBhbHRob3VnaCB2ZXJ5IGxhcmdlIGJvZGllcyBtYXkgcmVxdWlyZSBsYXJnZXIgdmFsdWVzIGZvciBzdGFibGUgc3RhY2tpbmcuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgc2xvcFxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDAuMDVcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBhbGxvd3MgcGVyLWJvZHkgdGltZSBzY2FsaW5nLCBlLmcuIGEgZm9yY2UtZmllbGQgd2hlcmUgYm9kaWVzIGluc2lkZSBhcmUgaW4gc2xvdy1tb3Rpb24sIHdoaWxlIG90aGVycyBhcmUgYXQgZnVsbCBzcGVlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB0aW1lU2NhbGVcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBgT2JqZWN0YCB0aGF0IGRlZmluZXMgdGhlIHJlbmRlcmluZyBwcm9wZXJ0aWVzIHRvIGJlIGNvbnN1bWVkIGJ5IHRoZSBtb2R1bGUgYE1hdHRlci5SZW5kZXJgLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHJlbmRlclxuICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBib2R5IHNob3VsZCBiZSByZW5kZXJlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIudmlzaWJsZVxuICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBvcGFjaXR5IHRvIHVzZSB3aGVuIHJlbmRlcmluZy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIub3BhY2l0eVxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gYE9iamVjdGAgdGhhdCBkZWZpbmVzIHRoZSBzcHJpdGUgcHJvcGVydGllcyB0byB1c2Ugd2hlbiByZW5kZXJpbmcsIGlmIGFueS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3ByaXRlXG4gICAgICogQHR5cGUgb2JqZWN0XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBgU3RyaW5nYCB0aGF0IGRlZmluZXMgdGhlIHBhdGggdG8gdGhlIGltYWdlIHRvIHVzZSBhcyB0aGUgc3ByaXRlIHRleHR1cmUsIGlmIGFueS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3ByaXRlLnRleHR1cmVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKi9cbiAgICAgXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIHNjYWxpbmcgaW4gdGhlIHgtYXhpcyBmb3IgdGhlIHNwcml0ZSwgaWYgYW55LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHJlbmRlci5zcHJpdGUueFNjYWxlXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIHNjYWxpbmcgaW4gdGhlIHktYXhpcyBmb3IgdGhlIHNwcml0ZSwgaWYgYW55LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHJlbmRlci5zcHJpdGUueVNjYWxlXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqL1xuXG4gICAgIC8qKlxuICAgICAgKiBBIGBOdW1iZXJgIHRoYXQgZGVmaW5lcyB0aGUgb2Zmc2V0IGluIHRoZSB4LWF4aXMgZm9yIHRoZSBzcHJpdGUgKG5vcm1hbGlzZWQgYnkgdGV4dHVyZSB3aWR0aCkuXG4gICAgICAqXG4gICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3ByaXRlLnhPZmZzZXRcbiAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICovXG5cbiAgICAgLyoqXG4gICAgICAqIEEgYE51bWJlcmAgdGhhdCBkZWZpbmVzIHRoZSBvZmZzZXQgaW4gdGhlIHktYXhpcyBmb3IgdGhlIHNwcml0ZSAobm9ybWFsaXNlZCBieSB0ZXh0dXJlIGhlaWdodCkuXG4gICAgICAqXG4gICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3ByaXRlLnlPZmZzZXRcbiAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgZGVmaW5lcyB0aGUgbGluZSB3aWR0aCB0byB1c2Ugd2hlbiByZW5kZXJpbmcgdGhlIGJvZHkgb3V0bGluZSAoaWYgYSBzcHJpdGUgaXMgbm90IGRlZmluZWQpLlxuICAgICAqIEEgdmFsdWUgb2YgYDBgIG1lYW5zIG5vIG91dGxpbmUgd2lsbCBiZSByZW5kZXJlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIubGluZVdpZHRoXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMS41XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBTdHJpbmdgIHRoYXQgZGVmaW5lcyB0aGUgZmlsbCBzdHlsZSB0byB1c2Ugd2hlbiByZW5kZXJpbmcgdGhlIGJvZHkgKGlmIGEgc3ByaXRlIGlzIG5vdCBkZWZpbmVkKS5cbiAgICAgKiBJdCBpcyB0aGUgc2FtZSBhcyB3aGVuIHVzaW5nIGEgY2FudmFzLCBzbyBpdCBhY2NlcHRzIENTUyBzdHlsZSBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcmVuZGVyLmZpbGxTdHlsZVxuICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAqIEBkZWZhdWx0IGEgcmFuZG9tIGNvbG91clxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgU3RyaW5nYCB0aGF0IGRlZmluZXMgdGhlIHN0cm9rZSBzdHlsZSB0byB1c2Ugd2hlbiByZW5kZXJpbmcgdGhlIGJvZHkgb3V0bGluZSAoaWYgYSBzcHJpdGUgaXMgbm90IGRlZmluZWQpLlxuICAgICAqIEl0IGlzIHRoZSBzYW1lIGFzIHdoZW4gdXNpbmcgYSBjYW52YXMsIHNvIGl0IGFjY2VwdHMgQ1NTIHN0eWxlIHByb3BlcnR5IHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3Ryb2tlU3R5bGVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBhIHJhbmRvbSBjb2xvdXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGFycmF5IG9mIHVuaXF1ZSBheGlzIHZlY3RvcnMgKGVkZ2Ugbm9ybWFscykgdXNlZCBmb3IgY29sbGlzaW9uIGRldGVjdGlvbi5cbiAgICAgKiBUaGVzZSBhcmUgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGZyb20gdGhlIGdpdmVuIGNvbnZleCBodWxsIChgdmVydGljZXNgIGFycmF5KSBpbiBgQm9keS5jcmVhdGVgLlxuICAgICAqIFRoZXkgYXJlIGNvbnN0YW50bHkgdXBkYXRlZCBieSBgQm9keS51cGRhdGVgIGR1cmluZyB0aGUgc2ltdWxhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBheGVzXG4gICAgICogQHR5cGUgdmVjdG9yW11cbiAgICAgKi9cbiAgICAgXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IF9tZWFzdXJlc18gdGhlIGFyZWEgb2YgdGhlIGJvZHkncyBjb252ZXggaHVsbCwgY2FsY3VsYXRlZCBhdCBjcmVhdGlvbiBieSBgQm9keS5jcmVhdGVgLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGFyZWFcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYEJvdW5kc2Agb2JqZWN0IHRoYXQgZGVmaW5lcyB0aGUgQUFCQiByZWdpb24gZm9yIHRoZSBib2R5LlxuICAgICAqIEl0IGlzIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCBmcm9tIHRoZSBnaXZlbiBjb252ZXggaHVsbCAoYHZlcnRpY2VzYCBhcnJheSkgaW4gYEJvZHkuY3JlYXRlYCBhbmQgY29uc3RhbnRseSB1cGRhdGVkIGJ5IGBCb2R5LnVwZGF0ZWAgZHVyaW5nIHNpbXVsYXRpb24uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYm91bmRzXG4gICAgICogQHR5cGUgYm91bmRzXG4gICAgICovXG5cbn0pKCk7XG5cbn0se1wiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2NvcmUvU2xlZXBpbmdcIjoyMixcIi4uL2dlb21ldHJ5L0F4ZXNcIjoyNSxcIi4uL2dlb21ldHJ5L0JvdW5kc1wiOjI2LFwiLi4vZ2VvbWV0cnkvVmVjdG9yXCI6MjgsXCIuLi9nZW9tZXRyeS9WZXJ0aWNlc1wiOjI5LFwiLi4vcmVuZGVyL1JlbmRlclwiOjMxfV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuQ29tcG9zaXRlYCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyBmb3IgY3JlYXRpbmcgYW5kIG1hbmlwdWxhdGluZyBjb21wb3NpdGUgYm9kaWVzLlxuKiBBIGNvbXBvc2l0ZSBib2R5IGlzIGEgY29sbGVjdGlvbiBvZiBgTWF0dGVyLkJvZHlgLCBgTWF0dGVyLkNvbnN0cmFpbnRgIGFuZCBvdGhlciBgTWF0dGVyLkNvbXBvc2l0ZWAsIHRoZXJlZm9yZSBjb21wb3NpdGVzIGZvcm0gYSB0cmVlIHN0cnVjdHVyZS5cbiogSXQgaXMgaW1wb3J0YW50IHRvIHVzZSB0aGUgZnVuY3Rpb25zIGluIHRoaXMgbW9kdWxlIHRvIG1vZGlmeSBjb21wb3NpdGVzLCByYXRoZXIgdGhhbiBkaXJlY3RseSBtb2RpZnlpbmcgdGhlaXIgcHJvcGVydGllcy5cbiogTm90ZSB0aGF0IHRoZSBgTWF0dGVyLldvcmxkYCBvYmplY3QgaXMgYWxzbyBhIHR5cGUgb2YgYE1hdHRlci5Db21wb3NpdGVgIGFuZCBhcyBzdWNoIGFsbCBjb21wb3NpdGUgbWV0aG9kcyBoZXJlIGNhbiBhbHNvIG9wZXJhdGUgb24gYSBgTWF0dGVyLldvcmxkYC5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIENvbXBvc2l0ZVxuKi9cblxudmFyIENvbXBvc2l0ZSA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvc2l0ZTtcblxudmFyIEV2ZW50cyA9IF9kZXJlcV8oJy4uL2NvcmUvRXZlbnRzJyk7XG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcbnZhciBCb2R5ID0gX2RlcmVxXygnLi9Cb2R5Jyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY29tcG9zaXRlLiBUaGUgb3B0aW9ucyBwYXJhbWV0ZXIgaXMgYW4gb2JqZWN0IHRoYXQgc3BlY2lmaWVzIGFueSBwcm9wZXJ0aWVzIHlvdSB3aXNoIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0cy5cbiAgICAgKiBTZWUgdGhlIHByb3Blcml0ZXMgc2VjdGlvbiBiZWxvdyBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gd2hhdCB5b3UgY2FuIHBhc3MgdmlhIHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHt9IFtvcHRpb25zXVxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gQSBuZXcgY29tcG9zaXRlXG4gICAgICovXG4gICAgQ29tcG9zaXRlLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIENvbW1vbi5leHRlbmQoeyBcbiAgICAgICAgICAgIGlkOiBDb21tb24ubmV4dElkKCksXG4gICAgICAgICAgICB0eXBlOiAnY29tcG9zaXRlJyxcbiAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgIGlzTW9kaWZpZWQ6IGZhbHNlLFxuICAgICAgICAgICAgYm9kaWVzOiBbXSwgXG4gICAgICAgICAgICBjb25zdHJhaW50czogW10sIFxuICAgICAgICAgICAgY29tcG9zaXRlczogW10sXG4gICAgICAgICAgICBsYWJlbDogJ0NvbXBvc2l0ZSdcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGNvbXBvc2l0ZSdzIGBpc01vZGlmaWVkYCBmbGFnLiBcbiAgICAgKiBJZiBgdXBkYXRlUGFyZW50c2AgaXMgdHJ1ZSwgYWxsIHBhcmVudHMgd2lsbCBiZSBzZXQgKGRlZmF1bHQ6IGZhbHNlKS5cbiAgICAgKiBJZiBgdXBkYXRlQ2hpbGRyZW5gIGlzIHRydWUsIGFsbCBjaGlsZHJlbiB3aWxsIGJlIHNldCAoZGVmYXVsdDogZmFsc2UpLlxuICAgICAqIEBtZXRob2Qgc2V0TW9kaWZpZWRcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc01vZGlmaWVkXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbdXBkYXRlUGFyZW50cz1mYWxzZV1cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt1cGRhdGVDaGlsZHJlbj1mYWxzZV1cbiAgICAgKi9cbiAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQgPSBmdW5jdGlvbihjb21wb3NpdGUsIGlzTW9kaWZpZWQsIHVwZGF0ZVBhcmVudHMsIHVwZGF0ZUNoaWxkcmVuKSB7XG4gICAgICAgIGNvbXBvc2l0ZS5pc01vZGlmaWVkID0gaXNNb2RpZmllZDtcblxuICAgICAgICBpZiAodXBkYXRlUGFyZW50cyAmJiBjb21wb3NpdGUucGFyZW50KSB7XG4gICAgICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlLnBhcmVudCwgaXNNb2RpZmllZCwgdXBkYXRlUGFyZW50cywgdXBkYXRlQ2hpbGRyZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVwZGF0ZUNoaWxkcmVuKSB7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY29tcG9zaXRlLmNvbXBvc2l0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRDb21wb3NpdGUgPSBjb21wb3NpdGUuY29tcG9zaXRlc1tpXTtcbiAgICAgICAgICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY2hpbGRDb21wb3NpdGUsIGlzTW9kaWZpZWQsIHVwZGF0ZVBhcmVudHMsIHVwZGF0ZUNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIGFkZCBmdW5jdGlvbi4gQWRkcyBvbmUgb3IgbWFueSBib2R5KHMpLCBjb25zdHJhaW50KHMpIG9yIGEgY29tcG9zaXRlKHMpIHRvIHRoZSBnaXZlbiBjb21wb3NpdGUuXG4gICAgICogVHJpZ2dlcnMgYGJlZm9yZUFkZGAgYW5kIGBhZnRlckFkZGAgZXZlbnRzIG9uIHRoZSBgY29tcG9zaXRlYC5cbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVcbiAgICAgKiBAcGFyYW0ge30gb2JqZWN0XG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBUaGUgb3JpZ2luYWwgY29tcG9zaXRlIHdpdGggdGhlIG9iamVjdHMgYWRkZWRcbiAgICAgKi9cbiAgICBDb21wb3NpdGUuYWRkID0gZnVuY3Rpb24oY29tcG9zaXRlLCBvYmplY3QpIHtcbiAgICAgICAgdmFyIG9iamVjdHMgPSBbXS5jb25jYXQob2JqZWN0KTtcblxuICAgICAgICBFdmVudHMudHJpZ2dlcihjb21wb3NpdGUsICdiZWZvcmVBZGQnLCB7IG9iamVjdDogb2JqZWN0IH0pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG9iamVjdHNbaV07XG5cbiAgICAgICAgICAgIHN3aXRjaCAob2JqLnR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnYm9keSc6XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBhZGRpbmcgY29tcG91bmQgcGFydHNcbiAgICAgICAgICAgICAgICBpZiAob2JqLnBhcmVudCAhPT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIENvbW1vbi53YXJuKCdDb21wb3NpdGUuYWRkOiBza2lwcGVkIGFkZGluZyBhIGNvbXBvdW5kIGJvZHkgcGFydCAoeW91IG11c3QgYWRkIGl0cyBwYXJlbnQgaW5zdGVhZCknKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLmFkZEJvZHkoY29tcG9zaXRlLCBvYmopO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29uc3RyYWludCc6XG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLmFkZENvbnN0cmFpbnQoY29tcG9zaXRlLCBvYmopO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tcG9zaXRlJzpcbiAgICAgICAgICAgICAgICBDb21wb3NpdGUuYWRkQ29tcG9zaXRlKGNvbXBvc2l0ZSwgb2JqKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21vdXNlQ29uc3RyYWludCc6XG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLmFkZENvbnN0cmFpbnQoY29tcG9zaXRlLCBvYmouY29uc3RyYWludCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50cy50cmlnZ2VyKGNvbXBvc2l0ZSwgJ2FmdGVyQWRkJywgeyBvYmplY3Q6IG9iamVjdCB9KTtcblxuICAgICAgICByZXR1cm4gY29tcG9zaXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmljIHJlbW92ZSBmdW5jdGlvbi4gUmVtb3ZlcyBvbmUgb3IgbWFueSBib2R5KHMpLCBjb25zdHJhaW50KHMpIG9yIGEgY29tcG9zaXRlKHMpIHRvIHRoZSBnaXZlbiBjb21wb3NpdGUuXG4gICAgICogT3B0aW9uYWxseSBzZWFyY2hpbmcgaXRzIGNoaWxkcmVuIHJlY3Vyc2l2ZWx5LlxuICAgICAqIFRyaWdnZXJzIGBiZWZvcmVSZW1vdmVgIGFuZCBgYWZ0ZXJSZW1vdmVgIGV2ZW50cyBvbiB0aGUgYGNvbXBvc2l0ZWAuXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHt9IG9iamVjdFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2RlZXA9ZmFsc2VdXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBUaGUgb3JpZ2luYWwgY29tcG9zaXRlIHdpdGggdGhlIG9iamVjdHMgcmVtb3ZlZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5yZW1vdmUgPSBmdW5jdGlvbihjb21wb3NpdGUsIG9iamVjdCwgZGVlcCkge1xuICAgICAgICB2YXIgb2JqZWN0cyA9IFtdLmNvbmNhdChvYmplY3QpO1xuXG4gICAgICAgIEV2ZW50cy50cmlnZ2VyKGNvbXBvc2l0ZSwgJ2JlZm9yZVJlbW92ZScsIHsgb2JqZWN0OiBvYmplY3QgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gb2JqZWN0c1tpXTtcblxuICAgICAgICAgICAgc3dpdGNoIChvYmoudHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICdib2R5JzpcbiAgICAgICAgICAgICAgICBDb21wb3NpdGUucmVtb3ZlQm9keShjb21wb3NpdGUsIG9iaiwgZGVlcCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb25zdHJhaW50JzpcbiAgICAgICAgICAgICAgICBDb21wb3NpdGUucmVtb3ZlQ29uc3RyYWludChjb21wb3NpdGUsIG9iaiwgZGVlcCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21wb3NpdGUnOlxuICAgICAgICAgICAgICAgIENvbXBvc2l0ZS5yZW1vdmVDb21wb3NpdGUoY29tcG9zaXRlLCBvYmosIGRlZXApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbW91c2VDb25zdHJhaW50JzpcbiAgICAgICAgICAgICAgICBDb21wb3NpdGUucmVtb3ZlQ29uc3RyYWludChjb21wb3NpdGUsIG9iai5jb25zdHJhaW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgRXZlbnRzLnRyaWdnZXIoY29tcG9zaXRlLCAnYWZ0ZXJSZW1vdmUnLCB7IG9iamVjdDogb2JqZWN0IH0pO1xuXG4gICAgICAgIHJldHVybiBjb21wb3NpdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjb21wb3NpdGUgdG8gdGhlIGdpdmVuIGNvbXBvc2l0ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYWRkQ29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZUFcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlQlxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gVGhlIG9yaWdpbmFsIGNvbXBvc2l0ZUEgd2l0aCB0aGUgb2JqZWN0cyBmcm9tIGNvbXBvc2l0ZUIgYWRkZWRcbiAgICAgKi9cbiAgICBDb21wb3NpdGUuYWRkQ29tcG9zaXRlID0gZnVuY3Rpb24oY29tcG9zaXRlQSwgY29tcG9zaXRlQikge1xuICAgICAgICBjb21wb3NpdGVBLmNvbXBvc2l0ZXMucHVzaChjb21wb3NpdGVCKTtcbiAgICAgICAgY29tcG9zaXRlQi5wYXJlbnQgPSBjb21wb3NpdGVBO1xuICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlQSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tcG9zaXRlQTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGNvbXBvc2l0ZSBmcm9tIHRoZSBnaXZlbiBjb21wb3NpdGUsIGFuZCBvcHRpb25hbGx5IHNlYXJjaGluZyBpdHMgY2hpbGRyZW4gcmVjdXJzaXZlbHkuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIHJlbW92ZUNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVBXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZUJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtkZWVwPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gVGhlIG9yaWdpbmFsIGNvbXBvc2l0ZUEgd2l0aCB0aGUgY29tcG9zaXRlIHJlbW92ZWRcbiAgICAgKi9cbiAgICBDb21wb3NpdGUucmVtb3ZlQ29tcG9zaXRlID0gZnVuY3Rpb24oY29tcG9zaXRlQSwgY29tcG9zaXRlQiwgZGVlcCkge1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBDb21tb24uaW5kZXhPZihjb21wb3NpdGVBLmNvbXBvc2l0ZXMsIGNvbXBvc2l0ZUIpO1xuICAgICAgICBpZiAocG9zaXRpb24gIT09IC0xKSB7XG4gICAgICAgICAgICBDb21wb3NpdGUucmVtb3ZlQ29tcG9zaXRlQXQoY29tcG9zaXRlQSwgcG9zaXRpb24pO1xuICAgICAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZUEsIHRydWUsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvc2l0ZUEuY29tcG9zaXRlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLnJlbW92ZUNvbXBvc2l0ZShjb21wb3NpdGVBLmNvbXBvc2l0ZXNbaV0sIGNvbXBvc2l0ZUIsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZUE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBjb21wb3NpdGUgZnJvbSB0aGUgZ2l2ZW4gY29tcG9zaXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCByZW1vdmVDb21wb3NpdGVBdFxuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcG9zaXRpb25cbiAgICAgKiBAcmV0dXJuIHtjb21wb3NpdGV9IFRoZSBvcmlnaW5hbCBjb21wb3NpdGUgd2l0aCB0aGUgY29tcG9zaXRlIHJlbW92ZWRcbiAgICAgKi9cbiAgICBDb21wb3NpdGUucmVtb3ZlQ29tcG9zaXRlQXQgPSBmdW5jdGlvbihjb21wb3NpdGUsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbXBvc2l0ZS5jb21wb3NpdGVzLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgICAgIENvbXBvc2l0ZS5zZXRNb2RpZmllZChjb21wb3NpdGUsIHRydWUsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGJvZHkgdG8gdGhlIGdpdmVuIGNvbXBvc2l0ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYWRkQm9keVxuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcmV0dXJuIHtjb21wb3NpdGV9IFRoZSBvcmlnaW5hbCBjb21wb3NpdGUgd2l0aCB0aGUgYm9keSBhZGRlZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5hZGRCb2R5ID0gZnVuY3Rpb24oY29tcG9zaXRlLCBib2R5KSB7XG4gICAgICAgIGNvbXBvc2l0ZS5ib2RpZXMucHVzaChib2R5KTtcbiAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tcG9zaXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgYm9keSBmcm9tIHRoZSBnaXZlbiBjb21wb3NpdGUsIGFuZCBvcHRpb25hbGx5IHNlYXJjaGluZyBpdHMgY2hpbGRyZW4gcmVjdXJzaXZlbHkuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIHJlbW92ZUJvZHlcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5XG4gICAgICogQHBhcmFtIHtib29sZWFufSBbZGVlcD1mYWxzZV1cbiAgICAgKiBAcmV0dXJuIHtjb21wb3NpdGV9IFRoZSBvcmlnaW5hbCBjb21wb3NpdGUgd2l0aCB0aGUgYm9keSByZW1vdmVkXG4gICAgICovXG4gICAgQ29tcG9zaXRlLnJlbW92ZUJvZHkgPSBmdW5jdGlvbihjb21wb3NpdGUsIGJvZHksIGRlZXApIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gQ29tbW9uLmluZGV4T2YoY29tcG9zaXRlLmJvZGllcywgYm9keSk7XG4gICAgICAgIGlmIChwb3NpdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIENvbXBvc2l0ZS5yZW1vdmVCb2R5QXQoY29tcG9zaXRlLCBwb3NpdGlvbik7XG4gICAgICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb3NpdGUuY29tcG9zaXRlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLnJlbW92ZUJvZHkoY29tcG9zaXRlLmNvbXBvc2l0ZXNbaV0sIGJvZHksIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGJvZHkgZnJvbSB0aGUgZ2l2ZW4gY29tcG9zaXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCByZW1vdmVCb2R5QXRcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBUaGUgb3JpZ2luYWwgY29tcG9zaXRlIHdpdGggdGhlIGJvZHkgcmVtb3ZlZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5yZW1vdmVCb2R5QXQgPSBmdW5jdGlvbihjb21wb3NpdGUsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbXBvc2l0ZS5ib2RpZXMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tcG9zaXRlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgY29uc3RyYWludCB0byB0aGUgZ2l2ZW4gY29tcG9zaXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBhZGRDb25zdHJhaW50XG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7Y29uc3RyYWludH0gY29uc3RyYWludFxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gVGhlIG9yaWdpbmFsIGNvbXBvc2l0ZSB3aXRoIHRoZSBjb25zdHJhaW50IGFkZGVkXG4gICAgICovXG4gICAgQ29tcG9zaXRlLmFkZENvbnN0cmFpbnQgPSBmdW5jdGlvbihjb21wb3NpdGUsIGNvbnN0cmFpbnQpIHtcbiAgICAgICAgY29tcG9zaXRlLmNvbnN0cmFpbnRzLnB1c2goY29uc3RyYWludCk7XG4gICAgICAgIENvbXBvc2l0ZS5zZXRNb2RpZmllZChjb21wb3NpdGUsIHRydWUsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGNvbnN0cmFpbnQgZnJvbSB0aGUgZ2l2ZW4gY29tcG9zaXRlLCBhbmQgb3B0aW9uYWxseSBzZWFyY2hpbmcgaXRzIGNoaWxkcmVuIHJlY3Vyc2l2ZWx5LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCByZW1vdmVDb25zdHJhaW50XG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7Y29uc3RyYWludH0gY29uc3RyYWludFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2RlZXA9ZmFsc2VdXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBUaGUgb3JpZ2luYWwgY29tcG9zaXRlIHdpdGggdGhlIGNvbnN0cmFpbnQgcmVtb3ZlZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5yZW1vdmVDb25zdHJhaW50ID0gZnVuY3Rpb24oY29tcG9zaXRlLCBjb25zdHJhaW50LCBkZWVwKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IENvbW1vbi5pbmRleE9mKGNvbXBvc2l0ZS5jb25zdHJhaW50cywgY29uc3RyYWludCk7XG4gICAgICAgIGlmIChwb3NpdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgIENvbXBvc2l0ZS5yZW1vdmVDb25zdHJhaW50QXQoY29tcG9zaXRlLCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb3NpdGUuY29tcG9zaXRlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICAgICAgQ29tcG9zaXRlLnJlbW92ZUNvbnN0cmFpbnQoY29tcG9zaXRlLmNvbXBvc2l0ZXNbaV0sIGNvbnN0cmFpbnQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGJvZHkgZnJvbSB0aGUgZ2l2ZW4gY29tcG9zaXRlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCByZW1vdmVDb25zdHJhaW50QXRcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBvc2l0aW9uXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBUaGUgb3JpZ2luYWwgY29tcG9zaXRlIHdpdGggdGhlIGNvbnN0cmFpbnQgcmVtb3ZlZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5yZW1vdmVDb25zdHJhaW50QXQgPSBmdW5jdGlvbihjb21wb3NpdGUsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbXBvc2l0ZS5jb25zdHJhaW50cy5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21wb3NpdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGJvZGllcywgY29uc3RyYWludHMgYW5kIGNvbXBvc2l0ZXMgZnJvbSB0aGUgZ2l2ZW4gY29tcG9zaXRlLlxuICAgICAqIE9wdGlvbmFsbHkgY2xlYXJpbmcgaXRzIGNoaWxkcmVuIHJlY3Vyc2l2ZWx5LlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtib29sZWFufSBrZWVwU3RhdGljXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbZGVlcD1mYWxzZV1cbiAgICAgKi9cbiAgICBDb21wb3NpdGUuY2xlYXIgPSBmdW5jdGlvbihjb21wb3NpdGUsIGtlZXBTdGF0aWMsIGRlZXApIHtcbiAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9zaXRlLmNvbXBvc2l0ZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIENvbXBvc2l0ZS5jbGVhcihjb21wb3NpdGUuY29tcG9zaXRlc1tpXSwga2VlcFN0YXRpYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChrZWVwU3RhdGljKSB7XG4gICAgICAgICAgICBjb21wb3NpdGUuYm9kaWVzID0gY29tcG9zaXRlLmJvZGllcy5maWx0ZXIoZnVuY3Rpb24oYm9keSkgeyByZXR1cm4gYm9keS5pc1N0YXRpYzsgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wb3NpdGUuYm9kaWVzLmxlbmd0aCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjb21wb3NpdGUuY29uc3RyYWludHMubGVuZ3RoID0gMDtcbiAgICAgICAgY29tcG9zaXRlLmNvbXBvc2l0ZXMubGVuZ3RoID0gMDtcbiAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAgIHJldHVybiBjb21wb3NpdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGJvZGllcyBpbiB0aGUgZ2l2ZW4gY29tcG9zaXRlLCBpbmNsdWRpbmcgYWxsIGJvZGllcyBpbiBpdHMgY2hpbGRyZW4sIHJlY3Vyc2l2ZWx5LlxuICAgICAqIEBtZXRob2QgYWxsQm9kaWVzXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEByZXR1cm4ge2JvZHlbXX0gQWxsIHRoZSBib2RpZXNcbiAgICAgKi9cbiAgICBDb21wb3NpdGUuYWxsQm9kaWVzID0gZnVuY3Rpb24oY29tcG9zaXRlKSB7XG4gICAgICAgIHZhciBib2RpZXMgPSBbXS5jb25jYXQoY29tcG9zaXRlLmJvZGllcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21wb3NpdGUuY29tcG9zaXRlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIGJvZGllcyA9IGJvZGllcy5jb25jYXQoQ29tcG9zaXRlLmFsbEJvZGllcyhjb21wb3NpdGUuY29tcG9zaXRlc1tpXSkpO1xuXG4gICAgICAgIHJldHVybiBib2RpZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGNvbnN0cmFpbnRzIGluIHRoZSBnaXZlbiBjb21wb3NpdGUsIGluY2x1ZGluZyBhbGwgY29uc3RyYWludHMgaW4gaXRzIGNoaWxkcmVuLCByZWN1cnNpdmVseS5cbiAgICAgKiBAbWV0aG9kIGFsbENvbnN0cmFpbnRzXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEByZXR1cm4ge2NvbnN0cmFpbnRbXX0gQWxsIHRoZSBjb25zdHJhaW50c1xuICAgICAqL1xuICAgIENvbXBvc2l0ZS5hbGxDb25zdHJhaW50cyA9IGZ1bmN0aW9uKGNvbXBvc2l0ZSkge1xuICAgICAgICB2YXIgY29uc3RyYWludHMgPSBbXS5jb25jYXQoY29tcG9zaXRlLmNvbnN0cmFpbnRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvc2l0ZS5jb21wb3NpdGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgY29uc3RyYWludHMgPSBjb25zdHJhaW50cy5jb25jYXQoQ29tcG9zaXRlLmFsbENvbnN0cmFpbnRzKGNvbXBvc2l0ZS5jb21wb3NpdGVzW2ldKSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnN0cmFpbnRzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCBjb21wb3NpdGVzIGluIHRoZSBnaXZlbiBjb21wb3NpdGUsIGluY2x1ZGluZyBhbGwgY29tcG9zaXRlcyBpbiBpdHMgY2hpbGRyZW4sIHJlY3Vyc2l2ZWx5LlxuICAgICAqIEBtZXRob2QgYWxsQ29tcG9zaXRlc1xuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVcbiAgICAgKiBAcmV0dXJuIHtjb21wb3NpdGVbXX0gQWxsIHRoZSBjb21wb3NpdGVzXG4gICAgICovXG4gICAgQ29tcG9zaXRlLmFsbENvbXBvc2l0ZXMgPSBmdW5jdGlvbihjb21wb3NpdGUpIHtcbiAgICAgICAgdmFyIGNvbXBvc2l0ZXMgPSBbXS5jb25jYXQoY29tcG9zaXRlLmNvbXBvc2l0ZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9zaXRlLmNvbXBvc2l0ZXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBjb21wb3NpdGVzID0gY29tcG9zaXRlcy5jb25jYXQoQ29tcG9zaXRlLmFsbENvbXBvc2l0ZXMoY29tcG9zaXRlLmNvbXBvc2l0ZXNbaV0pKTtcblxuICAgICAgICByZXR1cm4gY29tcG9zaXRlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VhcmNoZXMgdGhlIGNvbXBvc2l0ZSByZWN1cnNpdmVseSBmb3IgYW4gb2JqZWN0IG1hdGNoaW5nIHRoZSB0eXBlIGFuZCBpZCBzdXBwbGllZCwgbnVsbCBpZiBub3QgZm91bmQuXG4gICAgICogQG1ldGhvZCBnZXRcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGlkXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSByZXF1ZXN0ZWQgb2JqZWN0LCBpZiBmb3VuZFxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5nZXQgPSBmdW5jdGlvbihjb21wb3NpdGUsIGlkLCB0eXBlKSB7XG4gICAgICAgIHZhciBvYmplY3RzLFxuICAgICAgICAgICAgb2JqZWN0O1xuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdib2R5JzpcbiAgICAgICAgICAgIG9iamVjdHMgPSBDb21wb3NpdGUuYWxsQm9kaWVzKGNvbXBvc2l0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29uc3RyYWludCc6XG4gICAgICAgICAgICBvYmplY3RzID0gQ29tcG9zaXRlLmFsbENvbnN0cmFpbnRzKGNvbXBvc2l0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29tcG9zaXRlJzpcbiAgICAgICAgICAgIG9iamVjdHMgPSBDb21wb3NpdGUuYWxsQ29tcG9zaXRlcyhjb21wb3NpdGUpLmNvbmNhdChjb21wb3NpdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iamVjdHMpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBvYmplY3QgPSBvYmplY3RzLmZpbHRlcihmdW5jdGlvbihvYmplY3QpIHsgXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0LmlkLnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKCk7IFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gb2JqZWN0Lmxlbmd0aCA9PT0gMCA/IG51bGwgOiBvYmplY3RbMF07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoZSBnaXZlbiBvYmplY3QocykgZnJvbSBjb21wb3NpdGVBIHRvIGNvbXBvc2l0ZUIgKGVxdWFsIHRvIGEgcmVtb3ZlIGZvbGxvd2VkIGJ5IGFuIGFkZCkuXG4gICAgICogQG1ldGhvZCBtb3ZlXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGVBfSBjb21wb3NpdGVBXG4gICAgICogQHBhcmFtIHtvYmplY3RbXX0gb2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlQn0gY29tcG9zaXRlQlxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gUmV0dXJucyBjb21wb3NpdGVBXG4gICAgICovXG4gICAgQ29tcG9zaXRlLm1vdmUgPSBmdW5jdGlvbihjb21wb3NpdGVBLCBvYmplY3RzLCBjb21wb3NpdGVCKSB7XG4gICAgICAgIENvbXBvc2l0ZS5yZW1vdmUoY29tcG9zaXRlQSwgb2JqZWN0cyk7XG4gICAgICAgIENvbXBvc2l0ZS5hZGQoY29tcG9zaXRlQiwgb2JqZWN0cyk7XG4gICAgICAgIHJldHVybiBjb21wb3NpdGVBO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ25zIG5ldyBpZHMgZm9yIGFsbCBvYmplY3RzIGluIHRoZSBjb21wb3NpdGUsIHJlY3Vyc2l2ZWx5LlxuICAgICAqIEBtZXRob2QgcmViYXNlXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gUmV0dXJucyBjb21wb3NpdGVcbiAgICAgKi9cbiAgICBDb21wb3NpdGUucmViYXNlID0gZnVuY3Rpb24oY29tcG9zaXRlKSB7XG4gICAgICAgIHZhciBvYmplY3RzID0gQ29tcG9zaXRlLmFsbEJvZGllcyhjb21wb3NpdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KENvbXBvc2l0ZS5hbGxDb25zdHJhaW50cyhjb21wb3NpdGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChDb21wb3NpdGUuYWxsQ29tcG9zaXRlcyhjb21wb3NpdGUpKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG9iamVjdHNbaV0uaWQgPSBDb21tb24ubmV4dElkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVHJhbnNsYXRlcyBhbGwgY2hpbGRyZW4gaW4gdGhlIGNvbXBvc2l0ZSBieSBhIGdpdmVuIHZlY3RvciByZWxhdGl2ZSB0byB0aGVpciBjdXJyZW50IHBvc2l0aW9ucywgXG4gICAgICogd2l0aG91dCBpbXBhcnRpbmcgYW55IHZlbG9jaXR5LlxuICAgICAqIEBtZXRob2QgdHJhbnNsYXRlXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB0cmFuc2xhdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbH0gW3JlY3Vyc2l2ZT10cnVlXVxuICAgICAqL1xuICAgIENvbXBvc2l0ZS50cmFuc2xhdGUgPSBmdW5jdGlvbihjb21wb3NpdGUsIHRyYW5zbGF0aW9uLCByZWN1cnNpdmUpIHtcbiAgICAgICAgdmFyIGJvZGllcyA9IHJlY3Vyc2l2ZSA/IENvbXBvc2l0ZS5hbGxCb2RpZXMoY29tcG9zaXRlKSA6IGNvbXBvc2l0ZS5ib2RpZXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIEJvZHkudHJhbnNsYXRlKGJvZGllc1tpXSwgdHJhbnNsYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAgIHJldHVybiBjb21wb3NpdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZXMgYWxsIGNoaWxkcmVuIGluIHRoZSBjb21wb3NpdGUgYnkgYSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgZ2l2ZW4gcG9pbnQsIHdpdGhvdXQgaW1wYXJ0aW5nIGFueSBhbmd1bGFyIHZlbG9jaXR5LlxuICAgICAqIEBtZXRob2Qgcm90YXRlXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByb3RhdGlvblxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqIEBwYXJhbSB7Ym9vbH0gW3JlY3Vyc2l2ZT10cnVlXVxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5yb3RhdGUgPSBmdW5jdGlvbihjb21wb3NpdGUsIHJvdGF0aW9uLCBwb2ludCwgcmVjdXJzaXZlKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyb3RhdGlvbiksXG4gICAgICAgICAgICBzaW4gPSBNYXRoLnNpbihyb3RhdGlvbiksXG4gICAgICAgICAgICBib2RpZXMgPSByZWN1cnNpdmUgPyBDb21wb3NpdGUuYWxsQm9kaWVzKGNvbXBvc2l0ZSkgOiBjb21wb3NpdGUuYm9kaWVzO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXSxcbiAgICAgICAgICAgICAgICBkeCA9IGJvZHkucG9zaXRpb24ueCAtIHBvaW50LngsXG4gICAgICAgICAgICAgICAgZHkgPSBib2R5LnBvc2l0aW9uLnkgLSBwb2ludC55O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQm9keS5zZXRQb3NpdGlvbihib2R5LCB7XG4gICAgICAgICAgICAgICAgeDogcG9pbnQueCArIChkeCAqIGNvcyAtIGR5ICogc2luKSxcbiAgICAgICAgICAgICAgICB5OiBwb2ludC55ICsgKGR4ICogc2luICsgZHkgKiBjb3MpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQm9keS5yb3RhdGUoYm9keSwgcm90YXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29tcG9zaXRlLnNldE1vZGlmaWVkKGNvbXBvc2l0ZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAgIHJldHVybiBjb21wb3NpdGU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNjYWxlcyBhbGwgY2hpbGRyZW4gaW4gdGhlIGNvbXBvc2l0ZSwgaW5jbHVkaW5nIHVwZGF0aW5nIHBoeXNpY2FsIHByb3BlcnRpZXMgKG1hc3MsIGFyZWEsIGF4ZXMsIGluZXJ0aWEpLCBmcm9tIGEgd29ybGQtc3BhY2UgcG9pbnQuXG4gICAgICogQG1ldGhvZCBzY2FsZVxuICAgICAqIEBwYXJhbSB7Y29tcG9zaXRlfSBjb21wb3NpdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGVYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlWVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqIEBwYXJhbSB7Ym9vbH0gW3JlY3Vyc2l2ZT10cnVlXVxuICAgICAqL1xuICAgIENvbXBvc2l0ZS5zY2FsZSA9IGZ1bmN0aW9uKGNvbXBvc2l0ZSwgc2NhbGVYLCBzY2FsZVksIHBvaW50LCByZWN1cnNpdmUpIHtcbiAgICAgICAgdmFyIGJvZGllcyA9IHJlY3Vyc2l2ZSA/IENvbXBvc2l0ZS5hbGxCb2RpZXMoY29tcG9zaXRlKSA6IGNvbXBvc2l0ZS5ib2RpZXM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldLFxuICAgICAgICAgICAgICAgIGR4ID0gYm9keS5wb3NpdGlvbi54IC0gcG9pbnQueCxcbiAgICAgICAgICAgICAgICBkeSA9IGJvZHkucG9zaXRpb24ueSAtIHBvaW50Lnk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBCb2R5LnNldFBvc2l0aW9uKGJvZHksIHtcbiAgICAgICAgICAgICAgICB4OiBwb2ludC54ICsgZHggKiBzY2FsZVgsXG4gICAgICAgICAgICAgICAgeTogcG9pbnQueSArIGR5ICogc2NhbGVZXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQm9keS5zY2FsZShib2R5LCBzY2FsZVgsIHNjYWxlWSk7XG4gICAgICAgIH1cblxuICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQoY29tcG9zaXRlLCB0cnVlLCB0cnVlLCBmYWxzZSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgRXZlbnRzIERvY3VtZW50YXRpb25cbiAgICAqXG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgd2hlbiBhIGNhbGwgdG8gYENvbXBvc2l0ZS5hZGRgIGlzIG1hZGUsIGJlZm9yZSBvYmplY3RzIGhhdmUgYmVlbiBhZGRlZC5cbiAgICAqXG4gICAgKiBAZXZlbnQgYmVmb3JlQWRkXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge30gZXZlbnQub2JqZWN0IFRoZSBvYmplY3QocykgdG8gYmUgYWRkZWQgKG1heSBiZSBhIHNpbmdsZSBib2R5LCBjb25zdHJhaW50LCBjb21wb3NpdGUgb3IgYSBtaXhlZCBhcnJheSBvZiB0aGVzZSlcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIGEgY2FsbCB0byBgQ29tcG9zaXRlLmFkZGAgaXMgbWFkZSwgYWZ0ZXIgb2JqZWN0cyBoYXZlIGJlZW4gYWRkZWQuXG4gICAgKlxuICAgICogQGV2ZW50IGFmdGVyQWRkXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge30gZXZlbnQub2JqZWN0IFRoZSBvYmplY3QocykgdGhhdCBoYXZlIGJlZW4gYWRkZWQgKG1heSBiZSBhIHNpbmdsZSBib2R5LCBjb25zdHJhaW50LCBjb21wb3NpdGUgb3IgYSBtaXhlZCBhcnJheSBvZiB0aGVzZSlcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIGEgY2FsbCB0byBgQ29tcG9zaXRlLnJlbW92ZWAgaXMgbWFkZSwgYmVmb3JlIG9iamVjdHMgaGF2ZSBiZWVuIHJlbW92ZWQuXG4gICAgKlxuICAgICogQGV2ZW50IGJlZm9yZVJlbW92ZVxuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm9iamVjdCBUaGUgb2JqZWN0KHMpIHRvIGJlIHJlbW92ZWQgKG1heSBiZSBhIHNpbmdsZSBib2R5LCBjb25zdHJhaW50LCBjb21wb3NpdGUgb3IgYSBtaXhlZCBhcnJheSBvZiB0aGVzZSlcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIGEgY2FsbCB0byBgQ29tcG9zaXRlLnJlbW92ZWAgaXMgbWFkZSwgYWZ0ZXIgb2JqZWN0cyBoYXZlIGJlZW4gcmVtb3ZlZC5cbiAgICAqXG4gICAgKiBAZXZlbnQgYWZ0ZXJSZW1vdmVcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7fSBldmVudC5vYmplY3QgVGhlIG9iamVjdChzKSB0aGF0IGhhdmUgYmVlbiByZW1vdmVkIChtYXkgYmUgYSBzaW5nbGUgYm9keSwgY29uc3RyYWludCwgY29tcG9zaXRlIG9yIGEgbWl4ZWQgYXJyYXkgb2YgdGhlc2UpXG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qXG4gICAgKlxuICAgICogIFByb3BlcnRpZXMgRG9jdW1lbnRhdGlvblxuICAgICpcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gaW50ZWdlciBgTnVtYmVyYCB1bmlxdWVseSBpZGVudGlmeWluZyBudW1iZXIgZ2VuZXJhdGVkIGluIGBDb21wb3NpdGUuY3JlYXRlYCBieSBgQ29tbW9uLm5leHRJZGAuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgaWRcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYFN0cmluZ2AgZGVub3RpbmcgdGhlIHR5cGUgb2Ygb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHR5cGVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBcImNvbXBvc2l0ZVwiXG4gICAgICogQHJlYWRPbmx5XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBhcmJpdHJhcnkgYFN0cmluZ2AgbmFtZSB0byBoZWxwIHRoZSB1c2VyIGlkZW50aWZ5IGFuZCBtYW5hZ2UgY29tcG9zaXRlcy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBsYWJlbFxuICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAqIEBkZWZhdWx0IFwiQ29tcG9zaXRlXCJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0aGF0IHNwZWNpZmllcyB3aGV0aGVyIHRoZSBjb21wb3NpdGUgaGFzIGJlZW4gbW9kaWZpZWQgZHVyaW5nIHRoZSBjdXJyZW50IHN0ZXAuXG4gICAgICogTW9zdCBgTWF0dGVyLkNvbXBvc2l0ZWAgbWV0aG9kcyB3aWxsIGF1dG9tYXRpY2FsbHkgc2V0IHRoaXMgZmxhZyB0byBgdHJ1ZWAgdG8gaW5mb3JtIHRoZSBlbmdpbmUgb2YgY2hhbmdlcyB0byBiZSBoYW5kbGVkLlxuICAgICAqIElmIHlvdSBuZWVkIHRvIGNoYW5nZSBpdCBtYW51YWxseSwgeW91IHNob3VsZCB1c2UgdGhlIGBDb21wb3NpdGUuc2V0TW9kaWZpZWRgIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBpc01vZGlmaWVkXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgYENvbXBvc2l0ZWAgdGhhdCBpcyB0aGUgcGFyZW50IG9mIHRoaXMgY29tcG9zaXRlLiBJdCBpcyBhdXRvbWF0aWNhbGx5IG1hbmFnZWQgYnkgdGhlIGBNYXR0ZXIuQ29tcG9zaXRlYCBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHBhcmVudFxuICAgICAqIEB0eXBlIGNvbXBvc2l0ZVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGFycmF5IG9mIGBCb2R5YCB0aGF0IGFyZSBfZGlyZWN0XyBjaGlsZHJlbiBvZiB0aGlzIGNvbXBvc2l0ZS5cbiAgICAgKiBUbyBhZGQgb3IgcmVtb3ZlIGJvZGllcyB5b3Ugc2hvdWxkIHVzZSBgQ29tcG9zaXRlLmFkZGAgYW5kIGBDb21wb3NpdGUucmVtb3ZlYCBtZXRob2RzIHJhdGhlciB0aGFuIGRpcmVjdGx5IG1vZGlmeWluZyB0aGlzIHByb3BlcnR5LlxuICAgICAqIElmIHlvdSB3aXNoIHRvIHJlY3Vyc2l2ZWx5IGZpbmQgYWxsIGRlc2NlbmRhbnRzLCB5b3Ugc2hvdWxkIHVzZSB0aGUgYENvbXBvc2l0ZS5hbGxCb2RpZXNgIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBib2RpZXNcbiAgICAgKiBAdHlwZSBib2R5W11cbiAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgYENvbnN0cmFpbnRgIHRoYXQgYXJlIF9kaXJlY3RfIGNoaWxkcmVuIG9mIHRoaXMgY29tcG9zaXRlLlxuICAgICAqIFRvIGFkZCBvciByZW1vdmUgY29uc3RyYWludHMgeW91IHNob3VsZCB1c2UgYENvbXBvc2l0ZS5hZGRgIGFuZCBgQ29tcG9zaXRlLnJlbW92ZWAgbWV0aG9kcyByYXRoZXIgdGhhbiBkaXJlY3RseSBtb2RpZnlpbmcgdGhpcyBwcm9wZXJ0eS5cbiAgICAgKiBJZiB5b3Ugd2lzaCB0byByZWN1cnNpdmVseSBmaW5kIGFsbCBkZXNjZW5kYW50cywgeW91IHNob3VsZCB1c2UgdGhlIGBDb21wb3NpdGUuYWxsQ29uc3RyYWludHNgIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBjb25zdHJhaW50c1xuICAgICAqIEB0eXBlIGNvbnN0cmFpbnRbXVxuICAgICAqIEBkZWZhdWx0IFtdXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBhcnJheSBvZiBgQ29tcG9zaXRlYCB0aGF0IGFyZSBfZGlyZWN0XyBjaGlsZHJlbiBvZiB0aGlzIGNvbXBvc2l0ZS5cbiAgICAgKiBUbyBhZGQgb3IgcmVtb3ZlIGNvbXBvc2l0ZXMgeW91IHNob3VsZCB1c2UgYENvbXBvc2l0ZS5hZGRgIGFuZCBgQ29tcG9zaXRlLnJlbW92ZWAgbWV0aG9kcyByYXRoZXIgdGhhbiBkaXJlY3RseSBtb2RpZnlpbmcgdGhpcyBwcm9wZXJ0eS5cbiAgICAgKiBJZiB5b3Ugd2lzaCB0byByZWN1cnNpdmVseSBmaW5kIGFsbCBkZXNjZW5kYW50cywgeW91IHNob3VsZCB1c2UgdGhlIGBDb21wb3NpdGUuYWxsQ29tcG9zaXRlc2AgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGNvbXBvc2l0ZXNcbiAgICAgKiBAdHlwZSBjb21wb3NpdGVbXVxuICAgICAqIEBkZWZhdWx0IFtdXG4gICAgICovXG5cbn0pKCk7XG5cbn0se1wiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2NvcmUvRXZlbnRzXCI6MTYsXCIuL0JvZHlcIjoxfV0sMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuV29ybGRgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIHRoZSB3b3JsZCBjb21wb3NpdGUuXG4qIEEgYE1hdHRlci5Xb3JsZGAgaXMgYSBgTWF0dGVyLkNvbXBvc2l0ZWAgYm9keSwgd2hpY2ggaXMgYSBjb2xsZWN0aW9uIG9mIGBNYXR0ZXIuQm9keWAsIGBNYXR0ZXIuQ29uc3RyYWludGAgYW5kIG90aGVyIGBNYXR0ZXIuQ29tcG9zaXRlYC5cbiogQSBgTWF0dGVyLldvcmxkYCBoYXMgYSBmZXcgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGluY2x1ZGluZyBgZ3Jhdml0eWAgYW5kIGBib3VuZHNgLlxuKiBJdCBpcyBpbXBvcnRhbnQgdG8gdXNlIHRoZSBmdW5jdGlvbnMgaW4gdGhlIGBNYXR0ZXIuQ29tcG9zaXRlYCBtb2R1bGUgdG8gbW9kaWZ5IHRoZSB3b3JsZCBjb21wb3NpdGUsIHJhdGhlciB0aGFuIGRpcmVjdGx5IG1vZGlmeWluZyBpdHMgcHJvcGVydGllcy5cbiogVGhlcmUgYXJlIGFsc28gYSBmZXcgbWV0aG9kcyBoZXJlIHRoYXQgYWxpYXMgdGhvc2UgaW4gYE1hdHRlci5Db21wb3NpdGVgIGZvciBlYXNpZXIgcmVhZGFiaWxpdHkuXG4qXG4qIFNlZSB0aGUgaW5jbHVkZWQgdXNhZ2UgW2V4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbGlhYnJ1L21hdHRlci1qcy90cmVlL21hc3Rlci9leGFtcGxlcykuXG4qXG4qIEBjbGFzcyBXb3JsZFxuKiBAZXh0ZW5kcyBDb21wb3NpdGVcbiovXG5cbnZhciBXb3JsZCA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkO1xuXG52YXIgQ29tcG9zaXRlID0gX2RlcmVxXygnLi9Db21wb3NpdGUnKTtcbnZhciBDb25zdHJhaW50ID0gX2RlcmVxXygnLi4vY29uc3RyYWludC9Db25zdHJhaW50Jyk7XG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyB3b3JsZCBjb21wb3NpdGUuIFRoZSBvcHRpb25zIHBhcmFtZXRlciBpcyBhbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgYW55IHByb3BlcnRpZXMgeW91IHdpc2ggdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzLlxuICAgICAqIFNlZSB0aGUgcHJvcGVydGllcyBzZWN0aW9uIGJlbG93IGZvciBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvbiB3aGF0IHlvdSBjYW4gcGFzcyB2aWEgdGhlIGBvcHRpb25zYCBvYmplY3QuXG4gICAgICogQG1ldGhvZCBjcmVhdGVcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge30gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3dvcmxkfSBBIG5ldyB3b3JsZFxuICAgICAqL1xuICAgIFdvcmxkLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNvbXBvc2l0ZSA9IENvbXBvc2l0ZS5jcmVhdGUoKTtcblxuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBsYWJlbDogJ1dvcmxkJyxcbiAgICAgICAgICAgIGdyYXZpdHk6IHtcbiAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgIHk6IDEsXG4gICAgICAgICAgICAgICAgc2NhbGU6IDAuMDAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm91bmRzOiB7IFxuICAgICAgICAgICAgICAgIG1pbjogeyB4OiAtSW5maW5pdHksIHk6IC1JbmZpbml0eSB9LCBcbiAgICAgICAgICAgICAgICBtYXg6IHsgeDogSW5maW5pdHksIHk6IEluZmluaXR5IH0gXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQ29tbW9uLmV4dGVuZChjb21wb3NpdGUsIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgUHJvcGVydGllcyBEb2N1bWVudGF0aW9uXG4gICAgKlxuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZ3Jhdml0eSB0byBhcHBseSBvbiB0aGUgd29ybGQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZ3Jhdml0eVxuICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGdyYXZpdHkgeCBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZ3Jhdml0eS54XG4gICAgICogQHR5cGUgb2JqZWN0XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGdyYXZpdHkgeSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZ3Jhdml0eS55XG4gICAgICogQHR5cGUgb2JqZWN0XG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGdyYXZpdHkgc2NhbGUgZmFjdG9yLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGdyYXZpdHkuc2NhbGVcbiAgICAgKiBAdHlwZSBvYmplY3RcbiAgICAgKiBAZGVmYXVsdCAwLjAwMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgQm91bmRzYCBvYmplY3QgdGhhdCBkZWZpbmVzIHRoZSB3b3JsZCBib3VuZHMgZm9yIGNvbGxpc2lvbiBkZXRlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYm91bmRzXG4gICAgICogQHR5cGUgYm91bmRzXG4gICAgICogQGRlZmF1bHQgeyBtaW46IHsgeDogLUluZmluaXR5LCB5OiAtSW5maW5pdHkgfSwgbWF4OiB7IHg6IEluZmluaXR5LCB5OiBJbmZpbml0eSB9IH1cbiAgICAgKi9cblxuICAgIC8vIFdvcmxkIGlzIGEgQ29tcG9zaXRlIGJvZHlcbiAgICAvLyBzZWUgc3JjL21vZHVsZS9PdXRyby5qcyBmb3IgdGhlc2UgYWxpYXNlczpcbiAgICBcbiAgICAvKipcbiAgICAgKiBBbiBhbGlhcyBmb3IgQ29tcG9zaXRlLmNsZWFyXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEBwYXJhbSB7d29ybGR9IHdvcmxkXG4gICAgICogQHBhcmFtIHtib29sZWFufSBrZWVwU3RhdGljXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBhbGlhcyBmb3IgQ29tcG9zaXRlLmFkZFxuICAgICAqIEBtZXRob2QgYWRkQ29tcG9zaXRlXG4gICAgICogQHBhcmFtIHt3b3JsZH0gd29ybGRcbiAgICAgKiBAcGFyYW0ge2NvbXBvc2l0ZX0gY29tcG9zaXRlXG4gICAgICogQHJldHVybiB7d29ybGR9IFRoZSBvcmlnaW5hbCB3b3JsZCB3aXRoIHRoZSBvYmplY3RzIGZyb20gY29tcG9zaXRlIGFkZGVkXG4gICAgICovXG4gICAgXG4gICAgIC8qKlxuICAgICAgKiBBbiBhbGlhcyBmb3IgQ29tcG9zaXRlLmFkZEJvZHlcbiAgICAgICogQG1ldGhvZCBhZGRCb2R5XG4gICAgICAqIEBwYXJhbSB7d29ybGR9IHdvcmxkXG4gICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAgKiBAcmV0dXJuIHt3b3JsZH0gVGhlIG9yaWdpbmFsIHdvcmxkIHdpdGggdGhlIGJvZHkgYWRkZWRcbiAgICAgICovXG5cbiAgICAgLyoqXG4gICAgICAqIEFuIGFsaWFzIGZvciBDb21wb3NpdGUuYWRkQ29uc3RyYWludFxuICAgICAgKiBAbWV0aG9kIGFkZENvbnN0cmFpbnRcbiAgICAgICogQHBhcmFtIHt3b3JsZH0gd29ybGRcbiAgICAgICogQHBhcmFtIHtjb25zdHJhaW50fSBjb25zdHJhaW50XG4gICAgICAqIEByZXR1cm4ge3dvcmxkfSBUaGUgb3JpZ2luYWwgd29ybGQgd2l0aCB0aGUgY29uc3RyYWludCBhZGRlZFxuICAgICAgKi9cblxufSkoKTtcblxufSx7XCIuLi9jb25zdHJhaW50L0NvbnN0cmFpbnRcIjoxMixcIi4uL2NvcmUvQ29tbW9uXCI6MTQsXCIuL0NvbXBvc2l0ZVwiOjJ9XSw0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5Db250YWN0YCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyBmb3IgY3JlYXRpbmcgYW5kIG1hbmlwdWxhdGluZyBjb2xsaXNpb24gY29udGFjdHMuXG4qXG4qIEBjbGFzcyBDb250YWN0XG4qL1xuXG52YXIgQ29udGFjdCA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhY3Q7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY29udGFjdC5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7dmVydGV4fSB2ZXJ0ZXhcbiAgICAgKiBAcmV0dXJuIHtjb250YWN0fSBBIG5ldyBjb250YWN0XG4gICAgICovXG4gICAgQ29udGFjdC5jcmVhdGUgPSBmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBDb250YWN0LmlkKHZlcnRleCksXG4gICAgICAgICAgICB2ZXJ0ZXg6IHZlcnRleCxcbiAgICAgICAgICAgIG5vcm1hbEltcHVsc2U6IDAsXG4gICAgICAgICAgICB0YW5nZW50SW1wdWxzZTogMFxuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgY29udGFjdCBpZC5cbiAgICAgKiBAbWV0aG9kIGlkXG4gICAgICogQHBhcmFtIHt2ZXJ0ZXh9IHZlcnRleFxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVW5pcXVlIGNvbnRhY3RJRFxuICAgICAqL1xuICAgIENvbnRhY3QuaWQgPSBmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgICAgcmV0dXJuIHZlcnRleC5ib2R5LmlkICsgJ18nICsgdmVydGV4LmluZGV4O1xuICAgIH07XG5cbn0pKCk7XG5cbn0se31dLDU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLkRldGVjdG9yYCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyBmb3IgZGV0ZWN0aW5nIGNvbGxpc2lvbnMgZ2l2ZW4gYSBzZXQgb2YgcGFpcnMuXG4qXG4qIEBjbGFzcyBEZXRlY3RvclxuKi9cblxuLy8gVE9ETzogc3BlY3VsYXRpdmUgY29udGFjdHNcblxudmFyIERldGVjdG9yID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gRGV0ZWN0b3I7XG5cbnZhciBTQVQgPSBfZGVyZXFfKCcuL1NBVCcpO1xudmFyIFBhaXIgPSBfZGVyZXFfKCcuL1BhaXInKTtcbnZhciBCb3VuZHMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9Cb3VuZHMnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogRmluZHMgYWxsIGNvbGxpc2lvbnMgZ2l2ZW4gYSBsaXN0IG9mIHBhaXJzLlxuICAgICAqIEBtZXRob2QgY29sbGlzaW9uc1xuICAgICAqIEBwYXJhbSB7cGFpcltdfSBicm9hZHBoYXNlUGFpcnNcbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lXG4gICAgICogQHJldHVybiB7YXJyYXl9IGNvbGxpc2lvbnNcbiAgICAgKi9cbiAgICBEZXRlY3Rvci5jb2xsaXNpb25zID0gZnVuY3Rpb24oYnJvYWRwaGFzZVBhaXJzLCBlbmdpbmUpIHtcbiAgICAgICAgdmFyIGNvbGxpc2lvbnMgPSBbXSxcbiAgICAgICAgICAgIHBhaXJzVGFibGUgPSBlbmdpbmUucGFpcnMudGFibGU7XG5cbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnJvYWRwaGFzZVBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keUEgPSBicm9hZHBoYXNlUGFpcnNbaV1bMF0sIFxuICAgICAgICAgICAgICAgIGJvZHlCID0gYnJvYWRwaGFzZVBhaXJzW2ldWzFdO1xuXG4gICAgICAgICAgICBpZiAoKGJvZHlBLmlzU3RhdGljIHx8IGJvZHlBLmlzU2xlZXBpbmcpICYmIChib2R5Qi5pc1N0YXRpYyB8fCBib2R5Qi5pc1NsZWVwaW5nKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCFEZXRlY3Rvci5jYW5Db2xsaWRlKGJvZHlBLmNvbGxpc2lvbkZpbHRlciwgYm9keUIuY29sbGlzaW9uRmlsdGVyKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuXG4gICAgICAgICAgICAvLyBtaWQgcGhhc2VcbiAgICAgICAgICAgIGlmIChCb3VuZHMub3ZlcmxhcHMoYm9keUEuYm91bmRzLCBib2R5Qi5ib3VuZHMpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGJvZHlBLnBhcnRzLmxlbmd0aCA+IDEgPyAxIDogMDsgaiA8IGJvZHlBLnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0QSA9IGJvZHlBLnBhcnRzW2pdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSBib2R5Qi5wYXJ0cy5sZW5ndGggPiAxID8gMSA6IDA7IGsgPCBib2R5Qi5wYXJ0cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRCID0gYm9keUIucGFydHNba107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgocGFydEEgPT09IGJvZHlBICYmIHBhcnRCID09PSBib2R5QikgfHwgQm91bmRzLm92ZXJsYXBzKHBhcnRBLmJvdW5kcywgcGFydEIuYm91bmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgYSBwcmV2aW91cyBjb2xsaXNpb24gd2UgY291bGQgcmV1c2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFpcklkID0gUGFpci5pZChwYXJ0QSwgcGFydEIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWlyID0gcGFpcnNUYWJsZVtwYWlySWRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NvbGxpc2lvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWlyICYmIHBhaXIuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NvbGxpc2lvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmFycm93IHBoYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbGxpc2lvbiA9IFNBVC5jb2xsaWRlcyhwYXJ0QSwgcGFydEIsIHByZXZpb3VzQ29sbGlzaW9uKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbi5jb2xsaWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goY29sbGlzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29sbGlzaW9ucztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgYm90aCBzdXBwbGllZCBjb2xsaXNpb24gZmlsdGVycyB3aWxsIGFsbG93IGEgY29sbGlzaW9uIHRvIG9jY3VyLlxuICAgICAqIFNlZSBgYm9keS5jb2xsaXNpb25GaWx0ZXJgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqIEBtZXRob2QgY2FuQ29sbGlkZVxuICAgICAqIEBwYXJhbSB7fSBmaWx0ZXJBXG4gICAgICogQHBhcmFtIHt9IGZpbHRlckJcbiAgICAgKiBAcmV0dXJuIHtib29sfSBgdHJ1ZWAgaWYgY29sbGlzaW9uIGNhbiBvY2N1clxuICAgICAqL1xuICAgIERldGVjdG9yLmNhbkNvbGxpZGUgPSBmdW5jdGlvbihmaWx0ZXJBLCBmaWx0ZXJCKSB7XG4gICAgICAgIGlmIChmaWx0ZXJBLmdyb3VwID09PSBmaWx0ZXJCLmdyb3VwICYmIGZpbHRlckEuZ3JvdXAgIT09IDApXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQS5ncm91cCA+IDA7XG5cbiAgICAgICAgcmV0dXJuIChmaWx0ZXJBLm1hc2sgJiBmaWx0ZXJCLmNhdGVnb3J5KSAhPT0gMCAmJiAoZmlsdGVyQi5tYXNrICYgZmlsdGVyQS5jYXRlZ29yeSkgIT09IDA7XG4gICAgfTtcblxufSkoKTtcblxufSx7XCIuLi9nZW9tZXRyeS9Cb3VuZHNcIjoyNixcIi4vUGFpclwiOjcsXCIuL1NBVFwiOjExfV0sNjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuR3JpZGAgbW9kdWxlIGNvbnRhaW5zIG1ldGhvZHMgZm9yIGNyZWF0aW5nIGFuZCBtYW5pcHVsYXRpbmcgY29sbGlzaW9uIGJyb2FkcGhhc2UgZ3JpZCBzdHJ1Y3R1cmVzLlxuKlxuKiBAY2xhc3MgR3JpZFxuKi9cblxudmFyIEdyaWQgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkO1xuXG52YXIgUGFpciA9IF9kZXJlcV8oJy4vUGFpcicpO1xudmFyIERldGVjdG9yID0gX2RlcmVxXygnLi9EZXRlY3RvcicpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgZ3JpZC5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7Z3JpZH0gQSBuZXcgZ3JpZFxuICAgICAqL1xuICAgIEdyaWQuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBjb250cm9sbGVyOiBHcmlkLFxuICAgICAgICAgICAgZGV0ZWN0b3I6IERldGVjdG9yLmNvbGxpc2lvbnMsXG4gICAgICAgICAgICBidWNrZXRzOiB7fSxcbiAgICAgICAgICAgIHBhaXJzOiB7fSxcbiAgICAgICAgICAgIHBhaXJzTGlzdDogW10sXG4gICAgICAgICAgICBidWNrZXRXaWR0aDogNDgsXG4gICAgICAgICAgICBidWNrZXRIZWlnaHQ6IDQ4XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIENvbW1vbi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgd2lkdGggb2YgYSBzaW5nbGUgZ3JpZCBidWNrZXQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYnVja2V0V2lkdGhcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCA0OFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGhlaWdodCBvZiBhIHNpbmdsZSBncmlkIGJ1Y2tldC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBidWNrZXRIZWlnaHRcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCA0OFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgZ3JpZC5cbiAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7Z3JpZH0gZ3JpZFxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lXG4gICAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZVVwZGF0ZVxuICAgICAqL1xuICAgIEdyaWQudXBkYXRlID0gZnVuY3Rpb24oZ3JpZCwgYm9kaWVzLCBlbmdpbmUsIGZvcmNlVXBkYXRlKSB7XG4gICAgICAgIHZhciBpLCBjb2wsIHJvdyxcbiAgICAgICAgICAgIHdvcmxkID0gZW5naW5lLndvcmxkLFxuICAgICAgICAgICAgYnVja2V0cyA9IGdyaWQuYnVja2V0cyxcbiAgICAgICAgICAgIGJ1Y2tldCxcbiAgICAgICAgICAgIGJ1Y2tldElkLFxuICAgICAgICAgICAgZ3JpZENoYW5nZWQgPSBmYWxzZTtcblxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoYm9keS5pc1NsZWVwaW5nICYmICFmb3JjZVVwZGF0ZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gZG9uJ3QgdXBkYXRlIG91dCBvZiB3b3JsZCBib2RpZXNcbiAgICAgICAgICAgIGlmIChib2R5LmJvdW5kcy5tYXgueCA8IHdvcmxkLmJvdW5kcy5taW4ueCB8fCBib2R5LmJvdW5kcy5taW4ueCA+IHdvcmxkLmJvdW5kcy5tYXgueFxuICAgICAgICAgICAgICAgIHx8IGJvZHkuYm91bmRzLm1heC55IDwgd29ybGQuYm91bmRzLm1pbi55IHx8IGJvZHkuYm91bmRzLm1pbi55ID4gd29ybGQuYm91bmRzLm1heC55KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB2YXIgbmV3UmVnaW9uID0gX2dldFJlZ2lvbihncmlkLCBib2R5KTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGJvZHkgaGFzIGNoYW5nZWQgZ3JpZCByZWdpb25cbiAgICAgICAgICAgIGlmICghYm9keS5yZWdpb24gfHwgbmV3UmVnaW9uLmlkICE9PSBib2R5LnJlZ2lvbi5pZCB8fCBmb3JjZVVwZGF0ZSkge1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoIWJvZHkucmVnaW9uIHx8IGZvcmNlVXBkYXRlKVxuICAgICAgICAgICAgICAgICAgICBib2R5LnJlZ2lvbiA9IG5ld1JlZ2lvbjtcblxuICAgICAgICAgICAgICAgIHZhciB1bmlvbiA9IF9yZWdpb25VbmlvbihuZXdSZWdpb24sIGJvZHkucmVnaW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBncmlkIGJ1Y2tldHMgYWZmZWN0ZWQgYnkgcmVnaW9uIGNoYW5nZVxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgb3ZlciB0aGUgdW5pb24gb2YgYm90aCByZWdpb25zXG4gICAgICAgICAgICAgICAgZm9yIChjb2wgPSB1bmlvbi5zdGFydENvbDsgY29sIDw9IHVuaW9uLmVuZENvbDsgY29sKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyb3cgPSB1bmlvbi5zdGFydFJvdzsgcm93IDw9IHVuaW9uLmVuZFJvdzsgcm93KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1Y2tldElkID0gX2dldEJ1Y2tldElkKGNvbCwgcm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1Y2tldCA9IGJ1Y2tldHNbYnVja2V0SWRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXNJbnNpZGVOZXdSZWdpb24gPSAoY29sID49IG5ld1JlZ2lvbi5zdGFydENvbCAmJiBjb2wgPD0gbmV3UmVnaW9uLmVuZENvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcm93ID49IG5ld1JlZ2lvbi5zdGFydFJvdyAmJiByb3cgPD0gbmV3UmVnaW9uLmVuZFJvdyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0luc2lkZU9sZFJlZ2lvbiA9IChjb2wgPj0gYm9keS5yZWdpb24uc3RhcnRDb2wgJiYgY29sIDw9IGJvZHkucmVnaW9uLmVuZENvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcm93ID49IGJvZHkucmVnaW9uLnN0YXJ0Um93ICYmIHJvdyA8PSBib2R5LnJlZ2lvbi5lbmRSb3cpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZnJvbSBvbGQgcmVnaW9uIGJ1Y2tldHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNJbnNpZGVOZXdSZWdpb24gJiYgaXNJbnNpZGVPbGRSZWdpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbnNpZGVPbGRSZWdpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1Y2tldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9idWNrZXRSZW1vdmVCb2R5KGdyaWQsIGJ1Y2tldCwgYm9keSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdG8gbmV3IHJlZ2lvbiBidWNrZXRzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYm9keS5yZWdpb24gPT09IG5ld1JlZ2lvbiB8fCAoaXNJbnNpZGVOZXdSZWdpb24gJiYgIWlzSW5zaWRlT2xkUmVnaW9uKSB8fCBmb3JjZVVwZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYnVja2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWNrZXQgPSBfY3JlYXRlQnVja2V0KGJ1Y2tldHMsIGJ1Y2tldElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYnVja2V0QWRkQm9keShncmlkLCBidWNrZXQsIGJvZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBuZXcgcmVnaW9uXG4gICAgICAgICAgICAgICAgYm9keS5yZWdpb24gPSBuZXdSZWdpb247XG5cbiAgICAgICAgICAgICAgICAvLyBmbGFnIGNoYW5nZXMgc28gd2UgY2FuIHVwZGF0ZSBwYWlyc1xuICAgICAgICAgICAgICAgIGdyaWRDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBwYWlycyBsaXN0IG9ubHkgaWYgcGFpcnMgY2hhbmdlZCAoaS5lLiBhIGJvZHkgY2hhbmdlZCByZWdpb24pXG4gICAgICAgIGlmIChncmlkQ2hhbmdlZClcbiAgICAgICAgICAgIGdyaWQucGFpcnNMaXN0ID0gX2NyZWF0ZUFjdGl2ZVBhaXJzTGlzdChncmlkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBncmlkLlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcGFyYW0ge2dyaWR9IGdyaWRcbiAgICAgKi9cbiAgICBHcmlkLmNsZWFyID0gZnVuY3Rpb24oZ3JpZCkge1xuICAgICAgICBncmlkLmJ1Y2tldHMgPSB7fTtcbiAgICAgICAgZ3JpZC5wYWlycyA9IHt9O1xuICAgICAgICBncmlkLnBhaXJzTGlzdCA9IFtdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgdW5pb24gb2YgdHdvIHJlZ2lvbnMuXG4gICAgICogQG1ldGhvZCBfcmVnaW9uVW5pb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSByZWdpb25BXG4gICAgICogQHBhcmFtIHt9IHJlZ2lvbkJcbiAgICAgKiBAcmV0dXJuIHt9IHJlZ2lvblxuICAgICAqL1xuICAgIHZhciBfcmVnaW9uVW5pb24gPSBmdW5jdGlvbihyZWdpb25BLCByZWdpb25CKSB7XG4gICAgICAgIHZhciBzdGFydENvbCA9IE1hdGgubWluKHJlZ2lvbkEuc3RhcnRDb2wsIHJlZ2lvbkIuc3RhcnRDb2wpLFxuICAgICAgICAgICAgZW5kQ29sID0gTWF0aC5tYXgocmVnaW9uQS5lbmRDb2wsIHJlZ2lvbkIuZW5kQ29sKSxcbiAgICAgICAgICAgIHN0YXJ0Um93ID0gTWF0aC5taW4ocmVnaW9uQS5zdGFydFJvdywgcmVnaW9uQi5zdGFydFJvdyksXG4gICAgICAgICAgICBlbmRSb3cgPSBNYXRoLm1heChyZWdpb25BLmVuZFJvdywgcmVnaW9uQi5lbmRSb3cpO1xuXG4gICAgICAgIHJldHVybiBfY3JlYXRlUmVnaW9uKHN0YXJ0Q29sLCBlbmRDb2wsIHN0YXJ0Um93LCBlbmRSb3cpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSByZWdpb24gYSBnaXZlbiBib2R5IGZhbGxzIGluIGZvciBhIGdpdmVuIGdyaWQuXG4gICAgICogQG1ldGhvZCBfZ2V0UmVnaW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge30gZ3JpZFxuICAgICAqIEBwYXJhbSB7fSBib2R5XG4gICAgICogQHJldHVybiB7fSByZWdpb25cbiAgICAgKi9cbiAgICB2YXIgX2dldFJlZ2lvbiA9IGZ1bmN0aW9uKGdyaWQsIGJvZHkpIHtcbiAgICAgICAgdmFyIGJvdW5kcyA9IGJvZHkuYm91bmRzLFxuICAgICAgICAgICAgc3RhcnRDb2wgPSBNYXRoLmZsb29yKGJvdW5kcy5taW4ueCAvIGdyaWQuYnVja2V0V2lkdGgpLFxuICAgICAgICAgICAgZW5kQ29sID0gTWF0aC5mbG9vcihib3VuZHMubWF4LnggLyBncmlkLmJ1Y2tldFdpZHRoKSxcbiAgICAgICAgICAgIHN0YXJ0Um93ID0gTWF0aC5mbG9vcihib3VuZHMubWluLnkgLyBncmlkLmJ1Y2tldEhlaWdodCksXG4gICAgICAgICAgICBlbmRSb3cgPSBNYXRoLmZsb29yKGJvdW5kcy5tYXgueSAvIGdyaWQuYnVja2V0SGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gX2NyZWF0ZVJlZ2lvbihzdGFydENvbCwgZW5kQ29sLCBzdGFydFJvdywgZW5kUm93KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHJlZ2lvbi5cbiAgICAgKiBAbWV0aG9kIF9jcmVhdGVSZWdpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBzdGFydENvbFxuICAgICAqIEBwYXJhbSB7fSBlbmRDb2xcbiAgICAgKiBAcGFyYW0ge30gc3RhcnRSb3dcbiAgICAgKiBAcGFyYW0ge30gZW5kUm93XG4gICAgICogQHJldHVybiB7fSByZWdpb25cbiAgICAgKi9cbiAgICB2YXIgX2NyZWF0ZVJlZ2lvbiA9IGZ1bmN0aW9uKHN0YXJ0Q29sLCBlbmRDb2wsIHN0YXJ0Um93LCBlbmRSb3cpIHtcbiAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICBpZDogc3RhcnRDb2wgKyAnLCcgKyBlbmRDb2wgKyAnLCcgKyBzdGFydFJvdyArICcsJyArIGVuZFJvdyxcbiAgICAgICAgICAgIHN0YXJ0Q29sOiBzdGFydENvbCwgXG4gICAgICAgICAgICBlbmRDb2w6IGVuZENvbCwgXG4gICAgICAgICAgICBzdGFydFJvdzogc3RhcnRSb3csIFxuICAgICAgICAgICAgZW5kUm93OiBlbmRSb3cgXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGJ1Y2tldCBpZCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICogQG1ldGhvZCBfZ2V0QnVja2V0SWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBjb2x1bW5cbiAgICAgKiBAcGFyYW0ge30gcm93XG4gICAgICogQHJldHVybiB7c3RyaW5nfSBidWNrZXQgaWRcbiAgICAgKi9cbiAgICB2YXIgX2dldEJ1Y2tldElkID0gZnVuY3Rpb24oY29sdW1uLCByb3cpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbiArICcsJyArIHJvdztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJ1Y2tldC5cbiAgICAgKiBAbWV0aG9kIF9jcmVhdGVCdWNrZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBidWNrZXRzXG4gICAgICogQHBhcmFtIHt9IGJ1Y2tldElkXG4gICAgICogQHJldHVybiB7fSBidWNrZXRcbiAgICAgKi9cbiAgICB2YXIgX2NyZWF0ZUJ1Y2tldCA9IGZ1bmN0aW9uKGJ1Y2tldHMsIGJ1Y2tldElkKSB7XG4gICAgICAgIHZhciBidWNrZXQgPSBidWNrZXRzW2J1Y2tldElkXSA9IFtdO1xuICAgICAgICByZXR1cm4gYnVja2V0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgYm9keSB0byBhIGJ1Y2tldC5cbiAgICAgKiBAbWV0aG9kIF9idWNrZXRBZGRCb2R5XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge30gZ3JpZFxuICAgICAqIEBwYXJhbSB7fSBidWNrZXRcbiAgICAgKiBAcGFyYW0ge30gYm9keVxuICAgICAqL1xuICAgIHZhciBfYnVja2V0QWRkQm9keSA9IGZ1bmN0aW9uKGdyaWQsIGJ1Y2tldCwgYm9keSkge1xuICAgICAgICAvLyBhZGQgbmV3IHBhaXJzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVja2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keUIgPSBidWNrZXRbaV07XG5cbiAgICAgICAgICAgIGlmIChib2R5LmlkID09PSBib2R5Qi5pZCB8fCAoYm9keS5pc1N0YXRpYyAmJiBib2R5Qi5pc1N0YXRpYykpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBidWNrZXRzIHRoZSBwYWlyIGV4aXN0cyBpblxuICAgICAgICAgICAgLy8gaW1wb3J0YW50IGZvciBHcmlkLnVwZGF0ZSB0byB3b3JrXG4gICAgICAgICAgICB2YXIgcGFpcklkID0gUGFpci5pZChib2R5LCBib2R5QiksXG4gICAgICAgICAgICAgICAgcGFpciA9IGdyaWQucGFpcnNbcGFpcklkXTtcblxuICAgICAgICAgICAgaWYgKHBhaXIpIHtcbiAgICAgICAgICAgICAgICBwYWlyWzJdICs9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyaWQucGFpcnNbcGFpcklkXSA9IFtib2R5LCBib2R5QiwgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgdG8gYm9kaWVzIChhZnRlciBwYWlycywgb3RoZXJ3aXNlIHBhaXJzIHdpdGggc2VsZilcbiAgICAgICAgYnVja2V0LnB1c2goYm9keSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBib2R5IGZyb20gYSBidWNrZXQuXG4gICAgICogQG1ldGhvZCBfYnVja2V0UmVtb3ZlQm9keVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHt9IGdyaWRcbiAgICAgKiBAcGFyYW0ge30gYnVja2V0XG4gICAgICogQHBhcmFtIHt9IGJvZHlcbiAgICAgKi9cbiAgICB2YXIgX2J1Y2tldFJlbW92ZUJvZHkgPSBmdW5jdGlvbihncmlkLCBidWNrZXQsIGJvZHkpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gYnVja2V0XG4gICAgICAgIGJ1Y2tldC5zcGxpY2UoQ29tbW9uLmluZGV4T2YoYnVja2V0LCBib2R5KSwgMSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHBhaXIgY291bnRzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVja2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgYnVja2V0cyB0aGUgcGFpciBleGlzdHMgaW5cbiAgICAgICAgICAgIC8vIGltcG9ydGFudCBmb3IgX2NyZWF0ZUFjdGl2ZVBhaXJzTGlzdCB0byB3b3JrXG4gICAgICAgICAgICB2YXIgYm9keUIgPSBidWNrZXRbaV0sXG4gICAgICAgICAgICAgICAgcGFpcklkID0gUGFpci5pZChib2R5LCBib2R5QiksXG4gICAgICAgICAgICAgICAgcGFpciA9IGdyaWQucGFpcnNbcGFpcklkXTtcblxuICAgICAgICAgICAgaWYgKHBhaXIpXG4gICAgICAgICAgICAgICAgcGFpclsyXSAtPSAxO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIGxpc3Qgb2YgdGhlIGFjdGl2ZSBwYWlycyBpbiB0aGUgZ3JpZC5cbiAgICAgKiBAbWV0aG9kIF9jcmVhdGVBY3RpdmVQYWlyc0xpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBncmlkXG4gICAgICogQHJldHVybiBbXSBwYWlyc1xuICAgICAqL1xuICAgIHZhciBfY3JlYXRlQWN0aXZlUGFpcnNMaXN0ID0gZnVuY3Rpb24oZ3JpZCkge1xuICAgICAgICB2YXIgcGFpcktleXMsXG4gICAgICAgICAgICBwYWlyLFxuICAgICAgICAgICAgcGFpcnMgPSBbXTtcblxuICAgICAgICAvLyBncmlkLnBhaXJzIGlzIHVzZWQgYXMgYSBoYXNobWFwXG4gICAgICAgIHBhaXJLZXlzID0gQ29tbW9uLmtleXMoZ3JpZC5wYWlycyk7XG5cbiAgICAgICAgLy8gaXRlcmF0ZSBvdmVyIGdyaWQucGFpcnNcbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBwYWlyS2V5cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgcGFpciA9IGdyaWQucGFpcnNbcGFpcktleXNba11dO1xuXG4gICAgICAgICAgICAvLyBpZiBwYWlyIGV4aXN0cyBpbiBhdCBsZWFzdCBvbmUgYnVja2V0XG4gICAgICAgICAgICAvLyBpdCBpcyBhIHBhaXIgdGhhdCBuZWVkcyBmdXJ0aGVyIGNvbGxpc2lvbiB0ZXN0aW5nIHNvIHB1c2ggaXRcbiAgICAgICAgICAgIGlmIChwYWlyWzJdID4gMCkge1xuICAgICAgICAgICAgICAgIHBhaXJzLnB1c2gocGFpcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBncmlkLnBhaXJzW3BhaXJLZXlzW2tdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYWlycztcbiAgICB9O1xuICAgIFxufSkoKTtcblxufSx7XCIuLi9jb3JlL0NvbW1vblwiOjE0LFwiLi9EZXRlY3RvclwiOjUsXCIuL1BhaXJcIjo3fV0sNzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuUGFpcmAgbW9kdWxlIGNvbnRhaW5zIG1ldGhvZHMgZm9yIGNyZWF0aW5nIGFuZCBtYW5pcHVsYXRpbmcgY29sbGlzaW9uIHBhaXJzLlxuKlxuKiBAY2xhc3MgUGFpclxuKi9cblxudmFyIFBhaXIgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQYWlyO1xuXG52YXIgQ29udGFjdCA9IF9kZXJlcV8oJy4vQ29udGFjdCcpO1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhaXIuXG4gICAgICogQG1ldGhvZCBjcmVhdGVcbiAgICAgKiBAcGFyYW0ge2NvbGxpc2lvbn0gY29sbGlzaW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcFxuICAgICAqIEByZXR1cm4ge3BhaXJ9IEEgbmV3IHBhaXJcbiAgICAgKi9cbiAgICBQYWlyLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbGxpc2lvbiwgdGltZXN0YW1wKSB7XG4gICAgICAgIHZhciBib2R5QSA9IGNvbGxpc2lvbi5ib2R5QSxcbiAgICAgICAgICAgIGJvZHlCID0gY29sbGlzaW9uLmJvZHlCLFxuICAgICAgICAgICAgcGFyZW50QSA9IGNvbGxpc2lvbi5wYXJlbnRBLFxuICAgICAgICAgICAgcGFyZW50QiA9IGNvbGxpc2lvbi5wYXJlbnRCO1xuXG4gICAgICAgIHZhciBwYWlyID0ge1xuICAgICAgICAgICAgaWQ6IFBhaXIuaWQoYm9keUEsIGJvZHlCKSxcbiAgICAgICAgICAgIGJvZHlBOiBib2R5QSxcbiAgICAgICAgICAgIGJvZHlCOiBib2R5QixcbiAgICAgICAgICAgIGNvbnRhY3RzOiB7fSxcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRhY3RzOiBbXSxcbiAgICAgICAgICAgIHNlcGFyYXRpb246IDAsXG4gICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGlzU2Vuc29yOiBib2R5QS5pc1NlbnNvciB8fCBib2R5Qi5pc1NlbnNvcixcbiAgICAgICAgICAgIHRpbWVDcmVhdGVkOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICB0aW1lVXBkYXRlZDogdGltZXN0YW1wLFxuICAgICAgICAgICAgaW52ZXJzZU1hc3M6IHBhcmVudEEuaW52ZXJzZU1hc3MgKyBwYXJlbnRCLmludmVyc2VNYXNzLFxuICAgICAgICAgICAgZnJpY3Rpb246IE1hdGgubWluKHBhcmVudEEuZnJpY3Rpb24sIHBhcmVudEIuZnJpY3Rpb24pLFxuICAgICAgICAgICAgZnJpY3Rpb25TdGF0aWM6IE1hdGgubWF4KHBhcmVudEEuZnJpY3Rpb25TdGF0aWMsIHBhcmVudEIuZnJpY3Rpb25TdGF0aWMpLFxuICAgICAgICAgICAgcmVzdGl0dXRpb246IE1hdGgubWF4KHBhcmVudEEucmVzdGl0dXRpb24sIHBhcmVudEIucmVzdGl0dXRpb24pLFxuICAgICAgICAgICAgc2xvcDogTWF0aC5tYXgocGFyZW50QS5zbG9wLCBwYXJlbnRCLnNsb3ApXG4gICAgICAgIH07XG5cbiAgICAgICAgUGFpci51cGRhdGUocGFpciwgY29sbGlzaW9uLCB0aW1lc3RhbXApO1xuXG4gICAgICAgIHJldHVybiBwYWlyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGEgcGFpciBnaXZlbiBhIGNvbGxpc2lvbi5cbiAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7cGFpcn0gcGFpclxuICAgICAqIEBwYXJhbSB7Y29sbGlzaW9ufSBjb2xsaXNpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wXG4gICAgICovXG4gICAgUGFpci51cGRhdGUgPSBmdW5jdGlvbihwYWlyLCBjb2xsaXNpb24sIHRpbWVzdGFtcCkge1xuICAgICAgICB2YXIgY29udGFjdHMgPSBwYWlyLmNvbnRhY3RzLFxuICAgICAgICAgICAgc3VwcG9ydHMgPSBjb2xsaXNpb24uc3VwcG9ydHMsXG4gICAgICAgICAgICBhY3RpdmVDb250YWN0cyA9IHBhaXIuYWN0aXZlQ29udGFjdHMsXG4gICAgICAgICAgICBwYXJlbnRBID0gY29sbGlzaW9uLnBhcmVudEEsXG4gICAgICAgICAgICBwYXJlbnRCID0gY29sbGlzaW9uLnBhcmVudEI7XG4gICAgICAgIFxuICAgICAgICBwYWlyLmNvbGxpc2lvbiA9IGNvbGxpc2lvbjtcbiAgICAgICAgcGFpci5pbnZlcnNlTWFzcyA9IHBhcmVudEEuaW52ZXJzZU1hc3MgKyBwYXJlbnRCLmludmVyc2VNYXNzO1xuICAgICAgICBwYWlyLmZyaWN0aW9uID0gTWF0aC5taW4ocGFyZW50QS5mcmljdGlvbiwgcGFyZW50Qi5mcmljdGlvbik7XG4gICAgICAgIHBhaXIuZnJpY3Rpb25TdGF0aWMgPSBNYXRoLm1heChwYXJlbnRBLmZyaWN0aW9uU3RhdGljLCBwYXJlbnRCLmZyaWN0aW9uU3RhdGljKTtcbiAgICAgICAgcGFpci5yZXN0aXR1dGlvbiA9IE1hdGgubWF4KHBhcmVudEEucmVzdGl0dXRpb24sIHBhcmVudEIucmVzdGl0dXRpb24pO1xuICAgICAgICBwYWlyLnNsb3AgPSBNYXRoLm1heChwYXJlbnRBLnNsb3AsIHBhcmVudEIuc2xvcCk7XG4gICAgICAgIGFjdGl2ZUNvbnRhY3RzLmxlbmd0aCA9IDA7XG4gICAgICAgIFxuICAgICAgICBpZiAoY29sbGlzaW9uLmNvbGxpZGVkKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1cHBvcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1cHBvcnQgPSBzdXBwb3J0c1tpXSxcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdElkID0gQ29udGFjdC5pZChzdXBwb3J0KSxcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdCA9IGNvbnRhY3RzW2NvbnRhY3RJZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoY29udGFjdCkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVDb250YWN0cy5wdXNoKGNvbnRhY3QpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUNvbnRhY3RzLnB1c2goY29udGFjdHNbY29udGFjdElkXSA9IENvbnRhY3QuY3JlYXRlKHN1cHBvcnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhaXIuc2VwYXJhdGlvbiA9IGNvbGxpc2lvbi5kZXB0aDtcbiAgICAgICAgICAgIFBhaXIuc2V0QWN0aXZlKHBhaXIsIHRydWUsIHRpbWVzdGFtcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocGFpci5pc0FjdGl2ZSA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICBQYWlyLnNldEFjdGl2ZShwYWlyLCBmYWxzZSwgdGltZXN0YW1wKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGEgcGFpciBhcyBhY3RpdmUgb3IgaW5hY3RpdmUuXG4gICAgICogQG1ldGhvZCBzZXRBY3RpdmVcbiAgICAgKiBAcGFyYW0ge3BhaXJ9IHBhaXJcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IGlzQWN0aXZlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcFxuICAgICAqL1xuICAgIFBhaXIuc2V0QWN0aXZlID0gZnVuY3Rpb24ocGFpciwgaXNBY3RpdmUsIHRpbWVzdGFtcCkge1xuICAgICAgICBpZiAoaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHBhaXIuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgcGFpci50aW1lVXBkYXRlZCA9IHRpbWVzdGFtcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHBhaXIuYWN0aXZlQ29udGFjdHMubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGlkIGZvciB0aGUgZ2l2ZW4gcGFpci5cbiAgICAgKiBAbWV0aG9kIGlkXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5QVxuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keUJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFVuaXF1ZSBwYWlySWRcbiAgICAgKi9cbiAgICBQYWlyLmlkID0gZnVuY3Rpb24oYm9keUEsIGJvZHlCKSB7XG4gICAgICAgIGlmIChib2R5QS5pZCA8IGJvZHlCLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYm9keUEuaWQgKyAnXycgKyBib2R5Qi5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBib2R5Qi5pZCArICdfJyArIGJvZHlBLmlkO1xuICAgICAgICB9XG4gICAgfTtcblxufSkoKTtcblxufSx7XCIuL0NvbnRhY3RcIjo0fV0sODpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuUGFpcnNgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIGNvbGxpc2lvbiBwYWlyIHNldHMuXG4qXG4qIEBjbGFzcyBQYWlyc1xuKi9cblxudmFyIFBhaXJzID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gUGFpcnM7XG5cbnZhciBQYWlyID0gX2RlcmVxXygnLi9QYWlyJyk7XG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcblxuKGZ1bmN0aW9uKCkge1xuICAgIFxuICAgIHZhciBfcGFpck1heElkbGVMaWZlID0gMTAwMDtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcGFpcnMgc3RydWN0dXJlLlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtwYWlyc30gQSBuZXcgcGFpcnMgc3RydWN0dXJlXG4gICAgICovXG4gICAgUGFpcnMuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gQ29tbW9uLmV4dGVuZCh7IFxuICAgICAgICAgICAgdGFibGU6IHt9LFxuICAgICAgICAgICAgbGlzdDogW10sXG4gICAgICAgICAgICBjb2xsaXNpb25TdGFydDogW10sXG4gICAgICAgICAgICBjb2xsaXNpb25BY3RpdmU6IFtdLFxuICAgICAgICAgICAgY29sbGlzaW9uRW5kOiBbXVxuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBwYWlycyBnaXZlbiBhIGxpc3Qgb2YgY29sbGlzaW9ucy5cbiAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYWlyc1xuICAgICAqIEBwYXJhbSB7Y29sbGlzaW9uW119IGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wXG4gICAgICovXG4gICAgUGFpcnMudXBkYXRlID0gZnVuY3Rpb24ocGFpcnMsIGNvbGxpc2lvbnMsIHRpbWVzdGFtcCkge1xuICAgICAgICB2YXIgcGFpcnNMaXN0ID0gcGFpcnMubGlzdCxcbiAgICAgICAgICAgIHBhaXJzVGFibGUgPSBwYWlycy50YWJsZSxcbiAgICAgICAgICAgIGNvbGxpc2lvblN0YXJ0ID0gcGFpcnMuY29sbGlzaW9uU3RhcnQsXG4gICAgICAgICAgICBjb2xsaXNpb25FbmQgPSBwYWlycy5jb2xsaXNpb25FbmQsXG4gICAgICAgICAgICBjb2xsaXNpb25BY3RpdmUgPSBwYWlycy5jb2xsaXNpb25BY3RpdmUsXG4gICAgICAgICAgICBhY3RpdmVQYWlySWRzID0gW10sXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBwYWlySWQsXG4gICAgICAgICAgICBwYWlyLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICAvLyBjbGVhciBjb2xsaXNpb24gc3RhdGUgYXJyYXlzLCBidXQgbWFpbnRhaW4gb2xkIHJlZmVyZW5jZVxuICAgICAgICBjb2xsaXNpb25TdGFydC5sZW5ndGggPSAwO1xuICAgICAgICBjb2xsaXNpb25FbmQubGVuZ3RoID0gMDtcbiAgICAgICAgY29sbGlzaW9uQWN0aXZlLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbGxpc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IGNvbGxpc2lvbnNbaV07XG5cbiAgICAgICAgICAgIGlmIChjb2xsaXNpb24uY29sbGlkZWQpIHtcbiAgICAgICAgICAgICAgICBwYWlySWQgPSBQYWlyLmlkKGNvbGxpc2lvbi5ib2R5QSwgY29sbGlzaW9uLmJvZHlCKTtcbiAgICAgICAgICAgICAgICBhY3RpdmVQYWlySWRzLnB1c2gocGFpcklkKTtcblxuICAgICAgICAgICAgICAgIHBhaXIgPSBwYWlyc1RhYmxlW3BhaXJJZF07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHBhaXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFpciBhbHJlYWR5IGV4aXN0cyAoYnV0IG1heSBvciBtYXkgbm90IGJlIGFjdGl2ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhaXIuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBhaXIgZXhpc3RzIGFuZCBpcyBhY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbkFjdGl2ZS5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGFpciBleGlzdHMgYnV0IHdhcyBpbmFjdGl2ZSwgc28gYSBjb2xsaXNpb24gaGFzIGp1c3Qgc3RhcnRlZCBhZ2FpblxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uU3RhcnQucHVzaChwYWlyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcGFpclxuICAgICAgICAgICAgICAgICAgICBQYWlyLnVwZGF0ZShwYWlyLCBjb2xsaXNpb24sIHRpbWVzdGFtcCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFpciBkaWQgbm90IGV4aXN0LCBjcmVhdGUgYSBuZXcgcGFpclxuICAgICAgICAgICAgICAgICAgICBwYWlyID0gUGFpci5jcmVhdGUoY29sbGlzaW9uLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICAgICAgICBwYWlyc1RhYmxlW3BhaXJJZF0gPSBwYWlyO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHB1c2ggdGhlIG5ldyBwYWlyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvblN0YXJ0LnB1c2gocGFpcik7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzTGlzdC5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRlYWN0aXZhdGUgcHJldmlvdXNseSBhY3RpdmUgcGFpcnMgdGhhdCBhcmUgbm93IGluYWN0aXZlXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYWlyc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhaXIgPSBwYWlyc0xpc3RbaV07XG4gICAgICAgICAgICBpZiAocGFpci5pc0FjdGl2ZSAmJiBDb21tb24uaW5kZXhPZihhY3RpdmVQYWlySWRzLCBwYWlyLmlkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBQYWlyLnNldEFjdGl2ZShwYWlyLCBmYWxzZSwgdGltZXN0YW1wKTtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb25FbmQucHVzaChwYWlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRmluZHMgYW5kIHJlbW92ZXMgcGFpcnMgdGhhdCBoYXZlIGJlZW4gaW5hY3RpdmUgZm9yIGEgc2V0IGFtb3VudCBvZiB0aW1lLlxuICAgICAqIEBtZXRob2QgcmVtb3ZlT2xkXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhaXJzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcFxuICAgICAqL1xuICAgIFBhaXJzLnJlbW92ZU9sZCA9IGZ1bmN0aW9uKHBhaXJzLCB0aW1lc3RhbXApIHtcbiAgICAgICAgdmFyIHBhaXJzTGlzdCA9IHBhaXJzLmxpc3QsXG4gICAgICAgICAgICBwYWlyc1RhYmxlID0gcGFpcnMudGFibGUsXG4gICAgICAgICAgICBpbmRleGVzVG9SZW1vdmUgPSBbXSxcbiAgICAgICAgICAgIHBhaXIsXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBwYWlySW5kZXgsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYWlyc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhaXIgPSBwYWlyc0xpc3RbaV07XG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gbmV2ZXIgcmVtb3ZlIHNsZWVwaW5nIHBhaXJzXG4gICAgICAgICAgICBpZiAoY29sbGlzaW9uLmJvZHlBLmlzU2xlZXBpbmcgfHwgY29sbGlzaW9uLmJvZHlCLmlzU2xlZXBpbmcpIHtcbiAgICAgICAgICAgICAgICBwYWlyLnRpbWVVcGRhdGVkID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBwYWlyIGlzIGluYWN0aXZlIGZvciB0b28gbG9uZywgbWFyayBpdCB0byBiZSByZW1vdmVkXG4gICAgICAgICAgICBpZiAodGltZXN0YW1wIC0gcGFpci50aW1lVXBkYXRlZCA+IF9wYWlyTWF4SWRsZUxpZmUpIHtcbiAgICAgICAgICAgICAgICBpbmRleGVzVG9SZW1vdmUucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBtYXJrZWQgcGFpcnNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZGV4ZXNUb1JlbW92ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFpckluZGV4ID0gaW5kZXhlc1RvUmVtb3ZlW2ldIC0gaTtcbiAgICAgICAgICAgIHBhaXIgPSBwYWlyc0xpc3RbcGFpckluZGV4XTtcbiAgICAgICAgICAgIGRlbGV0ZSBwYWlyc1RhYmxlW3BhaXIuaWRdO1xuICAgICAgICAgICAgcGFpcnNMaXN0LnNwbGljZShwYWlySW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENsZWFycyB0aGUgZ2l2ZW4gcGFpcnMgc3RydWN0dXJlLlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcGFyYW0ge3BhaXJzfSBwYWlyc1xuICAgICAqIEByZXR1cm4ge3BhaXJzfSBwYWlyc1xuICAgICAqL1xuICAgIFBhaXJzLmNsZWFyID0gZnVuY3Rpb24ocGFpcnMpIHtcbiAgICAgICAgcGFpcnMudGFibGUgPSB7fTtcbiAgICAgICAgcGFpcnMubGlzdC5sZW5ndGggPSAwO1xuICAgICAgICBwYWlycy5jb2xsaXNpb25TdGFydC5sZW5ndGggPSAwO1xuICAgICAgICBwYWlycy5jb2xsaXNpb25BY3RpdmUubGVuZ3RoID0gMDtcbiAgICAgICAgcGFpcnMuY29sbGlzaW9uRW5kLmxlbmd0aCA9IDA7XG4gICAgICAgIHJldHVybiBwYWlycztcbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4uL2NvcmUvQ29tbW9uXCI6MTQsXCIuL1BhaXJcIjo3fV0sOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuUXVlcnlgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBwZXJmb3JtaW5nIGNvbGxpc2lvbiBxdWVyaWVzLlxuKlxuKiBTZWUgdGhlIGluY2x1ZGVkIHVzYWdlIFtleGFtcGxlc10oaHR0cHM6Ly9naXRodWIuY29tL2xpYWJydS9tYXR0ZXItanMvdHJlZS9tYXN0ZXIvZXhhbXBsZXMpLlxuKlxuKiBAY2xhc3MgUXVlcnlcbiovXG5cbnZhciBRdWVyeSA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5O1xuXG52YXIgVmVjdG9yID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVjdG9yJyk7XG52YXIgU0FUID0gX2RlcmVxXygnLi9TQVQnKTtcbnZhciBCb3VuZHMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9Cb3VuZHMnKTtcbnZhciBCb2RpZXMgPSBfZGVyZXFfKCcuLi9mYWN0b3J5L0JvZGllcycpO1xudmFyIFZlcnRpY2VzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVydGljZXMnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogQ2FzdHMgYSByYXkgc2VnbWVudCBhZ2FpbnN0IGEgc2V0IG9mIGJvZGllcyBhbmQgcmV0dXJucyBhbGwgY29sbGlzaW9ucywgcmF5IHdpZHRoIGlzIG9wdGlvbmFsLiBJbnRlcnNlY3Rpb24gcG9pbnRzIGFyZSBub3QgcHJvdmlkZWQuXG4gICAgICogQG1ldGhvZCByYXlcbiAgICAgKiBAcGFyYW0ge2JvZHlbXX0gYm9kaWVzXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHN0YXJ0UG9pbnRcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gZW5kUG9pbnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3JheVdpZHRoXVxuICAgICAqIEByZXR1cm4ge29iamVjdFtdfSBDb2xsaXNpb25zXG4gICAgICovXG4gICAgUXVlcnkucmF5ID0gZnVuY3Rpb24oYm9kaWVzLCBzdGFydFBvaW50LCBlbmRQb2ludCwgcmF5V2lkdGgpIHtcbiAgICAgICAgcmF5V2lkdGggPSByYXlXaWR0aCB8fCAxZS0xMDA7XG5cbiAgICAgICAgdmFyIHJheUFuZ2xlID0gVmVjdG9yLmFuZ2xlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KSxcbiAgICAgICAgICAgIHJheUxlbmd0aCA9IFZlY3Rvci5tYWduaXR1ZGUoVmVjdG9yLnN1YihzdGFydFBvaW50LCBlbmRQb2ludCkpLFxuICAgICAgICAgICAgcmF5WCA9IChlbmRQb2ludC54ICsgc3RhcnRQb2ludC54KSAqIDAuNSxcbiAgICAgICAgICAgIHJheVkgPSAoZW5kUG9pbnQueSArIHN0YXJ0UG9pbnQueSkgKiAwLjUsXG4gICAgICAgICAgICByYXkgPSBCb2RpZXMucmVjdGFuZ2xlKHJheVgsIHJheVksIHJheUxlbmd0aCwgcmF5V2lkdGgsIHsgYW5nbGU6IHJheUFuZ2xlIH0pLFxuICAgICAgICAgICAgY29sbGlzaW9ucyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keUEgPSBib2RpZXNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChCb3VuZHMub3ZlcmxhcHMoYm9keUEuYm91bmRzLCByYXkuYm91bmRzKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBib2R5QS5wYXJ0cy5sZW5ndGggPT09IDEgPyAwIDogMTsgaiA8IGJvZHlBLnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keUEucGFydHNbal07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKEJvdW5kcy5vdmVybGFwcyhwYXJ0LmJvdW5kcywgcmF5LmJvdW5kcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xsaXNpb24gPSBTQVQuY29sbGlkZXMocGFydCwgcmF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2xsaXNpb24uY29sbGlkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb24uYm9keSA9IGNvbGxpc2lvbi5ib2R5QSA9IGNvbGxpc2lvbi5ib2R5QiA9IGJvZHlBO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaChjb2xsaXNpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGJvZGllcyB3aG9zZSBib3VuZHMgYXJlIGluc2lkZSAob3Igb3V0c2lkZSBpZiBzZXQpIHRoZSBnaXZlbiBzZXQgb2YgYm91bmRzLCBmcm9tIHRoZSBnaXZlbiBzZXQgb2YgYm9kaWVzLlxuICAgICAqIEBtZXRob2QgcmVnaW9uXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7Ym91bmRzfSBib3VuZHNcbiAgICAgKiBAcGFyYW0ge2Jvb2x9IFtvdXRzaWRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge2JvZHlbXX0gVGhlIGJvZGllcyBtYXRjaGluZyB0aGUgcXVlcnlcbiAgICAgKi9cbiAgICBRdWVyeS5yZWdpb24gPSBmdW5jdGlvbihib2RpZXMsIGJvdW5kcywgb3V0c2lkZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldLFxuICAgICAgICAgICAgICAgIG92ZXJsYXBzID0gQm91bmRzLm92ZXJsYXBzKGJvZHkuYm91bmRzLCBib3VuZHMpO1xuICAgICAgICAgICAgaWYgKChvdmVybGFwcyAmJiAhb3V0c2lkZSkgfHwgKCFvdmVybGFwcyAmJiBvdXRzaWRlKSlcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChib2R5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGJvZGllcyB3aG9zZSB2ZXJ0aWNlcyBjb250YWluIHRoZSBnaXZlbiBwb2ludCwgZnJvbSB0aGUgZ2l2ZW4gc2V0IG9mIGJvZGllcy5cbiAgICAgKiBAbWV0aG9kIHBvaW50XG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqIEByZXR1cm4ge2JvZHlbXX0gVGhlIGJvZGllcyBtYXRjaGluZyB0aGUgcXVlcnlcbiAgICAgKi9cbiAgICBRdWVyeS5wb2ludCA9IGZ1bmN0aW9uKGJvZGllcywgcG9pbnQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKEJvdW5kcy5jb250YWlucyhib2R5LmJvdW5kcywgcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGJvZHkucGFydHMubGVuZ3RoID09PSAxID8gMCA6IDE7IGogPCBib2R5LnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keS5wYXJ0c1tqXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoQm91bmRzLmNvbnRhaW5zKHBhcnQuYm91bmRzLCBwb2ludClcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIFZlcnRpY2VzLmNvbnRhaW5zKHBhcnQudmVydGljZXMsIHBvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYm9keSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxufSkoKTtcblxufSx7XCIuLi9mYWN0b3J5L0JvZGllc1wiOjIzLFwiLi4vZ2VvbWV0cnkvQm91bmRzXCI6MjYsXCIuLi9nZW9tZXRyeS9WZWN0b3JcIjoyOCxcIi4uL2dlb21ldHJ5L1ZlcnRpY2VzXCI6MjksXCIuL1NBVFwiOjExfV0sMTA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLlJlc29sdmVyYCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyBmb3IgcmVzb2x2aW5nIGNvbGxpc2lvbiBwYWlycy5cbipcbiogQGNsYXNzIFJlc29sdmVyXG4qL1xuXG52YXIgUmVzb2x2ZXIgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNvbHZlcjtcblxudmFyIFZlcnRpY2VzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVydGljZXMnKTtcbnZhciBWZWN0b3IgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9WZWN0b3InKTtcbnZhciBDb21tb24gPSBfZGVyZXFfKCcuLi9jb3JlL0NvbW1vbicpO1xudmFyIEJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICBSZXNvbHZlci5fcmVzdGluZ1RocmVzaCA9IDQ7XG4gICAgUmVzb2x2ZXIuX3Jlc3RpbmdUaHJlc2hUYW5nZW50ID0gNjtcbiAgICBSZXNvbHZlci5fcG9zaXRpb25EYW1wZW4gPSAwLjk7XG4gICAgUmVzb2x2ZXIuX3Bvc2l0aW9uV2FybWluZyA9IDAuODtcbiAgICBSZXNvbHZlci5fZnJpY3Rpb25Ob3JtYWxNdWx0aXBsaWVyID0gNTtcblxuICAgIC8qKlxuICAgICAqIFByZXBhcmUgcGFpcnMgZm9yIHBvc2l0aW9uIHNvbHZpbmcuXG4gICAgICogQG1ldGhvZCBwcmVTb2x2ZVBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtwYWlyW119IHBhaXJzXG4gICAgICovXG4gICAgUmVzb2x2ZXIucHJlU29sdmVQb3NpdGlvbiA9IGZ1bmN0aW9uKHBhaXJzKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgcGFpcixcbiAgICAgICAgICAgIGFjdGl2ZUNvdW50O1xuXG4gICAgICAgIC8vIGZpbmQgdG90YWwgY29udGFjdHMgb24gZWFjaCBib2R5XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFpciA9IHBhaXJzW2ldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXBhaXIuaXNBY3RpdmUpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFjdGl2ZUNvdW50ID0gcGFpci5hY3RpdmVDb250YWN0cy5sZW5ndGg7XG4gICAgICAgICAgICBwYWlyLmNvbGxpc2lvbi5wYXJlbnRBLnRvdGFsQ29udGFjdHMgKz0gYWN0aXZlQ291bnQ7XG4gICAgICAgICAgICBwYWlyLmNvbGxpc2lvbi5wYXJlbnRCLnRvdGFsQ29udGFjdHMgKz0gYWN0aXZlQ291bnQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluZCBhIHNvbHV0aW9uIGZvciBwYWlyIHBvc2l0aW9ucy5cbiAgICAgKiBAbWV0aG9kIHNvbHZlUG9zaXRpb25cbiAgICAgKiBAcGFyYW0ge3BhaXJbXX0gcGFpcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVNjYWxlXG4gICAgICovXG4gICAgUmVzb2x2ZXIuc29sdmVQb3NpdGlvbiA9IGZ1bmN0aW9uKHBhaXJzLCB0aW1lU2NhbGUpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBwYWlyLFxuICAgICAgICAgICAgY29sbGlzaW9uLFxuICAgICAgICAgICAgYm9keUEsXG4gICAgICAgICAgICBib2R5QixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIGJvZHlCdG9BLFxuICAgICAgICAgICAgY29udGFjdFNoYXJlLFxuICAgICAgICAgICAgcG9zaXRpb25JbXB1bHNlLFxuICAgICAgICAgICAgY29udGFjdENvdW50ID0ge30sXG4gICAgICAgICAgICB0ZW1wQSA9IFZlY3Rvci5fdGVtcFswXSxcbiAgICAgICAgICAgIHRlbXBCID0gVmVjdG9yLl90ZW1wWzFdLFxuICAgICAgICAgICAgdGVtcEMgPSBWZWN0b3IuX3RlbXBbMl0sXG4gICAgICAgICAgICB0ZW1wRCA9IFZlY3Rvci5fdGVtcFszXTtcblxuICAgICAgICAvLyBmaW5kIGltcHVsc2VzIHJlcXVpcmVkIHRvIHJlc29sdmUgcGVuZXRyYXRpb25cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghcGFpci5pc0FjdGl2ZSB8fCBwYWlyLmlzU2Vuc29yKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcbiAgICAgICAgICAgIGJvZHlBID0gY29sbGlzaW9uLnBhcmVudEE7XG4gICAgICAgICAgICBib2R5QiA9IGNvbGxpc2lvbi5wYXJlbnRCO1xuICAgICAgICAgICAgbm9ybWFsID0gY29sbGlzaW9uLm5vcm1hbDtcblxuICAgICAgICAgICAgLy8gZ2V0IGN1cnJlbnQgc2VwYXJhdGlvbiBiZXR3ZWVuIGJvZHkgZWRnZXMgaW52b2x2ZWQgaW4gY29sbGlzaW9uXG4gICAgICAgICAgICBib2R5QnRvQSA9IFZlY3Rvci5zdWIoVmVjdG9yLmFkZChib2R5Qi5wb3NpdGlvbkltcHVsc2UsIGJvZHlCLnBvc2l0aW9uLCB0ZW1wQSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVjdG9yLmFkZChib2R5QS5wb3NpdGlvbkltcHVsc2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlY3Rvci5zdWIoYm9keUIucG9zaXRpb24sIGNvbGxpc2lvbi5wZW5ldHJhdGlvbiwgdGVtcEIpLCB0ZW1wQyksIHRlbXBEKTtcblxuICAgICAgICAgICAgcGFpci5zZXBhcmF0aW9uID0gVmVjdG9yLmRvdChub3JtYWwsIGJvZHlCdG9BKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWlyID0gcGFpcnNbaV07XG5cbiAgICAgICAgICAgIGlmICghcGFpci5pc0FjdGl2ZSB8fCBwYWlyLmlzU2Vuc29yIHx8IHBhaXIuc2VwYXJhdGlvbiA8IDApXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbGxpc2lvbiA9IHBhaXIuY29sbGlzaW9uO1xuICAgICAgICAgICAgYm9keUEgPSBjb2xsaXNpb24ucGFyZW50QTtcbiAgICAgICAgICAgIGJvZHlCID0gY29sbGlzaW9uLnBhcmVudEI7XG4gICAgICAgICAgICBub3JtYWwgPSBjb2xsaXNpb24ubm9ybWFsO1xuICAgICAgICAgICAgcG9zaXRpb25JbXB1bHNlID0gKHBhaXIuc2VwYXJhdGlvbiAtIHBhaXIuc2xvcCkgKiB0aW1lU2NhbGU7XG5cbiAgICAgICAgICAgIGlmIChib2R5QS5pc1N0YXRpYyB8fCBib2R5Qi5pc1N0YXRpYylcbiAgICAgICAgICAgICAgICBwb3NpdGlvbkltcHVsc2UgKj0gMjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCEoYm9keUEuaXNTdGF0aWMgfHwgYm9keUEuaXNTbGVlcGluZykpIHtcbiAgICAgICAgICAgICAgICBjb250YWN0U2hhcmUgPSBSZXNvbHZlci5fcG9zaXRpb25EYW1wZW4gLyBib2R5QS50b3RhbENvbnRhY3RzO1xuICAgICAgICAgICAgICAgIGJvZHlBLnBvc2l0aW9uSW1wdWxzZS54ICs9IG5vcm1hbC54ICogcG9zaXRpb25JbXB1bHNlICogY29udGFjdFNoYXJlO1xuICAgICAgICAgICAgICAgIGJvZHlBLnBvc2l0aW9uSW1wdWxzZS55ICs9IG5vcm1hbC55ICogcG9zaXRpb25JbXB1bHNlICogY29udGFjdFNoYXJlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIShib2R5Qi5pc1N0YXRpYyB8fCBib2R5Qi5pc1NsZWVwaW5nKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhY3RTaGFyZSA9IFJlc29sdmVyLl9wb3NpdGlvbkRhbXBlbiAvIGJvZHlCLnRvdGFsQ29udGFjdHM7XG4gICAgICAgICAgICAgICAgYm9keUIucG9zaXRpb25JbXB1bHNlLnggLT0gbm9ybWFsLnggKiBwb3NpdGlvbkltcHVsc2UgKiBjb250YWN0U2hhcmU7XG4gICAgICAgICAgICAgICAgYm9keUIucG9zaXRpb25JbXB1bHNlLnkgLT0gbm9ybWFsLnkgKiBwb3NpdGlvbkltcHVsc2UgKiBjb250YWN0U2hhcmU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbHkgcG9zaXRpb24gcmVzb2x1dGlvbi5cbiAgICAgKiBAbWV0aG9kIHBvc3RTb2x2ZVBvc2l0aW9uXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqL1xuICAgIFJlc29sdmVyLnBvc3RTb2x2ZVBvc2l0aW9uID0gZnVuY3Rpb24oYm9kaWVzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgY29udGFjdCBjb3VudFxuICAgICAgICAgICAgYm9keS50b3RhbENvbnRhY3RzID0gMDtcblxuICAgICAgICAgICAgaWYgKGJvZHkucG9zaXRpb25JbXB1bHNlLnggIT09IDAgfHwgYm9keS5wb3NpdGlvbkltcHVsc2UueSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBib2R5IGdlb21ldHJ5XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBib2R5LnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keS5wYXJ0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgVmVydGljZXMudHJhbnNsYXRlKHBhcnQudmVydGljZXMsIGJvZHkucG9zaXRpb25JbXB1bHNlKTtcbiAgICAgICAgICAgICAgICAgICAgQm91bmRzLnVwZGF0ZShwYXJ0LmJvdW5kcywgcGFydC52ZXJ0aWNlcywgYm9keS52ZWxvY2l0eSk7XG4gICAgICAgICAgICAgICAgICAgIHBhcnQucG9zaXRpb24ueCArPSBib2R5LnBvc2l0aW9uSW1wdWxzZS54O1xuICAgICAgICAgICAgICAgICAgICBwYXJ0LnBvc2l0aW9uLnkgKz0gYm9keS5wb3NpdGlvbkltcHVsc2UueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBtb3ZlIHRoZSBib2R5IHdpdGhvdXQgY2hhbmdpbmcgdmVsb2NpdHlcbiAgICAgICAgICAgICAgICBib2R5LnBvc2l0aW9uUHJldi54ICs9IGJvZHkucG9zaXRpb25JbXB1bHNlLng7XG4gICAgICAgICAgICAgICAgYm9keS5wb3NpdGlvblByZXYueSArPSBib2R5LnBvc2l0aW9uSW1wdWxzZS55O1xuXG4gICAgICAgICAgICAgICAgaWYgKFZlY3Rvci5kb3QoYm9keS5wb3NpdGlvbkltcHVsc2UsIGJvZHkudmVsb2NpdHkpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXNldCBjYWNoZWQgaW1wdWxzZSBpZiB0aGUgYm9keSBoYXMgdmVsb2NpdHkgYWxvbmcgaXRcbiAgICAgICAgICAgICAgICAgICAgYm9keS5wb3NpdGlvbkltcHVsc2UueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkucG9zaXRpb25JbXB1bHNlLnkgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdhcm0gdGhlIG5leHQgaXRlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIGJvZHkucG9zaXRpb25JbXB1bHNlLnggKj0gUmVzb2x2ZXIuX3Bvc2l0aW9uV2FybWluZztcbiAgICAgICAgICAgICAgICAgICAgYm9keS5wb3NpdGlvbkltcHVsc2UueSAqPSBSZXNvbHZlci5fcG9zaXRpb25XYXJtaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQcmVwYXJlIHBhaXJzIGZvciB2ZWxvY2l0eSBzb2x2aW5nLlxuICAgICAqIEBtZXRob2QgcHJlU29sdmVWZWxvY2l0eVxuICAgICAqIEBwYXJhbSB7cGFpcltdfSBwYWlyc1xuICAgICAqL1xuICAgIFJlc29sdmVyLnByZVNvbHZlVmVsb2NpdHkgPSBmdW5jdGlvbihwYWlycykge1xuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBwYWlyLFxuICAgICAgICAgICAgY29udGFjdHMsXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBib2R5QSxcbiAgICAgICAgICAgIGJvZHlCLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdGFuZ2VudCxcbiAgICAgICAgICAgIGNvbnRhY3QsXG4gICAgICAgICAgICBjb250YWN0VmVydGV4LFxuICAgICAgICAgICAgbm9ybWFsSW1wdWxzZSxcbiAgICAgICAgICAgIHRhbmdlbnRJbXB1bHNlLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgaW1wdWxzZSA9IFZlY3Rvci5fdGVtcFswXSxcbiAgICAgICAgICAgIHRlbXBBID0gVmVjdG9yLl90ZW1wWzFdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghcGFpci5pc0FjdGl2ZSB8fCBwYWlyLmlzU2Vuc29yKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb250YWN0cyA9IHBhaXIuYWN0aXZlQ29udGFjdHM7XG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcbiAgICAgICAgICAgIGJvZHlBID0gY29sbGlzaW9uLnBhcmVudEE7XG4gICAgICAgICAgICBib2R5QiA9IGNvbGxpc2lvbi5wYXJlbnRCO1xuICAgICAgICAgICAgbm9ybWFsID0gY29sbGlzaW9uLm5vcm1hbDtcbiAgICAgICAgICAgIHRhbmdlbnQgPSBjb2xsaXNpb24udGFuZ2VudDtcblxuICAgICAgICAgICAgLy8gcmVzb2x2ZSBlYWNoIGNvbnRhY3RcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb250YWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnRhY3QgPSBjb250YWN0c1tqXTtcbiAgICAgICAgICAgICAgICBjb250YWN0VmVydGV4ID0gY29udGFjdC52ZXJ0ZXg7XG4gICAgICAgICAgICAgICAgbm9ybWFsSW1wdWxzZSA9IGNvbnRhY3Qubm9ybWFsSW1wdWxzZTtcbiAgICAgICAgICAgICAgICB0YW5nZW50SW1wdWxzZSA9IGNvbnRhY3QudGFuZ2VudEltcHVsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsSW1wdWxzZSAhPT0gMCB8fCB0YW5nZW50SW1wdWxzZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0b3RhbCBpbXB1bHNlIGZyb20gY29udGFjdFxuICAgICAgICAgICAgICAgICAgICBpbXB1bHNlLnggPSAobm9ybWFsLnggKiBub3JtYWxJbXB1bHNlKSArICh0YW5nZW50LnggKiB0YW5nZW50SW1wdWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGltcHVsc2UueSA9IChub3JtYWwueSAqIG5vcm1hbEltcHVsc2UpICsgKHRhbmdlbnQueSAqIHRhbmdlbnRJbXB1bHNlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGFwcGx5IGltcHVsc2UgZnJvbSBjb250YWN0XG4gICAgICAgICAgICAgICAgICAgIGlmICghKGJvZHlBLmlzU3RhdGljIHx8IGJvZHlBLmlzU2xlZXBpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBWZWN0b3Iuc3ViKGNvbnRhY3RWZXJ0ZXgsIGJvZHlBLnBvc2l0aW9uLCB0ZW1wQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5QS5wb3NpdGlvblByZXYueCArPSBpbXB1bHNlLnggKiBib2R5QS5pbnZlcnNlTWFzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlBLnBvc2l0aW9uUHJldi55ICs9IGltcHVsc2UueSAqIGJvZHlBLmludmVyc2VNYXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keUEuYW5nbGVQcmV2ICs9IFZlY3Rvci5jcm9zcyhvZmZzZXQsIGltcHVsc2UpICogYm9keUEuaW52ZXJzZUluZXJ0aWE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIShib2R5Qi5pc1N0YXRpYyB8fCBib2R5Qi5pc1NsZWVwaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gVmVjdG9yLnN1Yihjb250YWN0VmVydGV4LCBib2R5Qi5wb3NpdGlvbiwgdGVtcEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keUIucG9zaXRpb25QcmV2LnggLT0gaW1wdWxzZS54ICogYm9keUIuaW52ZXJzZU1hc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5Qi5wb3NpdGlvblByZXYueSAtPSBpbXB1bHNlLnkgKiBib2R5Qi5pbnZlcnNlTWFzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlCLmFuZ2xlUHJldiAtPSBWZWN0b3IuY3Jvc3Mob2Zmc2V0LCBpbXB1bHNlKSAqIGJvZHlCLmludmVyc2VJbmVydGlhO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgYSBzb2x1dGlvbiBmb3IgcGFpciB2ZWxvY2l0aWVzLlxuICAgICAqIEBtZXRob2Qgc29sdmVWZWxvY2l0eVxuICAgICAqIEBwYXJhbSB7cGFpcltdfSBwYWlyc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lU2NhbGVcbiAgICAgKi9cbiAgICBSZXNvbHZlci5zb2x2ZVZlbG9jaXR5ID0gZnVuY3Rpb24ocGFpcnMsIHRpbWVTY2FsZSkge1xuICAgICAgICB2YXIgdGltZVNjYWxlU3F1YXJlZCA9IHRpbWVTY2FsZSAqIHRpbWVTY2FsZSxcbiAgICAgICAgICAgIGltcHVsc2UgPSBWZWN0b3IuX3RlbXBbMF0sXG4gICAgICAgICAgICB0ZW1wQSA9IFZlY3Rvci5fdGVtcFsxXSxcbiAgICAgICAgICAgIHRlbXBCID0gVmVjdG9yLl90ZW1wWzJdLFxuICAgICAgICAgICAgdGVtcEMgPSBWZWN0b3IuX3RlbXBbM10sXG4gICAgICAgICAgICB0ZW1wRCA9IFZlY3Rvci5fdGVtcFs0XSxcbiAgICAgICAgICAgIHRlbXBFID0gVmVjdG9yLl90ZW1wWzVdO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBhaXIgPSBwYWlyc1tpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCFwYWlyLmlzQWN0aXZlIHx8IHBhaXIuaXNTZW5zb3IpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbixcbiAgICAgICAgICAgICAgICBib2R5QSA9IGNvbGxpc2lvbi5wYXJlbnRBLFxuICAgICAgICAgICAgICAgIGJvZHlCID0gY29sbGlzaW9uLnBhcmVudEIsXG4gICAgICAgICAgICAgICAgbm9ybWFsID0gY29sbGlzaW9uLm5vcm1hbCxcbiAgICAgICAgICAgICAgICB0YW5nZW50ID0gY29sbGlzaW9uLnRhbmdlbnQsXG4gICAgICAgICAgICAgICAgY29udGFjdHMgPSBwYWlyLmFjdGl2ZUNvbnRhY3RzLFxuICAgICAgICAgICAgICAgIGNvbnRhY3RTaGFyZSA9IDEgLyBjb250YWN0cy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBib2R5IHZlbG9jaXRpZXNcbiAgICAgICAgICAgIGJvZHlBLnZlbG9jaXR5LnggPSBib2R5QS5wb3NpdGlvbi54IC0gYm9keUEucG9zaXRpb25QcmV2Lng7XG4gICAgICAgICAgICBib2R5QS52ZWxvY2l0eS55ID0gYm9keUEucG9zaXRpb24ueSAtIGJvZHlBLnBvc2l0aW9uUHJldi55O1xuICAgICAgICAgICAgYm9keUIudmVsb2NpdHkueCA9IGJvZHlCLnBvc2l0aW9uLnggLSBib2R5Qi5wb3NpdGlvblByZXYueDtcbiAgICAgICAgICAgIGJvZHlCLnZlbG9jaXR5LnkgPSBib2R5Qi5wb3NpdGlvbi55IC0gYm9keUIucG9zaXRpb25QcmV2Lnk7XG4gICAgICAgICAgICBib2R5QS5hbmd1bGFyVmVsb2NpdHkgPSBib2R5QS5hbmdsZSAtIGJvZHlBLmFuZ2xlUHJldjtcbiAgICAgICAgICAgIGJvZHlCLmFuZ3VsYXJWZWxvY2l0eSA9IGJvZHlCLmFuZ2xlIC0gYm9keUIuYW5nbGVQcmV2O1xuXG4gICAgICAgICAgICAvLyByZXNvbHZlIGVhY2ggY29udGFjdFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb250YWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBjb250YWN0ID0gY29udGFjdHNbal0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3RWZXJ0ZXggPSBjb250YWN0LnZlcnRleCxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0QSA9IFZlY3Rvci5zdWIoY29udGFjdFZlcnRleCwgYm9keUEucG9zaXRpb24sIHRlbXBBKSxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0QiA9IFZlY3Rvci5zdWIoY29udGFjdFZlcnRleCwgYm9keUIucG9zaXRpb24sIHRlbXBCKSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHlQb2ludEEgPSBWZWN0b3IuYWRkKGJvZHlBLnZlbG9jaXR5LCBWZWN0b3IubXVsdChWZWN0b3IucGVycChvZmZzZXRBKSwgYm9keUEuYW5ndWxhclZlbG9jaXR5KSwgdGVtcEMpLFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eVBvaW50QiA9IFZlY3Rvci5hZGQoYm9keUIudmVsb2NpdHksIFZlY3Rvci5tdWx0KFZlY3Rvci5wZXJwKG9mZnNldEIpLCBib2R5Qi5hbmd1bGFyVmVsb2NpdHkpLCB0ZW1wRCksIFxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZVZlbG9jaXR5ID0gVmVjdG9yLnN1Yih2ZWxvY2l0eVBvaW50QSwgdmVsb2NpdHlQb2ludEIsIHRlbXBFKSxcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsVmVsb2NpdHkgPSBWZWN0b3IuZG90KG5vcm1hbCwgcmVsYXRpdmVWZWxvY2l0eSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGFuZ2VudFZlbG9jaXR5ID0gVmVjdG9yLmRvdCh0YW5nZW50LCByZWxhdGl2ZVZlbG9jaXR5KSxcbiAgICAgICAgICAgICAgICAgICAgdGFuZ2VudFNwZWVkID0gTWF0aC5hYnModGFuZ2VudFZlbG9jaXR5KSxcbiAgICAgICAgICAgICAgICAgICAgdGFuZ2VudFZlbG9jaXR5RGlyZWN0aW9uID0gQ29tbW9uLnNpZ24odGFuZ2VudFZlbG9jaXR5KTtcblxuICAgICAgICAgICAgICAgIC8vIHJhdyBpbXB1bHNlc1xuICAgICAgICAgICAgICAgIHZhciBub3JtYWxJbXB1bHNlID0gKDEgKyBwYWlyLnJlc3RpdHV0aW9uKSAqIG5vcm1hbFZlbG9jaXR5LFxuICAgICAgICAgICAgICAgICAgICBub3JtYWxGb3JjZSA9IENvbW1vbi5jbGFtcChwYWlyLnNlcGFyYXRpb24gKyBub3JtYWxWZWxvY2l0eSwgMCwgMSkgKiBSZXNvbHZlci5fZnJpY3Rpb25Ob3JtYWxNdWx0aXBsaWVyO1xuXG4gICAgICAgICAgICAgICAgLy8gY291bG9tYiBmcmljdGlvblxuICAgICAgICAgICAgICAgIHZhciB0YW5nZW50SW1wdWxzZSA9IHRhbmdlbnRWZWxvY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgbWF4RnJpY3Rpb24gPSBJbmZpbml0eTtcblxuICAgICAgICAgICAgICAgIGlmICh0YW5nZW50U3BlZWQgPiBwYWlyLmZyaWN0aW9uICogcGFpci5mcmljdGlvblN0YXRpYyAqIG5vcm1hbEZvcmNlICogdGltZVNjYWxlU3F1YXJlZCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhGcmljdGlvbiA9IHRhbmdlbnRTcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgdGFuZ2VudEltcHVsc2UgPSBDb21tb24uY2xhbXAoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWlyLmZyaWN0aW9uICogdGFuZ2VudFZlbG9jaXR5RGlyZWN0aW9uICogdGltZVNjYWxlU3F1YXJlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC1tYXhGcmljdGlvbiwgbWF4RnJpY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBtb2RpZnkgaW1wdWxzZXMgYWNjb3VudGluZyBmb3IgbWFzcywgaW5lcnRpYSBhbmQgb2Zmc2V0XG4gICAgICAgICAgICAgICAgdmFyIG9BY04gPSBWZWN0b3IuY3Jvc3Mob2Zmc2V0QSwgbm9ybWFsKSxcbiAgICAgICAgICAgICAgICAgICAgb0JjTiA9IFZlY3Rvci5jcm9zcyhvZmZzZXRCLCBub3JtYWwpLFxuICAgICAgICAgICAgICAgICAgICBzaGFyZSA9IGNvbnRhY3RTaGFyZSAvIChib2R5QS5pbnZlcnNlTWFzcyArIGJvZHlCLmludmVyc2VNYXNzICsgYm9keUEuaW52ZXJzZUluZXJ0aWEgKiBvQWNOICogb0FjTiAgKyBib2R5Qi5pbnZlcnNlSW5lcnRpYSAqIG9CY04gKiBvQmNOKTtcblxuICAgICAgICAgICAgICAgIG5vcm1hbEltcHVsc2UgKj0gc2hhcmU7XG4gICAgICAgICAgICAgICAgdGFuZ2VudEltcHVsc2UgKj0gc2hhcmU7XG5cbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgaGlnaCB2ZWxvY2l0eSBhbmQgcmVzdGluZyBjb2xsaXNpb25zIHNlcGFyYXRlbHlcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsVmVsb2NpdHkgPCAwICYmIG5vcm1hbFZlbG9jaXR5ICogbm9ybWFsVmVsb2NpdHkgPiBSZXNvbHZlci5fcmVzdGluZ1RocmVzaCAqIHRpbWVTY2FsZVNxdWFyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGlnaCBub3JtYWwgdmVsb2NpdHkgc28gY2xlYXIgY2FjaGVkIGNvbnRhY3Qgbm9ybWFsIGltcHVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdC5ub3JtYWxJbXB1bHNlID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBzb2x2ZSByZXN0aW5nIGNvbGxpc2lvbiBjb25zdHJhaW50cyB1c2luZyBFcmluIENhdHRvJ3MgbWV0aG9kIChHREMwOClcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1wdWxzZSBjb25zdHJhaW50IHRlbmRzIHRvIDBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRhY3ROb3JtYWxJbXB1bHNlID0gY29udGFjdC5ub3JtYWxJbXB1bHNlO1xuICAgICAgICAgICAgICAgICAgICBjb250YWN0Lm5vcm1hbEltcHVsc2UgPSBNYXRoLm1pbihjb250YWN0Lm5vcm1hbEltcHVsc2UgKyBub3JtYWxJbXB1bHNlLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsSW1wdWxzZSA9IGNvbnRhY3Qubm9ybWFsSW1wdWxzZSAtIGNvbnRhY3ROb3JtYWxJbXB1bHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBoaWdoIHZlbG9jaXR5IGFuZCByZXN0aW5nIGNvbGxpc2lvbnMgc2VwYXJhdGVseVxuICAgICAgICAgICAgICAgIGlmICh0YW5nZW50VmVsb2NpdHkgKiB0YW5nZW50VmVsb2NpdHkgPiBSZXNvbHZlci5fcmVzdGluZ1RocmVzaFRhbmdlbnQgKiB0aW1lU2NhbGVTcXVhcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGhpZ2ggdGFuZ2VudCB2ZWxvY2l0eSBzbyBjbGVhciBjYWNoZWQgY29udGFjdCB0YW5nZW50IGltcHVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGFjdC50YW5nZW50SW1wdWxzZSA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc29sdmUgcmVzdGluZyBjb2xsaXNpb24gY29uc3RyYWludHMgdXNpbmcgRXJpbiBDYXR0bydzIG1ldGhvZCAoR0RDMDgpXG4gICAgICAgICAgICAgICAgICAgIC8vIHRhbmdlbnQgaW1wdWxzZSB0ZW5kcyB0byAtdGFuZ2VudFNwZWVkIG9yICt0YW5nZW50U3BlZWRcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRhY3RUYW5nZW50SW1wdWxzZSA9IGNvbnRhY3QudGFuZ2VudEltcHVsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhY3QudGFuZ2VudEltcHVsc2UgPSBDb21tb24uY2xhbXAoY29udGFjdC50YW5nZW50SW1wdWxzZSArIHRhbmdlbnRJbXB1bHNlLCAtbWF4RnJpY3Rpb24sIG1heEZyaWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGFuZ2VudEltcHVsc2UgPSBjb250YWN0LnRhbmdlbnRJbXB1bHNlIC0gY29udGFjdFRhbmdlbnRJbXB1bHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHRvdGFsIGltcHVsc2UgZnJvbSBjb250YWN0XG4gICAgICAgICAgICAgICAgaW1wdWxzZS54ID0gKG5vcm1hbC54ICogbm9ybWFsSW1wdWxzZSkgKyAodGFuZ2VudC54ICogdGFuZ2VudEltcHVsc2UpO1xuICAgICAgICAgICAgICAgIGltcHVsc2UueSA9IChub3JtYWwueSAqIG5vcm1hbEltcHVsc2UpICsgKHRhbmdlbnQueSAqIHRhbmdlbnRJbXB1bHNlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBhcHBseSBpbXB1bHNlIGZyb20gY29udGFjdFxuICAgICAgICAgICAgICAgIGlmICghKGJvZHlBLmlzU3RhdGljIHx8IGJvZHlBLmlzU2xlZXBpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHlBLnBvc2l0aW9uUHJldi54ICs9IGltcHVsc2UueCAqIGJvZHlBLmludmVyc2VNYXNzO1xuICAgICAgICAgICAgICAgICAgICBib2R5QS5wb3NpdGlvblByZXYueSArPSBpbXB1bHNlLnkgKiBib2R5QS5pbnZlcnNlTWFzcztcbiAgICAgICAgICAgICAgICAgICAgYm9keUEuYW5nbGVQcmV2ICs9IFZlY3Rvci5jcm9zcyhvZmZzZXRBLCBpbXB1bHNlKSAqIGJvZHlBLmludmVyc2VJbmVydGlhO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghKGJvZHlCLmlzU3RhdGljIHx8IGJvZHlCLmlzU2xlZXBpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHlCLnBvc2l0aW9uUHJldi54IC09IGltcHVsc2UueCAqIGJvZHlCLmludmVyc2VNYXNzO1xuICAgICAgICAgICAgICAgICAgICBib2R5Qi5wb3NpdGlvblByZXYueSAtPSBpbXB1bHNlLnkgKiBib2R5Qi5pbnZlcnNlTWFzcztcbiAgICAgICAgICAgICAgICAgICAgYm9keUIuYW5nbGVQcmV2IC09IFZlY3Rvci5jcm9zcyhvZmZzZXRCLCBpbXB1bHNlKSAqIGJvZHlCLmludmVyc2VJbmVydGlhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn0pKCk7XG5cbn0se1wiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2dlb21ldHJ5L0JvdW5kc1wiOjI2LFwiLi4vZ2VvbWV0cnkvVmVjdG9yXCI6MjgsXCIuLi9nZW9tZXRyeS9WZXJ0aWNlc1wiOjI5fV0sMTE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLlNBVGAgbW9kdWxlIGNvbnRhaW5zIG1ldGhvZHMgZm9yIGRldGVjdGluZyBjb2xsaXNpb25zIHVzaW5nIHRoZSBTZXBhcmF0aW5nIEF4aXMgVGhlb3JlbS5cbipcbiogQGNsYXNzIFNBVFxuKi9cblxuLy8gVE9ETzogdHJ1ZSBjaXJjbGVzIGFuZCBjdXJ2ZXNcblxudmFyIFNBVCA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNBVDtcblxudmFyIFZlcnRpY2VzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVydGljZXMnKTtcbnZhciBWZWN0b3IgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9WZWN0b3InKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGNvbGxpc2lvbiBiZXR3ZWVuIHR3byBib2RpZXMgdXNpbmcgdGhlIFNlcGFyYXRpbmcgQXhpcyBUaGVvcmVtLlxuICAgICAqIEBtZXRob2QgY29sbGlkZXNcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlBXG4gICAgICogQHBhcmFtIHtib2R5fSBib2R5QlxuICAgICAqIEBwYXJhbSB7Y29sbGlzaW9ufSBwcmV2aW91c0NvbGxpc2lvblxuICAgICAqIEByZXR1cm4ge2NvbGxpc2lvbn0gY29sbGlzaW9uXG4gICAgICovXG4gICAgU0FULmNvbGxpZGVzID0gZnVuY3Rpb24oYm9keUEsIGJvZHlCLCBwcmV2aW91c0NvbGxpc2lvbikge1xuICAgICAgICB2YXIgb3ZlcmxhcEFCLFxuICAgICAgICAgICAgb3ZlcmxhcEJBLCBcbiAgICAgICAgICAgIG1pbk92ZXJsYXAsXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBwcmV2Q29sID0gcHJldmlvdXNDb2xsaXNpb24sXG4gICAgICAgICAgICBjYW5SZXVzZVByZXZDb2wgPSBmYWxzZTtcblxuICAgICAgICBpZiAocHJldkNvbCkge1xuICAgICAgICAgICAgLy8gZXN0aW1hdGUgdG90YWwgbW90aW9uXG4gICAgICAgICAgICB2YXIgcGFyZW50QSA9IGJvZHlBLnBhcmVudCxcbiAgICAgICAgICAgICAgICBwYXJlbnRCID0gYm9keUIucGFyZW50LFxuICAgICAgICAgICAgICAgIG1vdGlvbiA9IHBhcmVudEEuc3BlZWQgKiBwYXJlbnRBLnNwZWVkICsgcGFyZW50QS5hbmd1bGFyU3BlZWQgKiBwYXJlbnRBLmFuZ3VsYXJTcGVlZFxuICAgICAgICAgICAgICAgICAgICAgICArIHBhcmVudEIuc3BlZWQgKiBwYXJlbnRCLnNwZWVkICsgcGFyZW50Qi5hbmd1bGFyU3BlZWQgKiBwYXJlbnRCLmFuZ3VsYXJTcGVlZDtcblxuICAgICAgICAgICAgLy8gd2UgbWF5IGJlIGFibGUgdG8gKHBhcnRpYWxseSkgcmV1c2UgY29sbGlzaW9uIHJlc3VsdCBcbiAgICAgICAgICAgIC8vIGJ1dCBvbmx5IHNhZmUgaWYgY29sbGlzaW9uIHdhcyByZXN0aW5nXG4gICAgICAgICAgICBjYW5SZXVzZVByZXZDb2wgPSBwcmV2Q29sICYmIHByZXZDb2wuY29sbGlkZWQgJiYgbW90aW9uIDwgMC4yO1xuXG4gICAgICAgICAgICAvLyByZXVzZSBjb2xsaXNpb24gb2JqZWN0XG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwcmV2Q29sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sbGlzaW9uID0geyBjb2xsaWRlZDogZmFsc2UsIGJvZHlBOiBib2R5QSwgYm9keUI6IGJvZHlCIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldkNvbCAmJiBjYW5SZXVzZVByZXZDb2wpIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGNhbiByZXVzZSB0aGUgY29sbGlzaW9uIHJlc3VsdFxuICAgICAgICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIHRlc3QgdGhlIHByZXZpb3VzbHkgZm91bmQgYXhpc1xuICAgICAgICAgICAgdmFyIGF4aXNCb2R5QSA9IGNvbGxpc2lvbi5heGlzQm9keSxcbiAgICAgICAgICAgICAgICBheGlzQm9keUIgPSBheGlzQm9keUEgPT09IGJvZHlBID8gYm9keUIgOiBib2R5QSxcbiAgICAgICAgICAgICAgICBheGVzID0gW2F4aXNCb2R5QS5heGVzW3ByZXZDb2wuYXhpc051bWJlcl1dO1xuXG4gICAgICAgICAgICBtaW5PdmVybGFwID0gX292ZXJsYXBBeGVzKGF4aXNCb2R5QS52ZXJ0aWNlcywgYXhpc0JvZHlCLnZlcnRpY2VzLCBheGVzKTtcbiAgICAgICAgICAgIGNvbGxpc2lvbi5yZXVzZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobWluT3ZlcmxhcC5vdmVybGFwIDw9IDApIHtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24uY29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sbGlzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgd2UgY2FuJ3QgcmV1c2UgYSByZXN1bHQsIHBlcmZvcm0gYSBmdWxsIFNBVCB0ZXN0XG5cbiAgICAgICAgICAgIG92ZXJsYXBBQiA9IF9vdmVybGFwQXhlcyhib2R5QS52ZXJ0aWNlcywgYm9keUIudmVydGljZXMsIGJvZHlBLmF4ZXMpO1xuXG4gICAgICAgICAgICBpZiAob3ZlcmxhcEFCLm92ZXJsYXAgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5jb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsaXNpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG92ZXJsYXBCQSA9IF9vdmVybGFwQXhlcyhib2R5Qi52ZXJ0aWNlcywgYm9keUEudmVydGljZXMsIGJvZHlCLmF4ZXMpO1xuXG4gICAgICAgICAgICBpZiAob3ZlcmxhcEJBLm92ZXJsYXAgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbi5jb2xsaWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsaXNpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvdmVybGFwQUIub3ZlcmxhcCA8IG92ZXJsYXBCQS5vdmVybGFwKSB7XG4gICAgICAgICAgICAgICAgbWluT3ZlcmxhcCA9IG92ZXJsYXBBQjtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24uYXhpc0JvZHkgPSBib2R5QTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWluT3ZlcmxhcCA9IG92ZXJsYXBCQTtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb24uYXhpc0JvZHkgPSBib2R5QjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW1wb3J0YW50IGZvciByZXVzZSBsYXRlclxuICAgICAgICAgICAgY29sbGlzaW9uLmF4aXNOdW1iZXIgPSBtaW5PdmVybGFwLmF4aXNOdW1iZXI7XG4gICAgICAgIH1cblxuICAgICAgICBjb2xsaXNpb24uYm9keUEgPSBib2R5QS5pZCA8IGJvZHlCLmlkID8gYm9keUEgOiBib2R5QjtcbiAgICAgICAgY29sbGlzaW9uLmJvZHlCID0gYm9keUEuaWQgPCBib2R5Qi5pZCA/IGJvZHlCIDogYm9keUE7XG4gICAgICAgIGNvbGxpc2lvbi5jb2xsaWRlZCA9IHRydWU7XG4gICAgICAgIGNvbGxpc2lvbi5ub3JtYWwgPSBtaW5PdmVybGFwLmF4aXM7XG4gICAgICAgIGNvbGxpc2lvbi5kZXB0aCA9IG1pbk92ZXJsYXAub3ZlcmxhcDtcbiAgICAgICAgY29sbGlzaW9uLnBhcmVudEEgPSBjb2xsaXNpb24uYm9keUEucGFyZW50O1xuICAgICAgICBjb2xsaXNpb24ucGFyZW50QiA9IGNvbGxpc2lvbi5ib2R5Qi5wYXJlbnQ7XG4gICAgICAgIFxuICAgICAgICBib2R5QSA9IGNvbGxpc2lvbi5ib2R5QTtcbiAgICAgICAgYm9keUIgPSBjb2xsaXNpb24uYm9keUI7XG5cbiAgICAgICAgLy8gZW5zdXJlIG5vcm1hbCBpcyBmYWNpbmcgYXdheSBmcm9tIGJvZHlBXG4gICAgICAgIGlmIChWZWN0b3IuZG90KGNvbGxpc2lvbi5ub3JtYWwsIFZlY3Rvci5zdWIoYm9keUIucG9zaXRpb24sIGJvZHlBLnBvc2l0aW9uKSkgPiAwKSBcbiAgICAgICAgICAgIGNvbGxpc2lvbi5ub3JtYWwgPSBWZWN0b3IubmVnKGNvbGxpc2lvbi5ub3JtYWwpO1xuXG4gICAgICAgIGNvbGxpc2lvbi50YW5nZW50ID0gVmVjdG9yLnBlcnAoY29sbGlzaW9uLm5vcm1hbCk7XG5cbiAgICAgICAgY29sbGlzaW9uLnBlbmV0cmF0aW9uID0geyBcbiAgICAgICAgICAgIHg6IGNvbGxpc2lvbi5ub3JtYWwueCAqIGNvbGxpc2lvbi5kZXB0aCwgXG4gICAgICAgICAgICB5OiBjb2xsaXNpb24ubm9ybWFsLnkgKiBjb2xsaXNpb24uZGVwdGggXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZmluZCBzdXBwb3J0IHBvaW50cywgdGhlcmUgaXMgYWx3YXlzIGVpdGhlciBleGFjdGx5IG9uZSBvciB0d29cbiAgICAgICAgdmFyIHZlcnRpY2VzQiA9IF9maW5kU3VwcG9ydHMoYm9keUEsIGJvZHlCLCBjb2xsaXNpb24ubm9ybWFsKSxcbiAgICAgICAgICAgIHN1cHBvcnRzID0gY29sbGlzaW9uLnN1cHBvcnRzIHx8IFtdO1xuICAgICAgICBzdXBwb3J0cy5sZW5ndGggPSAwO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIHN1cHBvcnRzIGZyb20gYm9keUIgdGhhdCBhcmUgaW5zaWRlIGJvZHlBXG4gICAgICAgIGlmIChWZXJ0aWNlcy5jb250YWlucyhib2R5QS52ZXJ0aWNlcywgdmVydGljZXNCWzBdKSlcbiAgICAgICAgICAgIHN1cHBvcnRzLnB1c2godmVydGljZXNCWzBdKTtcblxuICAgICAgICBpZiAoVmVydGljZXMuY29udGFpbnMoYm9keUEudmVydGljZXMsIHZlcnRpY2VzQlsxXSkpXG4gICAgICAgICAgICBzdXBwb3J0cy5wdXNoKHZlcnRpY2VzQlsxXSk7XG5cbiAgICAgICAgLy8gZmluZCB0aGUgc3VwcG9ydHMgZnJvbSBib2R5QSB0aGF0IGFyZSBpbnNpZGUgYm9keUJcbiAgICAgICAgaWYgKHN1cHBvcnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHZhciB2ZXJ0aWNlc0EgPSBfZmluZFN1cHBvcnRzKGJvZHlCLCBib2R5QSwgVmVjdG9yLm5lZyhjb2xsaXNpb24ubm9ybWFsKSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoVmVydGljZXMuY29udGFpbnMoYm9keUIudmVydGljZXMsIHZlcnRpY2VzQVswXSkpXG4gICAgICAgICAgICAgICAgc3VwcG9ydHMucHVzaCh2ZXJ0aWNlc0FbMF0pO1xuXG4gICAgICAgICAgICBpZiAoc3VwcG9ydHMubGVuZ3RoIDwgMiAmJiBWZXJ0aWNlcy5jb250YWlucyhib2R5Qi52ZXJ0aWNlcywgdmVydGljZXNBWzFdKSlcbiAgICAgICAgICAgICAgICBzdXBwb3J0cy5wdXNoKHZlcnRpY2VzQVsxXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhY2NvdW50IGZvciB0aGUgZWRnZSBjYXNlIG9mIG92ZXJsYXBwaW5nIGJ1dCBubyB2ZXJ0ZXggY29udGFpbm1lbnRcbiAgICAgICAgaWYgKHN1cHBvcnRzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBzdXBwb3J0cyA9IFt2ZXJ0aWNlc0JbMF1dO1xuICAgICAgICBcbiAgICAgICAgY29sbGlzaW9uLnN1cHBvcnRzID0gc3VwcG9ydHM7XG5cbiAgICAgICAgcmV0dXJuIGNvbGxpc2lvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgb3ZlcmxhcCBiZXR3ZWVuIHR3byBzZXRzIG9mIHZlcnRpY2VzLlxuICAgICAqIEBtZXRob2QgX292ZXJsYXBBeGVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge30gdmVydGljZXNBXG4gICAgICogQHBhcmFtIHt9IHZlcnRpY2VzQlxuICAgICAqIEBwYXJhbSB7fSBheGVzXG4gICAgICogQHJldHVybiByZXN1bHRcbiAgICAgKi9cbiAgICB2YXIgX292ZXJsYXBBeGVzID0gZnVuY3Rpb24odmVydGljZXNBLCB2ZXJ0aWNlc0IsIGF4ZXMpIHtcbiAgICAgICAgdmFyIHByb2plY3Rpb25BID0gVmVjdG9yLl90ZW1wWzBdLCBcbiAgICAgICAgICAgIHByb2plY3Rpb25CID0gVmVjdG9yLl90ZW1wWzFdLFxuICAgICAgICAgICAgcmVzdWx0ID0geyBvdmVybGFwOiBOdW1iZXIuTUFYX1ZBTFVFIH0sXG4gICAgICAgICAgICBvdmVybGFwLFxuICAgICAgICAgICAgYXhpcztcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGF4aXMgPSBheGVzW2ldO1xuXG4gICAgICAgICAgICBfcHJvamVjdFRvQXhpcyhwcm9qZWN0aW9uQSwgdmVydGljZXNBLCBheGlzKTtcbiAgICAgICAgICAgIF9wcm9qZWN0VG9BeGlzKHByb2plY3Rpb25CLCB2ZXJ0aWNlc0IsIGF4aXMpO1xuXG4gICAgICAgICAgICBvdmVybGFwID0gTWF0aC5taW4ocHJvamVjdGlvbkEubWF4IC0gcHJvamVjdGlvbkIubWluLCBwcm9qZWN0aW9uQi5tYXggLSBwcm9qZWN0aW9uQS5taW4pO1xuXG4gICAgICAgICAgICBpZiAob3ZlcmxhcCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm92ZXJsYXAgPSBvdmVybGFwO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvdmVybGFwIDwgcmVzdWx0Lm92ZXJsYXApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQub3ZlcmxhcCA9IG92ZXJsYXA7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmF4aXMgPSBheGlzO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5heGlzTnVtYmVyID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFByb2plY3RzIHZlcnRpY2VzIG9uIGFuIGF4aXMgYW5kIHJldHVybnMgYW4gaW50ZXJ2YWwuXG4gICAgICogQG1ldGhvZCBfcHJvamVjdFRvQXhpc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHt9IHByb2plY3Rpb25cbiAgICAgKiBAcGFyYW0ge30gdmVydGljZXNcbiAgICAgKiBAcGFyYW0ge30gYXhpc1xuICAgICAqL1xuICAgIHZhciBfcHJvamVjdFRvQXhpcyA9IGZ1bmN0aW9uKHByb2plY3Rpb24sIHZlcnRpY2VzLCBheGlzKSB7XG4gICAgICAgIHZhciBtaW4gPSBWZWN0b3IuZG90KHZlcnRpY2VzWzBdLCBheGlzKSxcbiAgICAgICAgICAgIG1heCA9IG1pbjtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICB2YXIgZG90ID0gVmVjdG9yLmRvdCh2ZXJ0aWNlc1tpXSwgYXhpcyk7XG5cbiAgICAgICAgICAgIGlmIChkb3QgPiBtYXgpIHsgXG4gICAgICAgICAgICAgICAgbWF4ID0gZG90OyBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZG90IDwgbWluKSB7IFxuICAgICAgICAgICAgICAgIG1pbiA9IGRvdDsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm9qZWN0aW9uLm1pbiA9IG1pbjtcbiAgICAgICAgcHJvamVjdGlvbi5tYXggPSBtYXg7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaW5kcyBzdXBwb3J0aW5nIHZlcnRpY2VzIGdpdmVuIHR3byBib2RpZXMgYWxvbmcgYSBnaXZlbiBkaXJlY3Rpb24gdXNpbmcgaGlsbC1jbGltYmluZy5cbiAgICAgKiBAbWV0aG9kIF9maW5kU3VwcG9ydHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBib2R5QVxuICAgICAqIEBwYXJhbSB7fSBib2R5QlxuICAgICAqIEBwYXJhbSB7fSBub3JtYWxcbiAgICAgKiBAcmV0dXJuIFt2ZWN0b3JdXG4gICAgICovXG4gICAgdmFyIF9maW5kU3VwcG9ydHMgPSBmdW5jdGlvbihib2R5QSwgYm9keUIsIG5vcm1hbCkge1xuICAgICAgICB2YXIgbmVhcmVzdERpc3RhbmNlID0gTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgIHZlcnRleFRvQm9keSA9IFZlY3Rvci5fdGVtcFswXSxcbiAgICAgICAgICAgIHZlcnRpY2VzID0gYm9keUIudmVydGljZXMsXG4gICAgICAgICAgICBib2R5QVBvc2l0aW9uID0gYm9keUEucG9zaXRpb24sXG4gICAgICAgICAgICBkaXN0YW5jZSxcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIHZlcnRleEEsXG4gICAgICAgICAgICB2ZXJ0ZXhCO1xuXG4gICAgICAgIC8vIGZpbmQgY2xvc2VzdCB2ZXJ0ZXggb24gYm9keUJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmVydGV4ID0gdmVydGljZXNbaV07XG4gICAgICAgICAgICB2ZXJ0ZXhUb0JvZHkueCA9IHZlcnRleC54IC0gYm9keUFQb3NpdGlvbi54O1xuICAgICAgICAgICAgdmVydGV4VG9Cb2R5LnkgPSB2ZXJ0ZXgueSAtIGJvZHlBUG9zaXRpb24ueTtcbiAgICAgICAgICAgIGRpc3RhbmNlID0gLVZlY3Rvci5kb3Qobm9ybWFsLCB2ZXJ0ZXhUb0JvZHkpO1xuXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBuZWFyZXN0RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBuZWFyZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhBID0gdmVydGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmluZCBuZXh0IGNsb3Nlc3QgdmVydGV4IHVzaW5nIHRoZSB0d28gY29ubmVjdGVkIHRvIGl0XG4gICAgICAgIHZhciBwcmV2SW5kZXggPSB2ZXJ0ZXhBLmluZGV4IC0gMSA+PSAwID8gdmVydGV4QS5pbmRleCAtIDEgOiB2ZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgICAgICB2ZXJ0ZXggPSB2ZXJ0aWNlc1twcmV2SW5kZXhdO1xuICAgICAgICB2ZXJ0ZXhUb0JvZHkueCA9IHZlcnRleC54IC0gYm9keUFQb3NpdGlvbi54O1xuICAgICAgICB2ZXJ0ZXhUb0JvZHkueSA9IHZlcnRleC55IC0gYm9keUFQb3NpdGlvbi55O1xuICAgICAgICBuZWFyZXN0RGlzdGFuY2UgPSAtVmVjdG9yLmRvdChub3JtYWwsIHZlcnRleFRvQm9keSk7XG4gICAgICAgIHZlcnRleEIgPSB2ZXJ0ZXg7XG5cbiAgICAgICAgdmFyIG5leHRJbmRleCA9ICh2ZXJ0ZXhBLmluZGV4ICsgMSkgJSB2ZXJ0aWNlcy5sZW5ndGg7XG4gICAgICAgIHZlcnRleCA9IHZlcnRpY2VzW25leHRJbmRleF07XG4gICAgICAgIHZlcnRleFRvQm9keS54ID0gdmVydGV4LnggLSBib2R5QVBvc2l0aW9uLng7XG4gICAgICAgIHZlcnRleFRvQm9keS55ID0gdmVydGV4LnkgLSBib2R5QVBvc2l0aW9uLnk7XG4gICAgICAgIGRpc3RhbmNlID0gLVZlY3Rvci5kb3Qobm9ybWFsLCB2ZXJ0ZXhUb0JvZHkpO1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCBuZWFyZXN0RGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHZlcnRleEIgPSB2ZXJ0ZXg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3ZlcnRleEEsIHZlcnRleEJdO1xuICAgIH07XG5cbn0pKCk7XG5cbn0se1wiLi4vZ2VvbWV0cnkvVmVjdG9yXCI6MjgsXCIuLi9nZW9tZXRyeS9WZXJ0aWNlc1wiOjI5fV0sMTI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLkNvbnN0cmFpbnRgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIGNvbnN0cmFpbnRzLlxuKiBDb25zdHJhaW50cyBhcmUgdXNlZCBmb3Igc3BlY2lmeWluZyB0aGF0IGEgZml4ZWQgZGlzdGFuY2UgbXVzdCBiZSBtYWludGFpbmVkIGJldHdlZW4gdHdvIGJvZGllcyAob3IgYSBib2R5IGFuZCBhIGZpeGVkIHdvcmxkLXNwYWNlIHBvc2l0aW9uKS5cbiogVGhlIHN0aWZmbmVzcyBvZiBjb25zdHJhaW50cyBjYW4gYmUgbW9kaWZpZWQgdG8gY3JlYXRlIHNwcmluZ3Mgb3IgZWxhc3RpYy5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIENvbnN0cmFpbnRcbiovXG5cbi8vIFRPRE86IGZpeCBpbnN0YWJpbGl0eSBpc3N1ZXMgd2l0aCB0b3JxdWVcbi8vIFRPRE86IGxpbmtlZCBjb25zdHJhaW50c1xuLy8gVE9ETzogYnJlYWthYmxlIGNvbnN0cmFpbnRzXG4vLyBUT0RPOiBjb2xsaXNpb24gY29uc3RyYWludHNcbi8vIFRPRE86IGFsbG93IGNvbnN0cmFpbmVkIGJvZGllcyB0byBzbGVlcFxuLy8gVE9ETzogaGFuZGxlIDAgbGVuZ3RoIGNvbnN0cmFpbnRzIHByb3Blcmx5XG4vLyBUT0RPOiBpbXB1bHNlIGNhY2hpbmcgYW5kIHdhcm1pbmdcblxudmFyIENvbnN0cmFpbnQgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb25zdHJhaW50O1xuXG52YXIgVmVydGljZXMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9WZXJ0aWNlcycpO1xudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xudmFyIFNsZWVwaW5nID0gX2RlcmVxXygnLi4vY29yZS9TbGVlcGluZycpO1xudmFyIEJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xudmFyIEF4ZXMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9BeGVzJyk7XG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9taW5MZW5ndGggPSAwLjAwMDAwMSxcbiAgICAgICAgX21pbkRpZmZlcmVuY2UgPSAwLjAwMTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY29uc3RyYWludC5cbiAgICAgKiBBbGwgcHJvcGVydGllcyBoYXZlIGRlZmF1bHQgdmFsdWVzLCBhbmQgbWFueSBhcmUgcHJlLWNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSBiYXNlZCBvbiBvdGhlciBwcm9wZXJ0aWVzLlxuICAgICAqIFNlZSB0aGUgcHJvcGVydGllcyBzZWN0aW9uIGJlbG93IGZvciBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvbiB3aGF0IHlvdSBjYW4gcGFzcyB2aWEgdGhlIGBvcHRpb25zYCBvYmplY3QuXG4gICAgICogQG1ldGhvZCBjcmVhdGVcbiAgICAgKiBAcGFyYW0ge30gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge2NvbnN0cmFpbnR9IGNvbnN0cmFpbnRcbiAgICAgKi9cbiAgICBDb25zdHJhaW50LmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNvbnN0cmFpbnQgPSBvcHRpb25zO1xuXG4gICAgICAgIC8vIGlmIGJvZGllcyBkZWZpbmVkIGJ1dCBubyBwb2ludHMsIHVzZSBib2R5IGNlbnRyZVxuICAgICAgICBpZiAoY29uc3RyYWludC5ib2R5QSAmJiAhY29uc3RyYWludC5wb2ludEEpXG4gICAgICAgICAgICBjb25zdHJhaW50LnBvaW50QSA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgICBpZiAoY29uc3RyYWludC5ib2R5QiAmJiAhY29uc3RyYWludC5wb2ludEIpXG4gICAgICAgICAgICBjb25zdHJhaW50LnBvaW50QiA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBzdGF0aWMgbGVuZ3RoIHVzaW5nIGluaXRpYWwgd29ybGQgc3BhY2UgcG9pbnRzXG4gICAgICAgIHZhciBpbml0aWFsUG9pbnRBID0gY29uc3RyYWludC5ib2R5QSA/IFZlY3Rvci5hZGQoY29uc3RyYWludC5ib2R5QS5wb3NpdGlvbiwgY29uc3RyYWludC5wb2ludEEpIDogY29uc3RyYWludC5wb2ludEEsXG4gICAgICAgICAgICBpbml0aWFsUG9pbnRCID0gY29uc3RyYWludC5ib2R5QiA/IFZlY3Rvci5hZGQoY29uc3RyYWludC5ib2R5Qi5wb3NpdGlvbiwgY29uc3RyYWludC5wb2ludEIpIDogY29uc3RyYWludC5wb2ludEIsXG4gICAgICAgICAgICBsZW5ndGggPSBWZWN0b3IubWFnbml0dWRlKFZlY3Rvci5zdWIoaW5pdGlhbFBvaW50QSwgaW5pdGlhbFBvaW50QikpO1xuICAgIFxuICAgICAgICBjb25zdHJhaW50Lmxlbmd0aCA9IGNvbnN0cmFpbnQubGVuZ3RoIHx8IGxlbmd0aCB8fCBfbWluTGVuZ3RoO1xuXG4gICAgICAgIC8vIHJlbmRlclxuICAgICAgICB2YXIgcmVuZGVyID0ge1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAnIzY2NidcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0cmFpbnQucmVuZGVyID0gQ29tbW9uLmV4dGVuZChyZW5kZXIsIGNvbnN0cmFpbnQucmVuZGVyKTtcblxuICAgICAgICAvLyBvcHRpb24gZGVmYXVsdHNcbiAgICAgICAgY29uc3RyYWludC5pZCA9IGNvbnN0cmFpbnQuaWQgfHwgQ29tbW9uLm5leHRJZCgpO1xuICAgICAgICBjb25zdHJhaW50LmxhYmVsID0gY29uc3RyYWludC5sYWJlbCB8fCAnQ29uc3RyYWludCc7XG4gICAgICAgIGNvbnN0cmFpbnQudHlwZSA9ICdjb25zdHJhaW50JztcbiAgICAgICAgY29uc3RyYWludC5zdGlmZm5lc3MgPSBjb25zdHJhaW50LnN0aWZmbmVzcyB8fCAxO1xuICAgICAgICBjb25zdHJhaW50LmFuZ3VsYXJTdGlmZm5lc3MgPSBjb25zdHJhaW50LmFuZ3VsYXJTdGlmZm5lc3MgfHwgMDtcbiAgICAgICAgY29uc3RyYWludC5hbmdsZUEgPSBjb25zdHJhaW50LmJvZHlBID8gY29uc3RyYWludC5ib2R5QS5hbmdsZSA6IGNvbnN0cmFpbnQuYW5nbGVBO1xuICAgICAgICBjb25zdHJhaW50LmFuZ2xlQiA9IGNvbnN0cmFpbnQuYm9keUIgPyBjb25zdHJhaW50LmJvZHlCLmFuZ2xlIDogY29uc3RyYWludC5hbmdsZUI7XG5cbiAgICAgICAgcmV0dXJuIGNvbnN0cmFpbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNvbHZlcyBhbGwgY29uc3RyYWludHMgaW4gYSBsaXN0IG9mIGNvbGxpc2lvbnMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIHNvbHZlQWxsXG4gICAgICogQHBhcmFtIHtjb25zdHJhaW50W119IGNvbnN0cmFpbnRzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVTY2FsZVxuICAgICAqL1xuICAgIENvbnN0cmFpbnQuc29sdmVBbGwgPSBmdW5jdGlvbihjb25zdHJhaW50cywgdGltZVNjYWxlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIENvbnN0cmFpbnQuc29sdmUoY29uc3RyYWludHNbaV0sIHRpbWVTY2FsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU29sdmVzIGEgZGlzdGFuY2UgY29uc3RyYWludCB3aXRoIEdhdXNzLVNpZWRlbCBtZXRob2QuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIHNvbHZlXG4gICAgICogQHBhcmFtIHtjb25zdHJhaW50fSBjb25zdHJhaW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVTY2FsZVxuICAgICAqL1xuICAgIENvbnN0cmFpbnQuc29sdmUgPSBmdW5jdGlvbihjb25zdHJhaW50LCB0aW1lU2NhbGUpIHtcbiAgICAgICAgdmFyIGJvZHlBID0gY29uc3RyYWludC5ib2R5QSxcbiAgICAgICAgICAgIGJvZHlCID0gY29uc3RyYWludC5ib2R5QixcbiAgICAgICAgICAgIHBvaW50QSA9IGNvbnN0cmFpbnQucG9pbnRBLFxuICAgICAgICAgICAgcG9pbnRCID0gY29uc3RyYWludC5wb2ludEI7XG5cbiAgICAgICAgLy8gdXBkYXRlIHJlZmVyZW5jZSBhbmdsZVxuICAgICAgICBpZiAoYm9keUEgJiYgIWJvZHlBLmlzU3RhdGljKSB7XG4gICAgICAgICAgICBjb25zdHJhaW50LnBvaW50QSA9IFZlY3Rvci5yb3RhdGUocG9pbnRBLCBib2R5QS5hbmdsZSAtIGNvbnN0cmFpbnQuYW5nbGVBKTtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQuYW5nbGVBID0gYm9keUEuYW5nbGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIHVwZGF0ZSByZWZlcmVuY2UgYW5nbGVcbiAgICAgICAgaWYgKGJvZHlCICYmICFib2R5Qi5pc1N0YXRpYykge1xuICAgICAgICAgICAgY29uc3RyYWludC5wb2ludEIgPSBWZWN0b3Iucm90YXRlKHBvaW50QiwgYm9keUIuYW5nbGUgLSBjb25zdHJhaW50LmFuZ2xlQik7XG4gICAgICAgICAgICBjb25zdHJhaW50LmFuZ2xlQiA9IGJvZHlCLmFuZ2xlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBvaW50QVdvcmxkID0gcG9pbnRBLFxuICAgICAgICAgICAgcG9pbnRCV29ybGQgPSBwb2ludEI7XG5cbiAgICAgICAgaWYgKGJvZHlBKSBwb2ludEFXb3JsZCA9IFZlY3Rvci5hZGQoYm9keUEucG9zaXRpb24sIHBvaW50QSk7XG4gICAgICAgIGlmIChib2R5QikgcG9pbnRCV29ybGQgPSBWZWN0b3IuYWRkKGJvZHlCLnBvc2l0aW9uLCBwb2ludEIpO1xuXG4gICAgICAgIGlmICghcG9pbnRBV29ybGQgfHwgIXBvaW50QldvcmxkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHZhciBkZWx0YSA9IFZlY3Rvci5zdWIocG9pbnRBV29ybGQsIHBvaW50QldvcmxkKSxcbiAgICAgICAgICAgIGN1cnJlbnRMZW5ndGggPSBWZWN0b3IubWFnbml0dWRlKGRlbHRhKTtcblxuICAgICAgICAvLyBwcmV2ZW50IHNpbmd1bGFyaXR5XG4gICAgICAgIGlmIChjdXJyZW50TGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgY3VycmVudExlbmd0aCA9IF9taW5MZW5ndGg7XG5cbiAgICAgICAgLy8gc29sdmUgZGlzdGFuY2UgY29uc3RyYWludCB3aXRoIEdhdXNzLVNpZWRlbCBtZXRob2RcbiAgICAgICAgdmFyIGRpZmZlcmVuY2UgPSAoY3VycmVudExlbmd0aCAtIGNvbnN0cmFpbnQubGVuZ3RoKSAvIGN1cnJlbnRMZW5ndGgsXG4gICAgICAgICAgICBub3JtYWwgPSBWZWN0b3IuZGl2KGRlbHRhLCBjdXJyZW50TGVuZ3RoKSxcbiAgICAgICAgICAgIGZvcmNlID0gVmVjdG9yLm11bHQoZGVsdGEsIGRpZmZlcmVuY2UgKiAwLjUgKiBjb25zdHJhaW50LnN0aWZmbmVzcyAqIHRpbWVTY2FsZSAqIHRpbWVTY2FsZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBpZiBkaWZmZXJlbmNlIGlzIHZlcnkgc21hbGwsIHdlIGNhbiBza2lwXG4gICAgICAgIGlmIChNYXRoLmFicygxIC0gKGN1cnJlbnRMZW5ndGggLyBjb25zdHJhaW50Lmxlbmd0aCkpIDwgX21pbkRpZmZlcmVuY2UgKiB0aW1lU2NhbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIHZlbG9jaXR5UG9pbnRBLFxuICAgICAgICAgICAgdmVsb2NpdHlQb2ludEIsXG4gICAgICAgICAgICBvZmZzZXRBLFxuICAgICAgICAgICAgb2Zmc2V0QixcbiAgICAgICAgICAgIG9BbixcbiAgICAgICAgICAgIG9CbixcbiAgICAgICAgICAgIGJvZHlBRGVub20sXG4gICAgICAgICAgICBib2R5QkRlbm9tO1xuICAgIFxuICAgICAgICBpZiAoYm9keUEgJiYgIWJvZHlBLmlzU3RhdGljKSB7XG4gICAgICAgICAgICAvLyBwb2ludCBib2R5IG9mZnNldFxuICAgICAgICAgICAgb2Zmc2V0QSA9IHsgXG4gICAgICAgICAgICAgICAgeDogcG9pbnRBV29ybGQueCAtIGJvZHlBLnBvc2l0aW9uLnggKyBmb3JjZS54LCBcbiAgICAgICAgICAgICAgICB5OiBwb2ludEFXb3JsZC55IC0gYm9keUEucG9zaXRpb24ueSArIGZvcmNlLnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB2ZWxvY2l0eVxuICAgICAgICAgICAgYm9keUEudmVsb2NpdHkueCA9IGJvZHlBLnBvc2l0aW9uLnggLSBib2R5QS5wb3NpdGlvblByZXYueDtcbiAgICAgICAgICAgIGJvZHlBLnZlbG9jaXR5LnkgPSBib2R5QS5wb3NpdGlvbi55IC0gYm9keUEucG9zaXRpb25QcmV2Lnk7XG4gICAgICAgICAgICBib2R5QS5hbmd1bGFyVmVsb2NpdHkgPSBib2R5QS5hbmdsZSAtIGJvZHlBLmFuZ2xlUHJldjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZmluZCBwb2ludCB2ZWxvY2l0eSBhbmQgYm9keSBtYXNzXG4gICAgICAgICAgICB2ZWxvY2l0eVBvaW50QSA9IFZlY3Rvci5hZGQoYm9keUEudmVsb2NpdHksIFZlY3Rvci5tdWx0KFZlY3Rvci5wZXJwKG9mZnNldEEpLCBib2R5QS5hbmd1bGFyVmVsb2NpdHkpKTtcbiAgICAgICAgICAgIG9BbiA9IFZlY3Rvci5kb3Qob2Zmc2V0QSwgbm9ybWFsKTtcbiAgICAgICAgICAgIGJvZHlBRGVub20gPSBib2R5QS5pbnZlcnNlTWFzcyArIGJvZHlBLmludmVyc2VJbmVydGlhICogb0FuICogb0FuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmVsb2NpdHlQb2ludEEgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICAgICAgICAgIGJvZHlBRGVub20gPSBib2R5QSA/IGJvZHlBLmludmVyc2VNYXNzIDogMDtcbiAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIChib2R5QiAmJiAhYm9keUIuaXNTdGF0aWMpIHtcbiAgICAgICAgICAgIC8vIHBvaW50IGJvZHkgb2Zmc2V0XG4gICAgICAgICAgICBvZmZzZXRCID0geyBcbiAgICAgICAgICAgICAgICB4OiBwb2ludEJXb3JsZC54IC0gYm9keUIucG9zaXRpb24ueCAtIGZvcmNlLngsIFxuICAgICAgICAgICAgICAgIHk6IHBvaW50QldvcmxkLnkgLSBib2R5Qi5wb3NpdGlvbi55IC0gZm9yY2UueSBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB2ZWxvY2l0eVxuICAgICAgICAgICAgYm9keUIudmVsb2NpdHkueCA9IGJvZHlCLnBvc2l0aW9uLnggLSBib2R5Qi5wb3NpdGlvblByZXYueDtcbiAgICAgICAgICAgIGJvZHlCLnZlbG9jaXR5LnkgPSBib2R5Qi5wb3NpdGlvbi55IC0gYm9keUIucG9zaXRpb25QcmV2Lnk7XG4gICAgICAgICAgICBib2R5Qi5hbmd1bGFyVmVsb2NpdHkgPSBib2R5Qi5hbmdsZSAtIGJvZHlCLmFuZ2xlUHJldjtcblxuICAgICAgICAgICAgLy8gZmluZCBwb2ludCB2ZWxvY2l0eSBhbmQgYm9keSBtYXNzXG4gICAgICAgICAgICB2ZWxvY2l0eVBvaW50QiA9IFZlY3Rvci5hZGQoYm9keUIudmVsb2NpdHksIFZlY3Rvci5tdWx0KFZlY3Rvci5wZXJwKG9mZnNldEIpLCBib2R5Qi5hbmd1bGFyVmVsb2NpdHkpKTtcbiAgICAgICAgICAgIG9CbiA9IFZlY3Rvci5kb3Qob2Zmc2V0Qiwgbm9ybWFsKTtcbiAgICAgICAgICAgIGJvZHlCRGVub20gPSBib2R5Qi5pbnZlcnNlTWFzcyArIGJvZHlCLmludmVyc2VJbmVydGlhICogb0JuICogb0JuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmVsb2NpdHlQb2ludEIgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICAgICAgICAgIGJvZHlCRGVub20gPSBib2R5QiA/IGJvZHlCLmludmVyc2VNYXNzIDogMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHJlbGF0aXZlVmVsb2NpdHkgPSBWZWN0b3Iuc3ViKHZlbG9jaXR5UG9pbnRCLCB2ZWxvY2l0eVBvaW50QSksXG4gICAgICAgICAgICBub3JtYWxJbXB1bHNlID0gVmVjdG9yLmRvdChub3JtYWwsIHJlbGF0aXZlVmVsb2NpdHkpIC8gKGJvZHlBRGVub20gKyBib2R5QkRlbm9tKTtcbiAgICBcbiAgICAgICAgaWYgKG5vcm1hbEltcHVsc2UgPiAwKSBub3JtYWxJbXB1bHNlID0gMDtcbiAgICBcbiAgICAgICAgdmFyIG5vcm1hbFZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgeDogbm9ybWFsLnggKiBub3JtYWxJbXB1bHNlLCBcbiAgICAgICAgICAgIHk6IG5vcm1hbC55ICogbm9ybWFsSW1wdWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0b3JxdWU7XG4gXG4gICAgICAgIGlmIChib2R5QSAmJiAhYm9keUEuaXNTdGF0aWMpIHtcbiAgICAgICAgICAgIHRvcnF1ZSA9IFZlY3Rvci5jcm9zcyhvZmZzZXRBLCBub3JtYWxWZWxvY2l0eSkgKiBib2R5QS5pbnZlcnNlSW5lcnRpYSAqICgxIC0gY29uc3RyYWludC5hbmd1bGFyU3RpZmZuZXNzKTtcblxuICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBhcHBsaWVkIGltcHVsc2VzIGZvciBwb3N0IHNvbHZpbmdcbiAgICAgICAgICAgIGJvZHlBLmNvbnN0cmFpbnRJbXB1bHNlLnggLT0gZm9yY2UueDtcbiAgICAgICAgICAgIGJvZHlBLmNvbnN0cmFpbnRJbXB1bHNlLnkgLT0gZm9yY2UueTtcbiAgICAgICAgICAgIGJvZHlBLmNvbnN0cmFpbnRJbXB1bHNlLmFuZ2xlICs9IHRvcnF1ZTtcblxuICAgICAgICAgICAgLy8gYXBwbHkgZm9yY2VzXG4gICAgICAgICAgICBib2R5QS5wb3NpdGlvbi54IC09IGZvcmNlLng7XG4gICAgICAgICAgICBib2R5QS5wb3NpdGlvbi55IC09IGZvcmNlLnk7XG4gICAgICAgICAgICBib2R5QS5hbmdsZSArPSB0b3JxdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keUIgJiYgIWJvZHlCLmlzU3RhdGljKSB7XG4gICAgICAgICAgICB0b3JxdWUgPSBWZWN0b3IuY3Jvc3Mob2Zmc2V0Qiwgbm9ybWFsVmVsb2NpdHkpICogYm9keUIuaW52ZXJzZUluZXJ0aWEgKiAoMSAtIGNvbnN0cmFpbnQuYW5ndWxhclN0aWZmbmVzcyk7XG5cbiAgICAgICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgYXBwbGllZCBpbXB1bHNlcyBmb3IgcG9zdCBzb2x2aW5nXG4gICAgICAgICAgICBib2R5Qi5jb25zdHJhaW50SW1wdWxzZS54ICs9IGZvcmNlLng7XG4gICAgICAgICAgICBib2R5Qi5jb25zdHJhaW50SW1wdWxzZS55ICs9IGZvcmNlLnk7XG4gICAgICAgICAgICBib2R5Qi5jb25zdHJhaW50SW1wdWxzZS5hbmdsZSAtPSB0b3JxdWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGFwcGx5IGZvcmNlc1xuICAgICAgICAgICAgYm9keUIucG9zaXRpb24ueCArPSBmb3JjZS54O1xuICAgICAgICAgICAgYm9keUIucG9zaXRpb24ueSArPSBmb3JjZS55O1xuICAgICAgICAgICAgYm9keUIuYW5nbGUgLT0gdG9ycXVlO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYm9keSB1cGRhdGVzIHJlcXVpcmVkIGFmdGVyIHNvbHZpbmcgY29uc3RyYWludHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIHBvc3RTb2x2ZUFsbFxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKi9cbiAgICBDb25zdHJhaW50LnBvc3RTb2x2ZUFsbCA9IGZ1bmN0aW9uKGJvZGllcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBib2RpZXNbaV0sXG4gICAgICAgICAgICAgICAgaW1wdWxzZSA9IGJvZHkuY29uc3RyYWludEltcHVsc2U7XG5cbiAgICAgICAgICAgIGlmIChpbXB1bHNlLnggPT09IDAgJiYgaW1wdWxzZS55ID09PSAwICYmIGltcHVsc2UuYW5nbGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgU2xlZXBpbmcuc2V0KGJvZHksIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIGdlb21ldHJ5IGFuZCByZXNldFxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBib2R5LnBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnQgPSBib2R5LnBhcnRzW2pdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFZlcnRpY2VzLnRyYW5zbGF0ZShwYXJ0LnZlcnRpY2VzLCBpbXB1bHNlKTtcblxuICAgICAgICAgICAgICAgIGlmIChqID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0LnBvc2l0aW9uLnggKz0gaW1wdWxzZS54O1xuICAgICAgICAgICAgICAgICAgICBwYXJ0LnBvc2l0aW9uLnkgKz0gaW1wdWxzZS55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpbXB1bHNlLmFuZ2xlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIFZlcnRpY2VzLnJvdGF0ZShwYXJ0LnZlcnRpY2VzLCBpbXB1bHNlLmFuZ2xlLCBib2R5LnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgQXhlcy5yb3RhdGUocGFydC5heGVzLCBpbXB1bHNlLmFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBWZWN0b3Iucm90YXRlQWJvdXQocGFydC5wb3NpdGlvbiwgaW1wdWxzZS5hbmdsZSwgYm9keS5wb3NpdGlvbiwgcGFydC5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBCb3VuZHMudXBkYXRlKHBhcnQuYm91bmRzLCBwYXJ0LnZlcnRpY2VzLCBib2R5LnZlbG9jaXR5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW1wdWxzZS5hbmdsZSA9IDA7XG4gICAgICAgICAgICBpbXB1bHNlLnggPSAwO1xuICAgICAgICAgICAgaW1wdWxzZS55ID0gMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICpcbiAgICAqICBQcm9wZXJ0aWVzIERvY3VtZW50YXRpb25cbiAgICAqXG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGludGVnZXIgYE51bWJlcmAgdW5pcXVlbHkgaWRlbnRpZnlpbmcgbnVtYmVyIGdlbmVyYXRlZCBpbiBgQ29tcG9zaXRlLmNyZWF0ZWAgYnkgYENvbW1vbi5uZXh0SWRgLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGlkXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBTdHJpbmdgIGRlbm90aW5nIHRoZSB0eXBlIG9mIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB0eXBlXG4gICAgICogQHR5cGUgc3RyaW5nXG4gICAgICogQGRlZmF1bHQgXCJjb25zdHJhaW50XCJcbiAgICAgKiBAcmVhZE9ubHlcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGFyYml0cmFyeSBgU3RyaW5nYCBuYW1lIHRvIGhlbHAgdGhlIHVzZXIgaWRlbnRpZnkgYW5kIG1hbmFnZSBib2RpZXMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgbGFiZWxcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBcIkNvbnN0cmFpbnRcIlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gYE9iamVjdGAgdGhhdCBkZWZpbmVzIHRoZSByZW5kZXJpbmcgcHJvcGVydGllcyB0byBiZSBjb25zdW1lZCBieSB0aGUgbW9kdWxlIGBNYXR0ZXIuUmVuZGVyYC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXJcbiAgICAgKiBAdHlwZSBvYmplY3RcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgZmxhZyB0aGF0IGluZGljYXRlcyBpZiB0aGUgY29uc3RyYWludCBzaG91bGQgYmUgcmVuZGVyZWQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcmVuZGVyLnZpc2libGVcbiAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IGRlZmluZXMgdGhlIGxpbmUgd2lkdGggdG8gdXNlIHdoZW4gcmVuZGVyaW5nIHRoZSBjb25zdHJhaW50IG91dGxpbmUuXG4gICAgICogQSB2YWx1ZSBvZiBgMGAgbWVhbnMgbm8gb3V0bGluZSB3aWxsIGJlIHJlbmRlcmVkLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHJlbmRlci5saW5lV2lkdGhcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAyXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBTdHJpbmdgIHRoYXQgZGVmaW5lcyB0aGUgc3Ryb2tlIHN0eWxlIHRvIHVzZSB3aGVuIHJlbmRlcmluZyB0aGUgY29uc3RyYWludCBvdXRsaW5lLlxuICAgICAqIEl0IGlzIHRoZSBzYW1lIGFzIHdoZW4gdXNpbmcgYSBjYW52YXMsIHNvIGl0IGFjY2VwdHMgQ1NTIHN0eWxlIHByb3BlcnR5IHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSByZW5kZXIuc3Ryb2tlU3R5bGVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBhIHJhbmRvbSBjb2xvdXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCBwb3NzaWJsZSBgQm9keWAgdGhhdCB0aGlzIGNvbnN0cmFpbnQgaXMgYXR0YWNoZWQgdG8uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYm9keUFcbiAgICAgKiBAdHlwZSBib2R5XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlY29uZCBwb3NzaWJsZSBgQm9keWAgdGhhdCB0aGlzIGNvbnN0cmFpbnQgaXMgYXR0YWNoZWQgdG8uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYm9keUJcbiAgICAgKiBAdHlwZSBib2R5XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgVmVjdG9yYCB0aGF0IHNwZWNpZmllcyB0aGUgb2Zmc2V0IG9mIHRoZSBjb25zdHJhaW50IGZyb20gY2VudGVyIG9mIHRoZSBgY29uc3RyYWludC5ib2R5QWAgaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIGEgd29ybGQtc3BhY2UgcG9zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcG9pbnRBXG4gICAgICogQHR5cGUgdmVjdG9yXG4gICAgICogQGRlZmF1bHQgeyB4OiAwLCB5OiAwIH1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYFZlY3RvcmAgdGhhdCBzcGVjaWZpZXMgdGhlIG9mZnNldCBvZiB0aGUgY29uc3RyYWludCBmcm9tIGNlbnRlciBvZiB0aGUgYGNvbnN0cmFpbnQuYm9keUFgIGlmIGRlZmluZWQsIG90aGVyd2lzZSBhIHdvcmxkLXNwYWNlIHBvc2l0aW9uLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHBvaW50QlxuICAgICAqIEB0eXBlIHZlY3RvclxuICAgICAqIEBkZWZhdWx0IHsgeDogMCwgeTogMCB9XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgc3BlY2lmaWVzIHRoZSBzdGlmZm5lc3Mgb2YgdGhlIGNvbnN0cmFpbnQsIGkuZS4gdGhlIHJhdGUgYXQgd2hpY2ggaXQgcmV0dXJucyB0byBpdHMgcmVzdGluZyBgY29uc3RyYWludC5sZW5ndGhgLlxuICAgICAqIEEgdmFsdWUgb2YgYDFgIG1lYW5zIHRoZSBjb25zdHJhaW50IHNob3VsZCBiZSB2ZXJ5IHN0aWZmLlxuICAgICAqIEEgdmFsdWUgb2YgYDAuMmAgbWVhbnMgdGhlIGNvbnN0cmFpbnQgYWN0cyBsaWtlIGEgc29mdCBzcHJpbmcuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgc3RpZmZuZXNzXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IHNwZWNpZmllcyB0aGUgdGFyZ2V0IHJlc3RpbmcgbGVuZ3RoIG9mIHRoZSBjb25zdHJhaW50LiBcbiAgICAgKiBJdCBpcyBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkgaW4gYENvbnN0cmFpbnQuY3JlYXRlYCBmcm9tIGluaXRpYWwgcG9zaXRpb25zIG9mIHRoZSBgY29uc3RyYWludC5ib2R5QWAgYW5kIGBjb25zdHJhaW50LmJvZHlCYC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBsZW5ndGhcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKi9cblxufSkoKTtcblxufSx7XCIuLi9jb3JlL0NvbW1vblwiOjE0LFwiLi4vY29yZS9TbGVlcGluZ1wiOjIyLFwiLi4vZ2VvbWV0cnkvQXhlc1wiOjI1LFwiLi4vZ2VvbWV0cnkvQm91bmRzXCI6MjYsXCIuLi9nZW9tZXRyeS9WZWN0b3JcIjoyOCxcIi4uL2dlb21ldHJ5L1ZlcnRpY2VzXCI6Mjl9XSwxMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuTW91c2VDb25zdHJhaW50YCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyBmb3IgY3JlYXRpbmcgbW91c2UgY29uc3RyYWludHMuXG4qIE1vdXNlIGNvbnN0cmFpbnRzIGFyZSB1c2VkIGZvciBhbGxvd2luZyB1c2VyIGludGVyYWN0aW9uLCBwcm92aWRpbmcgdGhlIGFiaWxpdHkgdG8gbW92ZSBib2RpZXMgdmlhIHRoZSBtb3VzZSBvciB0b3VjaC5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIE1vdXNlQ29uc3RyYWludFxuKi9cblxudmFyIE1vdXNlQ29uc3RyYWludCA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlQ29uc3RyYWludDtcblxudmFyIFZlcnRpY2VzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVydGljZXMnKTtcbnZhciBTbGVlcGluZyA9IF9kZXJlcV8oJy4uL2NvcmUvU2xlZXBpbmcnKTtcbnZhciBNb3VzZSA9IF9kZXJlcV8oJy4uL2NvcmUvTW91c2UnKTtcbnZhciBFdmVudHMgPSBfZGVyZXFfKCcuLi9jb3JlL0V2ZW50cycpO1xudmFyIERldGVjdG9yID0gX2RlcmVxXygnLi4vY29sbGlzaW9uL0RldGVjdG9yJyk7XG52YXIgQ29uc3RyYWludCA9IF9kZXJlcV8oJy4vQ29uc3RyYWludCcpO1xudmFyIENvbXBvc2l0ZSA9IF9kZXJlcV8oJy4uL2JvZHkvQ29tcG9zaXRlJyk7XG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcbnZhciBCb3VuZHMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9Cb3VuZHMnKTtcblxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBtb3VzZSBjb25zdHJhaW50LlxuICAgICAqIEFsbCBwcm9wZXJ0aWVzIGhhdmUgZGVmYXVsdCB2YWx1ZXMsIGFuZCBtYW55IGFyZSBwcmUtY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5IGJhc2VkIG9uIG90aGVyIHByb3BlcnRpZXMuXG4gICAgICogU2VlIHRoZSBwcm9wZXJ0aWVzIHNlY3Rpb24gYmVsb3cgZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIG9uIHdoYXQgeW91IGNhbiBwYXNzIHZpYSB0aGUgYG9wdGlvbnNgIG9iamVjdC5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7ZW5naW5lfSBlbmdpbmVcbiAgICAgKiBAcGFyYW0ge30gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge01vdXNlQ29uc3RyYWludH0gQSBuZXcgTW91c2VDb25zdHJhaW50XG4gICAgICovXG4gICAgTW91c2VDb25zdHJhaW50LmNyZWF0ZSA9IGZ1bmN0aW9uKGVuZ2luZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbW91c2UgPSAoZW5naW5lID8gZW5naW5lLm1vdXNlIDogbnVsbCkgfHwgKG9wdGlvbnMgPyBvcHRpb25zLm1vdXNlIDogbnVsbCk7XG5cbiAgICAgICAgaWYgKCFtb3VzZSkge1xuICAgICAgICAgICAgaWYgKGVuZ2luZSAmJiBlbmdpbmUucmVuZGVyICYmIGVuZ2luZS5yZW5kZXIuY2FudmFzKSB7XG4gICAgICAgICAgICAgICAgbW91c2UgPSBNb3VzZS5jcmVhdGUoZW5naW5lLnJlbmRlci5jYW52YXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIG1vdXNlID0gTW91c2UuY3JlYXRlKG9wdGlvbnMuZWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdXNlID0gTW91c2UuY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oJ01vdXNlQ29uc3RyYWludC5jcmVhdGU6IG9wdGlvbnMubW91c2Ugd2FzIHVuZGVmaW5lZCwgb3B0aW9ucy5lbGVtZW50IHdhcyB1bmRlZmluZWQsIG1heSBub3QgZnVuY3Rpb24gYXMgZXhwZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb25zdHJhaW50ID0gQ29uc3RyYWludC5jcmVhdGUoeyBcbiAgICAgICAgICAgIGxhYmVsOiAnTW91c2UgQ29uc3RyYWludCcsXG4gICAgICAgICAgICBwb2ludEE6IG1vdXNlLnBvc2l0aW9uLFxuICAgICAgICAgICAgcG9pbnRCOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogMC4wMSwgXG4gICAgICAgICAgICBzdGlmZm5lc3M6IDAuMSxcbiAgICAgICAgICAgIGFuZ3VsYXJTdGlmZm5lc3M6IDEsXG4gICAgICAgICAgICByZW5kZXI6IHtcbiAgICAgICAgICAgICAgICBzdHJva2VTdHlsZTogJyM5MEVFOTAnLFxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogM1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbW91c2VDb25zdHJhaW50JyxcbiAgICAgICAgICAgIG1vdXNlOiBtb3VzZSxcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBib2R5OiBudWxsLFxuICAgICAgICAgICAgY29uc3RyYWludDogY29uc3RyYWludCxcbiAgICAgICAgICAgIGNvbGxpc2lvbkZpbHRlcjoge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAweDAwMDEsXG4gICAgICAgICAgICAgICAgbWFzazogMHhGRkZGRkZGRixcbiAgICAgICAgICAgICAgICBncm91cDogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBtb3VzZUNvbnN0cmFpbnQgPSBDb21tb24uZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICBFdmVudHMub24oZW5naW5lLCAndGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFsbEJvZGllcyA9IENvbXBvc2l0ZS5hbGxCb2RpZXMoZW5naW5lLndvcmxkKTtcbiAgICAgICAgICAgIE1vdXNlQ29uc3RyYWludC51cGRhdGUobW91c2VDb25zdHJhaW50LCBhbGxCb2RpZXMpO1xuICAgICAgICAgICAgX3RyaWdnZXJFdmVudHMobW91c2VDb25zdHJhaW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1vdXNlQ29uc3RyYWludDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gbW91c2UgY29uc3RyYWludC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgICogQHBhcmFtIHtNb3VzZUNvbnN0cmFpbnR9IG1vdXNlQ29uc3RyYWludFxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKi9cbiAgICBNb3VzZUNvbnN0cmFpbnQudXBkYXRlID0gZnVuY3Rpb24obW91c2VDb25zdHJhaW50LCBib2RpZXMpIHtcbiAgICAgICAgdmFyIG1vdXNlID0gbW91c2VDb25zdHJhaW50Lm1vdXNlLFxuICAgICAgICAgICAgY29uc3RyYWludCA9IG1vdXNlQ29uc3RyYWludC5jb25zdHJhaW50LFxuICAgICAgICAgICAgYm9keSA9IG1vdXNlQ29uc3RyYWludC5ib2R5O1xuXG4gICAgICAgIGlmIChtb3VzZS5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgIGlmICghY29uc3RyYWludC5ib2R5Qikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBib2RpZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChCb3VuZHMuY29udGFpbnMoYm9keS5ib3VuZHMsIG1vdXNlLnBvc2l0aW9uKSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBEZXRlY3Rvci5jYW5Db2xsaWRlKGJvZHkuY29sbGlzaW9uRmlsdGVyLCBtb3VzZUNvbnN0cmFpbnQuY29sbGlzaW9uRmlsdGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGJvZHkucGFydHMubGVuZ3RoID4gMSA/IDEgOiAwOyBqIDwgYm9keS5wYXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gYm9keS5wYXJ0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVmVydGljZXMuY29udGFpbnMocGFydC52ZXJ0aWNlcywgbW91c2UucG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQucG9pbnRBID0gbW91c2UucG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQuYm9keUIgPSBtb3VzZUNvbnN0cmFpbnQuYm9keSA9IGJvZHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQucG9pbnRCID0geyB4OiBtb3VzZS5wb3NpdGlvbi54IC0gYm9keS5wb3NpdGlvbi54LCB5OiBtb3VzZS5wb3NpdGlvbi55IC0gYm9keS5wb3NpdGlvbi55IH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQuYW5nbGVCID0gYm9keS5hbmdsZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTbGVlcGluZy5zZXQoYm9keSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFdmVudHMudHJpZ2dlcihtb3VzZUNvbnN0cmFpbnQsICdzdGFydGRyYWcnLCB7IG1vdXNlOiBtb3VzZSwgYm9keTogYm9keSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFNsZWVwaW5nLnNldChjb25zdHJhaW50LmJvZHlCLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgY29uc3RyYWludC5wb2ludEEgPSBtb3VzZS5wb3NpdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0cmFpbnQuYm9keUIgPSBtb3VzZUNvbnN0cmFpbnQuYm9keSA9IG51bGw7XG4gICAgICAgICAgICBjb25zdHJhaW50LnBvaW50QiA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChib2R5KVxuICAgICAgICAgICAgICAgIEV2ZW50cy50cmlnZ2VyKG1vdXNlQ29uc3RyYWludCwgJ2VuZGRyYWcnLCB7IG1vdXNlOiBtb3VzZSwgYm9keTogYm9keSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyBtb3VzZSBjb25zdHJhaW50IGV2ZW50cy5cbiAgICAgKiBAbWV0aG9kIF90cmlnZ2VyRXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge21vdXNlfSBtb3VzZUNvbnN0cmFpbnRcbiAgICAgKi9cbiAgICB2YXIgX3RyaWdnZXJFdmVudHMgPSBmdW5jdGlvbihtb3VzZUNvbnN0cmFpbnQpIHtcbiAgICAgICAgdmFyIG1vdXNlID0gbW91c2VDb25zdHJhaW50Lm1vdXNlLFxuICAgICAgICAgICAgbW91c2VFdmVudHMgPSBtb3VzZS5zb3VyY2VFdmVudHM7XG5cbiAgICAgICAgaWYgKG1vdXNlRXZlbnRzLm1vdXNlbW92ZSlcbiAgICAgICAgICAgIEV2ZW50cy50cmlnZ2VyKG1vdXNlQ29uc3RyYWludCwgJ21vdXNlbW92ZScsIHsgbW91c2U6IG1vdXNlIH0pO1xuXG4gICAgICAgIGlmIChtb3VzZUV2ZW50cy5tb3VzZWRvd24pXG4gICAgICAgICAgICBFdmVudHMudHJpZ2dlcihtb3VzZUNvbnN0cmFpbnQsICdtb3VzZWRvd24nLCB7IG1vdXNlOiBtb3VzZSB9KTtcblxuICAgICAgICBpZiAobW91c2VFdmVudHMubW91c2V1cClcbiAgICAgICAgICAgIEV2ZW50cy50cmlnZ2VyKG1vdXNlQ29uc3RyYWludCwgJ21vdXNldXAnLCB7IG1vdXNlOiBtb3VzZSB9KTtcblxuICAgICAgICAvLyByZXNldCB0aGUgbW91c2Ugc3RhdGUgcmVhZHkgZm9yIHRoZSBuZXh0IHN0ZXBcbiAgICAgICAgTW91c2UuY2xlYXJTb3VyY2VFdmVudHMobW91c2UpO1xuICAgIH07XG5cbiAgICAvKlxuICAgICpcbiAgICAqICBFdmVudHMgRG9jdW1lbnRhdGlvblxuICAgICpcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIHRoZSBtb3VzZSBoYXMgbW92ZWQgKG9yIGEgdG91Y2ggbW92ZXMpIGR1cmluZyB0aGUgbGFzdCBzdGVwXG4gICAgKlxuICAgICogQGV2ZW50IG1vdXNlbW92ZVxuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHttb3VzZX0gZXZlbnQubW91c2UgVGhlIGVuZ2luZSdzIG1vdXNlIGluc3RhbmNlXG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgd2hlbiB0aGUgbW91c2UgaXMgZG93biAob3IgYSB0b3VjaCBoYXMgc3RhcnRlZCkgZHVyaW5nIHRoZSBsYXN0IHN0ZXBcbiAgICAqXG4gICAgKiBAZXZlbnQgbW91c2Vkb3duXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge21vdXNlfSBldmVudC5tb3VzZSBUaGUgZW5naW5lJ3MgbW91c2UgaW5zdGFuY2VcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIHRoZSBtb3VzZSBpcyB1cCAob3IgYSB0b3VjaCBoYXMgZW5kZWQpIGR1cmluZyB0aGUgbGFzdCBzdGVwXG4gICAgKlxuICAgICogQGV2ZW50IG1vdXNldXBcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bW91c2V9IGV2ZW50Lm1vdXNlIFRoZSBlbmdpbmUncyBtb3VzZSBpbnN0YW5jZVxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIHdoZW4gdGhlIHVzZXIgc3RhcnRzIGRyYWdnaW5nIGEgYm9keVxuICAgICpcbiAgICAqIEBldmVudCBzdGFydGRyYWdcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bW91c2V9IGV2ZW50Lm1vdXNlIFRoZSBlbmdpbmUncyBtb3VzZSBpbnN0YW5jZVxuICAgICogQHBhcmFtIHtib2R5fSBldmVudC5ib2R5IFRoZSBib2R5IGJlaW5nIGRyYWdnZWRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCB3aGVuIHRoZSB1c2VyIGVuZHMgZHJhZ2dpbmcgYSBib2R5XG4gICAgKlxuICAgICogQGV2ZW50IGVuZGRyYWdcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bW91c2V9IGV2ZW50Lm1vdXNlIFRoZSBlbmdpbmUncyBtb3VzZSBpbnN0YW5jZVxuICAgICogQHBhcmFtIHtib2R5fSBldmVudC5ib2R5IFRoZSBib2R5IHRoYXQgaGFzIHN0b3BwZWQgYmVpbmcgZHJhZ2dlZFxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKlxuICAgICpcbiAgICAqICBQcm9wZXJ0aWVzIERvY3VtZW50YXRpb25cbiAgICAqXG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYFN0cmluZ2AgZGVub3RpbmcgdGhlIHR5cGUgb2Ygb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHR5cGVcbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKiBAZGVmYXVsdCBcImNvbnN0cmFpbnRcIlxuICAgICAqIEByZWFkT25seVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGBNb3VzZWAgaW5zdGFuY2UgaW4gdXNlLiBJZiBub3Qgc3VwcGxpZWQgaW4gYE1vdXNlQ29uc3RyYWludC5jcmVhdGVgLCBvbmUgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IG1vdXNlXG4gICAgICogQHR5cGUgbW91c2VcbiAgICAgKiBAZGVmYXVsdCBtb3VzZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogVGhlIGBCb2R5YCB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBtb3ZlZCBieSB0aGUgdXNlciwgb3IgYG51bGxgIGlmIG5vIGJvZHkuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgYm9keVxuICAgICAqIEB0eXBlIGJvZHlcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgYENvbnN0cmFpbnRgIG9iamVjdCB0aGF0IGlzIHVzZWQgdG8gbW92ZSB0aGUgYm9keSBkdXJpbmcgaW50ZXJhY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgY29uc3RyYWludFxuICAgICAqIEB0eXBlIGNvbnN0cmFpbnRcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGBPYmplY3RgIHRoYXQgc3BlY2lmaWVzIHRoZSBjb2xsaXNpb24gZmlsdGVyIHByb3BlcnRpZXMuXG4gICAgICogVGhlIGNvbGxpc2lvbiBmaWx0ZXIgYWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSB3aGljaCB0eXBlcyBvZiBib2R5IHRoaXMgbW91c2UgY29uc3RyYWludCBjYW4gaW50ZXJhY3Qgd2l0aC5cbiAgICAgKiBTZWUgYGJvZHkuY29sbGlzaW9uRmlsdGVyYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBjb2xsaXNpb25GaWx0ZXJcbiAgICAgKiBAdHlwZSBvYmplY3RcbiAgICAgKi9cblxufSkoKTtcblxufSx7XCIuLi9ib2R5L0NvbXBvc2l0ZVwiOjIsXCIuLi9jb2xsaXNpb24vRGV0ZWN0b3JcIjo1LFwiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2NvcmUvRXZlbnRzXCI6MTYsXCIuLi9jb3JlL01vdXNlXCI6MTksXCIuLi9jb3JlL1NsZWVwaW5nXCI6MjIsXCIuLi9nZW9tZXRyeS9Cb3VuZHNcIjoyNixcIi4uL2dlb21ldHJ5L1ZlcnRpY2VzXCI6MjksXCIuL0NvbnN0cmFpbnRcIjoxMn1dLDE0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5Db21tb25gIG1vZHVsZSBjb250YWlucyB1dGlsaXR5IGZ1bmN0aW9ucyB0aGF0IGFyZSBjb21tb24gdG8gYWxsIG1vZHVsZXMuXG4qXG4qIEBjbGFzcyBDb21tb25cbiovXG5cbnZhciBDb21tb24gPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21tb247XG5cbihmdW5jdGlvbigpIHtcblxuICAgIENvbW1vbi5fbmV4dElkID0gMDtcbiAgICBDb21tb24uX3NlZWQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogRXh0ZW5kcyB0aGUgb2JqZWN0IGluIHRoZSBmaXJzdCBhcmd1bWVudCB1c2luZyB0aGUgb2JqZWN0IGluIHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgICogQG1ldGhvZCBleHRlbmRcbiAgICAgKiBAcGFyYW0ge30gb2JqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBkZWVwXG4gICAgICogQHJldHVybiB7fSBvYmogZXh0ZW5kZWRcbiAgICAgKi9cbiAgICBDb21tb24uZXh0ZW5kID0gZnVuY3Rpb24ob2JqLCBkZWVwKSB7XG4gICAgICAgIHZhciBhcmdzU3RhcnQsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgZGVlcENsb25lO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZGVlcCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBhcmdzU3RhcnQgPSAyO1xuICAgICAgICAgICAgZGVlcENsb25lID0gZGVlcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZ3NTdGFydCA9IDE7XG4gICAgICAgICAgICBkZWVwQ2xvbmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgYXJnc1N0YXJ0KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmdzW2ldO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZXBDbG9uZSAmJiBzb3VyY2VbcHJvcF0gJiYgc291cmNlW3Byb3BdLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb2JqW3Byb3BdIHx8IG9ialtwcm9wXS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3Byb3BdID0gb2JqW3Byb3BdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbW1vbi5leHRlbmQob2JqW3Byb3BdLCBkZWVwQ2xvbmUsIHNvdXJjZVtwcm9wXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBjbG9uZSBvZiB0aGUgb2JqZWN0LCBpZiBkZWVwIGlzIHRydWUgcmVmZXJlbmNlcyB3aWxsIGFsc28gYmUgY2xvbmVkLlxuICAgICAqIEBtZXRob2QgY2xvbmVcbiAgICAgKiBAcGFyYW0ge30gb2JqXG4gICAgICogQHBhcmFtIHtib29sfSBkZWVwXG4gICAgICogQHJldHVybiB7fSBvYmogY2xvbmVkXG4gICAgICovXG4gICAgQ29tbW9uLmNsb25lID0gZnVuY3Rpb24ob2JqLCBkZWVwKSB7XG4gICAgICAgIHJldHVybiBDb21tb24uZXh0ZW5kKHt9LCBkZWVwLCBvYmopO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGtleXMgZm9yIHRoZSBnaXZlbiBvYmplY3QuXG4gICAgICogQG1ldGhvZCBrZXlzXG4gICAgICogQHBhcmFtIHt9IG9ialxuICAgICAqIEByZXR1cm4ge3N0cmluZ1tdfSBrZXlzXG4gICAgICovXG4gICAgQ29tbW9uLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKVxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG5cbiAgICAgICAgLy8gYXZvaWQgaGFzT3duUHJvcGVydHkgZm9yIHBlcmZvcm1hbmNlXG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopXG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxpc3Qgb2YgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgICAqIEBtZXRob2QgdmFsdWVzXG4gICAgICogQHBhcmFtIHt9IG9ialxuICAgICAqIEByZXR1cm4ge2FycmF5fSBBcnJheSBvZiB0aGUgb2JqZWN0cyBwcm9wZXJ0eSB2YWx1ZXNcbiAgICAgKi9cbiAgICBDb21tb24udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmIChPYmplY3Qua2V5cykge1xuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2gob2JqW2tleXNbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGF2b2lkIGhhc093blByb3BlcnR5IGZvciBwZXJmb3JtYW5jZVxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKVxuICAgICAgICAgICAgdmFsdWVzLnB1c2gob2JqW2tleV0pO1xuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgdmFsdWUgZnJvbSBgYmFzZWAgcmVsYXRpdmUgdG8gdGhlIGBwYXRoYCBzdHJpbmcuXG4gICAgICogQG1ldGhvZCBnZXRcbiAgICAgKiBAcGFyYW0ge30gb2JqIFRoZSBiYXNlIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHJlbGF0aXZlIHRvIGBiYXNlYCwgZS5nLiAnRm9vLkJhci5iYXonXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtiZWdpbl0gUGF0aCBzbGljZSBiZWdpblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kXSBQYXRoIHNsaWNlIGVuZFxuICAgICAqIEByZXR1cm4ge30gVGhlIG9iamVjdCBhdCB0aGUgZ2l2ZW4gcGF0aFxuICAgICAqL1xuICAgIENvbW1vbi5nZXQgPSBmdW5jdGlvbihvYmosIHBhdGgsIGJlZ2luLCBlbmQpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3BsaXQoJy4nKS5zbGljZShiZWdpbiwgZW5kKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBvbiBgYmFzZWAgcmVsYXRpdmUgdG8gdGhlIGdpdmVuIGBwYXRoYCBzdHJpbmcuXG4gICAgICogQG1ldGhvZCBzZXRcbiAgICAgKiBAcGFyYW0ge30gb2JqIFRoZSBiYXNlIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHJlbGF0aXZlIHRvIGBiYXNlYCwgZS5nLiAnRm9vLkJhci5iYXonXG4gICAgICogQHBhcmFtIHt9IHZhbCBUaGUgdmFsdWUgdG8gc2V0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtiZWdpbl0gUGF0aCBzbGljZSBiZWdpblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kXSBQYXRoIHNsaWNlIGVuZFxuICAgICAqIEByZXR1cm4ge30gUGFzcyB0aHJvdWdoIGB2YWxgIGZvciBjaGFpbmluZ1xuICAgICAqL1xuICAgIENvbW1vbi5zZXQgPSBmdW5jdGlvbihvYmosIHBhdGgsIHZhbCwgYmVnaW4sIGVuZCkge1xuICAgICAgICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJykuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICAgIENvbW1vbi5nZXQob2JqLCBwYXRoLCAwLCAtMSlbcGFydHNbcGFydHMubGVuZ3RoIC0gMV1dID0gdmFsO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgaGV4IGNvbG91ciBzdHJpbmcgbWFkZSBieSBsaWdodGVuaW5nIG9yIGRhcmtlbmluZyBjb2xvciBieSBwZXJjZW50LlxuICAgICAqIEBtZXRob2Qgc2hhZGVDb2xvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50XG4gICAgICogQHJldHVybiB7c3RyaW5nfSBBIGhleCBjb2xvdXJcbiAgICAgKi9cbiAgICBDb21tb24uc2hhZGVDb2xvciA9IGZ1bmN0aW9uKGNvbG9yLCBwZXJjZW50KSB7ICAgXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTU2MDI0OC9wcm9ncmFtbWF0aWNhbGx5LWxpZ2h0ZW4tb3ItZGFya2VuLWEtaGV4LWNvbG9yXG4gICAgICAgIHZhciBjb2xvckludGVnZXIgPSBwYXJzZUludChjb2xvci5zbGljZSgxKSwxNiksIFxuICAgICAgICAgICAgYW1vdW50ID0gTWF0aC5yb3VuZCgyLjU1ICogcGVyY2VudCksIFxuICAgICAgICAgICAgUiA9IChjb2xvckludGVnZXIgPj4gMTYpICsgYW1vdW50LCBcbiAgICAgICAgICAgIEIgPSAoY29sb3JJbnRlZ2VyID4+IDggJiAweDAwRkYpICsgYW1vdW50LCBcbiAgICAgICAgICAgIEcgPSAoY29sb3JJbnRlZ2VyICYgMHgwMDAwRkYpICsgYW1vdW50O1xuICAgICAgICByZXR1cm4gXCIjXCIgKyAoMHgxMDAwMDAwICsgKFIgPCAyNTUgPyBSIDwgMSA/IDAgOiBSIDoyNTUpICogMHgxMDAwMCBcbiAgICAgICAgICAgICAgICArIChCIDwgMjU1ID8gQiA8IDEgPyAwIDogQiA6IDI1NSkgKiAweDEwMCBcbiAgICAgICAgICAgICAgICArIChHIDwgMjU1ID8gRyA8IDEgPyAwIDogRyA6IDI1NSkpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2h1ZmZsZXMgdGhlIGdpdmVuIGFycmF5IGluLXBsYWNlLlxuICAgICAqIFRoZSBmdW5jdGlvbiB1c2VzIGEgc2VlZGVkIHJhbmRvbSBnZW5lcmF0b3IuXG4gICAgICogQG1ldGhvZCBzaHVmZmxlXG4gICAgICogQHBhcmFtIHthcnJheX0gYXJyYXlcbiAgICAgKiBAcmV0dXJuIHthcnJheX0gYXJyYXkgc2h1ZmZsZWQgcmFuZG9tbHlcbiAgICAgKi9cbiAgICBDb21tb24uc2h1ZmZsZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoQ29tbW9uLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgICAgICB2YXIgdGVtcCA9IGFycmF5W2ldO1xuICAgICAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcbiAgICAgICAgICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJhbmRvbWx5IGNob29zZXMgYSB2YWx1ZSBmcm9tIGEgbGlzdCB3aXRoIGVxdWFsIHByb2JhYmlsaXR5LlxuICAgICAqIFRoZSBmdW5jdGlvbiB1c2VzIGEgc2VlZGVkIHJhbmRvbSBnZW5lcmF0b3IuXG4gICAgICogQG1ldGhvZCBjaG9vc2VcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBjaG9pY2VzXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBBIHJhbmRvbSBjaG9pY2Ugb2JqZWN0IGZyb20gdGhlIGFycmF5XG4gICAgICovXG4gICAgQ29tbW9uLmNob29zZSA9IGZ1bmN0aW9uKGNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZXNbTWF0aC5mbG9vcihDb21tb24ucmFuZG9tKCkgKiBjaG9pY2VzLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBpcyBhIEhUTUxFbGVtZW50LCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICogQG1ldGhvZCBpc0VsZW1lbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb2JqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIGEgSFRNTEVsZW1lbnQsIG90aGVyd2lzZSBmYWxzZVxuICAgICAqL1xuICAgIENvbW1vbi5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODQyODYvamF2YXNjcmlwdC1pc2RvbS1ob3ctZG8teW91LWNoZWNrLWlmLWEtamF2YXNjcmlwdC1vYmplY3QtaXMtYS1kb20tb2JqZWN0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBvYmo9PT1cIm9iamVjdFwiKSAmJlxuICAgICAgICAgICAgICAob2JqLm5vZGVUeXBlPT09MSkgJiYgKHR5cGVvZiBvYmouc3R5bGUgPT09IFwib2JqZWN0XCIpICYmXG4gICAgICAgICAgICAgICh0eXBlb2Ygb2JqLm93bmVyRG9jdW1lbnQgPT09XCJvYmplY3RcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgaXMgYW4gYXJyYXkuXG4gICAgICogQG1ldGhvZCBpc0FycmF5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9ialxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9iamVjdCBpcyBhbiBhcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgQ29tbW9uLmlzQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBpcyBhIGZ1bmN0aW9uLlxuICAgICAqIEBtZXRob2QgaXNGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvYmpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBvYmplY3QgaXMgYSBmdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgQ29tbW9uLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgaXMgYSBwbGFpbiBvYmplY3QuXG4gICAgICogQG1ldGhvZCBpc1BsYWluT2JqZWN0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9ialxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9iamVjdCBpcyBhIHBsYWluIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgQ29tbW9uLmlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBpcyBhIHN0cmluZy5cbiAgICAgKiBAbWV0aG9kIGlzU3RyaW5nXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9ialxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9iamVjdCBpcyBhIHN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgQ29tbW9uLmlzU3RyaW5nID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZ2l2ZW4gdmFsdWUgY2xhbXBlZCBiZXR3ZWVuIGEgbWluaW11bSBhbmQgbWF4aW11bSB2YWx1ZS5cbiAgICAgKiBAbWV0aG9kIGNsYW1wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB2YWx1ZSBjbGFtcGVkIGJldHdlZW4gbWluIGFuZCBtYXggaW5jbHVzaXZlXG4gICAgICovXG4gICAgQ29tbW9uLmNsYW1wID0gZnVuY3Rpb24odmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgICAgIGlmICh2YWx1ZSA8IG1pbilcbiAgICAgICAgICAgIHJldHVybiBtaW47XG4gICAgICAgIGlmICh2YWx1ZSA+IG1heClcbiAgICAgICAgICAgIHJldHVybiBtYXg7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNpZ24gb2YgdGhlIGdpdmVuIHZhbHVlLlxuICAgICAqIEBtZXRob2Qgc2lnblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLTEgaWYgbmVnYXRpdmUsICsxIGlmIDAgb3IgcG9zaXRpdmVcbiAgICAgKi9cbiAgICBDb21tb24uc2lnbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAtMSA6IDE7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHRpbWVzdGFtcCAoaGlnaC1yZXMgaWYgYXZhaWxhYmxlKS5cbiAgICAgKiBAbWV0aG9kIG5vd1xuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGN1cnJlbnQgdGltZXN0YW1wIChoaWdoLXJlcyBpZiBhdmFpbGFibGUpXG4gICAgICovXG4gICAgQ29tbW9uLm5vdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIyMTI5NC9ob3ctZG8teW91LWdldC1hLXRpbWVzdGFtcC1pbi1qYXZhc2NyaXB0XG4gICAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2Rhdmlkd2F0ZXJzdG9uLzI5ODI1MzFcblxuICAgICAgICB2YXIgcGVyZm9ybWFuY2UgPSB3aW5kb3cucGVyZm9ybWFuY2UgfHwge307XG5cbiAgICAgICAgcGVyZm9ybWFuY2Uubm93ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdyAgICB8fFxuICAgICAgICAgICAgcGVyZm9ybWFuY2Uud2Via2l0Tm93ICAgICB8fFxuICAgICAgICAgICAgcGVyZm9ybWFuY2UubXNOb3cgICAgICAgICB8fFxuICAgICAgICAgICAgcGVyZm9ybWFuY2Uub05vdyAgICAgICAgICB8fFxuICAgICAgICAgICAgcGVyZm9ybWFuY2UubW96Tm93ICAgICAgICB8fFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiArKG5ldyBEYXRlKCkpOyB9O1xuICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSB2YWx1ZSBiZXR3ZWVuIGEgbWluaW11bSBhbmQgYSBtYXhpbXVtIHZhbHVlIGluY2x1c2l2ZS5cbiAgICAgKiBUaGUgZnVuY3Rpb24gdXNlcyBhIHNlZWRlZCByYW5kb20gZ2VuZXJhdG9yLlxuICAgICAqIEBtZXRob2QgcmFuZG9tXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IEEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IGluY2x1c2l2ZVxuICAgICAqL1xuICAgIENvbW1vbi5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgICAgICBtaW4gPSAodHlwZW9mIG1pbiAhPT0gXCJ1bmRlZmluZWRcIikgPyBtaW4gOiAwO1xuICAgICAgICBtYXggPSAodHlwZW9mIG1heCAhPT0gXCJ1bmRlZmluZWRcIikgPyBtYXggOiAxO1xuICAgICAgICByZXR1cm4gbWluICsgX3NlZWRlZFJhbmRvbSgpICogKG1heCAtIG1pbik7XG4gICAgfTtcblxuICAgIHZhciBfc2VlZGVkUmFuZG9tID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL25ncnltYW4vMzgzMDQ4OVxuICAgICAgICBDb21tb24uX3NlZWQgPSAoQ29tbW9uLl9zZWVkICogOTMwMSArIDQ5Mjk3KSAlIDIzMzI4MDtcbiAgICAgICAgcmV0dXJuIENvbW1vbi5fc2VlZCAvIDIzMzI4MDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBDU1MgaGV4IGNvbG91ciBzdHJpbmcgaW50byBhbiBpbnRlZ2VyLlxuICAgICAqIEBtZXRob2QgY29sb3JUb051bWJlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvclN0cmluZ1xuICAgICAqIEByZXR1cm4ge251bWJlcn0gQW4gaW50ZWdlciByZXByZXNlbnRpbmcgdGhlIENTUyBoZXggc3RyaW5nXG4gICAgICovXG4gICAgQ29tbW9uLmNvbG9yVG9OdW1iZXIgPSBmdW5jdGlvbihjb2xvclN0cmluZykge1xuICAgICAgICBjb2xvclN0cmluZyA9IGNvbG9yU3RyaW5nLnJlcGxhY2UoJyMnLCcnKTtcblxuICAgICAgICBpZiAoY29sb3JTdHJpbmcubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgIGNvbG9yU3RyaW5nID0gY29sb3JTdHJpbmcuY2hhckF0KDApICsgY29sb3JTdHJpbmcuY2hhckF0KDApXG4gICAgICAgICAgICAgICAgICAgICAgICArIGNvbG9yU3RyaW5nLmNoYXJBdCgxKSArIGNvbG9yU3RyaW5nLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBjb2xvclN0cmluZy5jaGFyQXQoMikgKyBjb2xvclN0cmluZy5jaGFyQXQoMik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoY29sb3JTdHJpbmcsIDE2KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbnNvbGUgbG9nZ2luZyBsZXZlbCB0byB1c2UsIHdoZXJlIGVhY2ggbGV2ZWwgaW5jbHVkZXMgYWxsIGxldmVscyBhYm92ZSBhbmQgZXhjbHVkZXMgdGhlIGxldmVscyBiZWxvdy5cbiAgICAgKiBUaGUgZGVmYXVsdCBsZXZlbCBpcyAnZGVidWcnIHdoaWNoIHNob3dzIGFsbCBjb25zb2xlIG1lc3NhZ2VzLiAgXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSBsZXZlbCB2YWx1ZXMgYXJlOlxuICAgICAqIC0gMCA9IE5vbmVcbiAgICAgKiAtIDEgPSBEZWJ1Z1xuICAgICAqIC0gMiA9IEluZm9cbiAgICAgKiAtIDMgPSBXYXJuXG4gICAgICogLSA0ID0gRXJyb3JcbiAgICAgKiBAcHJvcGVydHkgQ29tbW9uLmxvZ0xldmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICovXG4gICAgQ29tbW9uLmxvZ0xldmVsID0gMTtcblxuICAgIC8qKlxuICAgICAqIFNob3dzIGEgYGNvbnNvbGUubG9nYCBtZXNzYWdlIG9ubHkgaWYgdGhlIGN1cnJlbnQgYENvbW1vbi5sb2dMZXZlbGAgYWxsb3dzIGl0LlxuICAgICAqIFRoZSBtZXNzYWdlIHdpbGwgYmUgcHJlZml4ZWQgd2l0aCAnbWF0dGVyLWpzJyB0byBtYWtlIGl0IGVhc2lseSBpZGVudGlmaWFibGUuXG4gICAgICogQG1ldGhvZCBsb2dcbiAgICAgKiBAcGFyYW0gLi4ub2JqcyB7fSBUaGUgb2JqZWN0cyB0byBsb2cuXG4gICAgICovXG4gICAgQ29tbW9uLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY29uc29sZSAmJiBDb21tb24ubG9nTGV2ZWwgPiAwICYmIENvbW1vbi5sb2dMZXZlbCA8PSAzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBbJ21hdHRlci1qczonXS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNob3dzIGEgYGNvbnNvbGUuaW5mb2AgbWVzc2FnZSBvbmx5IGlmIHRoZSBjdXJyZW50IGBDb21tb24ubG9nTGV2ZWxgIGFsbG93cyBpdC5cbiAgICAgKiBUaGUgbWVzc2FnZSB3aWxsIGJlIHByZWZpeGVkIHdpdGggJ21hdHRlci1qcycgdG8gbWFrZSBpdCBlYXNpbHkgaWRlbnRpZmlhYmxlLlxuICAgICAqIEBtZXRob2QgaW5mb1xuICAgICAqIEBwYXJhbSAuLi5vYmpzIHt9IFRoZSBvYmplY3RzIHRvIGxvZy5cbiAgICAgKi9cbiAgICBDb21tb24uaW5mbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY29uc29sZSAmJiBDb21tb24ubG9nTGV2ZWwgPiAwICYmIENvbW1vbi5sb2dMZXZlbCA8PSAyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8uYXBwbHkoY29uc29sZSwgWydtYXR0ZXItanM6J10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBhIGBjb25zb2xlLndhcm5gIG1lc3NhZ2Ugb25seSBpZiB0aGUgY3VycmVudCBgQ29tbW9uLmxvZ0xldmVsYCBhbGxvd3MgaXQuXG4gICAgICogVGhlIG1lc3NhZ2Ugd2lsbCBiZSBwcmVmaXhlZCB3aXRoICdtYXR0ZXItanMnIHRvIG1ha2UgaXQgZWFzaWx5IGlkZW50aWZpYWJsZS5cbiAgICAgKiBAbWV0aG9kIHdhcm5cbiAgICAgKiBAcGFyYW0gLi4ub2JqcyB7fSBUaGUgb2JqZWN0cyB0byBsb2cuXG4gICAgICovXG4gICAgQ29tbW9uLndhcm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNvbnNvbGUgJiYgQ29tbW9uLmxvZ0xldmVsID4gMCAmJiBDb21tb24ubG9nTGV2ZWwgPD0gMykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIFsnbWF0dGVyLWpzOiddLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCB1bmlxdWUgc2VxdWVudGlhbCBJRC5cbiAgICAgKiBAbWV0aG9kIG5leHRJZFxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVW5pcXVlIHNlcXVlbnRpYWwgSURcbiAgICAgKi9cbiAgICBDb21tb24ubmV4dElkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBDb21tb24uX25leHRJZCsrO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBIGNyb3NzIGJyb3dzZXIgY29tcGF0aWJsZSBpbmRleE9mIGltcGxlbWVudGF0aW9uLlxuICAgICAqIEBtZXRob2QgaW5kZXhPZlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGhheXN0YWNrXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5lZWRsZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIHBvc2l0aW9uIG9mIG5lZWRsZSBpbiBoYXlzdGFjaywgb3RoZXJ3aXNlIC0xLlxuICAgICAqL1xuICAgIENvbW1vbi5pbmRleE9mID0gZnVuY3Rpb24oaGF5c3RhY2ssIG5lZWRsZSkge1xuICAgICAgICBpZiAoaGF5c3RhY2suaW5kZXhPZilcbiAgICAgICAgICAgIHJldHVybiBoYXlzdGFjay5pbmRleE9mKG5lZWRsZSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYXlzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGhheXN0YWNrW2ldID09PSBuZWVkbGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEEgY3Jvc3MgYnJvd3NlciBjb21wYXRpYmxlIGFycmF5IG1hcCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgKiBAbWV0aG9kIG1hcFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGxpc3RcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jXG4gICAgICogQHJldHVybiB7YXJyYXl9IFZhbHVlcyBmcm9tIGxpc3QgdHJhbnNmb3JtZWQgYnkgZnVuYy5cbiAgICAgKi9cbiAgICBDb21tb24ubWFwID0gZnVuY3Rpb24obGlzdCwgZnVuYykge1xuICAgICAgICBpZiAobGlzdC5tYXApIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0Lm1hcChmdW5jKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXBwZWQgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIG1hcHBlZC5wdXNoKGZ1bmMobGlzdFtpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hcHBlZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBkaXJlY3RlZCBncmFwaCBhbmQgcmV0dXJucyB0aGUgcGFydGlhbGx5IG9yZGVyZWQgc2V0IG9mIHZlcnRpY2VzIGluIHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgICAqIENpcmN1bGFyIGRlcGVuZGVuY2llcyBhcmUgYWxsb3dlZC5cbiAgICAgKiBAbWV0aG9kIHRvcG9sb2dpY2FsU29ydFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBncmFwaFxuICAgICAqIEByZXR1cm4ge2FycmF5fSBQYXJ0aWFsbHkgb3JkZXJlZCBzZXQgb2YgdmVydGljZXMgaW4gdG9wb2xvZ2ljYWwgb3JkZXIuXG4gICAgICovXG4gICAgQ29tbW9uLnRvcG9sb2dpY2FsU29ydCA9IGZ1bmN0aW9uKGdyYXBoKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vbWdlY2hldi5naXRodWIuaW8vamF2YXNjcmlwdC1hbGdvcml0aG1zL2dyYXBoc19vdGhlcnNfdG9wb2xvZ2ljYWwtc29ydC5qcy5odG1sXG4gICAgICAgIHZhciByZXN1bHQgPSBbXSxcbiAgICAgICAgICAgIHZpc2l0ZWQgPSBbXSxcbiAgICAgICAgICAgIHRlbXAgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBub2RlIGluIGdyYXBoKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWRbbm9kZV0gJiYgIXRlbXBbbm9kZV0pIHtcbiAgICAgICAgICAgICAgICBfdG9wb2xvZ2ljYWxTb3J0KG5vZGUsIHZpc2l0ZWQsIHRlbXAsIGdyYXBoLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdmFyIF90b3BvbG9naWNhbFNvcnQgPSBmdW5jdGlvbihub2RlLCB2aXNpdGVkLCB0ZW1wLCBncmFwaCwgcmVzdWx0KSB7XG4gICAgICAgIHZhciBuZWlnaGJvcnMgPSBncmFwaFtub2RlXSB8fCBbXTtcbiAgICAgICAgdGVtcFtub2RlXSA9IHRydWU7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZWlnaGJvcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHZhciBuZWlnaGJvciA9IG5laWdoYm9yc1tpXTtcblxuICAgICAgICAgICAgaWYgKHRlbXBbbmVpZ2hib3JdKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF2aXNpdGVkW25laWdoYm9yXSkge1xuICAgICAgICAgICAgICAgIF90b3BvbG9naWNhbFNvcnQobmVpZ2hib3IsIHZpc2l0ZWQsIHRlbXAsIGdyYXBoLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGVtcFtub2RlXSA9IGZhbHNlO1xuICAgICAgICB2aXNpdGVkW25vZGVdID0gdHJ1ZTtcblxuICAgICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGFrZXMgX25fIGZ1bmN0aW9ucyBhcyBhcmd1bWVudHMgYW5kIHJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGVtIGluIG9yZGVyLlxuICAgICAqIFRoZSBhcmd1bWVudHMgYXBwbGllZCB3aGVuIGNhbGxpbmcgdGhlIG5ldyBmdW5jdGlvbiB3aWxsIGFsc28gYmUgYXBwbGllZCB0byBldmVyeSBmdW5jdGlvbiBwYXNzZWQuXG4gICAgICogVGhlIHZhbHVlIG9mIGB0aGlzYCByZWZlcnMgdG8gdGhlIGxhc3QgdmFsdWUgcmV0dXJuZWQgaW4gdGhlIGNoYWluIHRoYXQgd2FzIG5vdCBgdW5kZWZpbmVkYC5cbiAgICAgKiBUaGVyZWZvcmUgaWYgYSBwYXNzZWQgZnVuY3Rpb24gZG9lcyBub3QgcmV0dXJuIGEgdmFsdWUsIHRoZSBwcmV2aW91c2x5IHJldHVybmVkIHZhbHVlIGlzIG1haW50YWluZWQuXG4gICAgICogQWZ0ZXIgYWxsIHBhc3NlZCBmdW5jdGlvbnMgaGF2ZSBiZWVuIGNhbGxlZCB0aGUgbmV3IGZ1bmN0aW9uIHJldHVybnMgdGhlIGxhc3QgcmV0dXJuZWQgdmFsdWUgKGlmIGFueSkuXG4gICAgICogSWYgYW55IG9mIHRoZSBwYXNzZWQgZnVuY3Rpb25zIGFyZSBhIGNoYWluLCB0aGVuIHRoZSBjaGFpbiB3aWxsIGJlIGZsYXR0ZW5lZC5cbiAgICAgKiBAbWV0aG9kIGNoYWluXG4gICAgICogQHBhcmFtIC4uLmZ1bmNzIHtmdW5jdGlvbn0gVGhlIGZ1bmN0aW9ucyB0byBjaGFpbi5cbiAgICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgcGFzc2VkIGZ1bmN0aW9ucyBpbiBvcmRlci5cbiAgICAgKi9cbiAgICBDb21tb24uY2hhaW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgZnVuY3MgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHZhciBmdW5jID0gYXJnc1tpXTtcblxuICAgICAgICAgICAgaWYgKGZ1bmMuX2NoYWluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBmbGF0dGVuIGFscmVhZHkgY2hhaW5lZCBmdW5jdGlvbnNcbiAgICAgICAgICAgICAgICBmdW5jcy5wdXNoLmFwcGx5KGZ1bmNzLCBmdW5jLl9jaGFpbmVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnVuY3MucHVzaChmdW5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGFpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxhc3RSZXN1bHQ7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnVuY3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gZnVuY3NbaV0uYXBwbHkobGFzdFJlc3VsdCwgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBsYXN0UmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGxhc3RSZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgY2hhaW4uX2NoYWluZWQgPSBmdW5jcztcblxuICAgICAgICByZXR1cm4gY2hhaW47XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYWlucyBhIGZ1bmN0aW9uIHRvIGV4Y3V0ZSBiZWZvcmUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIG9uIHRoZSBnaXZlbiBgcGF0aGAgcmVsYXRpdmUgdG8gYGJhc2VgLlxuICAgICAqIFNlZSBhbHNvIGRvY3MgZm9yIGBDb21tb24uY2hhaW5gLlxuICAgICAqIEBtZXRob2QgY2hhaW5QYXRoQmVmb3JlXG4gICAgICogQHBhcmFtIHt9IGJhc2UgVGhlIGJhc2Ugb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIHBhdGggcmVsYXRpdmUgdG8gYGJhc2VgXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hhaW4gYmVmb3JlIHRoZSBvcmlnaW5hbFxuICAgICAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgY2hhaW5lZCBmdW5jdGlvbiB0aGF0IHJlcGxhY2VkIHRoZSBvcmlnaW5hbFxuICAgICAqL1xuICAgIENvbW1vbi5jaGFpblBhdGhCZWZvcmUgPSBmdW5jdGlvbihiYXNlLCBwYXRoLCBmdW5jKSB7XG4gICAgICAgIHJldHVybiBDb21tb24uc2V0KGJhc2UsIHBhdGgsIENvbW1vbi5jaGFpbihcbiAgICAgICAgICAgIGZ1bmMsXG4gICAgICAgICAgICBDb21tb24uZ2V0KGJhc2UsIHBhdGgpXG4gICAgICAgICkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGFpbnMgYSBmdW5jdGlvbiB0byBleGN1dGUgYWZ0ZXIgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIG9uIHRoZSBnaXZlbiBgcGF0aGAgcmVsYXRpdmUgdG8gYGJhc2VgLlxuICAgICAqIFNlZSBhbHNvIGRvY3MgZm9yIGBDb21tb24uY2hhaW5gLlxuICAgICAqIEBtZXRob2QgY2hhaW5QYXRoQWZ0ZXJcbiAgICAgKiBAcGFyYW0ge30gYmFzZSBUaGUgYmFzZSBvYmplY3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCByZWxhdGl2ZSB0byBgYmFzZWBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGFpbiBhZnRlciB0aGUgb3JpZ2luYWxcbiAgICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGNoYWluZWQgZnVuY3Rpb24gdGhhdCByZXBsYWNlZCB0aGUgb3JpZ2luYWxcbiAgICAgKi9cbiAgICBDb21tb24uY2hhaW5QYXRoQWZ0ZXIgPSBmdW5jdGlvbihiYXNlLCBwYXRoLCBmdW5jKSB7XG4gICAgICAgIHJldHVybiBDb21tb24uc2V0KGJhc2UsIHBhdGgsIENvbW1vbi5jaGFpbihcbiAgICAgICAgICAgIENvbW1vbi5nZXQoYmFzZSwgcGF0aCksXG4gICAgICAgICAgICBmdW5jXG4gICAgICAgICkpO1xuICAgIH07XG5cbn0pKCk7XG5cbn0se31dLDE1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5FbmdpbmVgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIGVuZ2luZXMuXG4qIEFuIGVuZ2luZSBpcyBhIGNvbnRyb2xsZXIgdGhhdCBtYW5hZ2VzIHVwZGF0aW5nIHRoZSBzaW11bGF0aW9uIG9mIHRoZSB3b3JsZC5cbiogU2VlIGBNYXR0ZXIuUnVubmVyYCBmb3IgYW4gb3B0aW9uYWwgZ2FtZSBsb29wIHV0aWxpdHkuXG4qXG4qIFNlZSB0aGUgaW5jbHVkZWQgdXNhZ2UgW2V4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbGlhYnJ1L21hdHRlci1qcy90cmVlL21hc3Rlci9leGFtcGxlcykuXG4qXG4qIEBjbGFzcyBFbmdpbmVcbiovXG5cbnZhciBFbmdpbmUgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmU7XG5cbnZhciBXb3JsZCA9IF9kZXJlcV8oJy4uL2JvZHkvV29ybGQnKTtcbnZhciBTbGVlcGluZyA9IF9kZXJlcV8oJy4vU2xlZXBpbmcnKTtcbnZhciBSZXNvbHZlciA9IF9kZXJlcV8oJy4uL2NvbGxpc2lvbi9SZXNvbHZlcicpO1xudmFyIFJlbmRlciA9IF9kZXJlcV8oJy4uL3JlbmRlci9SZW5kZXInKTtcbnZhciBQYWlycyA9IF9kZXJlcV8oJy4uL2NvbGxpc2lvbi9QYWlycycpO1xudmFyIE1ldHJpY3MgPSBfZGVyZXFfKCcuL01ldHJpY3MnKTtcbnZhciBHcmlkID0gX2RlcmVxXygnLi4vY29sbGlzaW9uL0dyaWQnKTtcbnZhciBFdmVudHMgPSBfZGVyZXFfKCcuL0V2ZW50cycpO1xudmFyIENvbXBvc2l0ZSA9IF9kZXJlcV8oJy4uL2JvZHkvQ29tcG9zaXRlJyk7XG52YXIgQ29uc3RyYWludCA9IF9kZXJlcV8oJy4uL2NvbnN0cmFpbnQvQ29uc3RyYWludCcpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4vQ29tbW9uJyk7XG52YXIgQm9keSA9IF9kZXJlcV8oJy4uL2JvZHkvQm9keScpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGVuZ2luZS4gVGhlIG9wdGlvbnMgcGFyYW1ldGVyIGlzIGFuIG9iamVjdCB0aGF0IHNwZWNpZmllcyBhbnkgcHJvcGVydGllcyB5b3Ugd2lzaCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHMuXG4gICAgICogQWxsIHByb3BlcnRpZXMgaGF2ZSBkZWZhdWx0IHZhbHVlcywgYW5kIG1hbnkgYXJlIHByZS1jYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkgYmFzZWQgb24gb3RoZXIgcHJvcGVydGllcy5cbiAgICAgKiBTZWUgdGhlIHByb3BlcnRpZXMgc2VjdGlvbiBiZWxvdyBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gd2hhdCB5b3UgY2FuIHBhc3MgdmlhIHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICAgICAqIEByZXR1cm4ge2VuZ2luZX0gZW5naW5lXG4gICAgICovXG4gICAgRW5naW5lLmNyZWF0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gb3B0aW9ucyBtYXkgYmUgcGFzc2VkIGFzIHRoZSBmaXJzdCAoYW5kIG9ubHkpIGFyZ3VtZW50XG4gICAgICAgIG9wdGlvbnMgPSBDb21tb24uaXNFbGVtZW50KGVsZW1lbnQpID8gb3B0aW9ucyA6IGVsZW1lbnQ7XG4gICAgICAgIGVsZW1lbnQgPSBDb21tb24uaXNFbGVtZW50KGVsZW1lbnQpID8gZWxlbWVudCA6IG51bGw7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGlmIChlbGVtZW50IHx8IG9wdGlvbnMucmVuZGVyKSB7XG4gICAgICAgICAgICBDb21tb24ud2FybignRW5naW5lLmNyZWF0ZTogZW5naW5lLnJlbmRlciBpcyBkZXByZWNhdGVkIChzZWUgZG9jcyknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uSXRlcmF0aW9uczogNixcbiAgICAgICAgICAgIHZlbG9jaXR5SXRlcmF0aW9uczogNCxcbiAgICAgICAgICAgIGNvbnN0cmFpbnRJdGVyYXRpb25zOiAyLFxuICAgICAgICAgICAgZW5hYmxlU2xlZXBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgICAgIHRpbWluZzoge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogMCxcbiAgICAgICAgICAgICAgICB0aW1lU2NhbGU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBicm9hZHBoYXNlOiB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogR3JpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBDb21tb24uZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBAZGVwcmVjYXRlZFxuICAgICAgICBpZiAoZWxlbWVudCB8fCBlbmdpbmUucmVuZGVyKSB7XG4gICAgICAgICAgICB2YXIgcmVuZGVyRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBSZW5kZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVuZ2luZS5yZW5kZXIgPSBDb21tb24uZXh0ZW5kKHJlbmRlckRlZmF1bHRzLCBlbmdpbmUucmVuZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEBkZXByZWNhdGVkXG4gICAgICAgIGlmIChlbmdpbmUucmVuZGVyICYmIGVuZ2luZS5yZW5kZXIuY29udHJvbGxlcikge1xuICAgICAgICAgICAgZW5naW5lLnJlbmRlciA9IGVuZ2luZS5yZW5kZXIuY29udHJvbGxlci5jcmVhdGUoZW5naW5lLnJlbmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBAZGVwcmVjYXRlZFxuICAgICAgICBpZiAoZW5naW5lLnJlbmRlcikge1xuICAgICAgICAgICAgZW5naW5lLnJlbmRlci5lbmdpbmUgPSBlbmdpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBlbmdpbmUud29ybGQgPSBvcHRpb25zLndvcmxkIHx8IFdvcmxkLmNyZWF0ZShlbmdpbmUud29ybGQpO1xuICAgICAgICBlbmdpbmUucGFpcnMgPSBQYWlycy5jcmVhdGUoKTtcbiAgICAgICAgZW5naW5lLmJyb2FkcGhhc2UgPSBlbmdpbmUuYnJvYWRwaGFzZS5jb250cm9sbGVyLmNyZWF0ZShlbmdpbmUuYnJvYWRwaGFzZSk7XG4gICAgICAgIGVuZ2luZS5tZXRyaWNzID0gZW5naW5lLm1ldHJpY3MgfHwgeyBleHRlbmRlZDogZmFsc2UgfTtcblxuXG4gICAgICAgIHJldHVybiBlbmdpbmU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoZSBzaW11bGF0aW9uIGZvcndhcmQgaW4gdGltZSBieSBgZGVsdGFgIG1zLlxuICAgICAqIFRoZSBgY29ycmVjdGlvbmAgYXJndW1lbnQgaXMgYW4gb3B0aW9uYWwgYE51bWJlcmAgdGhhdCBzcGVjaWZpZXMgdGhlIHRpbWUgY29ycmVjdGlvbiBmYWN0b3IgdG8gYXBwbHkgdG8gdGhlIHVwZGF0ZS5cbiAgICAgKiBUaGlzIGNhbiBoZWxwIGltcHJvdmUgdGhlIGFjY3VyYWN5IG9mIHRoZSBzaW11bGF0aW9uIGluIGNhc2VzIHdoZXJlIGBkZWx0YWAgaXMgY2hhbmdpbmcgYmV0d2VlbiB1cGRhdGVzLlxuICAgICAqIFRoZSB2YWx1ZSBvZiBgY29ycmVjdGlvbmAgaXMgZGVmaW5lZCBhcyBgZGVsdGEgLyBsYXN0RGVsdGFgLCBpLmUuIHRoZSBwZXJjZW50YWdlIGNoYW5nZSBvZiBgZGVsdGFgIG92ZXIgdGhlIGxhc3Qgc3RlcC5cbiAgICAgKiBUaGVyZWZvcmUgdGhlIHZhbHVlIGlzIGFsd2F5cyBgMWAgKG5vIGNvcnJlY3Rpb24pIHdoZW4gYGRlbHRhYCBjb25zdGFudCAob3Igd2hlbiBubyBjb3JyZWN0aW9uIGlzIGRlc2lyZWQsIHdoaWNoIGlzIHRoZSBkZWZhdWx0KS5cbiAgICAgKiBTZWUgdGhlIHBhcGVyIG9uIDxhIGhyZWY9XCJodHRwOi8vbG9uZXNvY2submV0L2FydGljbGUvdmVybGV0Lmh0bWxcIj5UaW1lIENvcnJlY3RlZCBWZXJsZXQ8L2E+IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogVHJpZ2dlcnMgYGJlZm9yZVVwZGF0ZWAgYW5kIGBhZnRlclVwZGF0ZWAgZXZlbnRzLlxuICAgICAqIFRyaWdnZXJzIGBjb2xsaXNpb25TdGFydGAsIGBjb2xsaXNpb25BY3RpdmVgIGFuZCBgY29sbGlzaW9uRW5kYCBldmVudHMuXG4gICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtkZWx0YT0xNi42NjZdXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtjb3JyZWN0aW9uPTFdXG4gICAgICovXG4gICAgRW5naW5lLnVwZGF0ZSA9IGZ1bmN0aW9uKGVuZ2luZSwgZGVsdGEsIGNvcnJlY3Rpb24pIHtcbiAgICAgICAgZGVsdGEgPSBkZWx0YSB8fCAxMDAwIC8gNjA7XG4gICAgICAgIGNvcnJlY3Rpb24gPSBjb3JyZWN0aW9uIHx8IDE7XG5cbiAgICAgICAgdmFyIHdvcmxkID0gZW5naW5lLndvcmxkLFxuICAgICAgICAgICAgdGltaW5nID0gZW5naW5lLnRpbWluZyxcbiAgICAgICAgICAgIGJyb2FkcGhhc2UgPSBlbmdpbmUuYnJvYWRwaGFzZSxcbiAgICAgICAgICAgIGJyb2FkcGhhc2VQYWlycyA9IFtdLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICAvLyBpbmNyZW1lbnQgdGltZXN0YW1wXG4gICAgICAgIHRpbWluZy50aW1lc3RhbXAgKz0gZGVsdGEgKiB0aW1pbmcudGltZVNjYWxlO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBhbiBldmVudCBvYmplY3RcbiAgICAgICAgdmFyIGV2ZW50ID0ge1xuICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1pbmcudGltZXN0YW1wXG4gICAgICAgIH07XG5cbiAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAnYmVmb3JlVXBkYXRlJywgZXZlbnQpO1xuXG4gICAgICAgIC8vIGdldCBsaXN0cyBvZiBhbGwgYm9kaWVzIGFuZCBjb25zdHJhaW50cywgbm8gbWF0dGVyIHdoYXQgY29tcG9zaXRlcyB0aGV5IGFyZSBpblxuICAgICAgICB2YXIgYWxsQm9kaWVzID0gQ29tcG9zaXRlLmFsbEJvZGllcyh3b3JsZCksXG4gICAgICAgICAgICBhbGxDb25zdHJhaW50cyA9IENvbXBvc2l0ZS5hbGxDb25zdHJhaW50cyh3b3JsZCk7XG5cblxuICAgICAgICAvLyBpZiBzbGVlcGluZyBlbmFibGVkLCBjYWxsIHRoZSBzbGVlcGluZyBjb250cm9sbGVyXG4gICAgICAgIGlmIChlbmdpbmUuZW5hYmxlU2xlZXBpbmcpXG4gICAgICAgICAgICBTbGVlcGluZy51cGRhdGUoYWxsQm9kaWVzLCB0aW1pbmcudGltZVNjYWxlKTtcblxuICAgICAgICAvLyBhcHBsaWVzIGdyYXZpdHkgdG8gYWxsIGJvZGllc1xuICAgICAgICBfYm9kaWVzQXBwbHlHcmF2aXR5KGFsbEJvZGllcywgd29ybGQuZ3Jhdml0eSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGFsbCBib2R5IHBvc2l0aW9uIGFuZCByb3RhdGlvbiBieSBpbnRlZ3JhdGlvblxuICAgICAgICBfYm9kaWVzVXBkYXRlKGFsbEJvZGllcywgZGVsdGEsIHRpbWluZy50aW1lU2NhbGUsIGNvcnJlY3Rpb24sIHdvcmxkLmJvdW5kcyk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGFsbCBjb25zdHJhaW50c1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZW5naW5lLmNvbnN0cmFpbnRJdGVyYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIENvbnN0cmFpbnQuc29sdmVBbGwoYWxsQ29uc3RyYWludHMsIHRpbWluZy50aW1lU2NhbGUpO1xuICAgICAgICB9XG4gICAgICAgIENvbnN0cmFpbnQucG9zdFNvbHZlQWxsKGFsbEJvZGllcyk7XG5cbiAgICAgICAgLy8gYnJvYWRwaGFzZSBwYXNzOiBmaW5kIHBvdGVudGlhbCBjb2xsaXNpb24gcGFpcnNcbiAgICAgICAgaWYgKGJyb2FkcGhhc2UuY29udHJvbGxlcikge1xuXG4gICAgICAgICAgICAvLyBpZiB3b3JsZCBpcyBkaXJ0eSwgd2UgbXVzdCBmbHVzaCB0aGUgd2hvbGUgZ3JpZFxuICAgICAgICAgICAgaWYgKHdvcmxkLmlzTW9kaWZpZWQpXG4gICAgICAgICAgICAgICAgYnJvYWRwaGFzZS5jb250cm9sbGVyLmNsZWFyKGJyb2FkcGhhc2UpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGdyaWQgYnVja2V0cyBiYXNlZCBvbiBjdXJyZW50IGJvZGllc1xuICAgICAgICAgICAgYnJvYWRwaGFzZS5jb250cm9sbGVyLnVwZGF0ZShicm9hZHBoYXNlLCBhbGxCb2RpZXMsIGVuZ2luZSwgd29ybGQuaXNNb2RpZmllZCk7XG4gICAgICAgICAgICBicm9hZHBoYXNlUGFpcnMgPSBicm9hZHBoYXNlLnBhaXJzTGlzdDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gaWYgbm8gYnJvYWRwaGFzZSBzZXQsIHdlIGp1c3QgcGFzcyBhbGwgYm9kaWVzXG4gICAgICAgICAgICBicm9hZHBoYXNlUGFpcnMgPSBhbGxCb2RpZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhciBhbGwgY29tcG9zaXRlIG1vZGlmaWVkIGZsYWdzXG4gICAgICAgIGlmICh3b3JsZC5pc01vZGlmaWVkKSB7XG4gICAgICAgICAgICBDb21wb3NpdGUuc2V0TW9kaWZpZWQod29ybGQsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBuYXJyb3dwaGFzZSBwYXNzOiBmaW5kIGFjdHVhbCBjb2xsaXNpb25zLCB0aGVuIGNyZWF0ZSBvciB1cGRhdGUgY29sbGlzaW9uIHBhaXJzXG4gICAgICAgIHZhciBjb2xsaXNpb25zID0gYnJvYWRwaGFzZS5kZXRlY3Rvcihicm9hZHBoYXNlUGFpcnMsIGVuZ2luZSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGNvbGxpc2lvbiBwYWlyc1xuICAgICAgICB2YXIgcGFpcnMgPSBlbmdpbmUucGFpcnMsXG4gICAgICAgICAgICB0aW1lc3RhbXAgPSB0aW1pbmcudGltZXN0YW1wO1xuICAgICAgICBQYWlycy51cGRhdGUocGFpcnMsIGNvbGxpc2lvbnMsIHRpbWVzdGFtcCk7XG4gICAgICAgIFBhaXJzLnJlbW92ZU9sZChwYWlycywgdGltZXN0YW1wKTtcblxuICAgICAgICAvLyB3YWtlIHVwIGJvZGllcyBpbnZvbHZlZCBpbiBjb2xsaXNpb25zXG4gICAgICAgIGlmIChlbmdpbmUuZW5hYmxlU2xlZXBpbmcpXG4gICAgICAgICAgICBTbGVlcGluZy5hZnRlckNvbGxpc2lvbnMocGFpcnMubGlzdCwgdGltaW5nLnRpbWVTY2FsZSk7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBjb2xsaXNpb24gZXZlbnRzXG4gICAgICAgIGlmIChwYWlycy5jb2xsaXNpb25TdGFydC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAnY29sbGlzaW9uU3RhcnQnLCB7IHBhaXJzOiBwYWlycy5jb2xsaXNpb25TdGFydCB9KTtcblxuICAgICAgICAvLyBpdGVyYXRpdmVseSByZXNvbHZlIHBvc2l0aW9uIGJldHdlZW4gY29sbGlzaW9uc1xuICAgICAgICBSZXNvbHZlci5wcmVTb2x2ZVBvc2l0aW9uKHBhaXJzLmxpc3QpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZW5naW5lLnBvc2l0aW9uSXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICBSZXNvbHZlci5zb2x2ZVBvc2l0aW9uKHBhaXJzLmxpc3QsIHRpbWluZy50aW1lU2NhbGUpO1xuICAgICAgICB9XG4gICAgICAgIFJlc29sdmVyLnBvc3RTb2x2ZVBvc2l0aW9uKGFsbEJvZGllcyk7XG5cbiAgICAgICAgLy8gaXRlcmF0aXZlbHkgcmVzb2x2ZSB2ZWxvY2l0eSBiZXR3ZWVuIGNvbGxpc2lvbnNcbiAgICAgICAgUmVzb2x2ZXIucHJlU29sdmVWZWxvY2l0eShwYWlycy5saXN0KTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGVuZ2luZS52ZWxvY2l0eUl0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgUmVzb2x2ZXIuc29sdmVWZWxvY2l0eShwYWlycy5saXN0LCB0aW1pbmcudGltZVNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyaWdnZXIgY29sbGlzaW9uIGV2ZW50c1xuICAgICAgICBpZiAocGFpcnMuY29sbGlzaW9uQWN0aXZlLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBFdmVudHMudHJpZ2dlcihlbmdpbmUsICdjb2xsaXNpb25BY3RpdmUnLCB7IHBhaXJzOiBwYWlycy5jb2xsaXNpb25BY3RpdmUgfSk7XG5cbiAgICAgICAgaWYgKHBhaXJzLmNvbGxpc2lvbkVuZC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAnY29sbGlzaW9uRW5kJywgeyBwYWlyczogcGFpcnMuY29sbGlzaW9uRW5kIH0pO1xuXG5cbiAgICAgICAgLy8gY2xlYXIgZm9yY2UgYnVmZmVyc1xuICAgICAgICBfYm9kaWVzQ2xlYXJGb3JjZXMoYWxsQm9kaWVzKTtcblxuICAgICAgICBFdmVudHMudHJpZ2dlcihlbmdpbmUsICdhZnRlclVwZGF0ZScsIGV2ZW50KTtcblxuICAgICAgICByZXR1cm4gZW5naW5lO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogTWVyZ2VzIHR3byBlbmdpbmVzIGJ5IGtlZXBpbmcgdGhlIGNvbmZpZ3VyYXRpb24gb2YgYGVuZ2luZUFgIGJ1dCByZXBsYWNpbmcgdGhlIHdvcmxkIHdpdGggdGhlIG9uZSBmcm9tIGBlbmdpbmVCYC5cbiAgICAgKiBAbWV0aG9kIG1lcmdlXG4gICAgICogQHBhcmFtIHtlbmdpbmV9IGVuZ2luZUFcbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lQlxuICAgICAqL1xuICAgIEVuZ2luZS5tZXJnZSA9IGZ1bmN0aW9uKGVuZ2luZUEsIGVuZ2luZUIpIHtcbiAgICAgICAgQ29tbW9uLmV4dGVuZChlbmdpbmVBLCBlbmdpbmVCKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChlbmdpbmVCLndvcmxkKSB7XG4gICAgICAgICAgICBlbmdpbmVBLndvcmxkID0gZW5naW5lQi53b3JsZDtcblxuICAgICAgICAgICAgRW5naW5lLmNsZWFyKGVuZ2luZUEpO1xuXG4gICAgICAgICAgICB2YXIgYm9kaWVzID0gQ29tcG9zaXRlLmFsbEJvZGllcyhlbmdpbmVBLndvcmxkKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcbiAgICAgICAgICAgICAgICBTbGVlcGluZy5zZXQoYm9keSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGJvZHkuaWQgPSBDb21tb24ubmV4dElkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBlbmdpbmUgaW5jbHVkaW5nIHRoZSB3b3JsZCwgcGFpcnMgYW5kIGJyb2FkcGhhc2UuXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEBwYXJhbSB7ZW5naW5lfSBlbmdpbmVcbiAgICAgKi9cbiAgICBFbmdpbmUuY2xlYXIgPSBmdW5jdGlvbihlbmdpbmUpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gZW5naW5lLndvcmxkO1xuICAgICAgICBcbiAgICAgICAgUGFpcnMuY2xlYXIoZW5naW5lLnBhaXJzKTtcblxuICAgICAgICB2YXIgYnJvYWRwaGFzZSA9IGVuZ2luZS5icm9hZHBoYXNlO1xuICAgICAgICBpZiAoYnJvYWRwaGFzZS5jb250cm9sbGVyKSB7XG4gICAgICAgICAgICB2YXIgYm9kaWVzID0gQ29tcG9zaXRlLmFsbEJvZGllcyh3b3JsZCk7XG4gICAgICAgICAgICBicm9hZHBoYXNlLmNvbnRyb2xsZXIuY2xlYXIoYnJvYWRwaGFzZSk7XG4gICAgICAgICAgICBicm9hZHBoYXNlLmNvbnRyb2xsZXIudXBkYXRlKGJyb2FkcGhhc2UsIGJvZGllcywgZW5naW5lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBaZXJvZXMgdGhlIGBib2R5LmZvcmNlYCBhbmQgYGJvZHkudG9ycXVlYCBmb3JjZSBidWZmZXJzLlxuICAgICAqIEBtZXRob2QgYm9kaWVzQ2xlYXJGb3JjZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKi9cbiAgICB2YXIgX2JvZGllc0NsZWFyRm9yY2VzID0gZnVuY3Rpb24oYm9kaWVzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgZm9yY2UgYnVmZmVyc1xuICAgICAgICAgICAgYm9keS5mb3JjZS54ID0gMDtcbiAgICAgICAgICAgIGJvZHkuZm9yY2UueSA9IDA7XG4gICAgICAgICAgICBib2R5LnRvcnF1ZSA9IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbHlzIGEgbWFzcyBkZXBlbmRhbnQgZm9yY2UgdG8gYWxsIGdpdmVuIGJvZGllcy5cbiAgICAgKiBAbWV0aG9kIGJvZGllc0FwcGx5R3Jhdml0eVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBncmF2aXR5XG4gICAgICovXG4gICAgdmFyIF9ib2RpZXNBcHBseUdyYXZpdHkgPSBmdW5jdGlvbihib2RpZXMsIGdyYXZpdHkpIHtcbiAgICAgICAgdmFyIGdyYXZpdHlTY2FsZSA9IHR5cGVvZiBncmF2aXR5LnNjYWxlICE9PSAndW5kZWZpbmVkJyA/IGdyYXZpdHkuc2NhbGUgOiAwLjAwMTtcblxuICAgICAgICBpZiAoKGdyYXZpdHkueCA9PT0gMCAmJiBncmF2aXR5LnkgPT09IDApIHx8IGdyYXZpdHlTY2FsZSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmIChib2R5LmlzU3RhdGljIHx8IGJvZHkuaXNTbGVlcGluZylcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYXBwbHkgZ3Jhdml0eVxuICAgICAgICAgICAgYm9keS5mb3JjZS55ICs9IGJvZHkubWFzcyAqIGdyYXZpdHkueSAqIGdyYXZpdHlTY2FsZTtcbiAgICAgICAgICAgIGJvZHkuZm9yY2UueCArPSBib2R5Lm1hc3MgKiBncmF2aXR5LnggKiBncmF2aXR5U2NhbGU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbHlzIGBCb2R5LnVwZGF0ZWAgdG8gYWxsIGdpdmVuIGBib2RpZXNgLlxuICAgICAqIEBtZXRob2QgdXBkYXRlQWxsXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2JvZHlbXX0gYm9kaWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhVGltZSBcbiAgICAgKiBUaGUgYW1vdW50IG9mIHRpbWUgZWxhcHNlZCBiZXR3ZWVuIHVwZGF0ZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVNjYWxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvcnJlY3Rpb24gXG4gICAgICogVGhlIFZlcmxldCBjb3JyZWN0aW9uIGZhY3RvciAoZGVsdGFUaW1lIC8gbGFzdERlbHRhVGltZSlcbiAgICAgKiBAcGFyYW0ge2JvdW5kc30gd29ybGRCb3VuZHNcbiAgICAgKi9cbiAgICB2YXIgX2JvZGllc1VwZGF0ZSA9IGZ1bmN0aW9uKGJvZGllcywgZGVsdGFUaW1lLCB0aW1lU2NhbGUsIGNvcnJlY3Rpb24sIHdvcmxkQm91bmRzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgaWYgKGJvZHkuaXNTdGF0aWMgfHwgYm9keS5pc1NsZWVwaW5nKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBCb2R5LnVwZGF0ZShib2R5LCBkZWx0YVRpbWUsIHRpbWVTY2FsZSwgY29ycmVjdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQW4gYWxpYXMgZm9yIGBSdW5uZXIucnVuYCwgc2VlIGBNYXR0ZXIuUnVubmVyYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKiBAbWV0aG9kIHJ1blxuICAgICAqIEBwYXJhbSB7ZW5naW5lfSBlbmdpbmVcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQganVzdCBiZWZvcmUgYW4gdXBkYXRlXG4gICAgKlxuICAgICogQGV2ZW50IGJlZm9yZVVwZGF0ZVxuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LnRpbWVzdGFtcCBUaGUgZW5naW5lLnRpbWluZy50aW1lc3RhbXAgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgYWZ0ZXIgZW5naW5lIHVwZGF0ZSBhbmQgYWxsIGNvbGxpc2lvbiBldmVudHNcbiAgICAqXG4gICAgKiBAZXZlbnQgYWZ0ZXJVcGRhdGVcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBldmVudC50aW1lc3RhbXAgVGhlIGVuZ2luZS50aW1pbmcudGltZXN0YW1wIG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIGFmdGVyIGVuZ2luZSB1cGRhdGUsIHByb3ZpZGVzIGEgbGlzdCBvZiBhbGwgcGFpcnMgdGhhdCBoYXZlIHN0YXJ0ZWQgdG8gY29sbGlkZSBpbiB0aGUgY3VycmVudCB0aWNrIChpZiBhbnkpXG4gICAgKlxuICAgICogQGV2ZW50IGNvbGxpc2lvblN0YXJ0XG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge30gZXZlbnQucGFpcnMgTGlzdCBvZiBhZmZlY3RlZCBwYWlyc1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LnRpbWVzdGFtcCBUaGUgZW5naW5lLnRpbWluZy50aW1lc3RhbXAgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgYWZ0ZXIgZW5naW5lIHVwZGF0ZSwgcHJvdmlkZXMgYSBsaXN0IG9mIGFsbCBwYWlycyB0aGF0IGFyZSBjb2xsaWRpbmcgaW4gdGhlIGN1cnJlbnQgdGljayAoaWYgYW55KVxuICAgICpcbiAgICAqIEBldmVudCBjb2xsaXNpb25BY3RpdmVcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7fSBldmVudC5wYWlycyBMaXN0IG9mIGFmZmVjdGVkIHBhaXJzXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCBhZnRlciBlbmdpbmUgdXBkYXRlLCBwcm92aWRlcyBhIGxpc3Qgb2YgYWxsIHBhaXJzIHRoYXQgaGF2ZSBlbmRlZCBjb2xsaXNpb24gaW4gdGhlIGN1cnJlbnQgdGljayAoaWYgYW55KVxuICAgICpcbiAgICAqIEBldmVudCBjb2xsaXNpb25FbmRcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7fSBldmVudC5wYWlycyBMaXN0IG9mIGFmZmVjdGVkIHBhaXJzXG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgUHJvcGVydGllcyBEb2N1bWVudGF0aW9uXG4gICAgKlxuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlZ2VyIGBOdW1iZXJgIHRoYXQgc3BlY2lmaWVzIHRoZSBudW1iZXIgb2YgcG9zaXRpb24gaXRlcmF0aW9ucyB0byBwZXJmb3JtIGVhY2ggdXBkYXRlLlxuICAgICAqIFRoZSBoaWdoZXIgdGhlIHZhbHVlLCB0aGUgaGlnaGVyIHF1YWxpdHkgdGhlIHNpbXVsYXRpb24gd2lsbCBiZSBhdCB0aGUgZXhwZW5zZSBvZiBwZXJmb3JtYW5jZS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBwb3NpdGlvbkl0ZXJhdGlvbnNcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCA2XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlZ2VyIGBOdW1iZXJgIHRoYXQgc3BlY2lmaWVzIHRoZSBudW1iZXIgb2YgdmVsb2NpdHkgaXRlcmF0aW9ucyB0byBwZXJmb3JtIGVhY2ggdXBkYXRlLlxuICAgICAqIFRoZSBoaWdoZXIgdGhlIHZhbHVlLCB0aGUgaGlnaGVyIHF1YWxpdHkgdGhlIHNpbXVsYXRpb24gd2lsbCBiZSBhdCB0aGUgZXhwZW5zZSBvZiBwZXJmb3JtYW5jZS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB2ZWxvY2l0eUl0ZXJhdGlvbnNcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCA0XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlZ2VyIGBOdW1iZXJgIHRoYXQgc3BlY2lmaWVzIHRoZSBudW1iZXIgb2YgY29uc3RyYWludCBpdGVyYXRpb25zIHRvIHBlcmZvcm0gZWFjaCB1cGRhdGUuXG4gICAgICogVGhlIGhpZ2hlciB0aGUgdmFsdWUsIHRoZSBoaWdoZXIgcXVhbGl0eSB0aGUgc2ltdWxhdGlvbiB3aWxsIGJlIGF0IHRoZSBleHBlbnNlIG9mIHBlcmZvcm1hbmNlLlxuICAgICAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIGAyYCBpcyB1c3VhbGx5IHZlcnkgYWRlcXVhdGUuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgY29uc3RyYWludEl0ZXJhdGlvbnNcbiAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgKiBAZGVmYXVsdCAyXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdGhhdCBzcGVjaWZpZXMgd2hldGhlciB0aGUgZW5naW5lIHNob3VsZCBhbGxvdyBzbGVlcGluZyB2aWEgdGhlIGBNYXR0ZXIuU2xlZXBpbmdgIG1vZHVsZS5cbiAgICAgKiBTbGVlcGluZyBjYW4gaW1wcm92ZSBzdGFiaWxpdHkgYW5kIHBlcmZvcm1hbmNlLCBidXQgb2Z0ZW4gYXQgdGhlIGV4cGVuc2Ugb2YgYWNjdXJhY3kuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgZW5hYmxlU2xlZXBpbmdcbiAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEFuIGBPYmplY3RgIGNvbnRhaW5pbmcgcHJvcGVydGllcyByZWdhcmRpbmcgdGhlIHRpbWluZyBzeXN0ZW1zIG9mIHRoZSBlbmdpbmUuIFxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHRpbWluZ1xuICAgICAqIEB0eXBlIG9iamVjdFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBgTnVtYmVyYCB0aGF0IHNwZWNpZmllcyB0aGUgZ2xvYmFsIHNjYWxpbmcgZmFjdG9yIG9mIHRpbWUgZm9yIGFsbCBib2RpZXMuXG4gICAgICogQSB2YWx1ZSBvZiBgMGAgZnJlZXplcyB0aGUgc2ltdWxhdGlvbi5cbiAgICAgKiBBIHZhbHVlIG9mIGAwLjFgIGdpdmVzIGEgc2xvdy1tb3Rpb24gZWZmZWN0LlxuICAgICAqIEEgdmFsdWUgb2YgYDEuMmAgZ2l2ZXMgYSBzcGVlZC11cCBlZmZlY3QuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgdGltaW5nLnRpbWVTY2FsZVxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYE51bWJlcmAgdGhhdCBzcGVjaWZpZXMgdGhlIGN1cnJlbnQgc2ltdWxhdGlvbi10aW1lIGluIG1pbGxpc2Vjb25kcyBzdGFydGluZyBmcm9tIGAwYC4gXG4gICAgICogSXQgaXMgaW5jcmVtZW50ZWQgb24gZXZlcnkgYEVuZ2luZS51cGRhdGVgIGJ5IHRoZSBnaXZlbiBgZGVsdGFgIGFyZ3VtZW50LiBcbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB0aW1pbmcudGltZXN0YW1wXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gaW5zdGFuY2Ugb2YgYSBgUmVuZGVyYCBjb250cm9sbGVyLiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyBhIGBNYXR0ZXIuUmVuZGVyYCBpbnN0YW5jZSBjcmVhdGVkIGJ5IGBFbmdpbmUuY3JlYXRlYC5cbiAgICAgKiBPbmUgbWF5IGFsc28gZGV2ZWxvcCBhIGN1c3RvbSByZW5kZXJlciBtb2R1bGUgYmFzZWQgb24gYE1hdHRlci5SZW5kZXJgIGFuZCBwYXNzIGFuIGluc3RhbmNlIG9mIGl0IHRvIGBFbmdpbmUuY3JlYXRlYCB2aWEgYG9wdGlvbnMucmVuZGVyYC5cbiAgICAgKlxuICAgICAqIEEgbWluaW1hbCBjdXN0b20gcmVuZGVyZXIgb2JqZWN0IG11c3QgZGVmaW5lIGF0IGxlYXN0IHRocmVlIGZ1bmN0aW9uczogYGNyZWF0ZWAsIGBjbGVhcmAgYW5kIGB3b3JsZGAgKHNlZSBgTWF0dGVyLlJlbmRlcmApLlxuICAgICAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gaW5zdGVhZCBwYXNzIHRoZSBfbW9kdWxlXyByZWZlcmVuY2UgdmlhIGBvcHRpb25zLnJlbmRlci5jb250cm9sbGVyYCBhbmQgYEVuZ2luZS5jcmVhdGVgIHdpbGwgaW5zdGFudGlhdGUgb25lIGZvciB5b3UuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgcmVuZGVyXG4gICAgICogQHR5cGUgcmVuZGVyXG4gICAgICogQGRlcHJlY2F0ZWQgc2VlIERlbW8uanMgZm9yIGFuIGV4YW1wbGUgb2YgY3JlYXRpbmcgYSByZW5kZXJlclxuICAgICAqIEBkZWZhdWx0IGEgTWF0dGVyLlJlbmRlciBpbnN0YW5jZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQW4gaW5zdGFuY2Ugb2YgYSBicm9hZHBoYXNlIGNvbnRyb2xsZXIuIFRoZSBkZWZhdWx0IHZhbHVlIGlzIGEgYE1hdHRlci5HcmlkYCBpbnN0YW5jZSBjcmVhdGVkIGJ5IGBFbmdpbmUuY3JlYXRlYC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBicm9hZHBoYXNlXG4gICAgICogQHR5cGUgZ3JpZFxuICAgICAqIEBkZWZhdWx0IGEgTWF0dGVyLkdyaWQgaW5zdGFuY2VcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYFdvcmxkYCBjb21wb3NpdGUgb2JqZWN0IHRoYXQgd2lsbCBjb250YWluIGFsbCBzaW11bGF0ZWQgYm9kaWVzIGFuZCBjb25zdHJhaW50cy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSB3b3JsZFxuICAgICAqIEB0eXBlIHdvcmxkXG4gICAgICogQGRlZmF1bHQgYSBNYXR0ZXIuV29ybGQgaW5zdGFuY2VcbiAgICAgKi9cblxufSkoKTtcblxufSx7XCIuLi9ib2R5L0JvZHlcIjoxLFwiLi4vYm9keS9Db21wb3NpdGVcIjoyLFwiLi4vYm9keS9Xb3JsZFwiOjMsXCIuLi9jb2xsaXNpb24vR3JpZFwiOjYsXCIuLi9jb2xsaXNpb24vUGFpcnNcIjo4LFwiLi4vY29sbGlzaW9uL1Jlc29sdmVyXCI6MTAsXCIuLi9jb25zdHJhaW50L0NvbnN0cmFpbnRcIjoxMixcIi4uL3JlbmRlci9SZW5kZXJcIjozMSxcIi4vQ29tbW9uXCI6MTQsXCIuL0V2ZW50c1wiOjE2LFwiLi9NZXRyaWNzXCI6MTgsXCIuL1NsZWVwaW5nXCI6MjJ9XSwxNjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuRXZlbnRzYCBtb2R1bGUgY29udGFpbnMgbWV0aG9kcyB0byBmaXJlIGFuZCBsaXN0ZW4gdG8gZXZlbnRzIG9uIG90aGVyIG9iamVjdHMuXG4qXG4qIFNlZSB0aGUgaW5jbHVkZWQgdXNhZ2UgW2V4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbGlhYnJ1L21hdHRlci1qcy90cmVlL21hc3Rlci9leGFtcGxlcykuXG4qXG4qIEBjbGFzcyBFdmVudHNcbiovXG5cbnZhciBFdmVudHMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudHM7XG5cbnZhciBDb21tb24gPSBfZGVyZXFfKCcuL0NvbW1vbicpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gdGhlIGdpdmVuIG9iamVjdCdzIGBldmVudE5hbWVgLlxuICAgICAqIEBtZXRob2Qgb25cbiAgICAgKiBAcGFyYW0ge30gb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqL1xuICAgIEV2ZW50cy5vbiA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnROYW1lcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5hbWVzID0gZXZlbnROYW1lcy5zcGxpdCgnICcpLFxuICAgICAgICAgICAgbmFtZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgICAgICAgICBvYmplY3QuZXZlbnRzID0gb2JqZWN0LmV2ZW50cyB8fCB7fTtcbiAgICAgICAgICAgIG9iamVjdC5ldmVudHNbbmFtZV0gPSBvYmplY3QuZXZlbnRzW25hbWVdIHx8IFtdO1xuICAgICAgICAgICAgb2JqZWN0LmV2ZW50c1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gZXZlbnQgY2FsbGJhY2suIElmIG5vIGNhbGxiYWNrLCBjbGVhcnMgYWxsIGNhbGxiYWNrcyBpbiBgZXZlbnROYW1lc2AuIElmIG5vIGBldmVudE5hbWVzYCwgY2xlYXJzIGFsbCBldmVudHMuXG4gICAgICogQG1ldGhvZCBvZmZcbiAgICAgKiBAcGFyYW0ge30gb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZXNcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqL1xuICAgIEV2ZW50cy5vZmYgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50TmFtZXMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghZXZlbnROYW1lcykge1xuICAgICAgICAgICAgb2JqZWN0LmV2ZW50cyA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIEV2ZW50cy5vZmYob2JqZWN0LCBjYWxsYmFjaylcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudE5hbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGV2ZW50TmFtZXM7XG4gICAgICAgICAgICBldmVudE5hbWVzID0gQ29tbW9uLmtleXMob2JqZWN0LmV2ZW50cykuam9pbignICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5hbWVzID0gZXZlbnROYW1lcy5zcGxpdCgnICcpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBvYmplY3QuZXZlbnRzW25hbWVzW2ldXSxcbiAgICAgICAgICAgICAgICBuZXdDYWxsYmFja3MgPSBbXTtcblxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmIGNhbGxiYWNrcykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2FsbGJhY2tzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3Nbal0gIT09IGNhbGxiYWNrKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2FsbGJhY2tzLnB1c2goY2FsbGJhY2tzW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9iamVjdC5ldmVudHNbbmFtZXNbaV1dID0gbmV3Q2FsbGJhY2tzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIGFsbCB0aGUgY2FsbGJhY2tzIHN1YnNjcmliZWQgdG8gdGhlIGdpdmVuIG9iamVjdCdzIGBldmVudE5hbWVgLCBpbiB0aGUgb3JkZXIgdGhleSBzdWJzY3JpYmVkLCBpZiBhbnkuXG4gICAgICogQG1ldGhvZCB0cmlnZ2VyXG4gICAgICogQHBhcmFtIHt9IG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVzXG4gICAgICogQHBhcmFtIHt9IGV2ZW50XG4gICAgICovXG4gICAgRXZlbnRzLnRyaWdnZXIgPSBmdW5jdGlvbihvYmplY3QsIGV2ZW50TmFtZXMsIGV2ZW50KSB7XG4gICAgICAgIHZhciBuYW1lcyxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBjYWxsYmFja3MsXG4gICAgICAgICAgICBldmVudENsb25lO1xuXG4gICAgICAgIGlmIChvYmplY3QuZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50KVxuICAgICAgICAgICAgICAgIGV2ZW50ID0ge307XG5cbiAgICAgICAgICAgIG5hbWVzID0gZXZlbnROYW1lcy5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrcyA9IG9iamVjdC5ldmVudHNbbmFtZV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50Q2xvbmUgPSBDb21tb24uY2xvbmUoZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRDbG9uZS5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRDbG9uZS5zb3VyY2UgPSBvYmplY3Q7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjYWxsYmFja3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrc1tqXS5hcHBseShvYmplY3QsIFtldmVudENsb25lXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4vQ29tbW9uXCI6MTR9XSwxNzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXJgIG1vZHVsZSBpcyB0aGUgdG9wIGxldmVsIG5hbWVzcGFjZS4gSXQgYWxzbyBpbmNsdWRlcyBhIGZ1bmN0aW9uIGZvciBpbnN0YWxsaW5nIHBsdWdpbnMgb24gdG9wIG9mIHRoZSBsaWJyYXJ5LlxuKlxuKiBAY2xhc3MgTWF0dGVyXG4qL1xuXG52YXIgTWF0dGVyID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gTWF0dGVyO1xuXG52YXIgUGx1Z2luID0gX2RlcmVxXygnLi9QbHVnaW4nKTtcbnZhciBDb21tb24gPSBfZGVyZXFfKCcuL0NvbW1vbicpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGlicmFyeSBuYW1lLlxuICAgICAqIEBwcm9wZXJ0eSBuYW1lXG4gICAgICogQHJlYWRPbmx5XG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBNYXR0ZXIubmFtZSA9ICdtYXR0ZXItanMnO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGxpYnJhcnkgdmVyc2lvbi5cbiAgICAgKiBAcHJvcGVydHkgdmVyc2lvblxuICAgICAqIEByZWFkT25seVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgTWF0dGVyLnZlcnNpb24gPSAnMC4xMS4xJztcblxuICAgIC8qKlxuICAgICAqIEEgbGlzdCBvZiBwbHVnaW4gZGVwZW5kZW5jaWVzIHRvIGJlIGluc3RhbGxlZC4gVGhlc2UgYXJlIG5vcm1hbGx5IHNldCBhbmQgaW5zdGFsbGVkIHRocm91Z2ggYE1hdHRlci51c2VgLlxuICAgICAqIEFsdGVybmF0aXZlbHkgeW91IG1heSBzZXQgYE1hdHRlci51c2VzYCBtYW51YWxseSBhbmQgaW5zdGFsbCB0aGVtIGJ5IGNhbGxpbmcgYFBsdWdpbi51c2UoTWF0dGVyKWAuXG4gICAgICogQHByb3BlcnR5IHVzZXNcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgTWF0dGVyLnVzZXMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBwbHVnaW5zIHRoYXQgaGF2ZSBiZWVuIGluc3RhbGxlZCB0aHJvdWdoIGBNYXR0ZXIuUGx1Z2luLmluc3RhbGxgLiBSZWFkIG9ubHkuXG4gICAgICogQHByb3BlcnR5IHVzZWRcbiAgICAgKiBAcmVhZE9ubHlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgTWF0dGVyLnVzZWQgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEluc3RhbGxzIHRoZSBnaXZlbiBwbHVnaW5zIG9uIHRoZSBgTWF0dGVyYCBuYW1lc3BhY2UuXG4gICAgICogVGhpcyBpcyBhIHNob3J0LWhhbmQgZm9yIGBQbHVnaW4udXNlYCwgc2VlIGl0IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqIENhbGwgdGhpcyBmdW5jdGlvbiBvbmNlIGF0IHRoZSBzdGFydCBvZiB5b3VyIGNvZGUsIHdpdGggYWxsIG9mIHRoZSBwbHVnaW5zIHlvdSB3aXNoIHRvIGluc3RhbGwgYXMgYXJndW1lbnRzLlxuICAgICAqIEF2b2lkIGNhbGxpbmcgdGhpcyBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB1bmxlc3MgeW91IGludGVuZCB0byBtYW51YWxseSBjb250cm9sIGluc3RhbGxhdGlvbiBvcmRlci5cbiAgICAgKiBAbWV0aG9kIHVzZVxuICAgICAqIEBwYXJhbSAuLi5wbHVnaW4ge0Z1bmN0aW9ufSBUaGUgcGx1Z2luKHMpIHRvIGluc3RhbGwgb24gYGJhc2VgIChtdWx0aS1hcmd1bWVudCkuXG4gICAgICovXG4gICAgTWF0dGVyLnVzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBQbHVnaW4udXNlKE1hdHRlciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYWlucyBhIGZ1bmN0aW9uIHRvIGV4Y3V0ZSBiZWZvcmUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIG9uIHRoZSBnaXZlbiBgcGF0aGAgcmVsYXRpdmUgdG8gYE1hdHRlcmAuXG4gICAgICogU2VlIGFsc28gZG9jcyBmb3IgYENvbW1vbi5jaGFpbmAuXG4gICAgICogQG1ldGhvZCBiZWZvcmVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCByZWxhdGl2ZSB0byBgTWF0dGVyYFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoYWluIGJlZm9yZSB0aGUgb3JpZ2luYWxcbiAgICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGNoYWluZWQgZnVuY3Rpb24gdGhhdCByZXBsYWNlZCB0aGUgb3JpZ2luYWxcbiAgICAgKi9cbiAgICBNYXR0ZXIuYmVmb3JlID0gZnVuY3Rpb24ocGF0aCwgZnVuYykge1xuICAgICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9eTWF0dGVyLi8sICcnKTtcbiAgICAgICAgcmV0dXJuIENvbW1vbi5jaGFpblBhdGhCZWZvcmUoTWF0dGVyLCBwYXRoLCBmdW5jKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hhaW5zIGEgZnVuY3Rpb24gdG8gZXhjdXRlIGFmdGVyIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBvbiB0aGUgZ2l2ZW4gYHBhdGhgIHJlbGF0aXZlIHRvIGBNYXR0ZXJgLlxuICAgICAqIFNlZSBhbHNvIGRvY3MgZm9yIGBDb21tb24uY2hhaW5gLlxuICAgICAqIEBtZXRob2QgYWZ0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCByZWxhdGl2ZSB0byBgTWF0dGVyYFxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoYWluIGFmdGVyIHRoZSBvcmlnaW5hbFxuICAgICAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgY2hhaW5lZCBmdW5jdGlvbiB0aGF0IHJlcGxhY2VkIHRoZSBvcmlnaW5hbFxuICAgICAqL1xuICAgIE1hdHRlci5hZnRlciA9IGZ1bmN0aW9uKHBhdGgsIGZ1bmMpIHtcbiAgICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXk1hdHRlci4vLCAnJyk7XG4gICAgICAgIHJldHVybiBDb21tb24uY2hhaW5QYXRoQWZ0ZXIoTWF0dGVyLCBwYXRoLCBmdW5jKTtcbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4vQ29tbW9uXCI6MTQsXCIuL1BsdWdpblwiOjIwfV0sMTg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuXG59LHtcIi4uL2JvZHkvQ29tcG9zaXRlXCI6MixcIi4vQ29tbW9uXCI6MTR9XSwxOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuTW91c2VgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIG1vdXNlIGlucHV0cy5cbipcbiogQGNsYXNzIE1vdXNlXG4qL1xuXG52YXIgTW91c2UgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcblxudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBtb3VzZSBpbnB1dC5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHttb3VzZX0gQSBuZXcgbW91c2VcbiAgICAgKi9cbiAgICBNb3VzZS5jcmVhdGUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciBtb3VzZSA9IHt9O1xuXG4gICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgQ29tbW9uLmxvZygnTW91c2UuY3JlYXRlOiBlbGVtZW50IHdhcyB1bmRlZmluZWQsIGRlZmF1bHRpbmcgdG8gZG9jdW1lbnQuYm9keScsICd3YXJuJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIG1vdXNlLmVsZW1lbnQgPSBlbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIG1vdXNlLmFic29sdXRlID0geyB4OiAwLCB5OiAwIH07XG4gICAgICAgIG1vdXNlLnBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgICAgIG1vdXNlLm1vdXNlZG93blBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gICAgICAgIG1vdXNlLm1vdXNldXBQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICAgICAgICBtb3VzZS5vZmZzZXQgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICAgICAgbW91c2Uuc2NhbGUgPSB7IHg6IDEsIHk6IDEgfTtcbiAgICAgICAgbW91c2Uud2hlZWxEZWx0YSA9IDA7XG4gICAgICAgIG1vdXNlLmJ1dHRvbiA9IC0xO1xuICAgICAgICBtb3VzZS5waXhlbFJhdGlvID0gbW91c2UuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGl4ZWwtcmF0aW8nKSB8fCAxO1xuXG4gICAgICAgIG1vdXNlLnNvdXJjZUV2ZW50cyA9IHtcbiAgICAgICAgICAgIG1vdXNlbW92ZTogbnVsbCxcbiAgICAgICAgICAgIG1vdXNlZG93bjogbnVsbCxcbiAgICAgICAgICAgIG1vdXNldXA6IG51bGwsXG4gICAgICAgICAgICBtb3VzZXdoZWVsOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBtb3VzZS5tb3VzZW1vdmUgPSBmdW5jdGlvbihldmVudCkgeyBcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IF9nZXRSZWxhdGl2ZU1vdXNlUG9zaXRpb24oZXZlbnQsIG1vdXNlLmVsZW1lbnQsIG1vdXNlLnBpeGVsUmF0aW8pLFxuICAgICAgICAgICAgICAgIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcblxuICAgICAgICAgICAgaWYgKHRvdWNoZXMpIHtcbiAgICAgICAgICAgICAgICBtb3VzZS5idXR0b24gPSAwO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1vdXNlLmFic29sdXRlLnggPSBwb3NpdGlvbi54O1xuICAgICAgICAgICAgbW91c2UuYWJzb2x1dGUueSA9IHBvc2l0aW9uLnk7XG4gICAgICAgICAgICBtb3VzZS5wb3NpdGlvbi54ID0gbW91c2UuYWJzb2x1dGUueCAqIG1vdXNlLnNjYWxlLnggKyBtb3VzZS5vZmZzZXQueDtcbiAgICAgICAgICAgIG1vdXNlLnBvc2l0aW9uLnkgPSBtb3VzZS5hYnNvbHV0ZS55ICogbW91c2Uuc2NhbGUueSArIG1vdXNlLm9mZnNldC55O1xuICAgICAgICAgICAgbW91c2Uuc291cmNlRXZlbnRzLm1vdXNlbW92ZSA9IGV2ZW50O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgbW91c2UubW91c2Vkb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IF9nZXRSZWxhdGl2ZU1vdXNlUG9zaXRpb24oZXZlbnQsIG1vdXNlLmVsZW1lbnQsIG1vdXNlLnBpeGVsUmF0aW8pLFxuICAgICAgICAgICAgICAgIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcblxuICAgICAgICAgICAgaWYgKHRvdWNoZXMpIHtcbiAgICAgICAgICAgICAgICBtb3VzZS5idXR0b24gPSAwO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vdXNlLmJ1dHRvbiA9IGV2ZW50LmJ1dHRvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbW91c2UuYWJzb2x1dGUueCA9IHBvc2l0aW9uLng7XG4gICAgICAgICAgICBtb3VzZS5hYnNvbHV0ZS55ID0gcG9zaXRpb24ueTtcbiAgICAgICAgICAgIG1vdXNlLnBvc2l0aW9uLnggPSBtb3VzZS5hYnNvbHV0ZS54ICogbW91c2Uuc2NhbGUueCArIG1vdXNlLm9mZnNldC54O1xuICAgICAgICAgICAgbW91c2UucG9zaXRpb24ueSA9IG1vdXNlLmFic29sdXRlLnkgKiBtb3VzZS5zY2FsZS55ICsgbW91c2Uub2Zmc2V0Lnk7XG4gICAgICAgICAgICBtb3VzZS5tb3VzZWRvd25Qb3NpdGlvbi54ID0gbW91c2UucG9zaXRpb24ueDtcbiAgICAgICAgICAgIG1vdXNlLm1vdXNlZG93blBvc2l0aW9uLnkgPSBtb3VzZS5wb3NpdGlvbi55O1xuICAgICAgICAgICAgbW91c2Uuc291cmNlRXZlbnRzLm1vdXNlZG93biA9IGV2ZW50O1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgbW91c2UubW91c2V1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBfZ2V0UmVsYXRpdmVNb3VzZVBvc2l0aW9uKGV2ZW50LCBtb3VzZS5lbGVtZW50LCBtb3VzZS5waXhlbFJhdGlvKSxcbiAgICAgICAgICAgICAgICB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG5cbiAgICAgICAgICAgIGlmICh0b3VjaGVzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbW91c2UuYnV0dG9uID0gLTE7XG4gICAgICAgICAgICBtb3VzZS5hYnNvbHV0ZS54ID0gcG9zaXRpb24ueDtcbiAgICAgICAgICAgIG1vdXNlLmFic29sdXRlLnkgPSBwb3NpdGlvbi55O1xuICAgICAgICAgICAgbW91c2UucG9zaXRpb24ueCA9IG1vdXNlLmFic29sdXRlLnggKiBtb3VzZS5zY2FsZS54ICsgbW91c2Uub2Zmc2V0Lng7XG4gICAgICAgICAgICBtb3VzZS5wb3NpdGlvbi55ID0gbW91c2UuYWJzb2x1dGUueSAqIG1vdXNlLnNjYWxlLnkgKyBtb3VzZS5vZmZzZXQueTtcbiAgICAgICAgICAgIG1vdXNlLm1vdXNldXBQb3NpdGlvbi54ID0gbW91c2UucG9zaXRpb24ueDtcbiAgICAgICAgICAgIG1vdXNlLm1vdXNldXBQb3NpdGlvbi55ID0gbW91c2UucG9zaXRpb24ueTtcbiAgICAgICAgICAgIG1vdXNlLnNvdXJjZUV2ZW50cy5tb3VzZXVwID0gZXZlbnQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgbW91c2UubW91c2V3aGVlbCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBtb3VzZS53aGVlbERlbHRhID0gTWF0aC5tYXgoLTEsIE1hdGgubWluKDEsIGV2ZW50LndoZWVsRGVsdGEgfHwgLWV2ZW50LmRldGFpbCkpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBNb3VzZS5zZXRFbGVtZW50KG1vdXNlLCBtb3VzZS5lbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gbW91c2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGVsZW1lbnQgdGhlIG1vdXNlIGlzIGJvdW5kIHRvIChhbmQgcmVsYXRpdmUgdG8pLlxuICAgICAqIEBtZXRob2Qgc2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7bW91c2V9IG1vdXNlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIE1vdXNlLnNldEVsZW1lbnQgPSBmdW5jdGlvbihtb3VzZSwgZWxlbWVudCkge1xuICAgICAgICBtb3VzZS5lbGVtZW50ID0gZWxlbWVudDtcblxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlLm1vdXNlbW92ZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgbW91c2UubW91c2Vkb3duKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2UubW91c2V1cCk7XG4gICAgICAgIFxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBtb3VzZS5tb3VzZXdoZWVsKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Nb3VzZVNjcm9sbCcsIG1vdXNlLm1vdXNld2hlZWwpO1xuXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgbW91c2UubW91c2Vtb3ZlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgbW91c2UubW91c2Vkb3duKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG1vdXNlLm1vdXNldXApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIGNhcHR1cmVkIHNvdXJjZSBldmVudHMuXG4gICAgICogQG1ldGhvZCBjbGVhclNvdXJjZUV2ZW50c1xuICAgICAqIEBwYXJhbSB7bW91c2V9IG1vdXNlXG4gICAgICovXG4gICAgTW91c2UuY2xlYXJTb3VyY2VFdmVudHMgPSBmdW5jdGlvbihtb3VzZSkge1xuICAgICAgICBtb3VzZS5zb3VyY2VFdmVudHMubW91c2Vtb3ZlID0gbnVsbDtcbiAgICAgICAgbW91c2Uuc291cmNlRXZlbnRzLm1vdXNlZG93biA9IG51bGw7XG4gICAgICAgIG1vdXNlLnNvdXJjZUV2ZW50cy5tb3VzZXVwID0gbnVsbDtcbiAgICAgICAgbW91c2Uuc291cmNlRXZlbnRzLm1vdXNld2hlZWwgPSBudWxsO1xuICAgICAgICBtb3VzZS53aGVlbERlbHRhID0gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbW91c2UgcG9zaXRpb24gb2Zmc2V0LlxuICAgICAqIEBtZXRob2Qgc2V0T2Zmc2V0XG4gICAgICogQHBhcmFtIHttb3VzZX0gbW91c2VcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gb2Zmc2V0XG4gICAgICovXG4gICAgTW91c2Uuc2V0T2Zmc2V0ID0gZnVuY3Rpb24obW91c2UsIG9mZnNldCkge1xuICAgICAgICBtb3VzZS5vZmZzZXQueCA9IG9mZnNldC54O1xuICAgICAgICBtb3VzZS5vZmZzZXQueSA9IG9mZnNldC55O1xuICAgICAgICBtb3VzZS5wb3NpdGlvbi54ID0gbW91c2UuYWJzb2x1dGUueCAqIG1vdXNlLnNjYWxlLnggKyBtb3VzZS5vZmZzZXQueDtcbiAgICAgICAgbW91c2UucG9zaXRpb24ueSA9IG1vdXNlLmFic29sdXRlLnkgKiBtb3VzZS5zY2FsZS55ICsgbW91c2Uub2Zmc2V0Lnk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1vdXNlIHBvc2l0aW9uIHNjYWxlLlxuICAgICAqIEBtZXRob2Qgc2V0U2NhbGVcbiAgICAgKiBAcGFyYW0ge21vdXNlfSBtb3VzZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBzY2FsZVxuICAgICAqL1xuICAgIE1vdXNlLnNldFNjYWxlID0gZnVuY3Rpb24obW91c2UsIHNjYWxlKSB7XG4gICAgICAgIG1vdXNlLnNjYWxlLnggPSBzY2FsZS54O1xuICAgICAgICBtb3VzZS5zY2FsZS55ID0gc2NhbGUueTtcbiAgICAgICAgbW91c2UucG9zaXRpb24ueCA9IG1vdXNlLmFic29sdXRlLnggKiBtb3VzZS5zY2FsZS54ICsgbW91c2Uub2Zmc2V0Lng7XG4gICAgICAgIG1vdXNlLnBvc2l0aW9uLnkgPSBtb3VzZS5hYnNvbHV0ZS55ICogbW91c2Uuc2NhbGUueSArIG1vdXNlLm9mZnNldC55O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbW91c2UgcG9zaXRpb24gcmVsYXRpdmUgdG8gYW4gZWxlbWVudCBnaXZlbiBhIHNjcmVlbiBwaXhlbCByYXRpby5cbiAgICAgKiBAbWV0aG9kIF9nZXRSZWxhdGl2ZU1vdXNlUG9zaXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7fSBldmVudFxuICAgICAqIEBwYXJhbSB7fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBpeGVsUmF0aW9cbiAgICAgKiBAcmV0dXJuIHt9XG4gICAgICovXG4gICAgdmFyIF9nZXRSZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBmdW5jdGlvbihldmVudCwgZWxlbWVudCwgcGl4ZWxSYXRpbykge1xuICAgICAgICB2YXIgZWxlbWVudEJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICByb290Tm9kZSA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlIHx8IGRvY3VtZW50LmJvZHkpLFxuICAgICAgICAgICAgc2Nyb2xsWCA9ICh3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCkgPyB3aW5kb3cucGFnZVhPZmZzZXQgOiByb290Tm9kZS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgc2Nyb2xsWSA9ICh3aW5kb3cucGFnZVlPZmZzZXQgIT09IHVuZGVmaW5lZCkgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiByb290Tm9kZS5zY3JvbGxUb3AsXG4gICAgICAgICAgICB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgICB4LCB5O1xuICAgICAgICBcbiAgICAgICAgaWYgKHRvdWNoZXMpIHtcbiAgICAgICAgICAgIHggPSB0b3VjaGVzWzBdLnBhZ2VYIC0gZWxlbWVudEJvdW5kcy5sZWZ0IC0gc2Nyb2xsWDtcbiAgICAgICAgICAgIHkgPSB0b3VjaGVzWzBdLnBhZ2VZIC0gZWxlbWVudEJvdW5kcy50b3AgLSBzY3JvbGxZO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeCA9IGV2ZW50LnBhZ2VYIC0gZWxlbWVudEJvdW5kcy5sZWZ0IC0gc2Nyb2xsWDtcbiAgICAgICAgICAgIHkgPSBldmVudC5wYWdlWSAtIGVsZW1lbnRCb3VuZHMudG9wIC0gc2Nyb2xsWTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IFxuICAgICAgICAgICAgeDogeCAvIChlbGVtZW50LmNsaWVudFdpZHRoIC8gKGVsZW1lbnQud2lkdGggfHwgZWxlbWVudC5jbGllbnRXaWR0aCkgKiBwaXhlbFJhdGlvKSxcbiAgICAgICAgICAgIHk6IHkgLyAoZWxlbWVudC5jbGllbnRIZWlnaHQgLyAoZWxlbWVudC5oZWlnaHQgfHwgZWxlbWVudC5jbGllbnRIZWlnaHQpICogcGl4ZWxSYXRpbylcbiAgICAgICAgfTtcbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4uL2NvcmUvQ29tbW9uXCI6MTR9XSwyMDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuUGx1Z2luYCBtb2R1bGUgY29udGFpbnMgZnVuY3Rpb25zIGZvciByZWdpc3RlcmluZyBhbmQgaW5zdGFsbGluZyBwbHVnaW5zIG9uIG1vZHVsZXMuXG4qXG4qIEBjbGFzcyBQbHVnaW5cbiovXG5cbnZhciBQbHVnaW4gPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbHVnaW47XG5cbnZhciBDb21tb24gPSBfZGVyZXFfKCcuL0NvbW1vbicpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICBQbHVnaW4uX3JlZ2lzdHJ5ID0ge307XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYSBwbHVnaW4gb2JqZWN0IHNvIGl0IGNhbiBiZSByZXNvbHZlZCBsYXRlciBieSBuYW1lLlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0gcGx1Z2luIHt9IFRoZSBwbHVnaW4gdG8gcmVnaXN0ZXIuXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgcGx1Z2luLlxuICAgICAqL1xuICAgIFBsdWdpbi5yZWdpc3RlciA9IGZ1bmN0aW9uKHBsdWdpbikge1xuICAgICAgICBpZiAoIVBsdWdpbi5pc1BsdWdpbihwbHVnaW4pKSB7XG4gICAgICAgICAgICBDb21tb24ud2FybignUGx1Z2luLnJlZ2lzdGVyOicsIFBsdWdpbi50b1N0cmluZyhwbHVnaW4pLCAnZG9lcyBub3QgaW1wbGVtZW50IGFsbCByZXF1aXJlZCBmaWVsZHMuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGx1Z2luLm5hbWUgaW4gUGx1Z2luLl9yZWdpc3RyeSkge1xuICAgICAgICAgICAgdmFyIHJlZ2lzdGVyZWQgPSBQbHVnaW4uX3JlZ2lzdHJ5W3BsdWdpbi5uYW1lXSxcbiAgICAgICAgICAgICAgICBwbHVnaW5WZXJzaW9uID0gUGx1Z2luLnZlcnNpb25QYXJzZShwbHVnaW4udmVyc2lvbikubnVtYmVyLFxuICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRWZXJzaW9uID0gUGx1Z2luLnZlcnNpb25QYXJzZShyZWdpc3RlcmVkLnZlcnNpb24pLm51bWJlcjtcblxuICAgICAgICAgICAgaWYgKHBsdWdpblZlcnNpb24gPiByZWdpc3RlcmVkVmVyc2lvbikge1xuICAgICAgICAgICAgICAgIENvbW1vbi53YXJuKCdQbHVnaW4ucmVnaXN0ZXI6JywgUGx1Z2luLnRvU3RyaW5nKHJlZ2lzdGVyZWQpLCAnd2FzIHVwZ3JhZGVkIHRvJywgUGx1Z2luLnRvU3RyaW5nKHBsdWdpbikpO1xuICAgICAgICAgICAgICAgIFBsdWdpbi5fcmVnaXN0cnlbcGx1Z2luLm5hbWVdID0gcGx1Z2luO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwbHVnaW5WZXJzaW9uIDwgcmVnaXN0ZXJlZFZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICBDb21tb24ud2FybignUGx1Z2luLnJlZ2lzdGVyOicsIFBsdWdpbi50b1N0cmluZyhyZWdpc3RlcmVkKSwgJ2NhbiBub3QgYmUgZG93bmdyYWRlZCB0bycsIFBsdWdpbi50b1N0cmluZyhwbHVnaW4pKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGx1Z2luICE9PSByZWdpc3RlcmVkKSB7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oJ1BsdWdpbi5yZWdpc3RlcjonLCBQbHVnaW4udG9TdHJpbmcocGx1Z2luKSwgJ2lzIGFscmVhZHkgcmVnaXN0ZXJlZCB0byBkaWZmZXJlbnQgcGx1Z2luIG9iamVjdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGx1Z2luLl9yZWdpc3RyeVtwbHVnaW4ubmFtZV0gPSBwbHVnaW47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGx1Z2luO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhIGRlcGVuZGVuY3kgdG8gYSBwbHVnaW4gb2JqZWN0IGZyb20gdGhlIHJlZ2lzdHJ5IGlmIGl0IGV4aXN0cy4gXG4gICAgICogVGhlIGBkZXBlbmRlbmN5YCBtYXkgY29udGFpbiBhIHZlcnNpb24sIGJ1dCBvbmx5IHRoZSBuYW1lIG1hdHRlcnMgd2hlbiByZXNvbHZpbmcuXG4gICAgICogQG1ldGhvZCByZXNvbHZlXG4gICAgICogQHBhcmFtIGRlcGVuZGVuY3kge3N0cmluZ30gVGhlIGRlcGVuZGVuY3kuXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBUaGUgcGx1Z2luIGlmIHJlc29sdmVkLCBvdGhlcndpc2UgYHVuZGVmaW5lZGAuXG4gICAgICovXG4gICAgUGx1Z2luLnJlc29sdmUgPSBmdW5jdGlvbihkZXBlbmRlbmN5KSB7XG4gICAgICAgIHJldHVybiBQbHVnaW4uX3JlZ2lzdHJ5W1BsdWdpbi5kZXBlbmRlbmN5UGFyc2UoZGVwZW5kZW5jeSkubmFtZV07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcmV0dHkgcHJpbnRlZCBwbHVnaW4gbmFtZSBhbmQgdmVyc2lvbi5cbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHBhcmFtIHBsdWdpbiB7fSBUaGUgcGx1Z2luLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gUHJldHR5IHByaW50ZWQgcGx1Z2luIG5hbWUgYW5kIHZlcnNpb24uXG4gICAgICovXG4gICAgUGx1Z2luLnRvU3RyaW5nID0gZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcGx1Z2luID09PSAnc3RyaW5nJyA/IHBsdWdpbiA6IChwbHVnaW4ubmFtZSB8fCAnYW5vbnltb3VzJykgKyAnQCcgKyAocGx1Z2luLnZlcnNpb24gfHwgcGx1Z2luLnJhbmdlIHx8ICcwLjAuMCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0IG1lZXRzIHRoZSBtaW5pbXVtIHN0YW5kYXJkIHRvIGJlIGNvbnNpZGVyZWQgYSBwbHVnaW4uXG4gICAgICogVGhpcyBtZWFucyBpdCBtdXN0IGRlZmluZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAgICogLSBgbmFtZWBcbiAgICAgKiAtIGB2ZXJzaW9uYFxuICAgICAqIC0gYGluc3RhbGxgXG4gICAgICogQG1ldGhvZCBpc1BsdWdpblxuICAgICAqIEBwYXJhbSBvYmoge30gVGhlIG9iaiB0byB0ZXN0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgb2JqZWN0IGNhbiBiZSBjb25zaWRlcmVkIGEgcGx1Z2luIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIFBsdWdpbi5pc1BsdWdpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICYmIG9iai5uYW1lICYmIG9iai52ZXJzaW9uICYmIG9iai5pbnN0YWxsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBhIHBsdWdpbiB3aXRoIHRoZSBnaXZlbiBgbmFtZWAgYmVlbiBpbnN0YWxsZWQgb24gYG1vZHVsZWAuXG4gICAgICogQG1ldGhvZCBpc1VzZWRcbiAgICAgKiBAcGFyYW0gbW9kdWxlIHt9IFRoZSBtb2R1bGUuXG4gICAgICogQHBhcmFtIG5hbWUge3N0cmluZ30gVGhlIHBsdWdpbiBuYW1lLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGB0cnVlYCBpZiBhIHBsdWdpbiB3aXRoIHRoZSBnaXZlbiBgbmFtZWAgYmVlbiBpbnN0YWxsZWQgb24gYG1vZHVsZWAsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIFBsdWdpbi5pc1VzZWQgPSBmdW5jdGlvbihtb2R1bGUsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG1vZHVsZS51c2VkLmluZGV4T2YobmFtZSkgPiAtMTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgYHBsdWdpbi5mb3JgIGlzIGFwcGxpY2FibGUgdG8gYG1vZHVsZWAgYnkgY29tcGFyaW5nIGFnYWluc3QgYG1vZHVsZS5uYW1lYCBhbmQgYG1vZHVsZS52ZXJzaW9uYC5cbiAgICAgKiBJZiBgcGx1Z2luLmZvcmAgaXMgbm90IHNwZWNpZmllZCB0aGVuIGl0IGlzIGFzc3VtZWQgdG8gYmUgYXBwbGljYWJsZS5cbiAgICAgKiBUaGUgdmFsdWUgb2YgYHBsdWdpbi5mb3JgIGlzIGEgc3RyaW5nIG9mIHRoZSBmb3JtYXQgYCdtb2R1bGUtbmFtZSdgIG9yIGAnbW9kdWxlLW5hbWVAdmVyc2lvbidgLlxuICAgICAqIEBtZXRob2QgaXNGb3JcbiAgICAgKiBAcGFyYW0gcGx1Z2luIHt9IFRoZSBwbHVnaW4uXG4gICAgICogQHBhcmFtIG1vZHVsZSB7fSBUaGUgbW9kdWxlLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGB0cnVlYCBpZiBgcGx1Z2luLmZvcmAgaXMgYXBwbGljYWJsZSB0byBgbW9kdWxlYCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgUGx1Z2luLmlzRm9yID0gZnVuY3Rpb24ocGx1Z2luLCBtb2R1bGUpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9IHBsdWdpbi5mb3IgJiYgUGx1Z2luLmRlcGVuZGVuY3lQYXJzZShwbHVnaW4uZm9yKTtcbiAgICAgICAgcmV0dXJuICFwbHVnaW4uZm9yIHx8IChtb2R1bGUubmFtZSA9PT0gcGFyc2VkLm5hbWUgJiYgUGx1Z2luLnZlcnNpb25TYXRpc2ZpZXMobW9kdWxlLnZlcnNpb24sIHBhcnNlZC5yYW5nZSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YWxscyB0aGUgcGx1Z2lucyBieSBjYWxsaW5nIGBwbHVnaW4uaW5zdGFsbGAgb24gZWFjaCBwbHVnaW4gc3BlY2lmaWVkIGluIGBwbHVnaW5zYCBpZiBwYXNzZWQsIG90aGVyd2lzZSBgbW9kdWxlLnVzZXNgLlxuICAgICAqIEZvciBpbnN0YWxsaW5nIHBsdWdpbnMgb24gYE1hdHRlcmAgc2VlIHRoZSBjb252ZW5pZW5jZSBmdW5jdGlvbiBgTWF0dGVyLnVzZWAuXG4gICAgICogUGx1Z2lucyBtYXkgYmUgc3BlY2lmaWVkIGVpdGhlciBieSB0aGVpciBuYW1lIG9yIGEgcmVmZXJlbmNlIHRvIHRoZSBwbHVnaW4gb2JqZWN0LlxuICAgICAqIFBsdWdpbnMgdGhlbXNlbHZlcyBtYXkgc3BlY2lmeSBmdXJ0aGVyIGRlcGVuZGVuY2llcywgYnV0IGVhY2ggcGx1Z2luIGlzIGluc3RhbGxlZCBvbmx5IG9uY2UuXG4gICAgICogT3JkZXIgaXMgaW1wb3J0YW50LCBhIHRvcG9sb2dpY2FsIHNvcnQgaXMgcGVyZm9ybWVkIHRvIGZpbmQgdGhlIGJlc3QgcmVzdWx0aW5nIG9yZGVyIG9mIGluc3RhbGxhdGlvbi5cbiAgICAgKiBUaGlzIHNvcnRpbmcgYXR0ZW1wdHMgdG8gc2F0aXNmeSBldmVyeSBkZXBlbmRlbmN5J3MgcmVxdWVzdGVkIG9yZGVyaW5nLCBidXQgbWF5IG5vdCBiZSBleGFjdCBpbiBhbGwgY2FzZXMuXG4gICAgICogVGhpcyBmdW5jdGlvbiBsb2dzIHRoZSByZXN1bHRpbmcgc3RhdHVzIG9mIGVhY2ggZGVwZW5kZW5jeSBpbiB0aGUgY29uc29sZSwgYWxvbmcgd2l0aCBhbnkgd2FybmluZ3MuXG4gICAgICogLSBBIGdyZWVuIHRpY2sg4pyFIGluZGljYXRlcyBhIGRlcGVuZGVuY3kgd2FzIHJlc29sdmVkIGFuZCBpbnN0YWxsZWQuXG4gICAgICogLSBBbiBvcmFuZ2UgZGlhbW9uZCDwn5S2IGluZGljYXRlcyBhIGRlcGVuZGVuY3kgd2FzIHJlc29sdmVkIGJ1dCBhIHdhcm5pbmcgd2FzIHRocm93biBmb3IgaXQgb3Igb25lIGlmIGl0cyBkZXBlbmRlbmNpZXMuXG4gICAgICogLSBBIHJlZCBjcm9zcyDinYwgaW5kaWNhdGVzIGEgZGVwZW5kZW5jeSBjb3VsZCBub3QgYmUgcmVzb2x2ZWQuXG4gICAgICogQXZvaWQgY2FsbGluZyB0aGlzIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIG9uIHRoZSBzYW1lIG1vZHVsZSB1bmxlc3MgeW91IGludGVuZCB0byBtYW51YWxseSBjb250cm9sIGluc3RhbGxhdGlvbiBvcmRlci5cbiAgICAgKiBAbWV0aG9kIHVzZVxuICAgICAqIEBwYXJhbSBtb2R1bGUge30gVGhlIG1vZHVsZSBpbnN0YWxsIHBsdWdpbnMgb24uXG4gICAgICogQHBhcmFtIFtwbHVnaW5zPW1vZHVsZS51c2VzXSB7fSBUaGUgcGx1Z2lucyB0byBpbnN0YWxsIG9uIG1vZHVsZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIGBtb2R1bGUudXNlc2ApLlxuICAgICAqL1xuICAgIFBsdWdpbi51c2UgPSBmdW5jdGlvbihtb2R1bGUsIHBsdWdpbnMpIHtcbiAgICAgICAgbW9kdWxlLnVzZXMgPSAobW9kdWxlLnVzZXMgfHwgW10pLmNvbmNhdChwbHVnaW5zIHx8IFtdKTtcblxuICAgICAgICBpZiAobW9kdWxlLnVzZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBDb21tb24ud2FybignUGx1Z2luLnVzZTonLCBQbHVnaW4udG9TdHJpbmcobW9kdWxlKSwgJ2RvZXMgbm90IHNwZWNpZnkgYW55IGRlcGVuZGVuY2llcyB0byBpbnN0YWxsLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlcGVuZGVuY2llcyA9IFBsdWdpbi5kZXBlbmRlbmNpZXMobW9kdWxlKSxcbiAgICAgICAgICAgIHNvcnRlZERlcGVuZGVuY2llcyA9IENvbW1vbi50b3BvbG9naWNhbFNvcnQoZGVwZW5kZW5jaWVzKSxcbiAgICAgICAgICAgIHN0YXR1cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc29ydGVkRGVwZW5kZW5jaWVzW2ldID09PSBtb2R1bGUubmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGx1Z2luID0gUGx1Z2luLnJlc29sdmUoc29ydGVkRGVwZW5kZW5jaWVzW2ldKTtcblxuICAgICAgICAgICAgaWYgKCFwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMucHVzaCgn4p2MICcgKyBzb3J0ZWREZXBlbmRlbmNpZXNbaV0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoUGx1Z2luLmlzVXNlZChtb2R1bGUsIHBsdWdpbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBsdWdpbi5pc0ZvcihwbHVnaW4sIG1vZHVsZSkpIHtcbiAgICAgICAgICAgICAgICBDb21tb24ud2FybignUGx1Z2luLnVzZTonLCBQbHVnaW4udG9TdHJpbmcocGx1Z2luKSwgJ2lzIGZvcicsIHBsdWdpbi5mb3IsICdidXQgaW5zdGFsbGVkIG9uJywgUGx1Z2luLnRvU3RyaW5nKG1vZHVsZSkgKyAnLicpO1xuICAgICAgICAgICAgICAgIHBsdWdpbi5fd2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBsdWdpbi5pbnN0YWxsKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luLmluc3RhbGwobW9kdWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oJ1BsdWdpbi51c2U6JywgUGx1Z2luLnRvU3RyaW5nKHBsdWdpbiksICdkb2VzIG5vdCBzcGVjaWZ5IGFuIGluc3RhbGwgZnVuY3Rpb24uJyk7XG4gICAgICAgICAgICAgICAgcGx1Z2luLl93YXJuZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGx1Z2luLl93YXJuZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMucHVzaCgn8J+UtiAnICsgUGx1Z2luLnRvU3RyaW5nKHBsdWdpbikpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBwbHVnaW4uX3dhcm5lZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzLnB1c2goJ+KchSAnICsgUGx1Z2luLnRvU3RyaW5nKHBsdWdpbikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtb2R1bGUudXNlZC5wdXNoKHBsdWdpbi5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0dXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgQ29tbW9uLmluZm8oc3RhdHVzLmpvaW4oJyAgJykpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlY3Vyc2l2ZWx5IGZpbmRzIGFsbCBvZiBhIG1vZHVsZSdzIGRlcGVuZGVuY2llcyBhbmQgcmV0dXJucyBhIGZsYXQgZGVwZW5kZW5jeSBncmFwaC5cbiAgICAgKiBAbWV0aG9kIGRlcGVuZGVuY2llc1xuICAgICAqIEBwYXJhbSBtb2R1bGUge30gVGhlIG1vZHVsZS5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IEEgZGVwZW5kZW5jeSBncmFwaC5cbiAgICAgKi9cbiAgICBQbHVnaW4uZGVwZW5kZW5jaWVzID0gZnVuY3Rpb24obW9kdWxlLCB0cmFja2VkKSB7XG4gICAgICAgIHZhciBwYXJzZWRCYXNlID0gUGx1Z2luLmRlcGVuZGVuY3lQYXJzZShtb2R1bGUpLFxuICAgICAgICAgICAgbmFtZSA9IHBhcnNlZEJhc2UubmFtZTtcblxuICAgICAgICB0cmFja2VkID0gdHJhY2tlZCB8fCB7fTtcblxuICAgICAgICBpZiAobmFtZSBpbiB0cmFja2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtb2R1bGUgPSBQbHVnaW4ucmVzb2x2ZShtb2R1bGUpIHx8IG1vZHVsZTtcblxuICAgICAgICB0cmFja2VkW25hbWVdID0gQ29tbW9uLm1hcChtb2R1bGUudXNlcyB8fCBbXSwgZnVuY3Rpb24oZGVwZW5kZW5jeSkge1xuICAgICAgICAgICAgaWYgKFBsdWdpbi5pc1BsdWdpbihkZXBlbmRlbmN5KSkge1xuICAgICAgICAgICAgICAgIFBsdWdpbi5yZWdpc3RlcihkZXBlbmRlbmN5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IFBsdWdpbi5kZXBlbmRlbmN5UGFyc2UoZGVwZW5kZW5jeSksXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWQgPSBQbHVnaW4ucmVzb2x2ZShkZXBlbmRlbmN5KTtcblxuICAgICAgICAgICAgaWYgKHJlc29sdmVkICYmICFQbHVnaW4udmVyc2lvblNhdGlzZmllcyhyZXNvbHZlZC52ZXJzaW9uLCBwYXJzZWQucmFuZ2UpKSB7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICdQbHVnaW4uZGVwZW5kZW5jaWVzOicsIFBsdWdpbi50b1N0cmluZyhyZXNvbHZlZCksICdkb2VzIG5vdCBzYXRpc2Z5JyxcbiAgICAgICAgICAgICAgICAgICAgUGx1Z2luLnRvU3RyaW5nKHBhcnNlZCksICd1c2VkIGJ5JywgUGx1Z2luLnRvU3RyaW5nKHBhcnNlZEJhc2UpICsgJy4nXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmVkLl93YXJuZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG1vZHVsZS5fd2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXJlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICdQbHVnaW4uZGVwZW5kZW5jaWVzOicsIFBsdWdpbi50b1N0cmluZyhkZXBlbmRlbmN5KSwgJ3VzZWQgYnknLFxuICAgICAgICAgICAgICAgICAgICBQbHVnaW4udG9TdHJpbmcocGFyc2VkQmFzZSksICdjb3VsZCBub3QgYmUgcmVzb2x2ZWQuJ1xuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBtb2R1bGUuX3dhcm5lZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZWQubmFtZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja2VkW25hbWVdLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBQbHVnaW4uZGVwZW5kZW5jaWVzKHRyYWNrZWRbbmFtZV1baV0sIHRyYWNrZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYWNrZWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhIGRlcGVuZGVuY3kgc3RyaW5nIGludG8gaXRzIGNvbXBvbmVudHMuXG4gICAgICogVGhlIGBkZXBlbmRlbmN5YCBpcyBhIHN0cmluZyBvZiB0aGUgZm9ybWF0IGAnbW9kdWxlLW5hbWUnYCBvciBgJ21vZHVsZS1uYW1lQHZlcnNpb24nYC5cbiAgICAgKiBTZWUgZG9jdW1lbnRhdGlvbiBmb3IgYFBsdWdpbi52ZXJzaW9uUGFyc2VgIGZvciBhIGRlc2NyaXB0aW9uIG9mIHRoZSBmb3JtYXQuXG4gICAgICogVGhpcyBmdW5jdGlvbiBjYW4gYWxzbyBoYW5kbGUgZGVwZW5kZW5jaWVzIHRoYXQgYXJlIGFscmVhZHkgcmVzb2x2ZWQgKGUuZy4gYSBtb2R1bGUgb2JqZWN0KS5cbiAgICAgKiBAbWV0aG9kIGRlcGVuZGVuY3lQYXJzZVxuICAgICAqIEBwYXJhbSBkZXBlbmRlbmN5IHtzdHJpbmd9IFRoZSBkZXBlbmRlbmN5IG9mIHRoZSBmb3JtYXQgYCdtb2R1bGUtbmFtZSdgIG9yIGAnbW9kdWxlLW5hbWVAdmVyc2lvbidgLlxuICAgICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGRlcGVuZGVuY3kgcGFyc2VkIGludG8gaXRzIGNvbXBvbmVudHMuXG4gICAgICovXG4gICAgUGx1Z2luLmRlcGVuZGVuY3lQYXJzZSA9IGZ1bmN0aW9uKGRlcGVuZGVuY3kpIHtcbiAgICAgICAgaWYgKENvbW1vbi5pc1N0cmluZyhkZXBlbmRlbmN5KSkge1xuICAgICAgICAgICAgdmFyIHBhdHRlcm4gPSAvXltcXHctXSsoQChcXCp8W1xcXn5dP1xcZCtcXC5cXGQrXFwuXFxkKygtWzAtOUEtWmEtei1dKyk/KSk/JC87XG5cbiAgICAgICAgICAgIGlmICghcGF0dGVybi50ZXN0KGRlcGVuZGVuY3kpKSB7XG4gICAgICAgICAgICAgICAgQ29tbW9uLndhcm4oJ1BsdWdpbi5kZXBlbmRlbmN5UGFyc2U6JywgZGVwZW5kZW5jeSwgJ2lzIG5vdCBhIHZhbGlkIGRlcGVuZGVuY3kgc3RyaW5nLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGRlcGVuZGVuY3kuc3BsaXQoJ0AnKVswXSxcbiAgICAgICAgICAgICAgICByYW5nZTogZGVwZW5kZW5jeS5zcGxpdCgnQCcpWzFdIHx8ICcqJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBkZXBlbmRlbmN5Lm5hbWUsXG4gICAgICAgICAgICByYW5nZTogZGVwZW5kZW5jeS5yYW5nZSB8fCBkZXBlbmRlbmN5LnZlcnNpb25cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIGEgdmVyc2lvbiBzdHJpbmcgaW50byBpdHMgY29tcG9uZW50cy4gIFxuICAgICAqIFZlcnNpb25zIGFyZSBzdHJpY3RseSBvZiB0aGUgZm9ybWF0IGB4LnkuemAgKGFzIGluIFtzZW12ZXJdKGh0dHA6Ly9zZW12ZXIub3JnLykpLlxuICAgICAqIFZlcnNpb25zIG1heSBvcHRpb25hbGx5IGhhdmUgYSBwcmVyZWxlYXNlIHRhZyBpbiB0aGUgZm9ybWF0IGB4Lnkuei1hbHBoYWAuXG4gICAgICogUmFuZ2VzIGFyZSBhIHN0cmljdCBzdWJzZXQgb2YgW25wbSByYW5nZXNdKGh0dHBzOi8vZG9jcy5ucG1qcy5jb20vbWlzYy9zZW12ZXIjYWR2YW5jZWQtcmFuZ2Utc3ludGF4KS5cbiAgICAgKiBPbmx5IHRoZSBmb2xsb3dpbmcgcmFuZ2UgdHlwZXMgYXJlIHN1cHBvcnRlZDpcbiAgICAgKiAtIFRpbGRlIHJhbmdlcyBlLmcuIGB+MS4yLjNgXG4gICAgICogLSBDYXJldCByYW5nZXMgZS5nLiBgXjEuMi4zYFxuICAgICAqIC0gRXhhY3QgdmVyc2lvbiBlLmcuIGAxLjIuM2BcbiAgICAgKiAtIEFueSB2ZXJzaW9uIGAqYFxuICAgICAqIEBtZXRob2QgdmVyc2lvblBhcnNlXG4gICAgICogQHBhcmFtIHJhbmdlIHtzdHJpbmd9IFRoZSB2ZXJzaW9uIHN0cmluZy5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IFRoZSB2ZXJzaW9uIHJhbmdlIHBhcnNlZCBpbnRvIGl0cyBjb21wb25lbnRzLlxuICAgICAqL1xuICAgIFBsdWdpbi52ZXJzaW9uUGFyc2UgPSBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICB2YXIgcGF0dGVybiA9IC9eXFwqfFtcXF5+XT9cXGQrXFwuXFxkK1xcLlxcZCsoLVswLTlBLVphLXotXSspPyQvO1xuXG4gICAgICAgIGlmICghcGF0dGVybi50ZXN0KHJhbmdlKSkge1xuICAgICAgICAgICAgQ29tbW9uLndhcm4oJ1BsdWdpbi52ZXJzaW9uUGFyc2U6JywgcmFuZ2UsICdpcyBub3QgYSB2YWxpZCB2ZXJzaW9uIG9yIHJhbmdlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlkZW50aWZpZXJzID0gcmFuZ2Uuc3BsaXQoJy0nKTtcbiAgICAgICAgcmFuZ2UgPSBpZGVudGlmaWVyc1swXTtcblxuICAgICAgICB2YXIgaXNSYW5nZSA9IGlzTmFOKE51bWJlcihyYW5nZVswXSkpLFxuICAgICAgICAgICAgdmVyc2lvbiA9IGlzUmFuZ2UgPyByYW5nZS5zdWJzdHIoMSkgOiByYW5nZSxcbiAgICAgICAgICAgIHBhcnRzID0gQ29tbW9uLm1hcCh2ZXJzaW9uLnNwbGl0KCcuJyksIGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHBhcnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzUmFuZ2U6IGlzUmFuZ2UsXG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgcmFuZ2U6IHJhbmdlLFxuICAgICAgICAgICAgb3BlcmF0b3I6IGlzUmFuZ2UgPyByYW5nZVswXSA6ICcnLFxuICAgICAgICAgICAgcGFydHM6IHBhcnRzLFxuICAgICAgICAgICAgcHJlcmVsZWFzZTogaWRlbnRpZmllcnNbMV0sXG4gICAgICAgICAgICBudW1iZXI6IHBhcnRzWzBdICogMWU4ICsgcGFydHNbMV0gKiAxZTQgKyBwYXJ0c1syXVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBgdmVyc2lvbmAgc2F0aXNmaWVzIHRoZSBnaXZlbiBgcmFuZ2VgLlxuICAgICAqIFNlZSBkb2N1bWVudGF0aW9uIGZvciBgUGx1Z2luLnZlcnNpb25QYXJzZWAgZm9yIGEgZGVzY3JpcHRpb24gb2YgdGhlIGZvcm1hdC5cbiAgICAgKiBJZiBhIHZlcnNpb24gb3IgcmFuZ2UgaXMgbm90IHNwZWNpZmllZCwgdGhlbiBhbnkgdmVyc2lvbiAoYCpgKSBpcyBhc3N1bWVkIHRvIHNhdGlzZnkuXG4gICAgICogQG1ldGhvZCB2ZXJzaW9uU2F0aXNmaWVzXG4gICAgICogQHBhcmFtIHZlcnNpb24ge3N0cmluZ30gVGhlIHZlcnNpb24gc3RyaW5nLlxuICAgICAqIEBwYXJhbSByYW5nZSB7c3RyaW5nfSBUaGUgcmFuZ2Ugc3RyaW5nLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGB0cnVlYCBpZiBgdmVyc2lvbmAgc2F0aXNmaWVzIGByYW5nZWAsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIFBsdWdpbi52ZXJzaW9uU2F0aXNmaWVzID0gZnVuY3Rpb24odmVyc2lvbiwgcmFuZ2UpIHtcbiAgICAgICAgcmFuZ2UgPSByYW5nZSB8fCAnKic7XG5cbiAgICAgICAgdmFyIHJhbmdlUGFyc2VkID0gUGx1Z2luLnZlcnNpb25QYXJzZShyYW5nZSksXG4gICAgICAgICAgICByYW5nZVBhcnRzID0gcmFuZ2VQYXJzZWQucGFydHMsXG4gICAgICAgICAgICB2ZXJzaW9uUGFyc2VkID0gUGx1Z2luLnZlcnNpb25QYXJzZSh2ZXJzaW9uKSxcbiAgICAgICAgICAgIHZlcnNpb25QYXJ0cyA9IHZlcnNpb25QYXJzZWQucGFydHM7XG5cbiAgICAgICAgaWYgKHJhbmdlUGFyc2VkLmlzUmFuZ2UpIHtcbiAgICAgICAgICAgIGlmIChyYW5nZVBhcnNlZC5vcGVyYXRvciA9PT0gJyonIHx8IHZlcnNpb24gPT09ICcqJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmFuZ2VQYXJzZWQub3BlcmF0b3IgPT09ICd+Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uUGFydHNbMF0gPT09IHJhbmdlUGFydHNbMF0gJiYgdmVyc2lvblBhcnRzWzFdID09PSByYW5nZVBhcnRzWzFdICYmIHZlcnNpb25QYXJ0c1syXSA+PSByYW5nZVBhcnRzWzJdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmFuZ2VQYXJzZWQub3BlcmF0b3IgPT09ICdeJykge1xuICAgICAgICAgICAgICAgIGlmIChyYW5nZVBhcnRzWzBdID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvblBhcnRzWzBdID09PSByYW5nZVBhcnRzWzBdICYmIHZlcnNpb25QYXJzZWQubnVtYmVyID49IHJhbmdlUGFyc2VkLm51bWJlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VQYXJ0c1sxXSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb25QYXJ0c1sxXSA9PT0gcmFuZ2VQYXJ0c1sxXSAmJiB2ZXJzaW9uUGFydHNbMl0gPj0gcmFuZ2VQYXJ0c1syXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvblBhcnRzWzJdID09PSByYW5nZVBhcnRzWzJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gPT09IHJhbmdlIHx8IHZlcnNpb24gPT09ICcqJztcbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4vQ29tbW9uXCI6MTR9XSwyMTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiogVGhlIGBNYXR0ZXIuUnVubmVyYCBtb2R1bGUgaXMgYW4gb3B0aW9uYWwgdXRpbGl0eSB3aGljaCBwcm92aWRlcyBhIGdhbWUgbG9vcCwgXG4qIHRoYXQgaGFuZGxlcyBjb250aW51b3VzbHkgdXBkYXRpbmcgYSBgTWF0dGVyLkVuZ2luZWAgZm9yIHlvdSB3aXRoaW4gYSBicm93c2VyLlxuKiBJdCBpcyBpbnRlbmRlZCBmb3IgZGV2ZWxvcG1lbnQgYW5kIGRlYnVnZ2luZyBwdXJwb3NlcywgYnV0IG1heSBhbHNvIGJlIHN1aXRhYmxlIGZvciBzaW1wbGUgZ2FtZXMuXG4qIElmIHlvdSBhcmUgdXNpbmcgeW91ciBvd24gZ2FtZSBsb29wIGluc3RlYWQsIHRoZW4geW91IGRvIG5vdCBuZWVkIHRoZSBgTWF0dGVyLlJ1bm5lcmAgbW9kdWxlLlxuKiBJbnN0ZWFkIGp1c3QgY2FsbCBgRW5naW5lLnVwZGF0ZShlbmdpbmUsIGRlbHRhKWAgaW4geW91ciBvd24gbG9vcC5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIFJ1bm5lclxuKi9cblxudmFyIFJ1bm5lciA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bm5lcjtcblxudmFyIEV2ZW50cyA9IF9kZXJlcV8oJy4vRXZlbnRzJyk7XG52YXIgRW5naW5lID0gX2RlcmVxXygnLi9FbmdpbmUnKTtcbnZhciBDb21tb24gPSBfZGVyZXFfKCcuL0NvbW1vbicpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX3JlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICBcbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuICAgIH1cblxuICAgIGlmICghX3JlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICB2YXIgX2ZyYW1lVGltZW91dDtcblxuICAgICAgICBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2speyBcbiAgICAgICAgICAgIF9mcmFtZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhDb21tb24ubm93KCkpOyBcbiAgICAgICAgICAgIH0sIDEwMDAgLyA2MCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoX2ZyYW1lVGltZW91dCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSdW5uZXIuIFRoZSBvcHRpb25zIHBhcmFtZXRlciBpcyBhbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgYW55IHByb3BlcnRpZXMgeW91IHdpc2ggdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzLlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHt9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBSdW5uZXIuY3JlYXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBmcHM6IDYwLFxuICAgICAgICAgICAgY29ycmVjdGlvbjogMSxcbiAgICAgICAgICAgIGRlbHRhU2FtcGxlU2l6ZTogNjAsXG4gICAgICAgICAgICBjb3VudGVyVGltZXN0YW1wOiAwLFxuICAgICAgICAgICAgZnJhbWVDb3VudGVyOiAwLFxuICAgICAgICAgICAgZGVsdGFIaXN0b3J5OiBbXSxcbiAgICAgICAgICAgIHRpbWVQcmV2OiBudWxsLFxuICAgICAgICAgICAgdGltZVNjYWxlUHJldjogMSxcbiAgICAgICAgICAgIGZyYW1lUmVxdWVzdElkOiBudWxsLFxuICAgICAgICAgICAgaXNGaXhlZDogZmFsc2UsXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHJ1bm5lciA9IENvbW1vbi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHJ1bm5lci5kZWx0YSA9IHJ1bm5lci5kZWx0YSB8fCAxMDAwIC8gcnVubmVyLmZwcztcbiAgICAgICAgcnVubmVyLmRlbHRhTWluID0gcnVubmVyLmRlbHRhTWluIHx8IDEwMDAgLyBydW5uZXIuZnBzO1xuICAgICAgICBydW5uZXIuZGVsdGFNYXggPSBydW5uZXIuZGVsdGFNYXggfHwgMTAwMCAvIChydW5uZXIuZnBzICogMC41KTtcbiAgICAgICAgcnVubmVyLmZwcyA9IDEwMDAgLyBydW5uZXIuZGVsdGE7XG5cbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udGludW91c2x5IHRpY2tzIGEgYE1hdHRlci5FbmdpbmVgIGJ5IGNhbGxpbmcgYFJ1bm5lci50aWNrYCBvbiB0aGUgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgZXZlbnQuXG4gICAgICogQG1ldGhvZCBydW5cbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lXG4gICAgICovXG4gICAgUnVubmVyLnJ1biA9IGZ1bmN0aW9uKHJ1bm5lciwgZW5naW5lKSB7XG4gICAgICAgIC8vIGNyZWF0ZSBydW5uZXIgaWYgZW5naW5lIGlzIGZpcnN0IGFyZ3VtZW50XG4gICAgICAgIGlmICh0eXBlb2YgcnVubmVyLnBvc2l0aW9uSXRlcmF0aW9ucyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGVuZ2luZSA9IHJ1bm5lcjtcbiAgICAgICAgICAgIHJ1bm5lciA9IFJ1bm5lci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIChmdW5jdGlvbiByZW5kZXIodGltZSl7XG4gICAgICAgICAgICBydW5uZXIuZnJhbWVSZXF1ZXN0SWQgPSBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICAgICAgICAgIGlmICh0aW1lICYmIHJ1bm5lci5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgUnVubmVyLnRpY2socnVubmVyLCBlbmdpbmUsIHRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuXG4gICAgICAgIHJldHVybiBydW5uZXI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEEgZ2FtZSBsb29wIHV0aWxpdHkgdGhhdCB1cGRhdGVzIHRoZSBlbmdpbmUgYW5kIHJlbmRlcmVyIGJ5IG9uZSBzdGVwIChhICd0aWNrJykuXG4gICAgICogRmVhdHVyZXMgZGVsdGEgc21vb3RoaW5nLCB0aW1lIGNvcnJlY3Rpb24gYW5kIGZpeGVkIG9yIGR5bmFtaWMgdGltaW5nLlxuICAgICAqIFRyaWdnZXJzIGBiZWZvcmVUaWNrYCwgYHRpY2tgIGFuZCBgYWZ0ZXJUaWNrYCBldmVudHMgb24gdGhlIGVuZ2luZS5cbiAgICAgKiBDb25zaWRlciBqdXN0IGBFbmdpbmUudXBkYXRlKGVuZ2luZSwgZGVsdGEpYCBpZiB5b3UncmUgdXNpbmcgeW91ciBvd24gbG9vcC5cbiAgICAgKiBAbWV0aG9kIHRpY2tcbiAgICAgKiBAcGFyYW0ge3J1bm5lcn0gcnVubmVyXG4gICAgICogQHBhcmFtIHtlbmdpbmV9IGVuZ2luZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lXG4gICAgICovXG4gICAgUnVubmVyLnRpY2sgPSBmdW5jdGlvbihydW5uZXIsIGVuZ2luZSwgdGltZSkge1xuICAgICAgICB2YXIgdGltaW5nID0gZW5naW5lLnRpbWluZyxcbiAgICAgICAgICAgIGNvcnJlY3Rpb24gPSAxLFxuICAgICAgICAgICAgZGVsdGE7XG5cbiAgICAgICAgLy8gY3JlYXRlIGFuIGV2ZW50IG9iamVjdFxuICAgICAgICB2YXIgZXZlbnQgPSB7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWluZy50aW1lc3RhbXBcbiAgICAgICAgfTtcblxuICAgICAgICBFdmVudHMudHJpZ2dlcihydW5uZXIsICdiZWZvcmVUaWNrJywgZXZlbnQpO1xuICAgICAgICBFdmVudHMudHJpZ2dlcihlbmdpbmUsICdiZWZvcmVUaWNrJywgZXZlbnQpOyAvLyBAZGVwcmVjYXRlZFxuXG4gICAgICAgIGlmIChydW5uZXIuaXNGaXhlZCkge1xuICAgICAgICAgICAgLy8gZml4ZWQgdGltZXN0ZXBcbiAgICAgICAgICAgIGRlbHRhID0gcnVubmVyLmRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZHluYW1pYyB0aW1lc3RlcCBiYXNlZCBvbiB3YWxsIGNsb2NrIGJldHdlZW4gY2FsbHNcbiAgICAgICAgICAgIGRlbHRhID0gKHRpbWUgLSBydW5uZXIudGltZVByZXYpIHx8IHJ1bm5lci5kZWx0YTtcbiAgICAgICAgICAgIHJ1bm5lci50aW1lUHJldiA9IHRpbWU7XG5cbiAgICAgICAgICAgIC8vIG9wdGltaXN0aWNhbGx5IGZpbHRlciBkZWx0YSBvdmVyIGEgZmV3IGZyYW1lcywgdG8gaW1wcm92ZSBzdGFiaWxpdHlcbiAgICAgICAgICAgIHJ1bm5lci5kZWx0YUhpc3RvcnkucHVzaChkZWx0YSk7XG4gICAgICAgICAgICBydW5uZXIuZGVsdGFIaXN0b3J5ID0gcnVubmVyLmRlbHRhSGlzdG9yeS5zbGljZSgtcnVubmVyLmRlbHRhU2FtcGxlU2l6ZSk7XG4gICAgICAgICAgICBkZWx0YSA9IE1hdGgubWluLmFwcGx5KG51bGwsIHJ1bm5lci5kZWx0YUhpc3RvcnkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBsaW1pdCBkZWx0YVxuICAgICAgICAgICAgZGVsdGEgPSBkZWx0YSA8IHJ1bm5lci5kZWx0YU1pbiA/IHJ1bm5lci5kZWx0YU1pbiA6IGRlbHRhO1xuICAgICAgICAgICAgZGVsdGEgPSBkZWx0YSA+IHJ1bm5lci5kZWx0YU1heCA/IHJ1bm5lci5kZWx0YU1heCA6IGRlbHRhO1xuXG4gICAgICAgICAgICAvLyBjb3JyZWN0aW9uIGZvciBkZWx0YVxuICAgICAgICAgICAgY29ycmVjdGlvbiA9IGRlbHRhIC8gcnVubmVyLmRlbHRhO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgZW5naW5lIHRpbWluZyBvYmplY3RcbiAgICAgICAgICAgIHJ1bm5lci5kZWx0YSA9IGRlbHRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGltZSBjb3JyZWN0aW9uIGZvciB0aW1lIHNjYWxpbmdcbiAgICAgICAgaWYgKHJ1bm5lci50aW1lU2NhbGVQcmV2ICE9PSAwKVxuICAgICAgICAgICAgY29ycmVjdGlvbiAqPSB0aW1pbmcudGltZVNjYWxlIC8gcnVubmVyLnRpbWVTY2FsZVByZXY7XG5cbiAgICAgICAgaWYgKHRpbWluZy50aW1lU2NhbGUgPT09IDApXG4gICAgICAgICAgICBjb3JyZWN0aW9uID0gMDtcblxuICAgICAgICBydW5uZXIudGltZVNjYWxlUHJldiA9IHRpbWluZy50aW1lU2NhbGU7XG4gICAgICAgIHJ1bm5lci5jb3JyZWN0aW9uID0gY29ycmVjdGlvbjtcblxuICAgICAgICAvLyBmcHMgY291bnRlclxuICAgICAgICBydW5uZXIuZnJhbWVDb3VudGVyICs9IDE7XG4gICAgICAgIGlmICh0aW1lIC0gcnVubmVyLmNvdW50ZXJUaW1lc3RhbXAgPj0gMTAwMCkge1xuICAgICAgICAgICAgcnVubmVyLmZwcyA9IHJ1bm5lci5mcmFtZUNvdW50ZXIgKiAoKHRpbWUgLSBydW5uZXIuY291bnRlclRpbWVzdGFtcCkgLyAxMDAwKTtcbiAgICAgICAgICAgIHJ1bm5lci5jb3VudGVyVGltZXN0YW1wID0gdGltZTtcbiAgICAgICAgICAgIHJ1bm5lci5mcmFtZUNvdW50ZXIgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgRXZlbnRzLnRyaWdnZXIocnVubmVyLCAndGljaycsIGV2ZW50KTtcbiAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAndGljaycsIGV2ZW50KTsgLy8gQGRlcHJlY2F0ZWRcblxuICAgICAgICAvLyBpZiB3b3JsZCBoYXMgYmVlbiBtb2RpZmllZCwgY2xlYXIgdGhlIHJlbmRlciBzY2VuZSBncmFwaFxuICAgICAgICBpZiAoZW5naW5lLndvcmxkLmlzTW9kaWZpZWQgXG4gICAgICAgICAgICAmJiBlbmdpbmUucmVuZGVyXG4gICAgICAgICAgICAmJiBlbmdpbmUucmVuZGVyLmNvbnRyb2xsZXJcbiAgICAgICAgICAgICYmIGVuZ2luZS5yZW5kZXIuY29udHJvbGxlci5jbGVhcikge1xuICAgICAgICAgICAgZW5naW5lLnJlbmRlci5jb250cm9sbGVyLmNsZWFyKGVuZ2luZS5yZW5kZXIpOyAvLyBAZGVwcmVjYXRlZFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlXG4gICAgICAgIEV2ZW50cy50cmlnZ2VyKHJ1bm5lciwgJ2JlZm9yZVVwZGF0ZScsIGV2ZW50KTtcbiAgICAgICAgRW5naW5lLnVwZGF0ZShlbmdpbmUsIGRlbHRhLCBjb3JyZWN0aW9uKTtcbiAgICAgICAgRXZlbnRzLnRyaWdnZXIocnVubmVyLCAnYWZ0ZXJVcGRhdGUnLCBldmVudCk7XG5cbiAgICAgICAgLy8gcmVuZGVyXG4gICAgICAgIC8vIEBkZXByZWNhdGVkXG4gICAgICAgIGlmIChlbmdpbmUucmVuZGVyICYmIGVuZ2luZS5yZW5kZXIuY29udHJvbGxlcikge1xuICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIocnVubmVyLCAnYmVmb3JlUmVuZGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAnYmVmb3JlUmVuZGVyJywgZXZlbnQpOyAvLyBAZGVwcmVjYXRlZFxuXG4gICAgICAgICAgICBlbmdpbmUucmVuZGVyLmNvbnRyb2xsZXIud29ybGQoZW5naW5lLnJlbmRlcik7XG5cbiAgICAgICAgICAgIEV2ZW50cy50cmlnZ2VyKHJ1bm5lciwgJ2FmdGVyUmVuZGVyJywgZXZlbnQpO1xuICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIoZW5naW5lLCAnYWZ0ZXJSZW5kZXInLCBldmVudCk7IC8vIEBkZXByZWNhdGVkXG4gICAgICAgIH1cblxuICAgICAgICBFdmVudHMudHJpZ2dlcihydW5uZXIsICdhZnRlclRpY2snLCBldmVudCk7XG4gICAgICAgIEV2ZW50cy50cmlnZ2VyKGVuZ2luZSwgJ2FmdGVyVGljaycsIGV2ZW50KTsgLy8gQGRlcHJlY2F0ZWRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5kcyBleGVjdXRpb24gb2YgYFJ1bm5lci5ydW5gIG9uIHRoZSBnaXZlbiBgcnVubmVyYCwgYnkgY2FuY2VsaW5nIHRoZSBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCBldmVudCBsb29wLlxuICAgICAqIElmIHlvdSB3aXNoIHRvIG9ubHkgdGVtcG9yYXJpbHkgcGF1c2UgdGhlIGVuZ2luZSwgc2VlIGBlbmdpbmUuZW5hYmxlZGAgaW5zdGVhZC5cbiAgICAgKiBAbWV0aG9kIHN0b3BcbiAgICAgKiBAcGFyYW0ge3J1bm5lcn0gcnVubmVyXG4gICAgICovXG4gICAgUnVubmVyLnN0b3AgPSBmdW5jdGlvbihydW5uZXIpIHtcbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lKHJ1bm5lci5mcmFtZVJlcXVlc3RJZCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIGZvciBgUnVubmVyLnJ1bmAuXG4gICAgICogQG1ldGhvZCBzdGFydFxuICAgICAqIEBwYXJhbSB7cnVubmVyfSBydW5uZXJcbiAgICAgKiBAcGFyYW0ge2VuZ2luZX0gZW5naW5lXG4gICAgICovXG4gICAgUnVubmVyLnN0YXJ0ID0gZnVuY3Rpb24ocnVubmVyLCBlbmdpbmUpIHtcbiAgICAgICAgUnVubmVyLnJ1bihydW5uZXIsIGVuZ2luZSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgKlxuICAgICogIEV2ZW50cyBEb2N1bWVudGF0aW9uXG4gICAgKlxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIGF0IHRoZSBzdGFydCBvZiBhIHRpY2ssIGJlZm9yZSBhbnkgdXBkYXRlcyB0byB0aGUgZW5naW5lIG9yIHRpbWluZ1xuICAgICpcbiAgICAqIEBldmVudCBiZWZvcmVUaWNrXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCBhZnRlciBlbmdpbmUgdGltaW5nIHVwZGF0ZWQsIGJ1dCBqdXN0IGJlZm9yZSB1cGRhdGVcbiAgICAqXG4gICAgKiBAZXZlbnQgdGlja1xuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LnRpbWVzdGFtcCBUaGUgZW5naW5lLnRpbWluZy50aW1lc3RhbXAgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgYXQgdGhlIGVuZCBvZiBhIHRpY2ssIGFmdGVyIGVuZ2luZSB1cGRhdGUgYW5kIGFmdGVyIHJlbmRlcmluZ1xuICAgICpcbiAgICAqIEBldmVudCBhZnRlclRpY2tcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBldmVudC50aW1lc3RhbXAgVGhlIGVuZ2luZS50aW1pbmcudGltZXN0YW1wIG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIGJlZm9yZSB1cGRhdGVcbiAgICAqXG4gICAgKiBAZXZlbnQgYmVmb3JlVXBkYXRlXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCBhZnRlciB1cGRhdGVcbiAgICAqXG4gICAgKiBAZXZlbnQgYWZ0ZXJVcGRhdGVcbiAgICAqIEBwYXJhbSB7fSBldmVudCBBbiBldmVudCBvYmplY3RcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBldmVudC50aW1lc3RhbXAgVGhlIGVuZ2luZS50aW1pbmcudGltZXN0YW1wIG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50LnNvdXJjZSBUaGUgc291cmNlIG9iamVjdCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgICovXG5cbiAgICAvKipcbiAgICAqIEZpcmVkIGJlZm9yZSByZW5kZXJpbmdcbiAgICAqXG4gICAgKiBAZXZlbnQgYmVmb3JlUmVuZGVyXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqIEBkZXByZWNhdGVkXG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgYWZ0ZXIgcmVuZGVyaW5nXG4gICAgKlxuICAgICogQGV2ZW50IGFmdGVyUmVuZGVyXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqIEBkZXByZWNhdGVkXG4gICAgKi9cblxuICAgIC8qXG4gICAgKlxuICAgICogIFByb3BlcnRpZXMgRG9jdW1lbnRhdGlvblxuICAgICpcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQSBmbGFnIHRoYXQgc3BlY2lmaWVzIHdoZXRoZXIgdGhlIHJ1bm5lciBpcyBydW5uaW5nIG9yIG5vdC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBlbmFibGVkXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgYEJvb2xlYW5gIHRoYXQgc3BlY2lmaWVzIGlmIHRoZSBydW5uZXIgc2hvdWxkIHVzZSBhIGZpeGVkIHRpbWVzdGVwIChvdGhlcndpc2UgaXQgaXMgdmFyaWFibGUpLlxuICAgICAqIElmIHRpbWluZyBpcyBmaXhlZCwgdGhlbiB0aGUgYXBwYXJlbnQgc2ltdWxhdGlvbiBzcGVlZCB3aWxsIGNoYW5nZSBkZXBlbmRpbmcgb24gdGhlIGZyYW1lIHJhdGUgKGJ1dCBiZWhhdmlvdXIgd2lsbCBiZSBkZXRlcm1pbmlzdGljKS5cbiAgICAgKiBJZiB0aGUgdGltaW5nIGlzIHZhcmlhYmxlLCB0aGVuIHRoZSBhcHBhcmVudCBzaW11bGF0aW9uIHNwZWVkIHdpbGwgYmUgY29uc3RhbnQgKGFwcHJveGltYXRlbHksIGJ1dCBhdCB0aGUgY29zdCBvZiBkZXRlcm1pbmluaXNtKS5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBpc0ZpeGVkXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBOdW1iZXJgIHRoYXQgc3BlY2lmaWVzIHRoZSB0aW1lIHN0ZXAgYmV0d2VlbiB1cGRhdGVzIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBJZiBgZW5naW5lLnRpbWluZy5pc0ZpeGVkYCBpcyBzZXQgdG8gYHRydWVgLCB0aGVuIGBkZWx0YWAgaXMgZml4ZWQuXG4gICAgICogSWYgaXQgaXMgYGZhbHNlYCwgdGhlbiBgZGVsdGFgIGNhbiBkeW5hbWljYWxseSBjaGFuZ2UgdG8gbWFpbnRhaW4gdGhlIGNvcnJlY3QgYXBwYXJlbnQgc2ltdWxhdGlvbiBzcGVlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBkZWx0YVxuICAgICAqIEB0eXBlIG51bWJlclxuICAgICAqIEBkZWZhdWx0IDEwMDAgLyA2MFxuICAgICAqL1xuXG59KSgpO1xuXG59LHtcIi4vQ29tbW9uXCI6MTQsXCIuL0VuZ2luZVwiOjE1LFwiLi9FdmVudHNcIjoxNn1dLDIyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5TbGVlcGluZ2AgbW9kdWxlIGNvbnRhaW5zIG1ldGhvZHMgdG8gbWFuYWdlIHRoZSBzbGVlcGluZyBzdGF0ZSBvZiBib2RpZXMuXG4qXG4qIEBjbGFzcyBTbGVlcGluZ1xuKi9cblxudmFyIFNsZWVwaW5nID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gU2xlZXBpbmc7XG5cbnZhciBFdmVudHMgPSBfZGVyZXFfKCcuL0V2ZW50cycpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICBTbGVlcGluZy5fbW90aW9uV2FrZVRocmVzaG9sZCA9IDAuMTg7XG4gICAgU2xlZXBpbmcuX21vdGlvblNsZWVwVGhyZXNob2xkID0gMC4wODtcbiAgICBTbGVlcGluZy5fbWluQmlhcyA9IDAuOTtcblxuICAgIC8qKlxuICAgICAqIFB1dHMgYm9kaWVzIHRvIHNsZWVwIG9yIHdha2VzIHRoZW0gdXAgZGVwZW5kaW5nIG9uIHRoZWlyIG1vdGlvbi5cbiAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVNjYWxlXG4gICAgICovXG4gICAgU2xlZXBpbmcudXBkYXRlID0gZnVuY3Rpb24oYm9kaWVzLCB0aW1lU2NhbGUpIHtcbiAgICAgICAgdmFyIHRpbWVGYWN0b3IgPSB0aW1lU2NhbGUgKiB0aW1lU2NhbGUgKiB0aW1lU2NhbGU7XG5cbiAgICAgICAgLy8gdXBkYXRlIGJvZGllcyBzbGVlcGluZyBzdGF0dXNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldLFxuICAgICAgICAgICAgICAgIG1vdGlvbiA9IGJvZHkuc3BlZWQgKiBib2R5LnNwZWVkICsgYm9keS5hbmd1bGFyU3BlZWQgKiBib2R5LmFuZ3VsYXJTcGVlZDtcblxuICAgICAgICAgICAgLy8gd2FrZSB1cCBib2RpZXMgaWYgdGhleSBoYXZlIGEgZm9yY2UgYXBwbGllZFxuICAgICAgICAgICAgaWYgKGJvZHkuZm9yY2UueCAhPT0gMCB8fCBib2R5LmZvcmNlLnkgIT09IDApIHtcbiAgICAgICAgICAgICAgICBTbGVlcGluZy5zZXQoYm9keSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWluTW90aW9uID0gTWF0aC5taW4oYm9keS5tb3Rpb24sIG1vdGlvbiksXG4gICAgICAgICAgICAgICAgbWF4TW90aW9uID0gTWF0aC5tYXgoYm9keS5tb3Rpb24sIG1vdGlvbik7XG4gICAgICAgIFxuICAgICAgICAgICAgLy8gYmlhc2VkIGF2ZXJhZ2UgbW90aW9uIGVzdGltYXRpb24gYmV0d2VlbiBmcmFtZXNcbiAgICAgICAgICAgIGJvZHkubW90aW9uID0gU2xlZXBpbmcuX21pbkJpYXMgKiBtaW5Nb3Rpb24gKyAoMSAtIFNsZWVwaW5nLl9taW5CaWFzKSAqIG1heE1vdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGJvZHkuc2xlZXBUaHJlc2hvbGQgPiAwICYmIGJvZHkubW90aW9uIDwgU2xlZXBpbmcuX21vdGlvblNsZWVwVGhyZXNob2xkICogdGltZUZhY3Rvcikge1xuICAgICAgICAgICAgICAgIGJvZHkuc2xlZXBDb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGJvZHkuc2xlZXBDb3VudGVyID49IGJvZHkuc2xlZXBUaHJlc2hvbGQpXG4gICAgICAgICAgICAgICAgICAgIFNsZWVwaW5nLnNldChib2R5LCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYm9keS5zbGVlcENvdW50ZXIgPiAwKSB7XG4gICAgICAgICAgICAgICAgYm9keS5zbGVlcENvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHNldCBvZiBjb2xsaWRpbmcgcGFpcnMsIHdha2VzIHRoZSBzbGVlcGluZyBib2RpZXMgaW52b2x2ZWQuXG4gICAgICogQG1ldGhvZCBhZnRlckNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0ge3BhaXJbXX0gcGFpcnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZVNjYWxlXG4gICAgICovXG4gICAgU2xlZXBpbmcuYWZ0ZXJDb2xsaXNpb25zID0gZnVuY3Rpb24ocGFpcnMsIHRpbWVTY2FsZSkge1xuICAgICAgICB2YXIgdGltZUZhY3RvciA9IHRpbWVTY2FsZSAqIHRpbWVTY2FsZSAqIHRpbWVTY2FsZTtcblxuICAgICAgICAvLyB3YWtlIHVwIGJvZGllcyBpbnZvbHZlZCBpbiBjb2xsaXNpb25zXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYWlyID0gcGFpcnNbaV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGRvbid0IHdha2UgaW5hY3RpdmUgcGFpcnNcbiAgICAgICAgICAgIGlmICghcGFpci5pc0FjdGl2ZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgdmFyIGNvbGxpc2lvbiA9IHBhaXIuY29sbGlzaW9uLFxuICAgICAgICAgICAgICAgIGJvZHlBID0gY29sbGlzaW9uLmJvZHlBLnBhcmVudCwgXG4gICAgICAgICAgICAgICAgYm9keUIgPSBjb2xsaXNpb24uYm9keUIucGFyZW50O1xuICAgICAgICBcbiAgICAgICAgICAgIC8vIGRvbid0IHdha2UgaWYgYXQgbGVhc3Qgb25lIGJvZHkgaXMgc3RhdGljXG4gICAgICAgICAgICBpZiAoKGJvZHlBLmlzU2xlZXBpbmcgJiYgYm9keUIuaXNTbGVlcGluZykgfHwgYm9keUEuaXNTdGF0aWMgfHwgYm9keUIuaXNTdGF0aWMpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIFxuICAgICAgICAgICAgaWYgKGJvZHlBLmlzU2xlZXBpbmcgfHwgYm9keUIuaXNTbGVlcGluZykge1xuICAgICAgICAgICAgICAgIHZhciBzbGVlcGluZ0JvZHkgPSAoYm9keUEuaXNTbGVlcGluZyAmJiAhYm9keUEuaXNTdGF0aWMpID8gYm9keUEgOiBib2R5QixcbiAgICAgICAgICAgICAgICAgICAgbW92aW5nQm9keSA9IHNsZWVwaW5nQm9keSA9PT0gYm9keUEgPyBib2R5QiA6IGJvZHlBO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFzbGVlcGluZ0JvZHkuaXNTdGF0aWMgJiYgbW92aW5nQm9keS5tb3Rpb24gPiBTbGVlcGluZy5fbW90aW9uV2FrZVRocmVzaG9sZCAqIHRpbWVGYWN0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgU2xlZXBpbmcuc2V0KHNsZWVwaW5nQm9keSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gIFxuICAgIC8qKlxuICAgICAqIFNldCBhIGJvZHkgYXMgc2xlZXBpbmcgb3IgYXdha2UuXG4gICAgICogQG1ldGhvZCBzZXRcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU2xlZXBpbmdcbiAgICAgKi9cbiAgICBTbGVlcGluZy5zZXQgPSBmdW5jdGlvbihib2R5LCBpc1NsZWVwaW5nKSB7XG4gICAgICAgIHZhciB3YXNTbGVlcGluZyA9IGJvZHkuaXNTbGVlcGluZztcblxuICAgICAgICBpZiAoaXNTbGVlcGluZykge1xuICAgICAgICAgICAgYm9keS5pc1NsZWVwaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGJvZHkuc2xlZXBDb3VudGVyID0gYm9keS5zbGVlcFRocmVzaG9sZDtcblxuICAgICAgICAgICAgYm9keS5wb3NpdGlvbkltcHVsc2UueCA9IDA7XG4gICAgICAgICAgICBib2R5LnBvc2l0aW9uSW1wdWxzZS55ID0gMDtcblxuICAgICAgICAgICAgYm9keS5wb3NpdGlvblByZXYueCA9IGJvZHkucG9zaXRpb24ueDtcbiAgICAgICAgICAgIGJvZHkucG9zaXRpb25QcmV2LnkgPSBib2R5LnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgIGJvZHkuYW5nbGVQcmV2ID0gYm9keS5hbmdsZTtcbiAgICAgICAgICAgIGJvZHkuc3BlZWQgPSAwO1xuICAgICAgICAgICAgYm9keS5hbmd1bGFyU3BlZWQgPSAwO1xuICAgICAgICAgICAgYm9keS5tb3Rpb24gPSAwO1xuXG4gICAgICAgICAgICBpZiAoIXdhc1NsZWVwaW5nKSB7XG4gICAgICAgICAgICAgICAgRXZlbnRzLnRyaWdnZXIoYm9keSwgJ3NsZWVwU3RhcnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkuaXNTbGVlcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgYm9keS5zbGVlcENvdW50ZXIgPSAwO1xuXG4gICAgICAgICAgICBpZiAod2FzU2xlZXBpbmcpIHtcbiAgICAgICAgICAgICAgICBFdmVudHMudHJpZ2dlcihib2R5LCAnc2xlZXBFbmQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn0pKCk7XG5cbn0se1wiLi9FdmVudHNcIjoxNn1dLDIzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5Cb2RpZXNgIG1vZHVsZSBjb250YWlucyBmYWN0b3J5IG1ldGhvZHMgZm9yIGNyZWF0aW5nIHJpZ2lkIGJvZHkgbW9kZWxzIFxuKiB3aXRoIGNvbW1vbmx5IHVzZWQgYm9keSBjb25maWd1cmF0aW9ucyAoc3VjaCBhcyByZWN0YW5nbGVzLCBjaXJjbGVzIGFuZCBvdGhlciBwb2x5Z29ucykuXG4qXG4qIFNlZSB0aGUgaW5jbHVkZWQgdXNhZ2UgW2V4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbGlhYnJ1L21hdHRlci1qcy90cmVlL21hc3Rlci9leGFtcGxlcykuXG4qXG4qIEBjbGFzcyBCb2RpZXNcbiovXG5cbi8vIFRPRE86IHRydWUgY2lyY2xlIGJvZGllc1xuXG52YXIgQm9kaWVzID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gQm9kaWVzO1xuXG52YXIgVmVydGljZXMgPSBfZGVyZXFfKCcuLi9nZW9tZXRyeS9WZXJ0aWNlcycpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG52YXIgQm9keSA9IF9kZXJlcV8oJy4uL2JvZHkvQm9keScpO1xudmFyIEJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJpZ2lkIGJvZHkgbW9kZWwgd2l0aCBhIHJlY3RhbmdsZSBodWxsLiBcbiAgICAgKiBUaGUgb3B0aW9ucyBwYXJhbWV0ZXIgaXMgYW4gb2JqZWN0IHRoYXQgc3BlY2lmaWVzIGFueSBwcm9wZXJ0aWVzIHlvdSB3aXNoIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0cy5cbiAgICAgKiBTZWUgdGhlIHByb3BlcnRpZXMgc2VjdGlvbiBvZiB0aGUgYE1hdHRlci5Cb2R5YCBtb2R1bGUgZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIG9uIHdoYXQgeW91IGNhbiBwYXNzIHZpYSB0aGUgYG9wdGlvbnNgIG9iamVjdC5cbiAgICAgKiBAbWV0aG9kIHJlY3RhbmdsZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICAgICAqIEByZXR1cm4ge2JvZHl9IEEgbmV3IHJlY3RhbmdsZSBib2R5XG4gICAgICovXG4gICAgQm9kaWVzLnJlY3RhbmdsZSA9IGZ1bmN0aW9uKHgsIHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgdmFyIHJlY3RhbmdsZSA9IHsgXG4gICAgICAgICAgICBsYWJlbDogJ1JlY3RhbmdsZSBCb2R5JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHg6IHgsIHk6IHkgfSxcbiAgICAgICAgICAgIHZlcnRpY2VzOiBWZXJ0aWNlcy5mcm9tUGF0aCgnTCAwIDAgTCAnICsgd2lkdGggKyAnIDAgTCAnICsgd2lkdGggKyAnICcgKyBoZWlnaHQgKyAnIEwgMCAnICsgaGVpZ2h0KVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNoYW1mZXIpIHtcbiAgICAgICAgICAgIHZhciBjaGFtZmVyID0gb3B0aW9ucy5jaGFtZmVyO1xuICAgICAgICAgICAgcmVjdGFuZ2xlLnZlcnRpY2VzID0gVmVydGljZXMuY2hhbWZlcihyZWN0YW5nbGUudmVydGljZXMsIGNoYW1mZXIucmFkaXVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW1mZXIucXVhbGl0eSwgY2hhbWZlci5xdWFsaXR5TWluLCBjaGFtZmVyLnF1YWxpdHlNYXgpO1xuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuY2hhbWZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBCb2R5LmNyZWF0ZShDb21tb24uZXh0ZW5kKHt9LCByZWN0YW5nbGUsIG9wdGlvbnMpKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmlnaWQgYm9keSBtb2RlbCB3aXRoIGEgdHJhcGV6b2lkIGh1bGwuIFxuICAgICAqIFRoZSBvcHRpb25zIHBhcmFtZXRlciBpcyBhbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgYW55IHByb3BlcnRpZXMgeW91IHdpc2ggdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzLlxuICAgICAqIFNlZSB0aGUgcHJvcGVydGllcyBzZWN0aW9uIG9mIHRoZSBgTWF0dGVyLkJvZHlgIG1vZHVsZSBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gd2hhdCB5b3UgY2FuIHBhc3MgdmlhIHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAqIEBtZXRob2QgdHJhcGV6b2lkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2xvcGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAgICogQHJldHVybiB7Ym9keX0gQSBuZXcgdHJhcGV6b2lkIGJvZHlcbiAgICAgKi9cbiAgICBCb2RpZXMudHJhcGV6b2lkID0gZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCwgc2xvcGUsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgc2xvcGUgKj0gMC41O1xuICAgICAgICB2YXIgcm9vZiA9ICgxIC0gKHNsb3BlICogMikpICogd2lkdGg7XG4gICAgICAgIFxuICAgICAgICB2YXIgeDEgPSB3aWR0aCAqIHNsb3BlLFxuICAgICAgICAgICAgeDIgPSB4MSArIHJvb2YsXG4gICAgICAgICAgICB4MyA9IHgyICsgeDEsXG4gICAgICAgICAgICB2ZXJ0aWNlc1BhdGg7XG5cbiAgICAgICAgaWYgKHNsb3BlIDwgMC41KSB7XG4gICAgICAgICAgICB2ZXJ0aWNlc1BhdGggPSAnTCAwIDAgTCAnICsgeDEgKyAnICcgKyAoLWhlaWdodCkgKyAnIEwgJyArIHgyICsgJyAnICsgKC1oZWlnaHQpICsgJyBMICcgKyB4MyArICcgMCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0aWNlc1BhdGggPSAnTCAwIDAgTCAnICsgeDIgKyAnICcgKyAoLWhlaWdodCkgKyAnIEwgJyArIHgzICsgJyAwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0cmFwZXpvaWQgPSB7IFxuICAgICAgICAgICAgbGFiZWw6ICdUcmFwZXpvaWQgQm9keScsXG4gICAgICAgICAgICBwb3NpdGlvbjogeyB4OiB4LCB5OiB5IH0sXG4gICAgICAgICAgICB2ZXJ0aWNlczogVmVydGljZXMuZnJvbVBhdGgodmVydGljZXNQYXRoKVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNoYW1mZXIpIHtcbiAgICAgICAgICAgIHZhciBjaGFtZmVyID0gb3B0aW9ucy5jaGFtZmVyO1xuICAgICAgICAgICAgdHJhcGV6b2lkLnZlcnRpY2VzID0gVmVydGljZXMuY2hhbWZlcih0cmFwZXpvaWQudmVydGljZXMsIGNoYW1mZXIucmFkaXVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW1mZXIucXVhbGl0eSwgY2hhbWZlci5xdWFsaXR5TWluLCBjaGFtZmVyLnF1YWxpdHlNYXgpO1xuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuY2hhbWZlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBCb2R5LmNyZWF0ZShDb21tb24uZXh0ZW5kKHt9LCB0cmFwZXpvaWQsIG9wdGlvbnMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByaWdpZCBib2R5IG1vZGVsIHdpdGggYSBjaXJjbGUgaHVsbC4gXG4gICAgICogVGhlIG9wdGlvbnMgcGFyYW1ldGVyIGlzIGFuIG9iamVjdCB0aGF0IHNwZWNpZmllcyBhbnkgcHJvcGVydGllcyB5b3Ugd2lzaCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHMuXG4gICAgICogU2VlIHRoZSBwcm9wZXJ0aWVzIHNlY3Rpb24gb2YgdGhlIGBNYXR0ZXIuQm9keWAgbW9kdWxlIGZvciBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvbiB3aGF0IHlvdSBjYW4gcGFzcyB2aWEgdGhlIGBvcHRpb25zYCBvYmplY3QuXG4gICAgICogQG1ldGhvZCBjaXJjbGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21heFNpZGVzXVxuICAgICAqIEByZXR1cm4ge2JvZHl9IEEgbmV3IGNpcmNsZSBib2R5XG4gICAgICovXG4gICAgQm9kaWVzLmNpcmNsZSA9IGZ1bmN0aW9uKHgsIHksIHJhZGl1cywgb3B0aW9ucywgbWF4U2lkZXMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgdmFyIGNpcmNsZSA9IHtcbiAgICAgICAgICAgIGxhYmVsOiAnQ2lyY2xlIEJvZHknLFxuICAgICAgICAgICAgY2lyY2xlUmFkaXVzOiByYWRpdXNcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIGFwcHJveGltYXRlIGNpcmNsZXMgd2l0aCBwb2x5Z29ucyB1bnRpbCB0cnVlIGNpcmNsZXMgaW1wbGVtZW50ZWQgaW4gU0FUXG4gICAgICAgIG1heFNpZGVzID0gbWF4U2lkZXMgfHwgMjU7XG4gICAgICAgIHZhciBzaWRlcyA9IE1hdGguY2VpbChNYXRoLm1heCgxMCwgTWF0aC5taW4obWF4U2lkZXMsIHJhZGl1cykpKTtcblxuICAgICAgICAvLyBvcHRpbWlzYXRpb246IGFsd2F5cyB1c2UgZXZlbiBudW1iZXIgb2Ygc2lkZXMgKGhhbGYgdGhlIG51bWJlciBvZiB1bmlxdWUgYXhlcylcbiAgICAgICAgaWYgKHNpZGVzICUgMiA9PT0gMSlcbiAgICAgICAgICAgIHNpZGVzICs9IDE7XG5cbiAgICAgICAgcmV0dXJuIEJvZGllcy5wb2x5Z29uKHgsIHksIHNpZGVzLCByYWRpdXMsIENvbW1vbi5leHRlbmQoe30sIGNpcmNsZSwgb3B0aW9ucykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJpZ2lkIGJvZHkgbW9kZWwgd2l0aCBhIHJlZ3VsYXIgcG9seWdvbiBodWxsIHdpdGggdGhlIGdpdmVuIG51bWJlciBvZiBzaWRlcy4gXG4gICAgICogVGhlIG9wdGlvbnMgcGFyYW1ldGVyIGlzIGFuIG9iamVjdCB0aGF0IHNwZWNpZmllcyBhbnkgcHJvcGVydGllcyB5b3Ugd2lzaCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHMuXG4gICAgICogU2VlIHRoZSBwcm9wZXJ0aWVzIHNlY3Rpb24gb2YgdGhlIGBNYXR0ZXIuQm9keWAgbW9kdWxlIGZvciBkZXRhaWxlZCBpbmZvcm1hdGlvbiBvbiB3aGF0IHlvdSBjYW4gcGFzcyB2aWEgdGhlIGBvcHRpb25zYCBvYmplY3QuXG4gICAgICogQG1ldGhvZCBwb2x5Z29uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaWRlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAgICogQHJldHVybiB7Ym9keX0gQSBuZXcgcmVndWxhciBwb2x5Z29uIGJvZHlcbiAgICAgKi9cbiAgICBCb2RpZXMucG9seWdvbiA9IGZ1bmN0aW9uKHgsIHksIHNpZGVzLCByYWRpdXMsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYgKHNpZGVzIDwgMylcbiAgICAgICAgICAgIHJldHVybiBCb2RpZXMuY2lyY2xlKHgsIHksIHJhZGl1cywgb3B0aW9ucyk7XG5cbiAgICAgICAgdmFyIHRoZXRhID0gMiAqIE1hdGguUEkgLyBzaWRlcyxcbiAgICAgICAgICAgIHBhdGggPSAnJyxcbiAgICAgICAgICAgIG9mZnNldCA9IHRoZXRhICogMC41O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lkZXM7IGkgKz0gMSkge1xuICAgICAgICAgICAgdmFyIGFuZ2xlID0gb2Zmc2V0ICsgKGkgKiB0aGV0YSksXG4gICAgICAgICAgICAgICAgeHggPSBNYXRoLmNvcyhhbmdsZSkgKiByYWRpdXMsXG4gICAgICAgICAgICAgICAgeXkgPSBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXM7XG5cbiAgICAgICAgICAgIHBhdGggKz0gJ0wgJyArIHh4LnRvRml4ZWQoMykgKyAnICcgKyB5eS50b0ZpeGVkKDMpICsgJyAnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBvbHlnb24gPSB7IFxuICAgICAgICAgICAgbGFiZWw6ICdQb2x5Z29uIEJvZHknLFxuICAgICAgICAgICAgcG9zaXRpb246IHsgeDogeCwgeTogeSB9LFxuICAgICAgICAgICAgdmVydGljZXM6IFZlcnRpY2VzLmZyb21QYXRoKHBhdGgpXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2hhbWZlcikge1xuICAgICAgICAgICAgdmFyIGNoYW1mZXIgPSBvcHRpb25zLmNoYW1mZXI7XG4gICAgICAgICAgICBwb2x5Z29uLnZlcnRpY2VzID0gVmVydGljZXMuY2hhbWZlcihwb2x5Z29uLnZlcnRpY2VzLCBjaGFtZmVyLnJhZGl1cywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFtZmVyLnF1YWxpdHksIGNoYW1mZXIucXVhbGl0eU1pbiwgY2hhbWZlci5xdWFsaXR5TWF4KTtcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmNoYW1mZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQm9keS5jcmVhdGUoQ29tbW9uLmV4dGVuZCh7fSwgcG9seWdvbiwgb3B0aW9ucykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgYm9keSB1c2luZyB0aGUgc3VwcGxpZWQgdmVydGljZXMgKG9yIGFuIGFycmF5IGNvbnRhaW5pbmcgbXVsdGlwbGUgc2V0cyBvZiB2ZXJ0aWNlcykuXG4gICAgICogSWYgdGhlIHZlcnRpY2VzIGFyZSBjb252ZXgsIHRoZXkgd2lsbCBwYXNzIHRocm91Z2ggYXMgc3VwcGxpZWQuXG4gICAgICogT3RoZXJ3aXNlIGlmIHRoZSB2ZXJ0aWNlcyBhcmUgY29uY2F2ZSwgdGhleSB3aWxsIGJlIGRlY29tcG9zZWQgaWYgW3BvbHktZGVjb21wLmpzXShodHRwczovL2dpdGh1Yi5jb20vc2NodGVwcGUvcG9seS1kZWNvbXAuanMpIGlzIGF2YWlsYWJsZS5cbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBwcm9jZXNzIGlzIG5vdCBndWFyYW50ZWVkIHRvIHN1cHBvcnQgY29tcGxleCBzZXRzIG9mIHZlcnRpY2VzIChlLmcuIHRob3NlIHdpdGggaG9sZXMgbWF5IGZhaWwpLlxuICAgICAqIEJ5IGRlZmF1bHQgdGhlIGRlY29tcG9zaXRpb24gd2lsbCBkaXNjYXJkIGNvbGxpbmVhciBlZGdlcyAodG8gaW1wcm92ZSBwZXJmb3JtYW5jZSkuXG4gICAgICogSXQgY2FuIGFsc28gb3B0aW9uYWxseSBkaXNjYXJkIGFueSBwYXJ0cyB0aGF0IGhhdmUgYW4gYXJlYSBsZXNzIHRoYW4gYG1pbmltdW1BcmVhYC5cbiAgICAgKiBJZiB0aGUgdmVydGljZXMgY2FuIG5vdCBiZSBkZWNvbXBvc2VkLCB0aGUgcmVzdWx0IHdpbGwgZmFsbCBiYWNrIHRvIHVzaW5nIHRoZSBjb252ZXggaHVsbC5cbiAgICAgKiBUaGUgb3B0aW9ucyBwYXJhbWV0ZXIgaXMgYW4gb2JqZWN0IHRoYXQgc3BlY2lmaWVzIGFueSBgTWF0dGVyLkJvZHlgIHByb3BlcnRpZXMgeW91IHdpc2ggdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzLlxuICAgICAqIFNlZSB0aGUgcHJvcGVydGllcyBzZWN0aW9uIG9mIHRoZSBgTWF0dGVyLkJvZHlgIG1vZHVsZSBmb3IgZGV0YWlsZWQgaW5mb3JtYXRpb24gb24gd2hhdCB5b3UgY2FuIHBhc3MgdmlhIHRoZSBgb3B0aW9uc2Agb2JqZWN0LlxuICAgICAqIEBtZXRob2QgZnJvbVZlcnRpY2VzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgICAqIEBwYXJhbSBbW3ZlY3Rvcl1dIHZlcnRleFNldHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAgICogQHBhcmFtIHtib29sfSBbZmxhZ0ludGVybmFsPWZhbHNlXVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcmVtb3ZlQ29sbGluZWFyPTAuMDFdXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFttaW5pbXVtQXJlYT0xMF1cbiAgICAgKiBAcmV0dXJuIHtib2R5fVxuICAgICAqL1xuICAgIEJvZGllcy5mcm9tVmVydGljZXMgPSBmdW5jdGlvbih4LCB5LCB2ZXJ0ZXhTZXRzLCBvcHRpb25zLCBmbGFnSW50ZXJuYWwsIHJlbW92ZUNvbGxpbmVhciwgbWluaW11bUFyZWEpIHtcbiAgICAgICAgdmFyIGJvZHksXG4gICAgICAgICAgICBwYXJ0cyxcbiAgICAgICAgICAgIGlzQ29udmV4LFxuICAgICAgICAgICAgdmVydGljZXMsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGssXG4gICAgICAgICAgICB2LFxuICAgICAgICAgICAgejtcblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcGFydHMgPSBbXTtcblxuICAgICAgICBmbGFnSW50ZXJuYWwgPSB0eXBlb2YgZmxhZ0ludGVybmFsICE9PSAndW5kZWZpbmVkJyA/IGZsYWdJbnRlcm5hbCA6IGZhbHNlO1xuICAgICAgICByZW1vdmVDb2xsaW5lYXIgPSB0eXBlb2YgcmVtb3ZlQ29sbGluZWFyICE9PSAndW5kZWZpbmVkJyA/IHJlbW92ZUNvbGxpbmVhciA6IDAuMDE7XG4gICAgICAgIG1pbmltdW1BcmVhID0gdHlwZW9mIG1pbmltdW1BcmVhICE9PSAndW5kZWZpbmVkJyA/IG1pbmltdW1BcmVhIDogMTA7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuZGVjb21wKSB7XG4gICAgICAgICAgICBDb21tb24ud2FybignQm9kaWVzLmZyb21WZXJ0aWNlczogcG9seS1kZWNvbXAuanMgcmVxdWlyZWQuIENvdWxkIG5vdCBkZWNvbXBvc2UgdmVydGljZXMuIEZhbGxiYWNrIHRvIGNvbnZleCBodWxsLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5zdXJlIHZlcnRleFNldHMgaXMgYW4gYXJyYXkgb2YgYXJyYXlzXG4gICAgICAgIGlmICghQ29tbW9uLmlzQXJyYXkodmVydGV4U2V0c1swXSkpIHtcbiAgICAgICAgICAgIHZlcnRleFNldHMgPSBbdmVydGV4U2V0c107XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHYgPSAwOyB2IDwgdmVydGV4U2V0cy5sZW5ndGg7IHYgKz0gMSkge1xuICAgICAgICAgICAgdmVydGljZXMgPSB2ZXJ0ZXhTZXRzW3ZdO1xuICAgICAgICAgICAgaXNDb252ZXggPSBWZXJ0aWNlcy5pc0NvbnZleCh2ZXJ0aWNlcyk7XG5cbiAgICAgICAgICAgIGlmIChpc0NvbnZleCB8fCAhd2luZG93LmRlY29tcCkge1xuICAgICAgICAgICAgICAgIGlmIChpc0NvbnZleCkge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlcyA9IFZlcnRpY2VzLmNsb2Nrd2lzZVNvcnQodmVydGljZXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrIHRvIGNvbnZleCBodWxsIHdoZW4gZGVjb21wb3NpdGlvbiBpcyBub3QgcG9zc2libGVcbiAgICAgICAgICAgICAgICAgICAgdmVydGljZXMgPSBWZXJ0aWNlcy5odWxsKHZlcnRpY2VzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHsgeDogeCwgeTogeSB9LFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlczogdmVydGljZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGlzZSBhIGRlY29tcG9zaXRpb25cbiAgICAgICAgICAgICAgICB2YXIgY29uY2F2ZSA9IG5ldyBkZWNvbXAuUG9seWdvbigpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25jYXZlLnZlcnRpY2VzLnB1c2goW3ZlcnRpY2VzW2ldLngsIHZlcnRpY2VzW2ldLnldKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB2ZXJ0aWNlcyBhcmUgY29uY2F2ZSBhbmQgc2ltcGxlLCB3ZSBjYW4gZGVjb21wb3NlIGludG8gcGFydHNcbiAgICAgICAgICAgICAgICBjb25jYXZlLm1ha2VDQ1coKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlQ29sbGluZWFyICE9PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgY29uY2F2ZS5yZW1vdmVDb2xsaW5lYXJQb2ludHMocmVtb3ZlQ29sbGluZWFyKTtcblxuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgcXVpY2sgZGVjb21wb3NpdGlvbiBhbGdvcml0aG0gKEJheWF6aXQpXG4gICAgICAgICAgICAgICAgdmFyIGRlY29tcG9zZWQgPSBjb25jYXZlLnF1aWNrRGVjb21wKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCBkZWNvbXBvc2VkIGNodW5rXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRlY29tcG9zZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNodW5rID0gZGVjb21wb3NlZFtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rVmVydGljZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IHZlcnRpY2VzIGludG8gdGhlIGNvcnJlY3Qgc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjaHVuay52ZXJ0aWNlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtWZXJ0aWNlcy5wdXNoKHsgeDogY2h1bmsudmVydGljZXNbal1bMF0sIHk6IGNodW5rLnZlcnRpY2VzW2pdWzFdIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc2tpcCBzbWFsbCBjaHVua3NcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbmltdW1BcmVhID4gMCAmJiBWZXJ0aWNlcy5hcmVhKGNodW5rVmVydGljZXMpIDwgbWluaW11bUFyZWEpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBjb21wb3VuZCBwYXJ0XG4gICAgICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFZlcnRpY2VzLmNlbnRyZShjaHVua1ZlcnRpY2VzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzOiBjaHVua1ZlcnRpY2VzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSBib2R5IHBhcnRzXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydHNbaV0gPSBCb2R5LmNyZWF0ZShDb21tb24uZXh0ZW5kKHBhcnRzW2ldLCBvcHRpb25zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmbGFnIGludGVybmFsIGVkZ2VzIChjb2luY2lkZW50IHBhcnQgZWRnZXMpXG4gICAgICAgIGlmIChmbGFnSW50ZXJuYWwpIHtcbiAgICAgICAgICAgIHZhciBjb2luY2lkZW50X21heF9kaXN0ID0gNTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRBID0gcGFydHNbaV07XG5cbiAgICAgICAgICAgICAgICBmb3IgKGogPSBpICsgMTsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0QiA9IHBhcnRzW2pdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChCb3VuZHMub3ZlcmxhcHMocGFydEEuYm91bmRzLCBwYXJ0Qi5ib3VuZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGF2ID0gcGFydEEudmVydGljZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGJ2ID0gcGFydEIudmVydGljZXM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdmVydGljZXMgb2YgYm90aCBwYXJ0c1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IHBhcnRBLnZlcnRpY2VzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh6ID0gMDsgeiA8IHBhcnRCLnZlcnRpY2VzLmxlbmd0aDsgeisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgZGlzdGFuY2VzIGJldHdlZW4gdGhlIHZlcnRpY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYSA9IFZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKFZlY3Rvci5zdWIocGF2WyhrICsgMSkgJSBwYXYubGVuZ3RoXSwgcGJ2W3pdKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYiA9IFZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKFZlY3Rvci5zdWIocGF2W2tdLCBwYnZbKHogKyAxKSAlIHBidi5sZW5ndGhdKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYm90aCB2ZXJ0aWNlcyBhcmUgdmVyeSBjbG9zZSwgY29uc2lkZXIgdGhlIGVkZ2UgY29uY2lkZW50IChpbnRlcm5hbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhIDwgY29pbmNpZGVudF9tYXhfZGlzdCAmJiBkYiA8IGNvaW5jaWRlbnRfbWF4X2Rpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdltrXS5pc0ludGVybmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBidlt6XS5pc0ludGVybmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcGFyZW50IGJvZHkgdG8gYmUgcmV0dXJuZWQsIHRoYXQgY29udGFpbnMgZ2VuZXJhdGVkIGNvbXBvdW5kIHBhcnRzXG4gICAgICAgICAgICBib2R5ID0gQm9keS5jcmVhdGUoQ29tbW9uLmV4dGVuZCh7IHBhcnRzOiBwYXJ0cy5zbGljZSgwKSB9LCBvcHRpb25zKSk7XG4gICAgICAgICAgICBCb2R5LnNldFBvc2l0aW9uKGJvZHksIHsgeDogeCwgeTogeSB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGJvZHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICAgIH1cbiAgICB9O1xuXG59KSgpO1xufSx7XCIuLi9ib2R5L0JvZHlcIjoxLFwiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2dlb21ldHJ5L0JvdW5kc1wiOjI2LFwiLi4vZ2VvbWV0cnkvVmVjdG9yXCI6MjgsXCIuLi9nZW9tZXRyeS9WZXJ0aWNlc1wiOjI5fV0sMjQ6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLkNvbXBvc2l0ZXNgIG1vZHVsZSBjb250YWlucyBmYWN0b3J5IG1ldGhvZHMgZm9yIGNyZWF0aW5nIGNvbXBvc2l0ZSBib2RpZXNcbiogd2l0aCBjb21tb25seSB1c2VkIGNvbmZpZ3VyYXRpb25zIChzdWNoIGFzIHN0YWNrcyBhbmQgY2hhaW5zKS5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIENvbXBvc2l0ZXNcbiovXG5cbnZhciBDb21wb3NpdGVzID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9zaXRlcztcblxudmFyIENvbXBvc2l0ZSA9IF9kZXJlcV8oJy4uL2JvZHkvQ29tcG9zaXRlJyk7XG52YXIgQ29uc3RyYWludCA9IF9kZXJlcV8oJy4uL2NvbnN0cmFpbnQvQ29uc3RyYWludCcpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG52YXIgQm9keSA9IF9kZXJlcV8oJy4uL2JvZHkvQm9keScpO1xudmFyIEJvZGllcyA9IF9kZXJlcV8oJy4vQm9kaWVzJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBjb21wb3NpdGUgY29udGFpbmluZyBib2RpZXMgY3JlYXRlZCBpbiB0aGUgY2FsbGJhY2sgaW4gYSBncmlkIGFycmFuZ2VtZW50LlxuICAgICAqIFRoaXMgZnVuY3Rpb24gdXNlcyB0aGUgYm9keSdzIGJvdW5kcyB0byBwcmV2ZW50IG92ZXJsYXBzLlxuICAgICAqIEBtZXRob2Qgc3RhY2tcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByb3dzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbkdhcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByb3dHYXBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gQSBuZXcgY29tcG9zaXRlIGNvbnRhaW5pbmcgb2JqZWN0cyBjcmVhdGVkIGluIHRoZSBjYWxsYmFja1xuICAgICAqL1xuICAgIENvbXBvc2l0ZXMuc3RhY2sgPSBmdW5jdGlvbih4eCwgeXksIGNvbHVtbnMsIHJvd3MsIGNvbHVtbkdhcCwgcm93R2FwLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc3RhY2sgPSBDb21wb3NpdGUuY3JlYXRlKHsgbGFiZWw6ICdTdGFjaycgfSksXG4gICAgICAgICAgICB4ID0geHgsXG4gICAgICAgICAgICB5ID0geXksXG4gICAgICAgICAgICBsYXN0Qm9keSxcbiAgICAgICAgICAgIGkgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHJvd3M7IHJvdysrKSB7XG4gICAgICAgICAgICB2YXIgbWF4SGVpZ2h0ID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1uczsgY29sdW1uKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGNhbGxiYWNrKHgsIHksIGNvbHVtbiwgcm93LCBsYXN0Qm9keSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBib2R5SGVpZ2h0ID0gYm9keS5ib3VuZHMubWF4LnkgLSBib2R5LmJvdW5kcy5taW4ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXaWR0aCA9IGJvZHkuYm91bmRzLm1heC54IC0gYm9keS5ib3VuZHMubWluLng7IFxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChib2R5SGVpZ2h0ID4gbWF4SGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0ID0gYm9keUhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEJvZHkudHJhbnNsYXRlKGJvZHksIHsgeDogYm9keVdpZHRoICogMC41LCB5OiBib2R5SGVpZ2h0ICogMC41IH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHggPSBib2R5LmJvdW5kcy5tYXgueCArIGNvbHVtbkdhcDtcblxuICAgICAgICAgICAgICAgICAgICBDb21wb3NpdGUuYWRkQm9keShzdGFjaywgYm9keSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsYXN0Qm9keSA9IGJvZHk7XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB4ICs9IGNvbHVtbkdhcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHkgKz0gbWF4SGVpZ2h0ICsgcm93R2FwO1xuICAgICAgICAgICAgeCA9IHh4O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQ2hhaW5zIGFsbCBib2RpZXMgaW4gdGhlIGdpdmVuIGNvbXBvc2l0ZSB0b2dldGhlciB1c2luZyBjb25zdHJhaW50cy5cbiAgICAgKiBAbWV0aG9kIGNoYWluXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4T2Zmc2V0QVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5T2Zmc2V0QVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4T2Zmc2V0QlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5T2Zmc2V0QlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBBIG5ldyBjb21wb3NpdGUgY29udGFpbmluZyBvYmplY3RzIGNoYWluZWQgdG9nZXRoZXIgd2l0aCBjb25zdHJhaW50c1xuICAgICAqL1xuICAgIENvbXBvc2l0ZXMuY2hhaW4gPSBmdW5jdGlvbihjb21wb3NpdGUsIHhPZmZzZXRBLCB5T2Zmc2V0QSwgeE9mZnNldEIsIHlPZmZzZXRCLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBib2RpZXMgPSBjb21wb3NpdGUuYm9kaWVzO1xuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5QSA9IGJvZGllc1tpIC0gMV0sXG4gICAgICAgICAgICAgICAgYm9keUIgPSBib2RpZXNbaV0sXG4gICAgICAgICAgICAgICAgYm9keUFIZWlnaHQgPSBib2R5QS5ib3VuZHMubWF4LnkgLSBib2R5QS5ib3VuZHMubWluLnksXG4gICAgICAgICAgICAgICAgYm9keUFXaWR0aCA9IGJvZHlBLmJvdW5kcy5tYXgueCAtIGJvZHlBLmJvdW5kcy5taW4ueCwgXG4gICAgICAgICAgICAgICAgYm9keUJIZWlnaHQgPSBib2R5Qi5ib3VuZHMubWF4LnkgLSBib2R5Qi5ib3VuZHMubWluLnksXG4gICAgICAgICAgICAgICAgYm9keUJXaWR0aCA9IGJvZHlCLmJvdW5kcy5tYXgueCAtIGJvZHlCLmJvdW5kcy5taW4ueDtcbiAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYm9keUE6IGJvZHlBLFxuICAgICAgICAgICAgICAgIHBvaW50QTogeyB4OiBib2R5QVdpZHRoICogeE9mZnNldEEsIHk6IGJvZHlBSGVpZ2h0ICogeU9mZnNldEEgfSxcbiAgICAgICAgICAgICAgICBib2R5QjogYm9keUIsXG4gICAgICAgICAgICAgICAgcG9pbnRCOiB7IHg6IGJvZHlCV2lkdGggKiB4T2Zmc2V0QiwgeTogYm9keUJIZWlnaHQgKiB5T2Zmc2V0QiB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgY29uc3RyYWludCA9IENvbW1vbi5leHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICBcbiAgICAgICAgICAgIENvbXBvc2l0ZS5hZGRDb25zdHJhaW50KGNvbXBvc2l0ZSwgQ29uc3RyYWludC5jcmVhdGUoY29uc3RyYWludCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29tcG9zaXRlLmxhYmVsICs9ICcgQ2hhaW4nO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbXBvc2l0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdHMgYm9kaWVzIGluIHRoZSBjb21wb3NpdGUgd2l0aCBjb25zdHJhaW50cyBpbiBhIGdyaWQgcGF0dGVybiwgd2l0aCBvcHRpb25hbCBjcm9zcyBicmFjZXMuXG4gICAgICogQG1ldGhvZCBtZXNoXG4gICAgICogQHBhcmFtIHtjb21wb3NpdGV9IGNvbXBvc2l0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJvd3NcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNyb3NzQnJhY2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gVGhlIGNvbXBvc2l0ZSBjb250YWluaW5nIG9iamVjdHMgbWVzaGVkIHRvZ2V0aGVyIHdpdGggY29uc3RyYWludHNcbiAgICAgKi9cbiAgICBDb21wb3NpdGVzLm1lc2ggPSBmdW5jdGlvbihjb21wb3NpdGUsIGNvbHVtbnMsIHJvd3MsIGNyb3NzQnJhY2UsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJvZGllcyA9IGNvbXBvc2l0ZS5ib2RpZXMsXG4gICAgICAgICAgICByb3csXG4gICAgICAgICAgICBjb2wsXG4gICAgICAgICAgICBib2R5QSxcbiAgICAgICAgICAgIGJvZHlCLFxuICAgICAgICAgICAgYm9keUM7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHJvdyA9IDA7IHJvdyA8IHJvd3M7IHJvdysrKSB7XG4gICAgICAgICAgICBmb3IgKGNvbCA9IDE7IGNvbCA8IGNvbHVtbnM7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgYm9keUEgPSBib2RpZXNbKGNvbCAtIDEpICsgKHJvdyAqIGNvbHVtbnMpXTtcbiAgICAgICAgICAgICAgICBib2R5QiA9IGJvZGllc1tjb2wgKyAocm93ICogY29sdW1ucyldO1xuICAgICAgICAgICAgICAgIENvbXBvc2l0ZS5hZGRDb25zdHJhaW50KGNvbXBvc2l0ZSwgQ29uc3RyYWludC5jcmVhdGUoQ29tbW9uLmV4dGVuZCh7IGJvZHlBOiBib2R5QSwgYm9keUI6IGJvZHlCIH0sIG9wdGlvbnMpKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyb3cgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBjb2x1bW5zOyBjb2wrKykge1xuICAgICAgICAgICAgICAgICAgICBib2R5QSA9IGJvZGllc1tjb2wgKyAoKHJvdyAtIDEpICogY29sdW1ucyldO1xuICAgICAgICAgICAgICAgICAgICBib2R5QiA9IGJvZGllc1tjb2wgKyAocm93ICogY29sdW1ucyldO1xuICAgICAgICAgICAgICAgICAgICBDb21wb3NpdGUuYWRkQ29uc3RyYWludChjb21wb3NpdGUsIENvbnN0cmFpbnQuY3JlYXRlKENvbW1vbi5leHRlbmQoeyBib2R5QTogYm9keUEsIGJvZHlCOiBib2R5QiB9LCBvcHRpb25zKSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcm9zc0JyYWNlICYmIGNvbCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlDID0gYm9kaWVzWyhjb2wgLSAxKSArICgocm93IC0gMSkgKiBjb2x1bW5zKV07XG4gICAgICAgICAgICAgICAgICAgICAgICBDb21wb3NpdGUuYWRkQ29uc3RyYWludChjb21wb3NpdGUsIENvbnN0cmFpbnQuY3JlYXRlKENvbW1vbi5leHRlbmQoeyBib2R5QTogYm9keUMsIGJvZHlCOiBib2R5QiB9LCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNyb3NzQnJhY2UgJiYgY29sIDwgY29sdW1ucyAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlDID0gYm9kaWVzWyhjb2wgKyAxKSArICgocm93IC0gMSkgKiBjb2x1bW5zKV07XG4gICAgICAgICAgICAgICAgICAgICAgICBDb21wb3NpdGUuYWRkQ29uc3RyYWludChjb21wb3NpdGUsIENvbnN0cmFpbnQuY3JlYXRlKENvbW1vbi5leHRlbmQoeyBib2R5QTogYm9keUMsIGJvZHlCOiBib2R5QiB9LCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29tcG9zaXRlLmxhYmVsICs9ICcgTWVzaCc7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9zaXRlO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGNvbXBvc2l0ZSBjb250YWluaW5nIGJvZGllcyBjcmVhdGVkIGluIHRoZSBjYWxsYmFjayBpbiBhIHB5cmFtaWQgYXJyYW5nZW1lbnQuXG4gICAgICogVGhpcyBmdW5jdGlvbiB1c2VzIHRoZSBib2R5J3MgYm91bmRzIHRvIHByZXZlbnQgb3ZlcmxhcHMuXG4gICAgICogQG1ldGhvZCBweXJhbWlkXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHh4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHl5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcm93c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5HYXBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcm93R2FwXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtjb21wb3NpdGV9IEEgbmV3IGNvbXBvc2l0ZSBjb250YWluaW5nIG9iamVjdHMgY3JlYXRlZCBpbiB0aGUgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBDb21wb3NpdGVzLnB5cmFtaWQgPSBmdW5jdGlvbih4eCwgeXksIGNvbHVtbnMsIHJvd3MsIGNvbHVtbkdhcCwgcm93R2FwLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gQ29tcG9zaXRlcy5zdGFjayh4eCwgeXksIGNvbHVtbnMsIHJvd3MsIGNvbHVtbkdhcCwgcm93R2FwLCBmdW5jdGlvbih4LCB5LCBjb2x1bW4sIHJvdywgbGFzdEJvZHksIGkpIHtcbiAgICAgICAgICAgIHZhciBhY3R1YWxSb3dzID0gTWF0aC5taW4ocm93cywgTWF0aC5jZWlsKGNvbHVtbnMgLyAyKSksXG4gICAgICAgICAgICAgICAgbGFzdEJvZHlXaWR0aCA9IGxhc3RCb2R5ID8gbGFzdEJvZHkuYm91bmRzLm1heC54IC0gbGFzdEJvZHkuYm91bmRzLm1pbi54IDogMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHJvdyA+IGFjdHVhbFJvd3MpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZXZlcnNlIHJvdyBvcmRlclxuICAgICAgICAgICAgcm93ID0gYWN0dWFsUm93cyAtIHJvdztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gcm93LFxuICAgICAgICAgICAgICAgIGVuZCA9IGNvbHVtbnMgLSAxIC0gcm93O1xuXG4gICAgICAgICAgICBpZiAoY29sdW1uIDwgc3RhcnQgfHwgY29sdW1uID4gZW5kKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcmV0cm9hY3RpdmVseSBmaXggdGhlIGZpcnN0IGJvZHkncyBwb3NpdGlvbiwgc2luY2Ugd2lkdGggd2FzIHVua25vd25cbiAgICAgICAgICAgIGlmIChpID09PSAxKSB7XG4gICAgICAgICAgICAgICAgQm9keS50cmFuc2xhdGUobGFzdEJvZHksIHsgeDogKGNvbHVtbiArIChjb2x1bW5zICUgMiA9PT0gMSA/IDEgOiAtMSkpICogbGFzdEJvZHlXaWR0aCwgeTogMCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHhPZmZzZXQgPSBsYXN0Qm9keSA/IGNvbHVtbiAqIGxhc3RCb2R5V2lkdGggOiAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soeHggKyB4T2Zmc2V0ICsgY29sdW1uICogY29sdW1uR2FwLCB5LCBjb2x1bW4sIHJvdywgbGFzdEJvZHksIGkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNvbXBvc2l0ZSB3aXRoIGEgTmV3dG9uJ3MgQ3JhZGxlIHNldHVwIG9mIGJvZGllcyBhbmQgY29uc3RyYWludHMuXG4gICAgICogQG1ldGhvZCBuZXd0b25zQ3JhZGxlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHh4XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHl5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gQSBuZXcgY29tcG9zaXRlIG5ld3RvbnNDcmFkbGUgYm9keVxuICAgICAqL1xuICAgIENvbXBvc2l0ZXMubmV3dG9uc0NyYWRsZSA9IGZ1bmN0aW9uKHh4LCB5eSwgbnVtYmVyLCBzaXplLCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIG5ld3RvbnNDcmFkbGUgPSBDb21wb3NpdGUuY3JlYXRlKHsgbGFiZWw6ICdOZXd0b25zIENyYWRsZScgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNlcGFyYXRpb24gPSAxLjksXG4gICAgICAgICAgICAgICAgY2lyY2xlID0gQm9kaWVzLmNpcmNsZSh4eCArIGkgKiAoc2l6ZSAqIHNlcGFyYXRpb24pLCB5eSArIGxlbmd0aCwgc2l6ZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpbmVydGlhOiBJbmZpbml0eSwgcmVzdGl0dXRpb246IDEsIGZyaWN0aW9uOiAwLCBmcmljdGlvbkFpcjogMC4wMDAxLCBzbG9wOiAxIH0pLFxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQgPSBDb25zdHJhaW50LmNyZWF0ZSh7IHBvaW50QTogeyB4OiB4eCArIGkgKiAoc2l6ZSAqIHNlcGFyYXRpb24pLCB5OiB5eSB9LCBib2R5QjogY2lyY2xlIH0pO1xuXG4gICAgICAgICAgICBDb21wb3NpdGUuYWRkQm9keShuZXd0b25zQ3JhZGxlLCBjaXJjbGUpO1xuICAgICAgICAgICAgQ29tcG9zaXRlLmFkZENvbnN0cmFpbnQobmV3dG9uc0NyYWRsZSwgY29uc3RyYWludCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3dG9uc0NyYWRsZTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBjb21wb3NpdGUgd2l0aCBzaW1wbGUgY2FyIHNldHVwIG9mIGJvZGllcyBhbmQgY29uc3RyYWludHMuXG4gICAgICogQG1ldGhvZCBjYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdoZWVsU2l6ZVxuICAgICAqIEByZXR1cm4ge2NvbXBvc2l0ZX0gQSBuZXcgY29tcG9zaXRlIGNhciBib2R5XG4gICAgICovXG4gICAgQ29tcG9zaXRlcy5jYXIgPSBmdW5jdGlvbih4eCwgeXksIHdpZHRoLCBoZWlnaHQsIHdoZWVsU2l6ZSkge1xuICAgICAgICB2YXIgZ3JvdXAgPSBCb2R5Lm5leHRHcm91cCh0cnVlKSxcbiAgICAgICAgICAgIHdoZWVsQmFzZSA9IC0yMCxcbiAgICAgICAgICAgIHdoZWVsQU9mZnNldCA9IC13aWR0aCAqIDAuNSArIHdoZWVsQmFzZSxcbiAgICAgICAgICAgIHdoZWVsQk9mZnNldCA9IHdpZHRoICogMC41IC0gd2hlZWxCYXNlLFxuICAgICAgICAgICAgd2hlZWxZT2Zmc2V0ID0gMDtcbiAgICBcbiAgICAgICAgdmFyIGNhciA9IENvbXBvc2l0ZS5jcmVhdGUoeyBsYWJlbDogJ0NhcicgfSksXG4gICAgICAgICAgICBib2R5ID0gQm9kaWVzLnRyYXBlem9pZCh4eCwgeXksIHdpZHRoLCBoZWlnaHQsIDAuMywgeyBcbiAgICAgICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IGdyb3VwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogMC4wMSxcbiAgICAgICAgICAgICAgICBjaGFtZmVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMTBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgdmFyIHdoZWVsQSA9IEJvZGllcy5jaXJjbGUoeHggKyB3aGVlbEFPZmZzZXQsIHl5ICsgd2hlZWxZT2Zmc2V0LCB3aGVlbFNpemUsIHsgXG4gICAgICAgICAgICBjb2xsaXNpb25GaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmcmljdGlvbjogMC44LFxuICAgICAgICAgICAgZGVuc2l0eTogMC4wMVxuICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciB3aGVlbEIgPSBCb2RpZXMuY2lyY2xlKHh4ICsgd2hlZWxCT2Zmc2V0LCB5eSArIHdoZWVsWU9mZnNldCwgd2hlZWxTaXplLCB7IFxuICAgICAgICAgICAgY29sbGlzaW9uRmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgZ3JvdXA6IGdyb3VwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnJpY3Rpb246IDAuOCxcbiAgICAgICAgICAgIGRlbnNpdHk6IDAuMDFcbiAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB2YXIgYXhlbEEgPSBDb25zdHJhaW50LmNyZWF0ZSh7XG4gICAgICAgICAgICBib2R5QTogYm9keSxcbiAgICAgICAgICAgIHBvaW50QTogeyB4OiB3aGVlbEFPZmZzZXQsIHk6IHdoZWVsWU9mZnNldCB9LFxuICAgICAgICAgICAgYm9keUI6IHdoZWVsQSxcbiAgICAgICAgICAgIHN0aWZmbmVzczogMC4yXG4gICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHZhciBheGVsQiA9IENvbnN0cmFpbnQuY3JlYXRlKHtcbiAgICAgICAgICAgIGJvZHlBOiBib2R5LFxuICAgICAgICAgICAgcG9pbnRBOiB7IHg6IHdoZWVsQk9mZnNldCwgeTogd2hlZWxZT2Zmc2V0IH0sXG4gICAgICAgICAgICBib2R5Qjogd2hlZWxCLFxuICAgICAgICAgICAgc3RpZmZuZXNzOiAwLjJcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBDb21wb3NpdGUuYWRkQm9keShjYXIsIGJvZHkpO1xuICAgICAgICBDb21wb3NpdGUuYWRkQm9keShjYXIsIHdoZWVsQSk7XG4gICAgICAgIENvbXBvc2l0ZS5hZGRCb2R5KGNhciwgd2hlZWxCKTtcbiAgICAgICAgQ29tcG9zaXRlLmFkZENvbnN0cmFpbnQoY2FyLCBheGVsQSk7XG4gICAgICAgIENvbXBvc2l0ZS5hZGRDb25zdHJhaW50KGNhciwgYXhlbEIpO1xuXG4gICAgICAgIHJldHVybiBjYXI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaW1wbGUgc29mdCBib2R5IGxpa2Ugb2JqZWN0LlxuICAgICAqIEBtZXRob2Qgc29mdEJvZHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByb3dzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbkdhcFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByb3dHYXBcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNyb3NzQnJhY2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGFydGljbGVSYWRpdXNcbiAgICAgKiBAcGFyYW0ge30gcGFydGljbGVPcHRpb25zXG4gICAgICogQHBhcmFtIHt9IGNvbnN0cmFpbnRPcHRpb25zXG4gICAgICogQHJldHVybiB7Y29tcG9zaXRlfSBBIG5ldyBjb21wb3NpdGUgc29mdEJvZHlcbiAgICAgKi9cbiAgICBDb21wb3NpdGVzLnNvZnRCb2R5ID0gZnVuY3Rpb24oeHgsIHl5LCBjb2x1bW5zLCByb3dzLCBjb2x1bW5HYXAsIHJvd0dhcCwgY3Jvc3NCcmFjZSwgcGFydGljbGVSYWRpdXMsIHBhcnRpY2xlT3B0aW9ucywgY29uc3RyYWludE9wdGlvbnMpIHtcbiAgICAgICAgcGFydGljbGVPcHRpb25zID0gQ29tbW9uLmV4dGVuZCh7IGluZXJ0aWE6IEluZmluaXR5IH0sIHBhcnRpY2xlT3B0aW9ucyk7XG4gICAgICAgIGNvbnN0cmFpbnRPcHRpb25zID0gQ29tbW9uLmV4dGVuZCh7IHN0aWZmbmVzczogMC40IH0sIGNvbnN0cmFpbnRPcHRpb25zKTtcblxuICAgICAgICB2YXIgc29mdEJvZHkgPSBDb21wb3NpdGVzLnN0YWNrKHh4LCB5eSwgY29sdW1ucywgcm93cywgY29sdW1uR2FwLCByb3dHYXAsIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiBCb2RpZXMuY2lyY2xlKHgsIHksIHBhcnRpY2xlUmFkaXVzLCBwYXJ0aWNsZU9wdGlvbnMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBDb21wb3NpdGVzLm1lc2goc29mdEJvZHksIGNvbHVtbnMsIHJvd3MsIGNyb3NzQnJhY2UsIGNvbnN0cmFpbnRPcHRpb25zKTtcblxuICAgICAgICBzb2Z0Qm9keS5sYWJlbCA9ICdTb2Z0IEJvZHknO1xuXG4gICAgICAgIHJldHVybiBzb2Z0Qm9keTtcbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4uL2JvZHkvQm9keVwiOjEsXCIuLi9ib2R5L0NvbXBvc2l0ZVwiOjIsXCIuLi9jb25zdHJhaW50L0NvbnN0cmFpbnRcIjoxMixcIi4uL2NvcmUvQ29tbW9uXCI6MTQsXCIuL0JvZGllc1wiOjIzfV0sMjU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLkF4ZXNgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIHNldHMgb2YgYXhlcy5cbipcbiogQGNsYXNzIEF4ZXNcbiovXG5cbnZhciBBeGVzID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gQXhlcztcblxudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgc2V0IG9mIGF4ZXMgZnJvbSB0aGUgZ2l2ZW4gdmVydGljZXMuXG4gICAgICogQG1ldGhvZCBmcm9tVmVydGljZXNcbiAgICAgKiBAcGFyYW0ge3ZlcnRpY2VzfSB2ZXJ0aWNlc1xuICAgICAqIEByZXR1cm4ge2F4ZXN9IEEgbmV3IGF4ZXMgZnJvbSB0aGUgZ2l2ZW4gdmVydGljZXNcbiAgICAgKi9cbiAgICBBeGVzLmZyb21WZXJ0aWNlcyA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgICAgIHZhciBheGVzID0ge307XG5cbiAgICAgICAgLy8gZmluZCB0aGUgdW5pcXVlIGF4ZXMsIHVzaW5nIGVkZ2Ugbm9ybWFsIGdyYWRpZW50c1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaiA9IChpICsgMSkgJSB2ZXJ0aWNlcy5sZW5ndGgsIFxuICAgICAgICAgICAgICAgIG5vcm1hbCA9IFZlY3Rvci5ub3JtYWxpc2UoeyBcbiAgICAgICAgICAgICAgICAgICAgeDogdmVydGljZXNbal0ueSAtIHZlcnRpY2VzW2ldLnksIFxuICAgICAgICAgICAgICAgICAgICB5OiB2ZXJ0aWNlc1tpXS54IC0gdmVydGljZXNbal0ueFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGdyYWRpZW50ID0gKG5vcm1hbC55ID09PSAwKSA/IEluZmluaXR5IDogKG5vcm1hbC54IC8gbm9ybWFsLnkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBsaW1pdCBwcmVjaXNpb25cbiAgICAgICAgICAgIGdyYWRpZW50ID0gZ3JhZGllbnQudG9GaXhlZCgzKS50b1N0cmluZygpO1xuICAgICAgICAgICAgYXhlc1tncmFkaWVudF0gPSBub3JtYWw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQ29tbW9uLnZhbHVlcyhheGVzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUm90YXRlcyBhIHNldCBvZiBheGVzIGJ5IHRoZSBnaXZlbiBhbmdsZS5cbiAgICAgKiBAbWV0aG9kIHJvdGF0ZVxuICAgICAqIEBwYXJhbSB7YXhlc30gYXhlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIEF4ZXMucm90YXRlID0gZnVuY3Rpb24oYXhlcywgYW5nbGUpIHtcbiAgICAgICAgaWYgKGFuZ2xlID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBheGlzID0gYXhlc1tpXSxcbiAgICAgICAgICAgICAgICB4eDtcbiAgICAgICAgICAgIHh4ID0gYXhpcy54ICogY29zIC0gYXhpcy55ICogc2luO1xuICAgICAgICAgICAgYXhpcy55ID0gYXhpcy54ICogc2luICsgYXhpcy55ICogY29zO1xuICAgICAgICAgICAgYXhpcy54ID0geHg7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KSgpO1xuXG59LHtcIi4uL2NvcmUvQ29tbW9uXCI6MTQsXCIuLi9nZW9tZXRyeS9WZWN0b3JcIjoyOH1dLDI2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5Cb3VuZHNgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIGF4aXMtYWxpZ25lZCBib3VuZGluZyBib3hlcyAoQUFCQikuXG4qXG4qIEBjbGFzcyBCb3VuZHNcbiovXG5cbnZhciBCb3VuZHMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZHM7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveCAoQUFCQikgZm9yIHRoZSBnaXZlbiB2ZXJ0aWNlcy5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7dmVydGljZXN9IHZlcnRpY2VzXG4gICAgICogQHJldHVybiB7Ym91bmRzfSBBIG5ldyBib3VuZHMgb2JqZWN0XG4gICAgICovXG4gICAgQm91bmRzLmNyZWF0ZSA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgICAgIHZhciBib3VuZHMgPSB7IFxuICAgICAgICAgICAgbWluOiB7IHg6IDAsIHk6IDAgfSwgXG4gICAgICAgICAgICBtYXg6IHsgeDogMCwgeTogMCB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHZlcnRpY2VzKVxuICAgICAgICAgICAgQm91bmRzLnVwZGF0ZShib3VuZHMsIHZlcnRpY2VzKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgYm91bmRzIHVzaW5nIHRoZSBnaXZlbiB2ZXJ0aWNlcyBhbmQgZXh0ZW5kcyB0aGUgYm91bmRzIGdpdmVuIGEgdmVsb2NpdHkuXG4gICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAgKiBAcGFyYW0ge2JvdW5kc30gYm91bmRzXG4gICAgICogQHBhcmFtIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVsb2NpdHlcbiAgICAgKi9cbiAgICBCb3VuZHMudXBkYXRlID0gZnVuY3Rpb24oYm91bmRzLCB2ZXJ0aWNlcywgdmVsb2NpdHkpIHtcbiAgICAgICAgYm91bmRzLm1pbi54ID0gSW5maW5pdHk7XG4gICAgICAgIGJvdW5kcy5tYXgueCA9IC1JbmZpbml0eTtcbiAgICAgICAgYm91bmRzLm1pbi55ID0gSW5maW5pdHk7XG4gICAgICAgIGJvdW5kcy5tYXgueSA9IC1JbmZpbml0eTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmVydGV4ID0gdmVydGljZXNbaV07XG4gICAgICAgICAgICBpZiAodmVydGV4LnggPiBib3VuZHMubWF4LngpIGJvdW5kcy5tYXgueCA9IHZlcnRleC54O1xuICAgICAgICAgICAgaWYgKHZlcnRleC54IDwgYm91bmRzLm1pbi54KSBib3VuZHMubWluLnggPSB2ZXJ0ZXgueDtcbiAgICAgICAgICAgIGlmICh2ZXJ0ZXgueSA+IGJvdW5kcy5tYXgueSkgYm91bmRzLm1heC55ID0gdmVydGV4Lnk7XG4gICAgICAgICAgICBpZiAodmVydGV4LnkgPCBib3VuZHMubWluLnkpIGJvdW5kcy5taW4ueSA9IHZlcnRleC55O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodmVsb2NpdHkpIHtcbiAgICAgICAgICAgIGlmICh2ZWxvY2l0eS54ID4gMCkge1xuICAgICAgICAgICAgICAgIGJvdW5kcy5tYXgueCArPSB2ZWxvY2l0eS54O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib3VuZHMubWluLnggKz0gdmVsb2NpdHkueDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgYm91bmRzLm1heC55ICs9IHZlbG9jaXR5Lnk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvdW5kcy5taW4ueSArPSB2ZWxvY2l0eS55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYm91bmRzIGNvbnRhaW5zIHRoZSBnaXZlbiBwb2ludC5cbiAgICAgKiBAbWV0aG9kIGNvbnRhaW5zXG4gICAgICogQHBhcmFtIHtib3VuZHN9IGJvdW5kc1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGJvdW5kcyBjb250YWluIHRoZSBwb2ludCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgQm91bmRzLmNvbnRhaW5zID0gZnVuY3Rpb24oYm91bmRzLCBwb2ludCkge1xuICAgICAgICByZXR1cm4gcG9pbnQueCA+PSBib3VuZHMubWluLnggJiYgcG9pbnQueCA8PSBib3VuZHMubWF4LnggXG4gICAgICAgICAgICAgICAmJiBwb2ludC55ID49IGJvdW5kcy5taW4ueSAmJiBwb2ludC55IDw9IGJvdW5kcy5tYXgueTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gYm91bmRzIGludGVyc2VjdC5cbiAgICAgKiBAbWV0aG9kIG92ZXJsYXBzXG4gICAgICogQHBhcmFtIHtib3VuZHN9IGJvdW5kc0FcbiAgICAgKiBAcGFyYW0ge2JvdW5kc30gYm91bmRzQlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGJvdW5kcyBvdmVybGFwLCBvdGhlcndpc2UgZmFsc2VcbiAgICAgKi9cbiAgICBCb3VuZHMub3ZlcmxhcHMgPSBmdW5jdGlvbihib3VuZHNBLCBib3VuZHNCKSB7XG4gICAgICAgIHJldHVybiAoYm91bmRzQS5taW4ueCA8PSBib3VuZHNCLm1heC54ICYmIGJvdW5kc0EubWF4LnggPj0gYm91bmRzQi5taW4ueFxuICAgICAgICAgICAgICAgICYmIGJvdW5kc0EubWF4LnkgPj0gYm91bmRzQi5taW4ueSAmJiBib3VuZHNBLm1pbi55IDw9IGJvdW5kc0IubWF4LnkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGVzIHRoZSBib3VuZHMgYnkgdGhlIGdpdmVuIHZlY3Rvci5cbiAgICAgKiBAbWV0aG9kIHRyYW5zbGF0ZVxuICAgICAqIEBwYXJhbSB7Ym91bmRzfSBib3VuZHNcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yXG4gICAgICovXG4gICAgQm91bmRzLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKGJvdW5kcywgdmVjdG9yKSB7XG4gICAgICAgIGJvdW5kcy5taW4ueCArPSB2ZWN0b3IueDtcbiAgICAgICAgYm91bmRzLm1heC54ICs9IHZlY3Rvci54O1xuICAgICAgICBib3VuZHMubWluLnkgKz0gdmVjdG9yLnk7XG4gICAgICAgIGJvdW5kcy5tYXgueSArPSB2ZWN0b3IueTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2hpZnRzIHRoZSBib3VuZHMgdG8gdGhlIGdpdmVuIHBvc2l0aW9uLlxuICAgICAqIEBtZXRob2Qgc2hpZnRcbiAgICAgKiBAcGFyYW0ge2JvdW5kc30gYm91bmRzXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHBvc2l0aW9uXG4gICAgICovXG4gICAgQm91bmRzLnNoaWZ0ID0gZnVuY3Rpb24oYm91bmRzLCBwb3NpdGlvbikge1xuICAgICAgICB2YXIgZGVsdGFYID0gYm91bmRzLm1heC54IC0gYm91bmRzLm1pbi54LFxuICAgICAgICAgICAgZGVsdGFZID0gYm91bmRzLm1heC55IC0gYm91bmRzLm1pbi55O1xuICAgICAgICAgICAgXG4gICAgICAgIGJvdW5kcy5taW4ueCA9IHBvc2l0aW9uLng7XG4gICAgICAgIGJvdW5kcy5tYXgueCA9IHBvc2l0aW9uLnggKyBkZWx0YVg7XG4gICAgICAgIGJvdW5kcy5taW4ueSA9IHBvc2l0aW9uLnk7XG4gICAgICAgIGJvdW5kcy5tYXgueSA9IHBvc2l0aW9uLnkgKyBkZWx0YVk7XG4gICAgfTtcbiAgICBcbn0pKCk7XG5cbn0se31dLDI3OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5TdmdgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjb252ZXJ0aW5nIFNWRyBpbWFnZXMgaW50byBhbiBhcnJheSBvZiB2ZWN0b3IgcG9pbnRzLlxuKlxuKiBUbyB1c2UgdGhpcyBtb2R1bGUgeW91IGFsc28gbmVlZCB0aGUgU1ZHUGF0aFNlZyBwb2x5ZmlsbDogaHR0cHM6Ly9naXRodWIuY29tL3Byb2dlcnMvcGF0aHNlZ1xuKlxuKiBTZWUgdGhlIGluY2x1ZGVkIHVzYWdlIFtleGFtcGxlc10oaHR0cHM6Ly9naXRodWIuY29tL2xpYWJydS9tYXR0ZXItanMvdHJlZS9tYXN0ZXIvZXhhbXBsZXMpLlxuKlxuKiBAY2xhc3MgU3ZnXG4qL1xuXG52YXIgU3ZnID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gU3ZnO1xuXG52YXIgQm91bmRzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvQm91bmRzJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIFNWRyBwYXRoIGludG8gYW4gYXJyYXkgb2YgdmVjdG9yIHBvaW50cy5cbiAgICAgKiBJZiB0aGUgaW5wdXQgcGF0aCBmb3JtcyBhIGNvbmNhdmUgc2hhcGUsIHlvdSBtdXN0IGRlY29tcG9zZSB0aGUgcmVzdWx0IGludG8gY29udmV4IHBhcnRzIGJlZm9yZSB1c2UuXG4gICAgICogU2VlIGBCb2RpZXMuZnJvbVZlcnRpY2VzYCB3aGljaCBwcm92aWRlcyBzdXBwb3J0IGZvciB0aGlzLlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzIG5vdCBndWFyYW50ZWVkIHRvIHN1cHBvcnQgY29tcGxleCBwYXRocyAoc3VjaCBhcyB0aG9zZSB3aXRoIGhvbGVzKS5cbiAgICAgKiBAbWV0aG9kIHBhdGhUb1ZlcnRpY2VzXG4gICAgICogQHBhcmFtIHtTVkdQYXRoRWxlbWVudH0gcGF0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbc2FtcGxlTGVuZ3RoPTE1XVxuICAgICAqIEByZXR1cm4ge1ZlY3RvcltdfSBwb2ludHNcbiAgICAgKi9cbiAgICBTdmcucGF0aFRvVmVydGljZXMgPSBmdW5jdGlvbihwYXRoLCBzYW1wbGVMZW5ndGgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dvdXQvc3ZnLnRvcG9seS5qcy9ibG9iL21hc3Rlci9zdmcudG9wb2x5LmpzXG4gICAgICAgIHZhciBpLCBpbCwgdG90YWwsIHBvaW50LCBzZWdtZW50LCBzZWdtZW50cywgXG4gICAgICAgICAgICBzZWdtZW50c1F1ZXVlLCBsYXN0U2VnbWVudCwgXG4gICAgICAgICAgICBsYXN0UG9pbnQsIHNlZ21lbnRJbmRleCwgcG9pbnRzID0gW10sXG4gICAgICAgICAgICBseCwgbHksIGxlbmd0aCA9IDAsIHggPSAwLCB5ID0gMDtcblxuICAgICAgICBzYW1wbGVMZW5ndGggPSBzYW1wbGVMZW5ndGggfHwgMTU7XG5cbiAgICAgICAgdmFyIGFkZFBvaW50ID0gZnVuY3Rpb24ocHgsIHB5LCBwYXRoU2VnVHlwZSkge1xuICAgICAgICAgICAgLy8gYWxsIG9kZC1udW1iZXJlZCBwYXRoIHR5cGVzIGFyZSByZWxhdGl2ZSBleGNlcHQgUEFUSFNFR19DTE9TRVBBVEggKDEpXG4gICAgICAgICAgICB2YXIgaXNSZWxhdGl2ZSA9IHBhdGhTZWdUeXBlICUgMiA9PT0gMSAmJiBwYXRoU2VnVHlwZSA+IDE7XG5cbiAgICAgICAgICAgIC8vIHdoZW4gdGhlIGxhc3QgcG9pbnQgZG9lc24ndCBlcXVhbCB0aGUgY3VycmVudCBwb2ludCBhZGQgdGhlIGN1cnJlbnQgcG9pbnRcbiAgICAgICAgICAgIGlmICghbGFzdFBvaW50IHx8IHB4ICE9IGxhc3RQb2ludC54IHx8IHB5ICE9IGxhc3RQb2ludC55KSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RQb2ludCAmJiBpc1JlbGF0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGx4ID0gbGFzdFBvaW50Lng7XG4gICAgICAgICAgICAgICAgICAgIGx5ID0gbGFzdFBvaW50Lnk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbHggPSAwO1xuICAgICAgICAgICAgICAgICAgICBseSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50ID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBseCArIHB4LFxuICAgICAgICAgICAgICAgICAgICB5OiBseSArIHB5XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIHNldCBsYXN0IHBvaW50XG4gICAgICAgICAgICAgICAgaWYgKGlzUmVsYXRpdmUgfHwgIWxhc3RQb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0UG9pbnQgPSBwb2ludDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwb2ludHMucHVzaChwb2ludCk7XG5cbiAgICAgICAgICAgICAgICB4ID0gbHggKyBweDtcbiAgICAgICAgICAgICAgICB5ID0gbHkgKyBweTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYWRkU2VnbWVudFBvaW50ID0gZnVuY3Rpb24oc2VnbWVudCkge1xuICAgICAgICAgICAgdmFyIHNlZ1R5cGUgPSBzZWdtZW50LnBhdGhTZWdUeXBlQXNMZXR0ZXIudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgLy8gc2tpcCBwYXRoIGVuZHNcbiAgICAgICAgICAgIGlmIChzZWdUeXBlID09PSAnWicpIFxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgLy8gbWFwIHNlZ21lbnQgdG8geCBhbmQgeVxuICAgICAgICAgICAgc3dpdGNoIChzZWdUeXBlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ00nOlxuICAgICAgICAgICAgY2FzZSAnTCc6XG4gICAgICAgICAgICBjYXNlICdUJzpcbiAgICAgICAgICAgIGNhc2UgJ0MnOlxuICAgICAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgICAgICAgICB4ID0gc2VnbWVudC54O1xuICAgICAgICAgICAgICAgIHkgPSBzZWdtZW50Lnk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICB4ID0gc2VnbWVudC54O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVic6XG4gICAgICAgICAgICAgICAgeSA9IHNlZ21lbnQueTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWRkUG9pbnQoeCwgeSwgc2VnbWVudC5wYXRoU2VnVHlwZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZW5zdXJlIHBhdGggaXMgYWJzb2x1dGVcbiAgICAgICAgX3N2Z1BhdGhUb0Fic29sdXRlKHBhdGgpO1xuXG4gICAgICAgIC8vIGdldCB0b3RhbCBsZW5ndGhcbiAgICAgICAgdG90YWwgPSBwYXRoLmdldFRvdGFsTGVuZ3RoKCk7XG5cbiAgICAgICAgLy8gcXVldWUgc2VnbWVudHNcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhdGgucGF0aFNlZ0xpc3QubnVtYmVyT2ZJdGVtczsgaSArPSAxKVxuICAgICAgICAgICAgc2VnbWVudHMucHVzaChwYXRoLnBhdGhTZWdMaXN0LmdldEl0ZW0oaSkpO1xuXG4gICAgICAgIHNlZ21lbnRzUXVldWUgPSBzZWdtZW50cy5jb25jYXQoKTtcblxuICAgICAgICAvLyBzYW1wbGUgdGhyb3VnaCBwYXRoXG4gICAgICAgIHdoaWxlIChsZW5ndGggPCB0b3RhbCkge1xuICAgICAgICAgICAgLy8gZ2V0IHNlZ21lbnQgYXQgcG9zaXRpb25cbiAgICAgICAgICAgIHNlZ21lbnRJbmRleCA9IHBhdGguZ2V0UGF0aFNlZ0F0TGVuZ3RoKGxlbmd0aCk7XG4gICAgICAgICAgICBzZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudEluZGV4XTtcblxuICAgICAgICAgICAgLy8gbmV3IHNlZ21lbnRcbiAgICAgICAgICAgIGlmIChzZWdtZW50ICE9IGxhc3RTZWdtZW50KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHNlZ21lbnRzUXVldWUubGVuZ3RoICYmIHNlZ21lbnRzUXVldWVbMF0gIT0gc2VnbWVudClcbiAgICAgICAgICAgICAgICAgICAgYWRkU2VnbWVudFBvaW50KHNlZ21lbnRzUXVldWUuc2hpZnQoKSk7XG5cbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudCA9IHNlZ21lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFkZCBwb2ludHMgaW4gYmV0d2VlbiB3aGVuIGN1cnZpbmdcbiAgICAgICAgICAgIC8vIFRPRE86IGFkYXB0aXZlIHNhbXBsaW5nXG4gICAgICAgICAgICBzd2l0Y2ggKHNlZ21lbnQucGF0aFNlZ1R5cGVBc0xldHRlci50b1VwcGVyQ2FzZSgpKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ0MnOlxuICAgICAgICAgICAgY2FzZSAnVCc6XG4gICAgICAgICAgICBjYXNlICdTJzpcbiAgICAgICAgICAgIGNhc2UgJ1EnOlxuICAgICAgICAgICAgY2FzZSAnQSc6XG4gICAgICAgICAgICAgICAgcG9pbnQgPSBwYXRoLmdldFBvaW50QXRMZW5ndGgobGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBhZGRQb2ludChwb2ludC54LCBwb2ludC55LCAwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbmNyZW1lbnQgYnkgc2FtcGxlIHZhbHVlXG4gICAgICAgICAgICBsZW5ndGggKz0gc2FtcGxlTGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHJlbWFpbmluZyBzZWdtZW50cyBub3QgcGFzc2VkIGJ5IHNhbXBsaW5nXG4gICAgICAgIGZvciAoaSA9IDAsIGlsID0gc2VnbWVudHNRdWV1ZS5sZW5ndGg7IGkgPCBpbDsgKytpKVxuICAgICAgICAgICAgYWRkU2VnbWVudFBvaW50KHNlZ21lbnRzUXVldWVbaV0pO1xuXG4gICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfTtcblxuICAgIHZhciBfc3ZnUGF0aFRvQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgIC8vIGh0dHA6Ly9waHJvZ3oubmV0L2NvbnZlcnQtc3ZnLXBhdGgtdG8tYWxsLWFic29sdXRlLWNvbW1hbmRzXG4gICAgICAgIHZhciB4MCwgeTAsIHgxLCB5MSwgeDIsIHkyLCBzZWdzID0gcGF0aC5wYXRoU2VnTGlzdCxcbiAgICAgICAgICAgIHggPSAwLCB5ID0gMCwgbGVuID0gc2Vncy5udW1iZXJPZkl0ZW1zO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBzZWcgPSBzZWdzLmdldEl0ZW0oaSksXG4gICAgICAgICAgICAgICAgc2VnVHlwZSA9IHNlZy5wYXRoU2VnVHlwZUFzTGV0dGVyO1xuXG4gICAgICAgICAgICBpZiAoL1tNTEhWQ1NRVEFdLy50ZXN0KHNlZ1R5cGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCd4JyBpbiBzZWcpIHggPSBzZWcueDtcbiAgICAgICAgICAgICAgICBpZiAoJ3knIGluIHNlZykgeSA9IHNlZy55O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3gxJyBpbiBzZWcpIHgxID0geCArIHNlZy54MTtcbiAgICAgICAgICAgICAgICBpZiAoJ3gyJyBpbiBzZWcpIHgyID0geCArIHNlZy54MjtcbiAgICAgICAgICAgICAgICBpZiAoJ3kxJyBpbiBzZWcpIHkxID0geSArIHNlZy55MTtcbiAgICAgICAgICAgICAgICBpZiAoJ3kyJyBpbiBzZWcpIHkyID0geSArIHNlZy55MjtcbiAgICAgICAgICAgICAgICBpZiAoJ3gnIGluIHNlZykgeCArPSBzZWcueDtcbiAgICAgICAgICAgICAgICBpZiAoJ3knIGluIHNlZykgeSArPSBzZWcueTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2VnVHlwZSkge1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnTW92ZXRvQWJzKHgsIHkpLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbCc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnTGluZXRvQWJzKHgsIHkpLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnTGluZXRvSG9yaXpvbnRhbEFicyh4KSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3YnOlxuICAgICAgICAgICAgICAgICAgICBzZWdzLnJlcGxhY2VJdGVtKHBhdGguY3JlYXRlU1ZHUGF0aFNlZ0xpbmV0b1ZlcnRpY2FsQWJzKHkpLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnQ3VydmV0b0N1YmljQWJzKHgsIHksIHgxLCB5MSwgeDIsIHkyKSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICBzZWdzLnJlcGxhY2VJdGVtKHBhdGguY3JlYXRlU1ZHUGF0aFNlZ0N1cnZldG9DdWJpY1Ntb290aEFicyh4LCB5LCB4MiwgeTIpLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncSc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnQ3VydmV0b1F1YWRyYXRpY0Ficyh4LCB5LCB4MSwgeTEpLCBpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgICAgIHNlZ3MucmVwbGFjZUl0ZW0ocGF0aC5jcmVhdGVTVkdQYXRoU2VnQ3VydmV0b1F1YWRyYXRpY1Ntb290aEFicyh4LCB5KSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICAgICBzZWdzLnJlcGxhY2VJdGVtKHBhdGguY3JlYXRlU1ZHUGF0aFNlZ0FyY0Ficyh4LCB5LCBzZWcucjEsIHNlZy5yMiwgc2VnLmFuZ2xlLCBzZWcubGFyZ2VBcmNGbGFnLCBzZWcuc3dlZXBGbGFnKSwgaSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3onOlxuICAgICAgICAgICAgICAgIGNhc2UgJ1onOlxuICAgICAgICAgICAgICAgICAgICB4ID0geDA7XG4gICAgICAgICAgICAgICAgICAgIHkgPSB5MDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWdUeXBlID09ICdNJyB8fCBzZWdUeXBlID09ICdtJykge1xuICAgICAgICAgICAgICAgIHgwID0geDtcbiAgICAgICAgICAgICAgICB5MCA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG59KSgpO1xufSx7XCIuLi9nZW9tZXRyeS9Cb3VuZHNcIjoyNn1dLDI4OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5WZWN0b3JgIG1vZHVsZSBjb250YWlucyBtZXRob2RzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIHZlY3RvcnMuXG4qIFZlY3RvcnMgYXJlIHRoZSBiYXNpcyBvZiBhbGwgdGhlIGdlb21ldHJ5IHJlbGF0ZWQgb3BlcmF0aW9ucyBpbiB0aGUgZW5naW5lLlxuKiBBIGBNYXR0ZXIuVmVjdG9yYCBvYmplY3QgaXMgb2YgdGhlIGZvcm0gYHsgeDogMCwgeTogMCB9YC5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIFZlY3RvclxuKi9cblxuLy8gVE9ETzogY29uc2lkZXIgcGFyYW1zIGZvciByZXVzaW5nIHZlY3RvciBvYmplY3RzXG5cbnZhciBWZWN0b3IgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgdmVjdG9yLlxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gQSBuZXcgdmVjdG9yXG4gICAgICovXG4gICAgVmVjdG9yLmNyZWF0ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIHsgeDogeCB8fCAwLCB5OiB5IHx8IDAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyB2ZWN0b3Igd2l0aCBgeGAgYW5kIGB5YCBjb3BpZWQgZnJvbSB0aGUgZ2l2ZW4gYHZlY3RvcmAuXG4gICAgICogQG1ldGhvZCBjbG9uZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcmV0dXJuIHt2ZWN0b3J9IEEgbmV3IGNsb25lZCB2ZWN0b3JcbiAgICAgKi9cbiAgICBWZWN0b3IuY2xvbmUgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHsgeDogdmVjdG9yLngsIHk6IHZlY3Rvci55IH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG1hZ25pdHVkZSAobGVuZ3RoKSBvZiBhIHZlY3Rvci5cbiAgICAgKiBAbWV0aG9kIG1hZ25pdHVkZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBtYWduaXR1ZGUgb2YgdGhlIHZlY3RvclxuICAgICAqL1xuICAgIFZlY3Rvci5tYWduaXR1ZGUgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCgodmVjdG9yLnggKiB2ZWN0b3IueCkgKyAodmVjdG9yLnkgKiB2ZWN0b3IueSkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWduaXR1ZGUgKGxlbmd0aCkgb2YgYSB2ZWN0b3IgKHRoZXJlZm9yZSBzYXZpbmcgYSBgc3FydGAgb3BlcmF0aW9uKS5cbiAgICAgKiBAbWV0aG9kIG1hZ25pdHVkZVNxdWFyZWRcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgdGhlIHZlY3RvclxuICAgICAqL1xuICAgIFZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkID0gZnVuY3Rpb24odmVjdG9yKSB7XG4gICAgICAgIHJldHVybiAodmVjdG9yLnggKiB2ZWN0b3IueCkgKyAodmVjdG9yLnkgKiB2ZWN0b3IueSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZXMgdGhlIHZlY3RvciBhYm91dCAoMCwgMCkgYnkgc3BlY2lmaWVkIGFuZ2xlLlxuICAgICAqIEBtZXRob2Qgcm90YXRlXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gQSBuZXcgdmVjdG9yIHJvdGF0ZWQgYWJvdXQgKDAsIDApXG4gICAgICovXG4gICAgVmVjdG9yLnJvdGF0ZSA9IGZ1bmN0aW9uKHZlY3RvciwgYW5nbGUpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSwgc2luID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdmVjdG9yLnggKiBjb3MgLSB2ZWN0b3IueSAqIHNpbixcbiAgICAgICAgICAgIHk6IHZlY3Rvci54ICogc2luICsgdmVjdG9yLnkgKiBjb3NcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUm90YXRlcyB0aGUgdmVjdG9yIGFib3V0IGEgc3BlY2lmaWVkIHBvaW50IGJ5IHNwZWNpZmllZCBhbmdsZS5cbiAgICAgKiBAbWV0aG9kIHJvdGF0ZUFib3V0XG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBbb3V0cHV0XVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gQSBuZXcgdmVjdG9yIHJvdGF0ZWQgYWJvdXQgdGhlIHBvaW50XG4gICAgICovXG4gICAgVmVjdG9yLnJvdGF0ZUFib3V0ID0gZnVuY3Rpb24odmVjdG9yLCBhbmdsZSwgcG9pbnQsIG91dHB1dCkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLCBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIGlmICghb3V0cHV0KSBvdXRwdXQgPSB7fTtcbiAgICAgICAgdmFyIHggPSBwb2ludC54ICsgKCh2ZWN0b3IueCAtIHBvaW50LngpICogY29zIC0gKHZlY3Rvci55IC0gcG9pbnQueSkgKiBzaW4pO1xuICAgICAgICBvdXRwdXQueSA9IHBvaW50LnkgKyAoKHZlY3Rvci54IC0gcG9pbnQueCkgKiBzaW4gKyAodmVjdG9yLnkgLSBwb2ludC55KSAqIGNvcyk7XG4gICAgICAgIG91dHB1dC54ID0geDtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXNlcyBhIHZlY3RvciAoc3VjaCB0aGF0IGl0cyBtYWduaXR1ZGUgaXMgYDFgKS5cbiAgICAgKiBAbWV0aG9kIG5vcm1hbGlzZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcmV0dXJuIHt2ZWN0b3J9IEEgbmV3IHZlY3RvciBub3JtYWxpc2VkXG4gICAgICovXG4gICAgVmVjdG9yLm5vcm1hbGlzZSA9IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgICB2YXIgbWFnbml0dWRlID0gVmVjdG9yLm1hZ25pdHVkZSh2ZWN0b3IpO1xuICAgICAgICBpZiAobWFnbml0dWRlID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHsgeDogMCwgeTogMCB9O1xuICAgICAgICByZXR1cm4geyB4OiB2ZWN0b3IueCAvIG1hZ25pdHVkZSwgeTogdmVjdG9yLnkgLyBtYWduaXR1ZGUgfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZG90LXByb2R1Y3Qgb2YgdHdvIHZlY3RvcnMuXG4gICAgICogQG1ldGhvZCBkb3RcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yQVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JCXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIHR3byB2ZWN0b3JzXG4gICAgICovXG4gICAgVmVjdG9yLmRvdCA9IGZ1bmN0aW9uKHZlY3RvckEsIHZlY3RvckIpIHtcbiAgICAgICAgcmV0dXJuICh2ZWN0b3JBLnggKiB2ZWN0b3JCLngpICsgKHZlY3RvckEueSAqIHZlY3RvckIueSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNyb3NzLXByb2R1Y3Qgb2YgdHdvIHZlY3RvcnMuXG4gICAgICogQG1ldGhvZCBjcm9zc1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JBXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvckJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBjcm9zcyBwcm9kdWN0IG9mIHRoZSB0d28gdmVjdG9yc1xuICAgICAqL1xuICAgIFZlY3Rvci5jcm9zcyA9IGZ1bmN0aW9uKHZlY3RvckEsIHZlY3RvckIpIHtcbiAgICAgICAgcmV0dXJuICh2ZWN0b3JBLnggKiB2ZWN0b3JCLnkpIC0gKHZlY3RvckEueSAqIHZlY3RvckIueCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNyb3NzLXByb2R1Y3Qgb2YgdGhyZWUgdmVjdG9ycy5cbiAgICAgKiBAbWV0aG9kIGNyb3NzM1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JBXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvckJcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yQ1xuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGNyb3NzIHByb2R1Y3Qgb2YgdGhlIHRocmVlIHZlY3RvcnNcbiAgICAgKi9cbiAgICBWZWN0b3IuY3Jvc3MzID0gZnVuY3Rpb24odmVjdG9yQSwgdmVjdG9yQiwgdmVjdG9yQykge1xuICAgICAgICByZXR1cm4gKHZlY3RvckIueCAtIHZlY3RvckEueCkgKiAodmVjdG9yQy55IC0gdmVjdG9yQS55KSAtICh2ZWN0b3JCLnkgLSB2ZWN0b3JBLnkpICogKHZlY3RvckMueCAtIHZlY3RvckEueCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHR3byB2ZWN0b3JzLlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvckFcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yQlxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBbb3V0cHV0XVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gQSBuZXcgdmVjdG9yIG9mIHZlY3RvckEgYW5kIHZlY3RvckIgYWRkZWRcbiAgICAgKi9cbiAgICBWZWN0b3IuYWRkID0gZnVuY3Rpb24odmVjdG9yQSwgdmVjdG9yQiwgb3V0cHV0KSB7XG4gICAgICAgIGlmICghb3V0cHV0KSBvdXRwdXQgPSB7fTtcbiAgICAgICAgb3V0cHV0LnggPSB2ZWN0b3JBLnggKyB2ZWN0b3JCLng7XG4gICAgICAgIG91dHB1dC55ID0gdmVjdG9yQS55ICsgdmVjdG9yQi55O1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIHR3byB2ZWN0b3JzLlxuICAgICAqIEBtZXRob2Qgc3ViXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvckFcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yQlxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBbb3V0cHV0XVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gQSBuZXcgdmVjdG9yIG9mIHZlY3RvckEgYW5kIHZlY3RvckIgc3VidHJhY3RlZFxuICAgICAqL1xuICAgIFZlY3Rvci5zdWIgPSBmdW5jdGlvbih2ZWN0b3JBLCB2ZWN0b3JCLCBvdXRwdXQpIHtcbiAgICAgICAgaWYgKCFvdXRwdXQpIG91dHB1dCA9IHt9O1xuICAgICAgICBvdXRwdXQueCA9IHZlY3RvckEueCAtIHZlY3RvckIueDtcbiAgICAgICAgb3V0cHV0LnkgPSB2ZWN0b3JBLnkgLSB2ZWN0b3JCLnk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGxpZXMgYSB2ZWN0b3IgYW5kIGEgc2NhbGFyLlxuICAgICAqIEBtZXRob2QgbXVsdFxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGFyXG4gICAgICogQHJldHVybiB7dmVjdG9yfSBBIG5ldyB2ZWN0b3IgbXVsdGlwbGllZCBieSBzY2FsYXJcbiAgICAgKi9cbiAgICBWZWN0b3IubXVsdCA9IGZ1bmN0aW9uKHZlY3Rvciwgc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiB7IHg6IHZlY3Rvci54ICogc2NhbGFyLCB5OiB2ZWN0b3IueSAqIHNjYWxhciB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGVzIGEgdmVjdG9yIGFuZCBhIHNjYWxhci5cbiAgICAgKiBAbWV0aG9kIGRpdlxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGFyXG4gICAgICogQHJldHVybiB7dmVjdG9yfSBBIG5ldyB2ZWN0b3IgZGl2aWRlZCBieSBzY2FsYXJcbiAgICAgKi9cbiAgICBWZWN0b3IuZGl2ID0gZnVuY3Rpb24odmVjdG9yLCBzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIHsgeDogdmVjdG9yLnggLyBzY2FsYXIsIHk6IHZlY3Rvci55IC8gc2NhbGFyIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBlcnBlbmRpY3VsYXIgdmVjdG9yLiBTZXQgYG5lZ2F0ZWAgdG8gdHJ1ZSBmb3IgdGhlIHBlcnBlbmRpY3VsYXIgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbi5cbiAgICAgKiBAbWV0aG9kIHBlcnBcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gdmVjdG9yXG4gICAgICogQHBhcmFtIHtib29sfSBbbmVnYXRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gVGhlIHBlcnBlbmRpY3VsYXIgdmVjdG9yXG4gICAgICovXG4gICAgVmVjdG9yLnBlcnAgPSBmdW5jdGlvbih2ZWN0b3IsIG5lZ2F0ZSkge1xuICAgICAgICBuZWdhdGUgPSBuZWdhdGUgPT09IHRydWUgPyAtMSA6IDE7XG4gICAgICAgIHJldHVybiB7IHg6IG5lZ2F0ZSAqIC12ZWN0b3IueSwgeTogbmVnYXRlICogdmVjdG9yLnggfTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTmVnYXRlcyBib3RoIGNvbXBvbmVudHMgb2YgYSB2ZWN0b3Igc3VjaCB0aGF0IGl0IHBvaW50cyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLlxuICAgICAqIEBtZXRob2QgbmVnXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvclxuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gVGhlIG5lZ2F0ZWQgdmVjdG9yXG4gICAgICovXG4gICAgVmVjdG9yLm5lZyA9IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgICAgICByZXR1cm4geyB4OiAtdmVjdG9yLngsIHk6IC12ZWN0b3IueSB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhbmdsZSBpbiByYWRpYW5zIGJldHdlZW4gdGhlIHR3byB2ZWN0b3JzIHJlbGF0aXZlIHRvIHRoZSB4LWF4aXMuXG4gICAgICogQG1ldGhvZCBhbmdsZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JBXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHZlY3RvckJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gICAgICovXG4gICAgVmVjdG9yLmFuZ2xlID0gZnVuY3Rpb24odmVjdG9yQSwgdmVjdG9yQikge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih2ZWN0b3JCLnkgLSB2ZWN0b3JBLnksIHZlY3RvckIueCAtIHZlY3RvckEueCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRlbXBvcmFyeSB2ZWN0b3IgcG9vbCAobm90IHRocmVhZC1zYWZlKS5cbiAgICAgKiBAcHJvcGVydHkgX3RlbXBcbiAgICAgKiBAdHlwZSB7dmVjdG9yW119XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBWZWN0b3IuX3RlbXAgPSBbVmVjdG9yLmNyZWF0ZSgpLCBWZWN0b3IuY3JlYXRlKCksIFxuICAgICAgICAgICAgICAgICAgICBWZWN0b3IuY3JlYXRlKCksIFZlY3Rvci5jcmVhdGUoKSwgXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5jcmVhdGUoKSwgVmVjdG9yLmNyZWF0ZSgpXTtcblxufSkoKTtcbn0se31dLDI5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5WZXJ0aWNlc2AgbW9kdWxlIGNvbnRhaW5zIG1ldGhvZHMgZm9yIGNyZWF0aW5nIGFuZCBtYW5pcHVsYXRpbmcgc2V0cyBvZiB2ZXJ0aWNlcy5cbiogQSBzZXQgb2YgdmVydGljZXMgaXMgYW4gYXJyYXkgb2YgYE1hdHRlci5WZWN0b3JgIHdpdGggYWRkaXRpb25hbCBpbmRleGluZyBwcm9wZXJ0aWVzIGluc2VydGVkIGJ5IGBWZXJ0aWNlcy5jcmVhdGVgLlxuKiBBIGBNYXR0ZXIuQm9keWAgbWFpbnRhaW5zIGEgc2V0IG9mIHZlcnRpY2VzIHRvIHJlcHJlc2VudCB0aGUgc2hhcGUgb2YgdGhlIG9iamVjdCAoaXRzIGNvbnZleCBodWxsKS5cbipcbiogU2VlIHRoZSBpbmNsdWRlZCB1c2FnZSBbZXhhbXBsZXNdKGh0dHBzOi8vZ2l0aHViLmNvbS9saWFicnUvbWF0dGVyLWpzL3RyZWUvbWFzdGVyL2V4YW1wbGVzKS5cbipcbiogQGNsYXNzIFZlcnRpY2VzXG4qL1xuXG52YXIgVmVydGljZXMgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZXJ0aWNlcztcblxudmFyIFZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xudmFyIENvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgc2V0IG9mIGBNYXR0ZXIuQm9keWAgY29tcGF0aWJsZSB2ZXJ0aWNlcy5cbiAgICAgKiBUaGUgYHBvaW50c2AgYXJndW1lbnQgYWNjZXB0cyBhbiBhcnJheSBvZiBgTWF0dGVyLlZlY3RvcmAgcG9pbnRzIG9yaWVudGF0ZWQgYXJvdW5kIHRoZSBvcmlnaW4gYCgwLCAwKWAsIGZvciBleGFtcGxlOlxuICAgICAqXG4gICAgICogICAgIFt7IHg6IDAsIHk6IDAgfSwgeyB4OiAyNSwgeTogNTAgfSwgeyB4OiA1MCwgeTogMCB9XVxuICAgICAqXG4gICAgICogVGhlIGBWZXJ0aWNlcy5jcmVhdGVgIG1ldGhvZCByZXR1cm5zIGEgbmV3IGFycmF5IG9mIHZlcnRpY2VzLCB3aGljaCBhcmUgc2ltaWxhciB0byBNYXR0ZXIuVmVjdG9yIG9iamVjdHMsXG4gICAgICogYnV0IHdpdGggc29tZSBhZGRpdGlvbmFsIHJlZmVyZW5jZXMgcmVxdWlyZWQgZm9yIGVmZmljaWVudCBjb2xsaXNpb24gZGV0ZWN0aW9uIHJvdXRpbmVzLlxuICAgICAqXG4gICAgICogVmVydGljZXMgbXVzdCBiZSBzcGVjaWZpZWQgaW4gY2xvY2t3aXNlIG9yZGVyLlxuICAgICAqXG4gICAgICogTm90ZSB0aGF0IHRoZSBgYm9keWAgYXJndW1lbnQgaXMgbm90IG9wdGlvbmFsLCBhIGBNYXR0ZXIuQm9keWAgcmVmZXJlbmNlIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7dmVjdG9yW119IHBvaW50c1xuICAgICAqIEBwYXJhbSB7Ym9keX0gYm9keVxuICAgICAqL1xuICAgIFZlcnRpY2VzLmNyZWF0ZSA9IGZ1bmN0aW9uKHBvaW50cywgYm9keSkge1xuICAgICAgICB2YXIgdmVydGljZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW2ldLFxuICAgICAgICAgICAgICAgIHZlcnRleCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogcG9pbnQueCxcbiAgICAgICAgICAgICAgICAgICAgeTogcG9pbnQueSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaCh2ZXJ0ZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZlcnRpY2VzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZXMgYSBzdHJpbmcgY29udGFpbmluZyBvcmRlcmVkIHggeSBwYWlycyBzZXBhcmF0ZWQgYnkgc3BhY2VzIChhbmQgb3B0aW9uYWxseSBjb21tYXMpLCBcbiAgICAgKiBpbnRvIGEgYE1hdHRlci5WZXJ0aWNlc2Agb2JqZWN0IGZvciB0aGUgZ2l2ZW4gYE1hdHRlci5Cb2R5YC5cbiAgICAgKiBGb3IgcGFyc2luZyBTVkcgcGF0aHMsIHNlZSBgU3ZnLnBhdGhUb1ZlcnRpY2VzYC5cbiAgICAgKiBAbWV0aG9kIGZyb21QYXRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcmV0dXJuIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKi9cbiAgICBWZXJ0aWNlcy5mcm9tUGF0aCA9IGZ1bmN0aW9uKHBhdGgsIGJvZHkpIHtcbiAgICAgICAgdmFyIHBhdGhQYXR0ZXJuID0gL0w/XFxzKihbXFwtXFxkXFwuZV0rKVtcXHMsXSooW1xcLVxcZFxcLmVdKykqL2lnLFxuICAgICAgICAgICAgcG9pbnRzID0gW107XG5cbiAgICAgICAgcGF0aC5yZXBsYWNlKHBhdGhQYXR0ZXJuLCBmdW5jdGlvbihtYXRjaCwgeCwgeSkge1xuICAgICAgICAgICAgcG9pbnRzLnB1c2goeyB4OiBwYXJzZUZsb2F0KHgpLCB5OiBwYXJzZUZsb2F0KHkpIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gVmVydGljZXMuY3JlYXRlKHBvaW50cywgYm9keSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNlbnRyZSAoY2VudHJvaWQpIG9mIHRoZSBzZXQgb2YgdmVydGljZXMuXG4gICAgICogQG1ldGhvZCBjZW50cmVcbiAgICAgKiBAcGFyYW0ge3ZlcnRpY2VzfSB2ZXJ0aWNlc1xuICAgICAqIEByZXR1cm4ge3ZlY3Rvcn0gVGhlIGNlbnRyZSBwb2ludFxuICAgICAqL1xuICAgIFZlcnRpY2VzLmNlbnRyZSA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgICAgIHZhciBhcmVhID0gVmVydGljZXMuYXJlYSh2ZXJ0aWNlcywgdHJ1ZSksXG4gICAgICAgICAgICBjZW50cmUgPSB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIGNyb3NzLFxuICAgICAgICAgICAgdGVtcCxcbiAgICAgICAgICAgIGo7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaiA9IChpICsgMSkgJSB2ZXJ0aWNlcy5sZW5ndGg7XG4gICAgICAgICAgICBjcm9zcyA9IFZlY3Rvci5jcm9zcyh2ZXJ0aWNlc1tpXSwgdmVydGljZXNbal0pO1xuICAgICAgICAgICAgdGVtcCA9IFZlY3Rvci5tdWx0KFZlY3Rvci5hZGQodmVydGljZXNbaV0sIHZlcnRpY2VzW2pdKSwgY3Jvc3MpO1xuICAgICAgICAgICAgY2VudHJlID0gVmVjdG9yLmFkZChjZW50cmUsIHRlbXApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFZlY3Rvci5kaXYoY2VudHJlLCA2ICogYXJlYSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGF2ZXJhZ2UgKG1lYW4pIG9mIHRoZSBzZXQgb2YgdmVydGljZXMuXG4gICAgICogQG1ldGhvZCBtZWFuXG4gICAgICogQHBhcmFtIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKiBAcmV0dXJuIHt2ZWN0b3J9IFRoZSBhdmVyYWdlIHBvaW50XG4gICAgICovXG4gICAgVmVydGljZXMubWVhbiA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgICAgIHZhciBhdmVyYWdlID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXZlcmFnZS54ICs9IHZlcnRpY2VzW2ldLng7XG4gICAgICAgICAgICBhdmVyYWdlLnkgKz0gdmVydGljZXNbaV0ueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBWZWN0b3IuZGl2KGF2ZXJhZ2UsIHZlcnRpY2VzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFyZWEgb2YgdGhlIHNldCBvZiB2ZXJ0aWNlcy5cbiAgICAgKiBAbWV0aG9kIGFyZWFcbiAgICAgKiBAcGFyYW0ge3ZlcnRpY2VzfSB2ZXJ0aWNlc1xuICAgICAqIEBwYXJhbSB7Ym9vbH0gc2lnbmVkXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgYXJlYVxuICAgICAqL1xuICAgIFZlcnRpY2VzLmFyZWEgPSBmdW5jdGlvbih2ZXJ0aWNlcywgc2lnbmVkKSB7XG4gICAgICAgIHZhciBhcmVhID0gMCxcbiAgICAgICAgICAgIGogPSB2ZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZWEgKz0gKHZlcnRpY2VzW2pdLnggLSB2ZXJ0aWNlc1tpXS54KSAqICh2ZXJ0aWNlc1tqXS55ICsgdmVydGljZXNbaV0ueSk7XG4gICAgICAgICAgICBqID0gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaWduZWQpXG4gICAgICAgICAgICByZXR1cm4gYXJlYSAvIDI7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGFyZWEpIC8gMjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbW9tZW50IG9mIGluZXJ0aWEgKHNlY29uZCBtb21lbnQgb2YgYXJlYSkgb2YgdGhlIHNldCBvZiB2ZXJ0aWNlcyBnaXZlbiB0aGUgdG90YWwgbWFzcy5cbiAgICAgKiBAbWV0aG9kIGluZXJ0aWFcbiAgICAgKiBAcGFyYW0ge3ZlcnRpY2VzfSB2ZXJ0aWNlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtYXNzXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgcG9seWdvbidzIG1vbWVudCBvZiBpbmVydGlhXG4gICAgICovXG4gICAgVmVydGljZXMuaW5lcnRpYSA9IGZ1bmN0aW9uKHZlcnRpY2VzLCBtYXNzKSB7XG4gICAgICAgIHZhciBudW1lcmF0b3IgPSAwLFxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSAwLFxuICAgICAgICAgICAgdiA9IHZlcnRpY2VzLFxuICAgICAgICAgICAgY3Jvc3MsXG4gICAgICAgICAgICBqO1xuXG4gICAgICAgIC8vIGZpbmQgdGhlIHBvbHlnb24ncyBtb21lbnQgb2YgaW5lcnRpYSwgdXNpbmcgc2Vjb25kIG1vbWVudCBvZiBhcmVhXG4gICAgICAgIC8vIGh0dHA6Ly93d3cucGh5c2ljc2ZvcnVtcy5jb20vc2hvd3RocmVhZC5waHA/dD0yNTI5M1xuICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IHYubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIGogPSAobiArIDEpICUgdi5sZW5ndGg7XG4gICAgICAgICAgICBjcm9zcyA9IE1hdGguYWJzKFZlY3Rvci5jcm9zcyh2W2pdLCB2W25dKSk7XG4gICAgICAgICAgICBudW1lcmF0b3IgKz0gY3Jvc3MgKiAoVmVjdG9yLmRvdCh2W2pdLCB2W2pdKSArIFZlY3Rvci5kb3QodltqXSwgdltuXSkgKyBWZWN0b3IuZG90KHZbbl0sIHZbbl0pKTtcbiAgICAgICAgICAgIGRlbm9taW5hdG9yICs9IGNyb3NzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChtYXNzIC8gNikgKiAobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGVzIHRoZSBzZXQgb2YgdmVydGljZXMgaW4tcGxhY2UuXG4gICAgICogQG1ldGhvZCB0cmFuc2xhdGVcbiAgICAgKiBAcGFyYW0ge3ZlcnRpY2VzfSB2ZXJ0aWNlc1xuICAgICAqIEBwYXJhbSB7dmVjdG9yfSB2ZWN0b3JcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGFyXG4gICAgICovXG4gICAgVmVydGljZXMudHJhbnNsYXRlID0gZnVuY3Rpb24odmVydGljZXMsIHZlY3Rvciwgc2NhbGFyKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBpZiAoc2NhbGFyKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlc1tpXS54ICs9IHZlY3Rvci54ICogc2NhbGFyO1xuICAgICAgICAgICAgICAgIHZlcnRpY2VzW2ldLnkgKz0gdmVjdG9yLnkgKiBzY2FsYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlc1tpXS54ICs9IHZlY3Rvci54O1xuICAgICAgICAgICAgICAgIHZlcnRpY2VzW2ldLnkgKz0gdmVjdG9yLnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmVydGljZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZXMgdGhlIHNldCBvZiB2ZXJ0aWNlcyBpbi1wbGFjZS5cbiAgICAgKiBAbWV0aG9kIHJvdGF0ZVxuICAgICAqIEBwYXJhbSB7dmVydGljZXN9IHZlcnRpY2VzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlXG4gICAgICogQHBhcmFtIHt2ZWN0b3J9IHBvaW50XG4gICAgICovXG4gICAgVmVydGljZXMucm90YXRlID0gZnVuY3Rpb24odmVydGljZXMsIGFuZ2xlLCBwb2ludCkge1xuICAgICAgICBpZiAoYW5nbGUgPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmVydGljZSA9IHZlcnRpY2VzW2ldLFxuICAgICAgICAgICAgICAgIGR4ID0gdmVydGljZS54IC0gcG9pbnQueCxcbiAgICAgICAgICAgICAgICBkeSA9IHZlcnRpY2UueSAtIHBvaW50Lnk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2ZXJ0aWNlLnggPSBwb2ludC54ICsgKGR4ICogY29zIC0gZHkgKiBzaW4pO1xuICAgICAgICAgICAgdmVydGljZS55ID0gcG9pbnQueSArIChkeCAqIHNpbiArIGR5ICogY29zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2ZXJ0aWNlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGBwb2ludGAgaXMgaW5zaWRlIHRoZSBzZXQgb2YgYHZlcnRpY2VzYC5cbiAgICAgKiBAbWV0aG9kIGNvbnRhaW5zXG4gICAgICogQHBhcmFtIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKiBAcGFyYW0ge3ZlY3Rvcn0gcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSB2ZXJ0aWNlcyBjb250YWlucyBwb2ludCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgICovXG4gICAgVmVydGljZXMuY29udGFpbnMgPSBmdW5jdGlvbih2ZXJ0aWNlcywgcG9pbnQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHZlcnRpY2UgPSB2ZXJ0aWNlc1tpXSxcbiAgICAgICAgICAgICAgICBuZXh0VmVydGljZSA9IHZlcnRpY2VzWyhpICsgMSkgJSB2ZXJ0aWNlcy5sZW5ndGhdO1xuICAgICAgICAgICAgaWYgKChwb2ludC54IC0gdmVydGljZS54KSAqIChuZXh0VmVydGljZS55IC0gdmVydGljZS55KSArIChwb2ludC55IC0gdmVydGljZS55KSAqICh2ZXJ0aWNlLnggLSBuZXh0VmVydGljZS54KSA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2NhbGVzIHRoZSB2ZXJ0aWNlcyBmcm9tIGEgcG9pbnQgKGRlZmF1bHQgaXMgY2VudHJlKSBpbi1wbGFjZS5cbiAgICAgKiBAbWV0aG9kIHNjYWxlXG4gICAgICogQHBhcmFtIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGVYXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlWVxuICAgICAqIEBwYXJhbSB7dmVjdG9yfSBwb2ludFxuICAgICAqL1xuICAgIFZlcnRpY2VzLnNjYWxlID0gZnVuY3Rpb24odmVydGljZXMsIHNjYWxlWCwgc2NhbGVZLCBwb2ludCkge1xuICAgICAgICBpZiAoc2NhbGVYID09PSAxICYmIHNjYWxlWSA9PT0gMSlcbiAgICAgICAgICAgIHJldHVybiB2ZXJ0aWNlcztcblxuICAgICAgICBwb2ludCA9IHBvaW50IHx8IFZlcnRpY2VzLmNlbnRyZSh2ZXJ0aWNlcyk7XG5cbiAgICAgICAgdmFyIHZlcnRleCxcbiAgICAgICAgICAgIGRlbHRhO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZlcnRleCA9IHZlcnRpY2VzW2ldO1xuICAgICAgICAgICAgZGVsdGEgPSBWZWN0b3Iuc3ViKHZlcnRleCwgcG9pbnQpO1xuICAgICAgICAgICAgdmVydGljZXNbaV0ueCA9IHBvaW50LnggKyBkZWx0YS54ICogc2NhbGVYO1xuICAgICAgICAgICAgdmVydGljZXNbaV0ueSA9IHBvaW50LnkgKyBkZWx0YS55ICogc2NhbGVZO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZlcnRpY2VzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGFtZmVycyBhIHNldCBvZiB2ZXJ0aWNlcyBieSBnaXZpbmcgdGhlbSByb3VuZGVkIGNvcm5lcnMsIHJldHVybnMgYSBuZXcgc2V0IG9mIHZlcnRpY2VzLlxuICAgICAqIFRoZSByYWRpdXMgcGFyYW1ldGVyIGlzIGEgc2luZ2xlIG51bWJlciBvciBhbiBhcnJheSB0byBzcGVjaWZ5IHRoZSByYWRpdXMgZm9yIGVhY2ggdmVydGV4LlxuICAgICAqIEBtZXRob2QgY2hhbWZlclxuICAgICAqIEBwYXJhbSB7dmVydGljZXN9IHZlcnRpY2VzXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gcmFkaXVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHF1YWxpdHlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcXVhbGl0eU1pblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFsaXR5TWF4XG4gICAgICovXG4gICAgVmVydGljZXMuY2hhbWZlciA9IGZ1bmN0aW9uKHZlcnRpY2VzLCByYWRpdXMsIHF1YWxpdHksIHF1YWxpdHlNaW4sIHF1YWxpdHlNYXgpIHtcbiAgICAgICAgcmFkaXVzID0gcmFkaXVzIHx8IFs4XTtcblxuICAgICAgICBpZiAoIXJhZGl1cy5sZW5ndGgpXG4gICAgICAgICAgICByYWRpdXMgPSBbcmFkaXVzXTtcblxuICAgICAgICAvLyBxdWFsaXR5IGRlZmF1bHRzIHRvIC0xLCB3aGljaCBpcyBhdXRvXG4gICAgICAgIHF1YWxpdHkgPSAodHlwZW9mIHF1YWxpdHkgIT09ICd1bmRlZmluZWQnKSA/IHF1YWxpdHkgOiAtMTtcbiAgICAgICAgcXVhbGl0eU1pbiA9IHF1YWxpdHlNaW4gfHwgMjtcbiAgICAgICAgcXVhbGl0eU1heCA9IHF1YWxpdHlNYXggfHwgMTQ7XG5cbiAgICAgICAgdmFyIG5ld1ZlcnRpY2VzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHByZXZWZXJ0ZXggPSB2ZXJ0aWNlc1tpIC0gMSA+PSAwID8gaSAtIDEgOiB2ZXJ0aWNlcy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICB2ZXJ0ZXggPSB2ZXJ0aWNlc1tpXSxcbiAgICAgICAgICAgICAgICBuZXh0VmVydGV4ID0gdmVydGljZXNbKGkgKyAxKSAlIHZlcnRpY2VzLmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgY3VycmVudFJhZGl1cyA9IHJhZGl1c1tpIDwgcmFkaXVzLmxlbmd0aCA/IGkgOiByYWRpdXMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50UmFkaXVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbmV3VmVydGljZXMucHVzaCh2ZXJ0ZXgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJldk5vcm1hbCA9IFZlY3Rvci5ub3JtYWxpc2UoeyBcbiAgICAgICAgICAgICAgICB4OiB2ZXJ0ZXgueSAtIHByZXZWZXJ0ZXgueSwgXG4gICAgICAgICAgICAgICAgeTogcHJldlZlcnRleC54IC0gdmVydGV4LnhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgbmV4dE5vcm1hbCA9IFZlY3Rvci5ub3JtYWxpc2UoeyBcbiAgICAgICAgICAgICAgICB4OiBuZXh0VmVydGV4LnkgLSB2ZXJ0ZXgueSwgXG4gICAgICAgICAgICAgICAgeTogdmVydGV4LnggLSBuZXh0VmVydGV4LnhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgZGlhZ29uYWxSYWRpdXMgPSBNYXRoLnNxcnQoMiAqIE1hdGgucG93KGN1cnJlbnRSYWRpdXMsIDIpKSxcbiAgICAgICAgICAgICAgICByYWRpdXNWZWN0b3IgPSBWZWN0b3IubXVsdChDb21tb24uY2xvbmUocHJldk5vcm1hbCksIGN1cnJlbnRSYWRpdXMpLFxuICAgICAgICAgICAgICAgIG1pZE5vcm1hbCA9IFZlY3Rvci5ub3JtYWxpc2UoVmVjdG9yLm11bHQoVmVjdG9yLmFkZChwcmV2Tm9ybWFsLCBuZXh0Tm9ybWFsKSwgMC41KSksXG4gICAgICAgICAgICAgICAgc2NhbGVkVmVydGV4ID0gVmVjdG9yLnN1Yih2ZXJ0ZXgsIFZlY3Rvci5tdWx0KG1pZE5vcm1hbCwgZGlhZ29uYWxSYWRpdXMpKTtcblxuICAgICAgICAgICAgdmFyIHByZWNpc2lvbiA9IHF1YWxpdHk7XG5cbiAgICAgICAgICAgIGlmIChxdWFsaXR5ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGF1dG9tYXRpY2FsbHkgZGVjaWRlIHByZWNpc2lvblxuICAgICAgICAgICAgICAgIHByZWNpc2lvbiA9IE1hdGgucG93KGN1cnJlbnRSYWRpdXMsIDAuMzIpICogMS43NTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJlY2lzaW9uID0gQ29tbW9uLmNsYW1wKHByZWNpc2lvbiwgcXVhbGl0eU1pbiwgcXVhbGl0eU1heCk7XG5cbiAgICAgICAgICAgIC8vIHVzZSBhbiBldmVuIHZhbHVlIGZvciBwcmVjaXNpb24sIG1vcmUgbGlrZWx5IHRvIHJlZHVjZSBheGVzIGJ5IHVzaW5nIHN5bW1ldHJ5XG4gICAgICAgICAgICBpZiAocHJlY2lzaW9uICUgMiA9PT0gMSlcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24gKz0gMTtcblxuICAgICAgICAgICAgdmFyIGFscGhhID0gTWF0aC5hY29zKFZlY3Rvci5kb3QocHJldk5vcm1hbCwgbmV4dE5vcm1hbCkpLFxuICAgICAgICAgICAgICAgIHRoZXRhID0gYWxwaGEgLyBwcmVjaXNpb247XG5cbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcHJlY2lzaW9uOyBqKyspIHtcbiAgICAgICAgICAgICAgICBuZXdWZXJ0aWNlcy5wdXNoKFZlY3Rvci5hZGQoVmVjdG9yLnJvdGF0ZShyYWRpdXNWZWN0b3IsIHRoZXRhICogaiksIHNjYWxlZFZlcnRleCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ld1ZlcnRpY2VzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTb3J0cyB0aGUgaW5wdXQgdmVydGljZXMgaW50byBjbG9ja3dpc2Ugb3JkZXIgaW4gcGxhY2UuXG4gICAgICogQG1ldGhvZCBjbG9ja3dpc2VTb3J0XG4gICAgICogQHBhcmFtIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKiBAcmV0dXJuIHt2ZXJ0aWNlc30gdmVydGljZXNcbiAgICAgKi9cbiAgICBWZXJ0aWNlcy5jbG9ja3dpc2VTb3J0ID0gZnVuY3Rpb24odmVydGljZXMpIHtcbiAgICAgICAgdmFyIGNlbnRyZSA9IFZlcnRpY2VzLm1lYW4odmVydGljZXMpO1xuXG4gICAgICAgIHZlcnRpY2VzLnNvcnQoZnVuY3Rpb24odmVydGV4QSwgdmVydGV4Qikge1xuICAgICAgICAgICAgcmV0dXJuIFZlY3Rvci5hbmdsZShjZW50cmUsIHZlcnRleEEpIC0gVmVjdG9yLmFuZ2xlKGNlbnRyZSwgdmVydGV4Qik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB2ZXJ0aWNlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB2ZXJ0aWNlcyBmb3JtIGEgY29udmV4IHNoYXBlICh2ZXJ0aWNlcyBtdXN0IGJlIGluIGNsb2Nrd2lzZSBvcmRlcikuXG4gICAgICogQG1ldGhvZCBpc0NvbnZleFxuICAgICAqIEBwYXJhbSB7dmVydGljZXN9IHZlcnRpY2VzXG4gICAgICogQHJldHVybiB7Ym9vbH0gYHRydWVgIGlmIHRoZSBgdmVydGljZXNgIGFyZSBjb252ZXgsIGBmYWxzZWAgaWYgbm90IChvciBgbnVsbGAgaWYgbm90IGNvbXB1dGFibGUpLlxuICAgICAqL1xuICAgIFZlcnRpY2VzLmlzQ29udmV4ID0gZnVuY3Rpb24odmVydGljZXMpIHtcbiAgICAgICAgLy8gaHR0cDovL3BhdWxib3Vya2UubmV0L2dlb21ldHJ5L3BvbHlnb25tZXNoL1xuXG4gICAgICAgIHZhciBmbGFnID0gMCxcbiAgICAgICAgICAgIG4gPSB2ZXJ0aWNlcy5sZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGssXG4gICAgICAgICAgICB6O1xuXG4gICAgICAgIGlmIChuIDwgMylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGogPSAoaSArIDEpICUgbjtcbiAgICAgICAgICAgIGsgPSAoaSArIDIpICUgbjtcbiAgICAgICAgICAgIHogPSAodmVydGljZXNbal0ueCAtIHZlcnRpY2VzW2ldLngpICogKHZlcnRpY2VzW2tdLnkgLSB2ZXJ0aWNlc1tqXS55KTtcbiAgICAgICAgICAgIHogLT0gKHZlcnRpY2VzW2pdLnkgLSB2ZXJ0aWNlc1tpXS55KSAqICh2ZXJ0aWNlc1trXS54IC0gdmVydGljZXNbal0ueCk7XG5cbiAgICAgICAgICAgIGlmICh6IDwgMCkge1xuICAgICAgICAgICAgICAgIGZsYWcgfD0gMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeiA+IDApIHtcbiAgICAgICAgICAgICAgICBmbGFnIHw9IDI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmbGFnID09PSAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZsYWcgIT09IDApe1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb252ZXggaHVsbCBvZiB0aGUgaW5wdXQgdmVydGljZXMgYXMgYSBuZXcgYXJyYXkgb2YgcG9pbnRzLlxuICAgICAqIEBtZXRob2QgaHVsbFxuICAgICAqIEBwYXJhbSB7dmVydGljZXN9IHZlcnRpY2VzXG4gICAgICogQHJldHVybiBbdmVydGV4XSB2ZXJ0aWNlc1xuICAgICAqL1xuICAgIFZlcnRpY2VzLmh1bGwgPSBmdW5jdGlvbih2ZXJ0aWNlcykge1xuICAgICAgICAvLyBodHRwOi8vZW4ud2lraWJvb2tzLm9yZy93aWtpL0FsZ29yaXRobV9JbXBsZW1lbnRhdGlvbi9HZW9tZXRyeS9Db252ZXhfaHVsbC9Nb25vdG9uZV9jaGFpblxuXG4gICAgICAgIHZhciB1cHBlciA9IFtdLFxuICAgICAgICAgICAgbG93ZXIgPSBbXSwgXG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIC8vIHNvcnQgdmVydGljZXMgb24geC1heGlzICh5LWF4aXMgZm9yIHRpZXMpXG4gICAgICAgIHZlcnRpY2VzID0gdmVydGljZXMuc2xpY2UoMCk7XG4gICAgICAgIHZlcnRpY2VzLnNvcnQoZnVuY3Rpb24odmVydGV4QSwgdmVydGV4Qikge1xuICAgICAgICAgICAgdmFyIGR4ID0gdmVydGV4QS54IC0gdmVydGV4Qi54O1xuICAgICAgICAgICAgcmV0dXJuIGR4ICE9PSAwID8gZHggOiB2ZXJ0ZXhBLnkgLSB2ZXJ0ZXhCLnk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGJ1aWxkIGxvd2VyIGh1bGxcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2ZXJ0ZXggPSB2ZXJ0aWNlc1tpXTtcblxuICAgICAgICAgICAgd2hpbGUgKGxvd2VyLmxlbmd0aCA+PSAyIFxuICAgICAgICAgICAgICAgICAgICYmIFZlY3Rvci5jcm9zczMobG93ZXJbbG93ZXIubGVuZ3RoIC0gMl0sIGxvd2VyW2xvd2VyLmxlbmd0aCAtIDFdLCB2ZXJ0ZXgpIDw9IDApIHtcbiAgICAgICAgICAgICAgICBsb3dlci5wb3AoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG93ZXIucHVzaCh2ZXJ0ZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYnVpbGQgdXBwZXIgaHVsbFxuICAgICAgICBmb3IgKGkgPSB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmVydGV4ID0gdmVydGljZXNbaV07XG5cbiAgICAgICAgICAgIHdoaWxlICh1cHBlci5sZW5ndGggPj0gMiBcbiAgICAgICAgICAgICAgICAgICAmJiBWZWN0b3IuY3Jvc3MzKHVwcGVyW3VwcGVyLmxlbmd0aCAtIDJdLCB1cHBlclt1cHBlci5sZW5ndGggLSAxXSwgdmVydGV4KSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdXBwZXIucG9wKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVwcGVyLnB1c2godmVydGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbmNhdGVuYXRpb24gb2YgdGhlIGxvd2VyIGFuZCB1cHBlciBodWxscyBnaXZlcyB0aGUgY29udmV4IGh1bGxcbiAgICAgICAgLy8gb21pdCBsYXN0IHBvaW50cyBiZWNhdXNlIHRoZXkgYXJlIHJlcGVhdGVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIG90aGVyIGxpc3RcbiAgICAgICAgdXBwZXIucG9wKCk7XG4gICAgICAgIGxvd2VyLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiB1cHBlci5jb25jYXQobG93ZXIpO1xuICAgIH07XG5cbn0pKCk7XG5cbn0se1wiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2dlb21ldHJ5L1ZlY3RvclwiOjI4fV0sMzA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xudmFyIE1hdHRlciA9IG1vZHVsZS5leHBvcnRzID0gX2RlcmVxXygnLi4vY29yZS9NYXR0ZXInKTtcblxuTWF0dGVyLkJvZHkgPSBfZGVyZXFfKCcuLi9ib2R5L0JvZHknKTtcbk1hdHRlci5Db21wb3NpdGUgPSBfZGVyZXFfKCcuLi9ib2R5L0NvbXBvc2l0ZScpO1xuTWF0dGVyLldvcmxkID0gX2RlcmVxXygnLi4vYm9keS9Xb3JsZCcpO1xuXG5NYXR0ZXIuQ29udGFjdCA9IF9kZXJlcV8oJy4uL2NvbGxpc2lvbi9Db250YWN0Jyk7XG5NYXR0ZXIuRGV0ZWN0b3IgPSBfZGVyZXFfKCcuLi9jb2xsaXNpb24vRGV0ZWN0b3InKTtcbk1hdHRlci5HcmlkID0gX2RlcmVxXygnLi4vY29sbGlzaW9uL0dyaWQnKTtcbk1hdHRlci5QYWlycyA9IF9kZXJlcV8oJy4uL2NvbGxpc2lvbi9QYWlycycpO1xuTWF0dGVyLlBhaXIgPSBfZGVyZXFfKCcuLi9jb2xsaXNpb24vUGFpcicpO1xuTWF0dGVyLlF1ZXJ5ID0gX2RlcmVxXygnLi4vY29sbGlzaW9uL1F1ZXJ5Jyk7XG5NYXR0ZXIuUmVzb2x2ZXIgPSBfZGVyZXFfKCcuLi9jb2xsaXNpb24vUmVzb2x2ZXInKTtcbk1hdHRlci5TQVQgPSBfZGVyZXFfKCcuLi9jb2xsaXNpb24vU0FUJyk7XG5cbk1hdHRlci5Db25zdHJhaW50ID0gX2RlcmVxXygnLi4vY29uc3RyYWludC9Db25zdHJhaW50Jyk7XG5NYXR0ZXIuTW91c2VDb25zdHJhaW50ID0gX2RlcmVxXygnLi4vY29uc3RyYWludC9Nb3VzZUNvbnN0cmFpbnQnKTtcblxuTWF0dGVyLkNvbW1vbiA9IF9kZXJlcV8oJy4uL2NvcmUvQ29tbW9uJyk7XG5NYXR0ZXIuRW5naW5lID0gX2RlcmVxXygnLi4vY29yZS9FbmdpbmUnKTtcbk1hdHRlci5FdmVudHMgPSBfZGVyZXFfKCcuLi9jb3JlL0V2ZW50cycpO1xuTWF0dGVyLk1vdXNlID0gX2RlcmVxXygnLi4vY29yZS9Nb3VzZScpO1xuTWF0dGVyLlJ1bm5lciA9IF9kZXJlcV8oJy4uL2NvcmUvUnVubmVyJyk7XG5NYXR0ZXIuU2xlZXBpbmcgPSBfZGVyZXFfKCcuLi9jb3JlL1NsZWVwaW5nJyk7XG5NYXR0ZXIuUGx1Z2luID0gX2RlcmVxXygnLi4vY29yZS9QbHVnaW4nKTtcblxuXG5NYXR0ZXIuQm9kaWVzID0gX2RlcmVxXygnLi4vZmFjdG9yeS9Cb2RpZXMnKTtcbk1hdHRlci5Db21wb3NpdGVzID0gX2RlcmVxXygnLi4vZmFjdG9yeS9Db21wb3NpdGVzJyk7XG5cbk1hdHRlci5BeGVzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvQXhlcycpO1xuTWF0dGVyLkJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xuTWF0dGVyLlN2ZyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1N2ZycpO1xuTWF0dGVyLlZlY3RvciA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L1ZlY3RvcicpO1xuTWF0dGVyLlZlcnRpY2VzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVydGljZXMnKTtcblxuTWF0dGVyLlJlbmRlciA9IF9kZXJlcV8oJy4uL3JlbmRlci9SZW5kZXInKTtcbk1hdHRlci5SZW5kZXJQaXhpID0gX2RlcmVxXygnLi4vcmVuZGVyL1JlbmRlclBpeGknKTtcblxuLy8gYWxpYXNlc1xuXG5NYXR0ZXIuV29ybGQuYWRkID0gTWF0dGVyLkNvbXBvc2l0ZS5hZGQ7XG5NYXR0ZXIuV29ybGQucmVtb3ZlID0gTWF0dGVyLkNvbXBvc2l0ZS5yZW1vdmU7XG5NYXR0ZXIuV29ybGQuYWRkQ29tcG9zaXRlID0gTWF0dGVyLkNvbXBvc2l0ZS5hZGRDb21wb3NpdGU7XG5NYXR0ZXIuV29ybGQuYWRkQm9keSA9IE1hdHRlci5Db21wb3NpdGUuYWRkQm9keTtcbk1hdHRlci5Xb3JsZC5hZGRDb25zdHJhaW50ID0gTWF0dGVyLkNvbXBvc2l0ZS5hZGRDb25zdHJhaW50O1xuTWF0dGVyLldvcmxkLmNsZWFyID0gTWF0dGVyLkNvbXBvc2l0ZS5jbGVhcjtcbk1hdHRlci5FbmdpbmUucnVuID0gTWF0dGVyLlJ1bm5lci5ydW47XG5cbn0se1wiLi4vYm9keS9Cb2R5XCI6MSxcIi4uL2JvZHkvQ29tcG9zaXRlXCI6MixcIi4uL2JvZHkvV29ybGRcIjozLFwiLi4vY29sbGlzaW9uL0NvbnRhY3RcIjo0LFwiLi4vY29sbGlzaW9uL0RldGVjdG9yXCI6NSxcIi4uL2NvbGxpc2lvbi9HcmlkXCI6NixcIi4uL2NvbGxpc2lvbi9QYWlyXCI6NyxcIi4uL2NvbGxpc2lvbi9QYWlyc1wiOjgsXCIuLi9jb2xsaXNpb24vUXVlcnlcIjo5LFwiLi4vY29sbGlzaW9uL1Jlc29sdmVyXCI6MTAsXCIuLi9jb2xsaXNpb24vU0FUXCI6MTEsXCIuLi9jb25zdHJhaW50L0NvbnN0cmFpbnRcIjoxMixcIi4uL2NvbnN0cmFpbnQvTW91c2VDb25zdHJhaW50XCI6MTMsXCIuLi9jb3JlL0NvbW1vblwiOjE0LFwiLi4vY29yZS9FbmdpbmVcIjoxNSxcIi4uL2NvcmUvRXZlbnRzXCI6MTYsXCIuLi9jb3JlL01hdHRlclwiOjE3LFwiLi4vY29yZS9NZXRyaWNzXCI6MTgsXCIuLi9jb3JlL01vdXNlXCI6MTksXCIuLi9jb3JlL1BsdWdpblwiOjIwLFwiLi4vY29yZS9SdW5uZXJcIjoyMSxcIi4uL2NvcmUvU2xlZXBpbmdcIjoyMixcIi4uL2ZhY3RvcnkvQm9kaWVzXCI6MjMsXCIuLi9mYWN0b3J5L0NvbXBvc2l0ZXNcIjoyNCxcIi4uL2dlb21ldHJ5L0F4ZXNcIjoyNSxcIi4uL2dlb21ldHJ5L0JvdW5kc1wiOjI2LFwiLi4vZ2VvbWV0cnkvU3ZnXCI6MjcsXCIuLi9nZW9tZXRyeS9WZWN0b3JcIjoyOCxcIi4uL2dlb21ldHJ5L1ZlcnRpY2VzXCI6MjksXCIuLi9yZW5kZXIvUmVuZGVyXCI6MzEsXCIuLi9yZW5kZXIvUmVuZGVyUGl4aVwiOjMyfV0sMzE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4qIFRoZSBgTWF0dGVyLlJlbmRlcmAgbW9kdWxlIGlzIGEgc2ltcGxlIEhUTUw1IGNhbnZhcyBiYXNlZCByZW5kZXJlciBmb3IgdmlzdWFsaXNpbmcgaW5zdGFuY2VzIG9mIGBNYXR0ZXIuRW5naW5lYC5cbiogSXQgaXMgaW50ZW5kZWQgZm9yIGRldmVsb3BtZW50IGFuZCBkZWJ1Z2dpbmcgcHVycG9zZXMsIGJ1dCBtYXkgYWxzbyBiZSBzdWl0YWJsZSBmb3Igc2ltcGxlIGdhbWVzLlxuKiBJdCBpbmNsdWRlcyBhIG51bWJlciBvZiBkcmF3aW5nIG9wdGlvbnMgaW5jbHVkaW5nIHdpcmVmcmFtZSwgdmVjdG9yIHdpdGggc3VwcG9ydCBmb3Igc3ByaXRlcyBhbmQgdmlld3BvcnRzLlxuKlxuKiBAY2xhc3MgUmVuZGVyXG4qL1xuXG52YXIgUmVuZGVyID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyO1xuXG52YXIgQ29tbW9uID0gX2RlcmVxXygnLi4vY29yZS9Db21tb24nKTtcbnZhciBDb21wb3NpdGUgPSBfZGVyZXFfKCcuLi9ib2R5L0NvbXBvc2l0ZScpO1xudmFyIEJvdW5kcyA9IF9kZXJlcV8oJy4uL2dlb21ldHJ5L0JvdW5kcycpO1xudmFyIEV2ZW50cyA9IF9kZXJlcV8oJy4uL2NvcmUvRXZlbnRzJyk7XG52YXIgR3JpZCA9IF9kZXJlcV8oJy4uL2NvbGxpc2lvbi9HcmlkJyk7XG52YXIgVmVjdG9yID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVjdG9yJyk7XG5cbihmdW5jdGlvbigpIHtcbiAgICBcbiAgICB2YXIgX3JlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGZ1bmN0aW9uKGNhbGxiYWNrKXsgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKENvbW1vbi5ub3coKSk7IH0sIDEwMDAgLyA2MCk7IH07XG4gICBcbiAgICAgICAgX2NhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVuZGVyZXIuIFRoZSBvcHRpb25zIHBhcmFtZXRlciBpcyBhbiBvYmplY3QgdGhhdCBzcGVjaWZpZXMgYW55IHByb3BlcnRpZXMgeW91IHdpc2ggdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzLlxuICAgICAqIEFsbCBwcm9wZXJ0aWVzIGhhdmUgZGVmYXVsdCB2YWx1ZXMsIGFuZCBtYW55IGFyZSBwcmUtY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5IGJhc2VkIG9uIG90aGVyIHByb3BlcnRpZXMuXG4gICAgICogU2VlIHRoZSBwcm9wZXJ0aWVzIHNlY3Rpb24gYmVsb3cgZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIG9uIHdoYXQgeW91IGNhbiBwYXNzIHZpYSB0aGUgYG9wdGlvbnNgIG9iamVjdC5cbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICAgKiBAcmV0dXJuIHtyZW5kZXJ9IEEgbmV3IHJlbmRlcmVyXG4gICAgICovXG4gICAgUmVuZGVyLmNyZWF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgY29udHJvbGxlcjogUmVuZGVyLFxuICAgICAgICAgICAgZW5naW5lOiBudWxsLFxuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGNhbnZhczogbnVsbCxcbiAgICAgICAgICAgIG1vdXNlOiBudWxsLFxuICAgICAgICAgICAgZnJhbWVSZXF1ZXN0SWQ6IG51bGwsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDgwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgICAgICBwaXhlbFJhdGlvOiAxLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmFmYWZhJyxcbiAgICAgICAgICAgICAgICB3aXJlZnJhbWVCYWNrZ3JvdW5kOiAnIzIyMicsXG4gICAgICAgICAgICAgICAgaGFzQm91bmRzOiAhIW9wdGlvbnMuYm91bmRzLFxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgd2lyZWZyYW1lczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzaG93U2xlZXBpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgc2hvd0RlYnVnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93QnJvYWRwaGFzZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd0JvdW5kczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd1ZlbG9jaXR5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93Q29sbGlzaW9uczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd1NlcGFyYXRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93QXhlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd1Bvc2l0aW9uczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd0FuZ2xlSW5kaWNhdG9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93SWRzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93U2hhZG93czogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd1ZlcnRleE51bWJlcnM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNob3dDb252ZXhIdWxsczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd0ludGVybmFsRWRnZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNob3dNb3VzZVBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciByZW5kZXIgPSBDb21tb24uZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAocmVuZGVyLmNhbnZhcykge1xuICAgICAgICAgICAgcmVuZGVyLmNhbnZhcy53aWR0aCA9IHJlbmRlci5vcHRpb25zLndpZHRoIHx8IHJlbmRlci5jYW52YXMud2lkdGg7XG4gICAgICAgICAgICByZW5kZXIuY2FudmFzLmhlaWdodCA9IHJlbmRlci5vcHRpb25zLmhlaWdodCB8fCByZW5kZXIuY2FudmFzLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlci5tb3VzZSA9IG9wdGlvbnMubW91c2U7XG4gICAgICAgIHJlbmRlci5lbmdpbmUgPSBvcHRpb25zLmVuZ2luZTtcbiAgICAgICAgcmVuZGVyLmNhbnZhcyA9IHJlbmRlci5jYW52YXMgfHwgX2NyZWF0ZUNhbnZhcyhyZW5kZXIub3B0aW9ucy53aWR0aCwgcmVuZGVyLm9wdGlvbnMuaGVpZ2h0KTtcbiAgICAgICAgcmVuZGVyLmNvbnRleHQgPSByZW5kZXIuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHJlbmRlci50ZXh0dXJlcyA9IHt9O1xuXG4gICAgICAgIHJlbmRlci5ib3VuZHMgPSByZW5kZXIuYm91bmRzIHx8IHsgXG4gICAgICAgICAgICBtaW46IHsgXG4gICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIG1heDogeyBcbiAgICAgICAgICAgICAgICB4OiByZW5kZXIuY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgICAgIHk6IHJlbmRlci5jYW52YXMuaGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlbmRlci5vcHRpb25zLnBpeGVsUmF0aW8gIT09IDEpIHtcbiAgICAgICAgICAgIFJlbmRlci5zZXRQaXhlbFJhdGlvKHJlbmRlciwgcmVuZGVyLm9wdGlvbnMucGl4ZWxSYXRpbyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQ29tbW9uLmlzRWxlbWVudChyZW5kZXIuZWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJlbmRlci5lbGVtZW50LmFwcGVuZENoaWxkKHJlbmRlci5jYW52YXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQ29tbW9uLmxvZygnUmVuZGVyLmNyZWF0ZTogb3B0aW9ucy5lbGVtZW50IHdhcyB1bmRlZmluZWQsIHJlbmRlci5jYW52YXMgd2FzIGNyZWF0ZWQgYnV0IG5vdCBhcHBlbmRlZCcsICd3YXJuJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVuZGVyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb250aW51b3VzbHkgdXBkYXRlcyB0aGUgcmVuZGVyIGNhbnZhcyBvbiB0aGUgYHJlcXVlc3RBbmltYXRpb25GcmFtZWAgZXZlbnQuXG4gICAgICogQG1ldGhvZCBydW5cbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICovXG4gICAgUmVuZGVyLnJ1biA9IGZ1bmN0aW9uKHJlbmRlcikge1xuICAgICAgICAoZnVuY3Rpb24gbG9vcCh0aW1lKXtcbiAgICAgICAgICAgIHJlbmRlci5mcmFtZVJlcXVlc3RJZCA9IF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XG4gICAgICAgICAgICBSZW5kZXIud29ybGQocmVuZGVyKTtcbiAgICAgICAgfSkoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5kcyBleGVjdXRpb24gb2YgYFJlbmRlci5ydW5gIG9uIHRoZSBnaXZlbiBgcmVuZGVyYCwgYnkgY2FuY2VsaW5nIHRoZSBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCBldmVudCBsb29wLlxuICAgICAqIEBtZXRob2Qgc3RvcFxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKi9cbiAgICBSZW5kZXIuc3RvcCA9IGZ1bmN0aW9uKHJlbmRlcikge1xuICAgICAgICBfY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVuZGVyLmZyYW1lUmVxdWVzdElkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgcGl4ZWwgcmF0aW8gb2YgdGhlIHJlbmRlcmVyIGFuZCB1cGRhdGVzIHRoZSBjYW52YXMuXG4gICAgICogVG8gYXV0b21hdGljYWxseSBkZXRlY3QgdGhlIGNvcnJlY3QgcmF0aW8sIHBhc3MgdGhlIHN0cmluZyBgJ2F1dG8nYCBmb3IgYHBpeGVsUmF0aW9gLlxuICAgICAqIEBtZXRob2Qgc2V0UGl4ZWxSYXRpb1xuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcGl4ZWxSYXRpb1xuICAgICAqL1xuICAgIFJlbmRlci5zZXRQaXhlbFJhdGlvID0gZnVuY3Rpb24ocmVuZGVyLCBwaXhlbFJhdGlvKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnMsXG4gICAgICAgICAgICBjYW52YXMgPSByZW5kZXIuY2FudmFzO1xuXG4gICAgICAgIGlmIChwaXhlbFJhdGlvID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgIHBpeGVsUmF0aW8gPSBfZ2V0UGl4ZWxSYXRpbyhjYW52YXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0aW9ucy5waXhlbFJhdGlvID0gcGl4ZWxSYXRpbztcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnZGF0YS1waXhlbC1yYXRpbycsIHBpeGVsUmF0aW8pO1xuICAgICAgICBjYW52YXMud2lkdGggPSBvcHRpb25zLndpZHRoICogcGl4ZWxSYXRpbztcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0ICogcGl4ZWxSYXRpbztcbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gb3B0aW9ucy53aWR0aCArICdweCc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCArICdweCc7XG4gICAgICAgIHJlbmRlci5jb250ZXh0LnNjYWxlKHBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBnaXZlbiBgZW5naW5lYCdzIGBNYXR0ZXIuV29ybGRgIG9iamVjdC5cbiAgICAgKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgYWxsIHJlbmRlcmluZyBhbmQgc2hvdWxkIGJlIGNhbGxlZCBldmVyeSB0aW1lIHRoZSBzY2VuZSBjaGFuZ2VzLlxuICAgICAqIEBtZXRob2Qgd29ybGRcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICovXG4gICAgUmVuZGVyLndvcmxkID0gZnVuY3Rpb24ocmVuZGVyKSB7XG4gICAgICAgIHZhciBlbmdpbmUgPSByZW5kZXIuZW5naW5lLFxuICAgICAgICAgICAgd29ybGQgPSBlbmdpbmUud29ybGQsXG4gICAgICAgICAgICBjYW52YXMgPSByZW5kZXIuY2FudmFzLFxuICAgICAgICAgICAgY29udGV4dCA9IHJlbmRlci5jb250ZXh0LFxuICAgICAgICAgICAgb3B0aW9ucyA9IHJlbmRlci5vcHRpb25zLFxuICAgICAgICAgICAgYWxsQm9kaWVzID0gQ29tcG9zaXRlLmFsbEJvZGllcyh3b3JsZCksXG4gICAgICAgICAgICBhbGxDb25zdHJhaW50cyA9IENvbXBvc2l0ZS5hbGxDb25zdHJhaW50cyh3b3JsZCksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kID0gb3B0aW9ucy53aXJlZnJhbWVzID8gb3B0aW9ucy53aXJlZnJhbWVCYWNrZ3JvdW5kIDogb3B0aW9ucy5iYWNrZ3JvdW5kLFxuICAgICAgICAgICAgYm9kaWVzID0gW10sXG4gICAgICAgICAgICBjb25zdHJhaW50cyA9IFtdLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICB2YXIgZXZlbnQgPSB7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IGVuZ2luZS50aW1pbmcudGltZXN0YW1wXG4gICAgICAgIH07XG5cbiAgICAgICAgRXZlbnRzLnRyaWdnZXIocmVuZGVyLCAnYmVmb3JlUmVuZGVyJywgZXZlbnQpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJhY2tncm91bmQgaWYgaXQgaGFzIGNoYW5nZWRcbiAgICAgICAgaWYgKHJlbmRlci5jdXJyZW50QmFja2dyb3VuZCAhPT0gYmFja2dyb3VuZClcbiAgICAgICAgICAgIF9hcHBseUJhY2tncm91bmQocmVuZGVyLCBiYWNrZ3JvdW5kKTtcblxuICAgICAgICAvLyBjbGVhciB0aGUgY2FudmFzIHdpdGggYSB0cmFuc3BhcmVudCBmaWxsLCB0byBhbGxvdyB0aGUgY2FudmFzIGJhY2tncm91bmQgdG8gc2hvd1xuICAgICAgICBjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtaW4nO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG5cbiAgICAgICAgLy8gaGFuZGxlIGJvdW5kc1xuICAgICAgICBpZiAob3B0aW9ucy5oYXNCb3VuZHMpIHtcbiAgICAgICAgICAgIHZhciBib3VuZHNXaWR0aCA9IHJlbmRlci5ib3VuZHMubWF4LnggLSByZW5kZXIuYm91bmRzLm1pbi54LFxuICAgICAgICAgICAgICAgIGJvdW5kc0hlaWdodCA9IHJlbmRlci5ib3VuZHMubWF4LnkgLSByZW5kZXIuYm91bmRzLm1pbi55LFxuICAgICAgICAgICAgICAgIGJvdW5kc1NjYWxlWCA9IGJvdW5kc1dpZHRoIC8gb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgICAgICBib3VuZHNTY2FsZVkgPSBib3VuZHNIZWlnaHQgLyBvcHRpb25zLmhlaWdodDtcblxuICAgICAgICAgICAgLy8gZmlsdGVyIG91dCBib2RpZXMgdGhhdCBhcmUgbm90IGluIHZpZXdcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbGxCb2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYm9keSA9IGFsbEJvZGllc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoQm91bmRzLm92ZXJsYXBzKGJvZHkuYm91bmRzLCByZW5kZXIuYm91bmRzKSlcbiAgICAgICAgICAgICAgICAgICAgYm9kaWVzLnB1c2goYm9keSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgY29uc3RyYWludHMgdGhhdCBhcmUgbm90IGluIHZpZXdcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbGxDb25zdHJhaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjb25zdHJhaW50ID0gYWxsQ29uc3RyYWludHNbaV0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHlBID0gY29uc3RyYWludC5ib2R5QSxcbiAgICAgICAgICAgICAgICAgICAgYm9keUIgPSBjb25zdHJhaW50LmJvZHlCLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEFXb3JsZCA9IGNvbnN0cmFpbnQucG9pbnRBLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEJXb3JsZCA9IGNvbnN0cmFpbnQucG9pbnRCO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJvZHlBKSBwb2ludEFXb3JsZCA9IFZlY3Rvci5hZGQoYm9keUEucG9zaXRpb24sIGNvbnN0cmFpbnQucG9pbnRBKTtcbiAgICAgICAgICAgICAgICBpZiAoYm9keUIpIHBvaW50QldvcmxkID0gVmVjdG9yLmFkZChib2R5Qi5wb3NpdGlvbiwgY29uc3RyYWludC5wb2ludEIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwb2ludEFXb3JsZCB8fCAhcG9pbnRCV29ybGQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKEJvdW5kcy5jb250YWlucyhyZW5kZXIuYm91bmRzLCBwb2ludEFXb3JsZCkgfHwgQm91bmRzLmNvbnRhaW5zKHJlbmRlci5ib3VuZHMsIHBvaW50QldvcmxkKSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWludHMucHVzaChjb25zdHJhaW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdHJhbnNmb3JtIHRoZSB2aWV3XG4gICAgICAgICAgICBjb250ZXh0LnNjYWxlKDEgLyBib3VuZHNTY2FsZVgsIDEgLyBib3VuZHNTY2FsZVkpO1xuICAgICAgICAgICAgY29udGV4dC50cmFuc2xhdGUoLXJlbmRlci5ib3VuZHMubWluLngsIC1yZW5kZXIuYm91bmRzLm1pbi55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0cmFpbnRzID0gYWxsQ29uc3RyYWludHM7XG4gICAgICAgICAgICBib2RpZXMgPSBhbGxCb2RpZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wdGlvbnMud2lyZWZyYW1lcyB8fCAoZW5naW5lLmVuYWJsZVNsZWVwaW5nICYmIG9wdGlvbnMuc2hvd1NsZWVwaW5nKSkge1xuICAgICAgICAgICAgLy8gZnVsbHkgZmVhdHVyZWQgcmVuZGVyaW5nIG9mIGJvZGllc1xuICAgICAgICAgICAgUmVuZGVyLmJvZGllcyhyZW5kZXIsIGJvZGllcywgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93Q29udmV4SHVsbHMpXG4gICAgICAgICAgICAgICAgUmVuZGVyLmJvZHlDb252ZXhIdWxscyhyZW5kZXIsIGJvZGllcywgY29udGV4dCk7XG5cbiAgICAgICAgICAgIC8vIG9wdGltaXNlZCBtZXRob2QgZm9yIHdpcmVmcmFtZXMgb25seVxuICAgICAgICAgICAgUmVuZGVyLmJvZHlXaXJlZnJhbWVzKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnNob3dCb3VuZHMpXG4gICAgICAgICAgICBSZW5kZXIuYm9keUJvdW5kcyhyZW5kZXIsIGJvZGllcywgY29udGV4dCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc2hvd0F4ZXMgfHwgb3B0aW9ucy5zaG93QW5nbGVJbmRpY2F0b3IpXG4gICAgICAgICAgICBSZW5kZXIuYm9keUF4ZXMocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpO1xuICAgICAgICBcbiAgICAgICAgaWYgKG9wdGlvbnMuc2hvd1Bvc2l0aW9ucylcbiAgICAgICAgICAgIFJlbmRlci5ib2R5UG9zaXRpb25zKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5zaG93VmVsb2NpdHkpXG4gICAgICAgICAgICBSZW5kZXIuYm9keVZlbG9jaXR5KHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5zaG93SWRzKVxuICAgICAgICAgICAgUmVuZGVyLmJvZHlJZHMocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNob3dTZXBhcmF0aW9ucylcbiAgICAgICAgICAgIFJlbmRlci5zZXBhcmF0aW9ucyhyZW5kZXIsIGVuZ2luZS5wYWlycy5saXN0LCBjb250ZXh0KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5zaG93Q29sbGlzaW9ucylcbiAgICAgICAgICAgIFJlbmRlci5jb2xsaXNpb25zKHJlbmRlciwgZW5naW5lLnBhaXJzLmxpc3QsIGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNob3dWZXJ0ZXhOdW1iZXJzKVxuICAgICAgICAgICAgUmVuZGVyLnZlcnRleE51bWJlcnMocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNob3dNb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgUmVuZGVyLm1vdXNlUG9zaXRpb24ocmVuZGVyLCByZW5kZXIubW91c2UsIGNvbnRleHQpO1xuXG4gICAgICAgIFJlbmRlci5jb25zdHJhaW50cyhjb25zdHJhaW50cywgY29udGV4dCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc2hvd0Jyb2FkcGhhc2UgJiYgZW5naW5lLmJyb2FkcGhhc2UuY29udHJvbGxlciA9PT0gR3JpZClcbiAgICAgICAgICAgIFJlbmRlci5ncmlkKHJlbmRlciwgZW5naW5lLmJyb2FkcGhhc2UsIGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNob3dEZWJ1ZylcbiAgICAgICAgICAgIFJlbmRlci5kZWJ1ZyhyZW5kZXIsIGNvbnRleHQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmhhc0JvdW5kcykge1xuICAgICAgICAgICAgLy8gcmV2ZXJ0IHZpZXcgdHJhbnNmb3Jtc1xuICAgICAgICAgICAgY29udGV4dC5zZXRUcmFuc2Zvcm0ob3B0aW9ucy5waXhlbFJhdGlvLCAwLCAwLCBvcHRpb25zLnBpeGVsUmF0aW8sIDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgRXZlbnRzLnRyaWdnZXIocmVuZGVyLCAnYWZ0ZXJSZW5kZXInLCBldmVudCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlc2NyaXB0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIGRlYnVnXG4gICAgICogQHBhcmFtIHtyZW5kZXJ9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5kZWJ1ZyA9IGZ1bmN0aW9uKHJlbmRlciwgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQsXG4gICAgICAgICAgICBlbmdpbmUgPSByZW5kZXIuZW5naW5lLFxuICAgICAgICAgICAgd29ybGQgPSBlbmdpbmUud29ybGQsXG4gICAgICAgICAgICBtZXRyaWNzID0gZW5naW5lLm1ldHJpY3MsXG4gICAgICAgICAgICBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnMsXG4gICAgICAgICAgICBib2RpZXMgPSBDb21wb3NpdGUuYWxsQm9kaWVzKHdvcmxkKSxcbiAgICAgICAgICAgIHNwYWNlID0gXCIgICAgXCI7XG5cbiAgICAgICAgaWYgKGVuZ2luZS50aW1pbmcudGltZXN0YW1wIC0gKHJlbmRlci5kZWJ1Z1RpbWVzdGFtcCB8fCAwKSA+PSA1MDApIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gXCJcIjtcblxuICAgICAgICAgICAgaWYgKG1ldHJpY3MudGltaW5nKSB7XG4gICAgICAgICAgICAgICAgdGV4dCArPSBcImZwczogXCIgKyBNYXRoLnJvdW5kKG1ldHJpY3MudGltaW5nLmZwcykgKyBzcGFjZTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICByZW5kZXIuZGVidWdTdHJpbmcgPSB0ZXh0O1xuICAgICAgICAgICAgcmVuZGVyLmRlYnVnVGltZXN0YW1wID0gZW5naW5lLnRpbWluZy50aW1lc3RhbXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVuZGVyLmRlYnVnU3RyaW5nKSB7XG4gICAgICAgICAgICBjLmZvbnQgPSBcIjEycHggQXJpYWxcIjtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lyZWZyYW1lcykge1xuICAgICAgICAgICAgICAgIGMuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC41KSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGMuZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMC41KSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHJlbmRlci5kZWJ1Z1N0cmluZy5zcGxpdCgnXFxuJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjLmZpbGxUZXh0KHNwbGl0W2ldLCA1MCwgNTAgKyBpICogMTgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlc2NyaXB0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIGNvbnN0cmFpbnRzXG4gICAgICogQHBhcmFtIHtjb25zdHJhaW50W119IGNvbnN0cmFpbnRzXG4gICAgICogQHBhcmFtIHtSZW5kZXJpbmdDb250ZXh0fSBjb250ZXh0XG4gICAgICovXG4gICAgUmVuZGVyLmNvbnN0cmFpbnRzID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGMgPSBjb250ZXh0O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjb25zdHJhaW50ID0gY29uc3RyYWludHNbaV07XG5cbiAgICAgICAgICAgIGlmICghY29uc3RyYWludC5yZW5kZXIudmlzaWJsZSB8fCAhY29uc3RyYWludC5wb2ludEEgfHwgIWNvbnN0cmFpbnQucG9pbnRCKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICB2YXIgYm9keUEgPSBjb25zdHJhaW50LmJvZHlBLFxuICAgICAgICAgICAgICAgIGJvZHlCID0gY29uc3RyYWludC5ib2R5QjtcblxuICAgICAgICAgICAgaWYgKGJvZHlBKSB7XG4gICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLm1vdmVUbyhib2R5QS5wb3NpdGlvbi54ICsgY29uc3RyYWludC5wb2ludEEueCwgYm9keUEucG9zaXRpb24ueSArIGNvbnN0cmFpbnQucG9pbnRBLnkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGMubW92ZVRvKGNvbnN0cmFpbnQucG9pbnRBLngsIGNvbnN0cmFpbnQucG9pbnRBLnkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYm9keUIpIHtcbiAgICAgICAgICAgICAgICBjLmxpbmVUbyhib2R5Qi5wb3NpdGlvbi54ICsgY29uc3RyYWludC5wb2ludEIueCwgYm9keUIucG9zaXRpb24ueSArIGNvbnN0cmFpbnQucG9pbnRCLnkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjLmxpbmVUbyhjb25zdHJhaW50LnBvaW50Qi54LCBjb25zdHJhaW50LnBvaW50Qi55KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYy5saW5lV2lkdGggPSBjb25zdHJhaW50LnJlbmRlci5saW5lV2lkdGg7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gY29uc3RyYWludC5yZW5kZXIuc3Ryb2tlU3R5bGU7XG4gICAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBib2R5U2hhZG93c1xuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2JvZHlbXX0gYm9kaWVzXG4gICAgICogQHBhcmFtIHtSZW5kZXJpbmdDb250ZXh0fSBjb250ZXh0XG4gICAgICovXG4gICAgUmVuZGVyLmJvZHlTaGFkb3dzID0gZnVuY3Rpb24ocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGMgPSBjb250ZXh0LFxuICAgICAgICAgICAgZW5naW5lID0gcmVuZGVyLmVuZ2luZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmICghYm9keS5yZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKGJvZHkuY2lyY2xlUmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLmFyYyhib2R5LnBvc2l0aW9uLngsIGJvZHkucG9zaXRpb24ueSwgYm9keS5jaXJjbGVSYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICBjLmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGMubW92ZVRvKGJvZHkudmVydGljZXNbMF0ueCwgYm9keS52ZXJ0aWNlc1swXS55KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGJvZHkudmVydGljZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYy5saW5lVG8oYm9keS52ZXJ0aWNlc1tqXS54LCBib2R5LnZlcnRpY2VzW2pdLnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjLmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGlzdGFuY2VYID0gYm9keS5wb3NpdGlvbi54IC0gcmVuZGVyLm9wdGlvbnMud2lkdGggKiAwLjUsXG4gICAgICAgICAgICAgICAgZGlzdGFuY2VZID0gYm9keS5wb3NpdGlvbi55IC0gcmVuZGVyLm9wdGlvbnMuaGVpZ2h0ICogMC4yLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoZGlzdGFuY2VYKSArIE1hdGguYWJzKGRpc3RhbmNlWSk7XG5cbiAgICAgICAgICAgIGMuc2hhZG93Q29sb3IgPSAncmdiYSgwLDAsMCwwLjE1KSc7XG4gICAgICAgICAgICBjLnNoYWRvd09mZnNldFggPSAwLjA1ICogZGlzdGFuY2VYO1xuICAgICAgICAgICAgYy5zaGFkb3dPZmZzZXRZID0gMC4wNSAqIGRpc3RhbmNlWTtcbiAgICAgICAgICAgIGMuc2hhZG93Qmx1ciA9IDEgKyAxMiAqIE1hdGgubWluKDEsIGRpc3RhbmNlIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIGMuZmlsbCgpO1xuXG4gICAgICAgICAgICBjLnNoYWRvd0NvbG9yID0gbnVsbDtcbiAgICAgICAgICAgIGMuc2hhZG93T2Zmc2V0WCA9IG51bGw7XG4gICAgICAgICAgICBjLnNoYWRvd09mZnNldFkgPSBudWxsO1xuICAgICAgICAgICAgYy5zaGFkb3dCbHVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBib2RpZXNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5ib2RpZXMgPSBmdW5jdGlvbihyZW5kZXIsIGJvZGllcywgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQsXG4gICAgICAgICAgICBlbmdpbmUgPSByZW5kZXIuZW5naW5lLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHJlbmRlci5vcHRpb25zLFxuICAgICAgICAgICAgc2hvd0ludGVybmFsRWRnZXMgPSBvcHRpb25zLnNob3dJbnRlcm5hbEVkZ2VzIHx8ICFvcHRpb25zLndpcmVmcmFtZXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBrO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmICghYm9keS5yZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gaGFuZGxlIGNvbXBvdW5kIHBhcnRzXG4gICAgICAgICAgICBmb3IgKGsgPSBib2R5LnBhcnRzLmxlbmd0aCA+IDEgPyAxIDogMDsgayA8IGJvZHkucGFydHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBwYXJ0ID0gYm9keS5wYXJ0c1trXTtcblxuICAgICAgICAgICAgICAgIGlmICghcGFydC5yZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaG93U2xlZXBpbmcgJiYgYm9keS5pc1NsZWVwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGMuZ2xvYmFsQWxwaGEgPSAwLjUgKiBwYXJ0LnJlbmRlci5vcGFjaXR5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydC5yZW5kZXIub3BhY2l0eSAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjLmdsb2JhbEFscGhhID0gcGFydC5yZW5kZXIub3BhY2l0eTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocGFydC5yZW5kZXIuc3ByaXRlICYmIHBhcnQucmVuZGVyLnNwcml0ZS50ZXh0dXJlICYmICFvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFydCBzcHJpdGVcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IHBhcnQucmVuZGVyLnNwcml0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUgPSBfZ2V0VGV4dHVyZShyZW5kZXIsIHNwcml0ZS50ZXh0dXJlKTtcblxuICAgICAgICAgICAgICAgICAgICBjLnRyYW5zbGF0ZShwYXJ0LnBvc2l0aW9uLngsIHBhcnQucG9zaXRpb24ueSk7IFxuICAgICAgICAgICAgICAgICAgICBjLnJvdGF0ZShwYXJ0LmFuZ2xlKTtcblxuICAgICAgICAgICAgICAgICAgICBjLmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLndpZHRoICogLXNwcml0ZS54T2Zmc2V0ICogc3ByaXRlLnhTY2FsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmhlaWdodCAqIC1zcHJpdGUueU9mZnNldCAqIHNwcml0ZS55U2NhbGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS53aWR0aCAqIHNwcml0ZS54U2NhbGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5oZWlnaHQgKiBzcHJpdGUueVNjYWxlXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV2ZXJ0IHRyYW5zbGF0aW9uLCBob3BlZnVsbHkgZmFzdGVyIHRoYW4gc2F2ZSAvIHJlc3RvcmVcbiAgICAgICAgICAgICAgICAgICAgYy5yb3RhdGUoLXBhcnQuYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICBjLnRyYW5zbGF0ZSgtcGFydC5wb3NpdGlvbi54LCAtcGFydC5wb3NpdGlvbi55KTsgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFydCBwb2x5Z29uXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0LmNpcmNsZVJhZGl1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYXJjKHBhcnQucG9zaXRpb24ueCwgcGFydC5wb3NpdGlvbi55LCBwYXJ0LmNpcmNsZVJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMubW92ZVRvKHBhcnQudmVydGljZXNbMF0ueCwgcGFydC52ZXJ0aWNlc1swXS55KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBwYXJ0LnZlcnRpY2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJ0LnZlcnRpY2VzW2ogLSAxXS5pc0ludGVybmFsIHx8IHNob3dJbnRlcm5hbEVkZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMubGluZVRvKHBhcnQudmVydGljZXNbal0ueCwgcGFydC52ZXJ0aWNlc1tqXS55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLm1vdmVUbyhwYXJ0LnZlcnRpY2VzW2pdLngsIHBhcnQudmVydGljZXNbal0ueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQudmVydGljZXNbal0uaXNJbnRlcm5hbCAmJiAhc2hvd0ludGVybmFsRWRnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYy5tb3ZlVG8ocGFydC52ZXJ0aWNlc1soaiArIDEpICUgcGFydC52ZXJ0aWNlcy5sZW5ndGhdLngsIHBhcnQudmVydGljZXNbKGogKyAxKSAlIHBhcnQudmVydGljZXMubGVuZ3RoXS55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMubGluZVRvKHBhcnQudmVydGljZXNbMF0ueCwgcGFydC52ZXJ0aWNlc1swXS55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMud2lyZWZyYW1lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5maWxsU3R5bGUgPSBwYXJ0LnJlbmRlci5maWxsU3R5bGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmxpbmVXaWR0aCA9IHBhcnQucmVuZGVyLmxpbmVXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSBwYXJ0LnJlbmRlci5zdHJva2VTdHlsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICcjYmJiJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYy5nbG9iYWxBbHBoYSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogT3B0aW1pc2VkIG1ldGhvZCBmb3IgZHJhd2luZyBib2R5IHdpcmVmcmFtZXMgaW4gb25lIHBhc3NcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYm9keVdpcmVmcmFtZXNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5ib2R5V2lyZWZyYW1lcyA9IGZ1bmN0aW9uKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIHNob3dJbnRlcm5hbEVkZ2VzID0gcmVuZGVyLm9wdGlvbnMuc2hvd0ludGVybmFsRWRnZXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgaztcblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBhbGwgYm9kaWVzXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmICghYm9keS5yZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gaGFuZGxlIGNvbXBvdW5kIHBhcnRzXG4gICAgICAgICAgICBmb3IgKGsgPSBib2R5LnBhcnRzLmxlbmd0aCA+IDEgPyAxIDogMDsgayA8IGJvZHkucGFydHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBwYXJ0ID0gYm9keS5wYXJ0c1trXTtcblxuICAgICAgICAgICAgICAgIGMubW92ZVRvKHBhcnQudmVydGljZXNbMF0ueCwgcGFydC52ZXJ0aWNlc1swXS55KTtcblxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCBwYXJ0LnZlcnRpY2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFydC52ZXJ0aWNlc1tqIC0gMV0uaXNJbnRlcm5hbCB8fCBzaG93SW50ZXJuYWxFZGdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5saW5lVG8ocGFydC52ZXJ0aWNlc1tqXS54LCBwYXJ0LnZlcnRpY2VzW2pdLnkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYy5tb3ZlVG8ocGFydC52ZXJ0aWNlc1tqXS54LCBwYXJ0LnZlcnRpY2VzW2pdLnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQudmVydGljZXNbal0uaXNJbnRlcm5hbCAmJiAhc2hvd0ludGVybmFsRWRnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMubW92ZVRvKHBhcnQudmVydGljZXNbKGogKyAxKSAlIHBhcnQudmVydGljZXMubGVuZ3RoXS54LCBwYXJ0LnZlcnRpY2VzWyhqICsgMSkgJSBwYXJ0LnZlcnRpY2VzLmxlbmd0aF0ueSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYy5saW5lVG8ocGFydC52ZXJ0aWNlc1swXS54LCBwYXJ0LnZlcnRpY2VzWzBdLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLnN0cm9rZVN0eWxlID0gJyNiYmInO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBPcHRpbWlzZWQgbWV0aG9kIGZvciBkcmF3aW5nIGJvZHkgY29udmV4IGh1bGwgd2lyZWZyYW1lcyBpbiBvbmUgcGFzc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBib2R5Q29udmV4SHVsbHNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5ib2R5Q29udmV4SHVsbHMgPSBmdW5jdGlvbihyZW5kZXIsIGJvZGllcywgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgaztcblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8vIHJlbmRlciBjb252ZXggaHVsbHNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgaWYgKCFib2R5LnJlbmRlci52aXNpYmxlIHx8IGJvZHkucGFydHMubGVuZ3RoID09PSAxKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjLm1vdmVUbyhib2R5LnZlcnRpY2VzWzBdLngsIGJvZHkudmVydGljZXNbMF0ueSk7XG5cbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCBib2R5LnZlcnRpY2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYy5saW5lVG8oYm9keS52ZXJ0aWNlc1tqXS54LCBib2R5LnZlcnRpY2VzW2pdLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjLmxpbmVUbyhib2R5LnZlcnRpY2VzWzBdLngsIGJvZHkudmVydGljZXNbMF0ueSk7XG4gICAgICAgIH1cblxuICAgICAgICBjLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjIpJztcbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyBib2R5IHZlcnRleCBudW1iZXJzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCB2ZXJ0ZXhOdW1iZXJzXG4gICAgICogQHBhcmFtIHtyZW5kZXJ9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmluZ0NvbnRleHR9IGNvbnRleHRcbiAgICAgKi9cbiAgICBSZW5kZXIudmVydGV4TnVtYmVycyA9IGZ1bmN0aW9uKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgaztcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBib2RpZXNbaV0ucGFydHM7XG4gICAgICAgICAgICBmb3IgKGsgPSBwYXJ0cy5sZW5ndGggPiAxID8gMSA6IDA7IGsgPCBwYXJ0cy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0ID0gcGFydHNba107XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHBhcnQudmVydGljZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYy5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjIpJztcbiAgICAgICAgICAgICAgICAgICAgYy5maWxsVGV4dChpICsgJ18nICsgaiwgcGFydC5wb3NpdGlvbi54ICsgKHBhcnQudmVydGljZXNbal0ueCAtIHBhcnQucG9zaXRpb24ueCkgKiAwLjgsIHBhcnQucG9zaXRpb24ueSArIChwYXJ0LnZlcnRpY2VzW2pdLnkgLSBwYXJ0LnBvc2l0aW9uLnkpICogMC44KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVuZGVycyBtb3VzZSBwb3NpdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgbW91c2VQb3NpdGlvblxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge21vdXNlfSBtb3VzZVxuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5tb3VzZVBvc2l0aW9uID0gZnVuY3Rpb24ocmVuZGVyLCBtb3VzZSwgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQ7XG4gICAgICAgIGMuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC44KSc7XG4gICAgICAgIGMuZmlsbFRleHQobW91c2UucG9zaXRpb24ueCArICcgICcgKyBtb3VzZS5wb3NpdGlvbi55LCBtb3VzZS5wb3NpdGlvbi54ICsgNSwgbW91c2UucG9zaXRpb24ueSAtIDUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEcmF3cyBib2R5IGJvdW5kc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBib2R5Qm91bmRzXG4gICAgICogQHBhcmFtIHtyZW5kZXJ9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmluZ0NvbnRleHR9IGNvbnRleHRcbiAgICAgKi9cbiAgICBSZW5kZXIuYm9keUJvdW5kcyA9IGZ1bmN0aW9uKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIGVuZ2luZSA9IHJlbmRlci5lbmdpbmUsXG4gICAgICAgICAgICBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnM7XG5cbiAgICAgICAgYy5iZWdpblBhdGgoKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBib2RpZXNbaV07XG5cbiAgICAgICAgICAgIGlmIChib2R5LnJlbmRlci52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gYm9kaWVzW2ldLnBhcnRzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBwYXJ0cy5sZW5ndGggPiAxID8gMSA6IDA7IGogPCBwYXJ0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFydCA9IHBhcnRzW2pdO1xuICAgICAgICAgICAgICAgICAgICBjLnJlY3QocGFydC5ib3VuZHMubWluLngsIHBhcnQuYm91bmRzLm1pbi55LCBwYXJ0LmJvdW5kcy5tYXgueCAtIHBhcnQuYm91bmRzLm1pbi54LCBwYXJ0LmJvdW5kcy5tYXgueSAtIHBhcnQuYm91bmRzLm1pbi55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy53aXJlZnJhbWVzKSB7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC4wOCknO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuMSknO1xuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEcmF3cyBib2R5IGFuZ2xlIGluZGljYXRvcnMgYW5kIGF4ZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYm9keUF4ZXNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5ib2R5QXhlcyA9IGZ1bmN0aW9uKHJlbmRlciwgYm9kaWVzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIGVuZ2luZSA9IHJlbmRlci5lbmdpbmUsXG4gICAgICAgICAgICBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnMsXG4gICAgICAgICAgICBwYXJ0LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBrO1xuXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJvZHkgPSBib2RpZXNbaV0sXG4gICAgICAgICAgICAgICAgcGFydHMgPSBib2R5LnBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWJvZHkucmVuZGVyLnZpc2libGUpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dBeGVzKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVuZGVyIGFsbCBheGVzXG4gICAgICAgICAgICAgICAgZm9yIChqID0gcGFydHMubGVuZ3RoID4gMSA/IDEgOiAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydCA9IHBhcnRzW2pdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcGFydC5heGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXhpcyA9IHBhcnQuYXhlc1trXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMubW92ZVRvKHBhcnQucG9zaXRpb24ueCwgcGFydC5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMubGluZVRvKHBhcnQucG9zaXRpb24ueCArIGF4aXMueCAqIDIwLCBwYXJ0LnBvc2l0aW9uLnkgKyBheGlzLnkgKiAyMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IHBhcnRzLmxlbmd0aCA+IDEgPyAxIDogMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSBwYXJ0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IHBhcnQuYXhlcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVuZGVyIGEgc2luZ2xlIGF4aXMgaW5kaWNhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjLm1vdmVUbyhwYXJ0LnBvc2l0aW9uLngsIHBhcnQucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmxpbmVUbygocGFydC52ZXJ0aWNlc1swXS54ICsgcGFydC52ZXJ0aWNlc1twYXJ0LnZlcnRpY2VzLmxlbmd0aC0xXS54KSAvIDIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcnQudmVydGljZXNbMF0ueSArIHBhcnQudmVydGljZXNbcGFydC52ZXJ0aWNlcy5sZW5ndGgtMV0ueSkgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAnaW5kaWFucmVkJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiYSgwLDAsMCwwLjgpJztcbiAgICAgICAgICAgIGMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ292ZXJsYXknO1xuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICBjLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERyYXdzIGJvZHkgcG9zaXRpb25zXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIGJvZHlQb3NpdGlvbnNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtib2R5W119IGJvZGllc1xuICAgICAqIEBwYXJhbSB7UmVuZGVyaW5nQ29udGV4dH0gY29udGV4dFxuICAgICAqL1xuICAgIFJlbmRlci5ib2R5UG9zaXRpb25zID0gZnVuY3Rpb24ocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGMgPSBjb250ZXh0LFxuICAgICAgICAgICAgZW5naW5lID0gcmVuZGVyLmVuZ2luZSxcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZW5kZXIub3B0aW9ucyxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBwYXJ0LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGs7XG5cbiAgICAgICAgYy5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyByZW5kZXIgY3VycmVudCBwb3NpdGlvbnNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYm9keSA9IGJvZGllc1tpXTtcblxuICAgICAgICAgICAgaWYgKCFib2R5LnJlbmRlci52aXNpYmxlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBoYW5kbGUgY29tcG91bmQgcGFydHNcbiAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBib2R5LnBhcnRzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgcGFydCA9IGJvZHkucGFydHNba107XG4gICAgICAgICAgICAgICAgYy5hcmMocGFydC5wb3NpdGlvbi54LCBwYXJ0LnBvc2l0aW9uLnksIDMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYy5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgIGMuZmlsbFN0eWxlID0gJ2luZGlhbnJlZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjLmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuNSknO1xuICAgICAgICB9XG4gICAgICAgIGMuZmlsbCgpO1xuXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHByZXZpb3VzIHBvc2l0aW9uc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBib2R5ID0gYm9kaWVzW2ldO1xuICAgICAgICAgICAgaWYgKGJvZHkucmVuZGVyLnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICBjLmFyYyhib2R5LnBvc2l0aW9uUHJldi54LCBib2R5LnBvc2l0aW9uUHJldi55LCAyLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjLmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwxNjUsMCwwLjgpJztcbiAgICAgICAgYy5maWxsKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERyYXdzIGJvZHkgdmVsb2NpdHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYm9keVZlbG9jaXR5XG4gICAgICogQHBhcmFtIHtyZW5kZXJ9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7Ym9keVtdfSBib2RpZXNcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmluZ0NvbnRleHR9IGNvbnRleHRcbiAgICAgKi9cbiAgICBSZW5kZXIuYm9keVZlbG9jaXR5ID0gZnVuY3Rpb24ocmVuZGVyLCBib2RpZXMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGMgPSBjb250ZXh0O1xuXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoIWJvZHkucmVuZGVyLnZpc2libGUpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGMubW92ZVRvKGJvZHkucG9zaXRpb24ueCwgYm9keS5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGMubGluZVRvKGJvZHkucG9zaXRpb24ueCArIChib2R5LnBvc2l0aW9uLnggLSBib2R5LnBvc2l0aW9uUHJldi54KSAqIDIsIGJvZHkucG9zaXRpb24ueSArIChib2R5LnBvc2l0aW9uLnkgLSBib2R5LnBvc2l0aW9uUHJldi55KSAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAzO1xuICAgICAgICBjLnN0cm9rZVN0eWxlID0gJ2Nvcm5mbG93ZXJibHVlJztcbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRHJhd3MgYm9keSBpZHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgYm9keUlkc1xuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2JvZHlbXX0gYm9kaWVzXG4gICAgICogQHBhcmFtIHtSZW5kZXJpbmdDb250ZXh0fSBjb250ZXh0XG4gICAgICovXG4gICAgUmVuZGVyLmJvZHlJZHMgPSBmdW5jdGlvbihyZW5kZXIsIGJvZGllcywgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgajtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIWJvZGllc1tpXS5yZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgdmFyIHBhcnRzID0gYm9kaWVzW2ldLnBhcnRzO1xuICAgICAgICAgICAgZm9yIChqID0gcGFydHMubGVuZ3RoID4gMSA/IDEgOiAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFydCA9IHBhcnRzW2pdO1xuICAgICAgICAgICAgICAgIGMuZm9udCA9IFwiMTJweCBBcmlhbFwiO1xuICAgICAgICAgICAgICAgIGMuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC41KSc7XG4gICAgICAgICAgICAgICAgYy5maWxsVGV4dChwYXJ0LmlkLCBwYXJ0LnBvc2l0aW9uLnggKyAxMCwgcGFydC5wb3NpdGlvbi55IC0gMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlc2NyaXB0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWV0aG9kIGNvbGxpc2lvbnNcbiAgICAgKiBAcGFyYW0ge3JlbmRlcn0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtwYWlyW119IHBhaXJzXG4gICAgICogQHBhcmFtIHtSZW5kZXJpbmdDb250ZXh0fSBjb250ZXh0XG4gICAgICovXG4gICAgUmVuZGVyLmNvbGxpc2lvbnMgPSBmdW5jdGlvbihyZW5kZXIsIHBhaXJzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZW5kZXIub3B0aW9ucyxcbiAgICAgICAgICAgIHBhaXIsXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBjb3JyZWN0ZWQsXG4gICAgICAgICAgICBib2R5QSxcbiAgICAgICAgICAgIGJvZHlCLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGo7XG5cbiAgICAgICAgYy5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyByZW5kZXIgY29sbGlzaW9uIHBvc2l0aW9uc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhaXIgPSBwYWlyc1tpXTtcblxuICAgICAgICAgICAgaWYgKCFwYWlyLmlzQWN0aXZlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBwYWlyLmFjdGl2ZUNvbnRhY3RzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhY3QgPSBwYWlyLmFjdGl2ZUNvbnRhY3RzW2pdLFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXggPSBjb250YWN0LnZlcnRleDtcbiAgICAgICAgICAgICAgICBjLnJlY3QodmVydGV4LnggLSAxLjUsIHZlcnRleC55IC0gMS41LCAzLjUsIDMuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy53aXJlZnJhbWVzKSB7XG4gICAgICAgICAgICBjLmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNyknO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYy5maWxsU3R5bGUgPSAnb3JhbmdlJztcbiAgICAgICAgfVxuICAgICAgICBjLmZpbGwoKTtcblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vIHJlbmRlciBjb2xsaXNpb24gbm9ybWFsc1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhaXIgPSBwYWlyc1tpXTtcblxuICAgICAgICAgICAgaWYgKCFwYWlyLmlzQWN0aXZlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb2xsaXNpb24gPSBwYWlyLmNvbGxpc2lvbjtcblxuICAgICAgICAgICAgaWYgKHBhaXIuYWN0aXZlQ29udGFjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBub3JtYWxQb3NYID0gcGFpci5hY3RpdmVDb250YWN0c1swXS52ZXJ0ZXgueCxcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsUG9zWSA9IHBhaXIuYWN0aXZlQ29udGFjdHNbMF0udmVydGV4Lnk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpci5hY3RpdmVDb250YWN0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsUG9zWCA9IChwYWlyLmFjdGl2ZUNvbnRhY3RzWzBdLnZlcnRleC54ICsgcGFpci5hY3RpdmVDb250YWN0c1sxXS52ZXJ0ZXgueCkgLyAyO1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxQb3NZID0gKHBhaXIuYWN0aXZlQ29udGFjdHNbMF0udmVydGV4LnkgKyBwYWlyLmFjdGl2ZUNvbnRhY3RzWzFdLnZlcnRleC55KSAvIDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChjb2xsaXNpb24uYm9keUIgPT09IGNvbGxpc2lvbi5zdXBwb3J0c1swXS5ib2R5IHx8IGNvbGxpc2lvbi5ib2R5QS5pc1N0YXRpYyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjLm1vdmVUbyhub3JtYWxQb3NYIC0gY29sbGlzaW9uLm5vcm1hbC54ICogOCwgbm9ybWFsUG9zWSAtIGNvbGxpc2lvbi5ub3JtYWwueSAqIDgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGMubW92ZVRvKG5vcm1hbFBvc1ggKyBjb2xsaXNpb24ubm9ybWFsLnggKiA4LCBub3JtYWxQb3NZICsgY29sbGlzaW9uLm5vcm1hbC55ICogOCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYy5saW5lVG8obm9ybWFsUG9zWCwgbm9ybWFsUG9zWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy53aXJlZnJhbWVzKSB7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LDE2NSwwLDAuNyknO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBzZXBhcmF0aW9uc1xuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge3BhaXJbXX0gcGFpcnNcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmluZ0NvbnRleHR9IGNvbnRleHRcbiAgICAgKi9cbiAgICBSZW5kZXIuc2VwYXJhdGlvbnMgPSBmdW5jdGlvbihyZW5kZXIsIHBhaXJzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBjID0gY29udGV4dCxcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZW5kZXIub3B0aW9ucyxcbiAgICAgICAgICAgIHBhaXIsXG4gICAgICAgICAgICBjb2xsaXNpb24sXG4gICAgICAgICAgICBjb3JyZWN0ZWQsXG4gICAgICAgICAgICBib2R5QSxcbiAgICAgICAgICAgIGJvZHlCLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGo7XG5cbiAgICAgICAgYy5iZWdpblBhdGgoKTtcblxuICAgICAgICAvLyByZW5kZXIgc2VwYXJhdGlvbnNcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWlyID0gcGFpcnNbaV07XG5cbiAgICAgICAgICAgIGlmICghcGFpci5pc0FjdGl2ZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgY29sbGlzaW9uID0gcGFpci5jb2xsaXNpb247XG4gICAgICAgICAgICBib2R5QSA9IGNvbGxpc2lvbi5ib2R5QTtcbiAgICAgICAgICAgIGJvZHlCID0gY29sbGlzaW9uLmJvZHlCO1xuXG4gICAgICAgICAgICB2YXIgayA9IDE7XG5cbiAgICAgICAgICAgIGlmICghYm9keUIuaXNTdGF0aWMgJiYgIWJvZHlBLmlzU3RhdGljKSBrID0gMC41O1xuICAgICAgICAgICAgaWYgKGJvZHlCLmlzU3RhdGljKSBrID0gMDtcblxuICAgICAgICAgICAgYy5tb3ZlVG8oYm9keUIucG9zaXRpb24ueCwgYm9keUIucG9zaXRpb24ueSk7XG4gICAgICAgICAgICBjLmxpbmVUbyhib2R5Qi5wb3NpdGlvbi54IC0gY29sbGlzaW9uLnBlbmV0cmF0aW9uLnggKiBrLCBib2R5Qi5wb3NpdGlvbi55IC0gY29sbGlzaW9uLnBlbmV0cmF0aW9uLnkgKiBrKTtcblxuICAgICAgICAgICAgayA9IDE7XG5cbiAgICAgICAgICAgIGlmICghYm9keUIuaXNTdGF0aWMgJiYgIWJvZHlBLmlzU3RhdGljKSBrID0gMC41O1xuICAgICAgICAgICAgaWYgKGJvZHlBLmlzU3RhdGljKSBrID0gMDtcblxuICAgICAgICAgICAgYy5tb3ZlVG8oYm9keUEucG9zaXRpb24ueCwgYm9keUEucG9zaXRpb24ueSk7XG4gICAgICAgICAgICBjLmxpbmVUbyhib2R5QS5wb3NpdGlvbi54ICsgY29sbGlzaW9uLnBlbmV0cmF0aW9uLnggKiBrLCBib2R5QS5wb3NpdGlvbi55ICsgY29sbGlzaW9uLnBlbmV0cmF0aW9uLnkgKiBrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMTY1LDAsMC41KSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gJ29yYW5nZSc7XG4gICAgICAgIH1cbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVzY3JpcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZXRob2QgZ3JpZFxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2dyaWR9IGdyaWRcbiAgICAgKiBAcGFyYW0ge1JlbmRlcmluZ0NvbnRleHR9IGNvbnRleHRcbiAgICAgKi9cbiAgICBSZW5kZXIuZ3JpZCA9IGZ1bmN0aW9uKHJlbmRlciwgZ3JpZCwgY29udGV4dCkge1xuICAgICAgICB2YXIgYyA9IGNvbnRleHQsXG4gICAgICAgICAgICBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnM7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMud2lyZWZyYW1lcykge1xuICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwxODAsMCwwLjEpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMTgwLDAsMC41KSc7XG4gICAgICAgIH1cblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIHZhciBidWNrZXRLZXlzID0gQ29tbW9uLmtleXMoZ3JpZC5idWNrZXRzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Y2tldEtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBidWNrZXRJZCA9IGJ1Y2tldEtleXNbaV07XG5cbiAgICAgICAgICAgIGlmIChncmlkLmJ1Y2tldHNbYnVja2V0SWRdLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIHZhciByZWdpb24gPSBidWNrZXRJZC5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgYy5yZWN0KDAuNSArIHBhcnNlSW50KHJlZ2lvblswXSwgMTApICogZ3JpZC5idWNrZXRXaWR0aCwgXG4gICAgICAgICAgICAgICAgICAgIDAuNSArIHBhcnNlSW50KHJlZ2lvblsxXSwgMTApICogZ3JpZC5idWNrZXRIZWlnaHQsIFxuICAgICAgICAgICAgICAgICAgICBncmlkLmJ1Y2tldFdpZHRoLCBcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5idWNrZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1ldGhvZCBpbnNwZWN0b3JcbiAgICAgKiBAcGFyYW0ge2luc3BlY3Rvcn0gaW5zcGVjdG9yXG4gICAgICogQHBhcmFtIHtSZW5kZXJpbmdDb250ZXh0fSBjb250ZXh0XG4gICAgICovXG4gICAgUmVuZGVyLmluc3BlY3RvciA9IGZ1bmN0aW9uKGluc3BlY3RvciwgY29udGV4dCkge1xuICAgICAgICB2YXIgZW5naW5lID0gaW5zcGVjdG9yLmVuZ2luZSxcbiAgICAgICAgICAgIHNlbGVjdGVkID0gaW5zcGVjdG9yLnNlbGVjdGVkLFxuICAgICAgICAgICAgcmVuZGVyID0gaW5zcGVjdG9yLnJlbmRlcixcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZW5kZXIub3B0aW9ucyxcbiAgICAgICAgICAgIGJvdW5kcztcblxuICAgICAgICBpZiAob3B0aW9ucy5oYXNCb3VuZHMpIHtcbiAgICAgICAgICAgIHZhciBib3VuZHNXaWR0aCA9IHJlbmRlci5ib3VuZHMubWF4LnggLSByZW5kZXIuYm91bmRzLm1pbi54LFxuICAgICAgICAgICAgICAgIGJvdW5kc0hlaWdodCA9IHJlbmRlci5ib3VuZHMubWF4LnkgLSByZW5kZXIuYm91bmRzLm1pbi55LFxuICAgICAgICAgICAgICAgIGJvdW5kc1NjYWxlWCA9IGJvdW5kc1dpZHRoIC8gcmVuZGVyLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICAgICAgYm91bmRzU2NhbGVZID0gYm91bmRzSGVpZ2h0IC8gcmVuZGVyLm9wdGlvbnMuaGVpZ2h0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb250ZXh0LnNjYWxlKDEgLyBib3VuZHNTY2FsZVgsIDEgLyBib3VuZHNTY2FsZVkpO1xuICAgICAgICAgICAgY29udGV4dC50cmFuc2xhdGUoLXJlbmRlci5ib3VuZHMubWluLngsIC1yZW5kZXIuYm91bmRzLm1pbi55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gc2VsZWN0ZWRbaV0uZGF0YTtcblxuICAgICAgICAgICAgY29udGV4dC50cmFuc2xhdGUoMC41LCAwLjUpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwxNjUsMCwwLjkpJztcbiAgICAgICAgICAgIGNvbnRleHQuc2V0TGluZURhc2goWzEsMl0pO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICdib2R5JzpcblxuICAgICAgICAgICAgICAgIC8vIHJlbmRlciBib2R5IHNlbGVjdGlvbnNcbiAgICAgICAgICAgICAgICBib3VuZHMgPSBpdGVtLmJvdW5kcztcbiAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQucmVjdChNYXRoLmZsb29yKGJvdW5kcy5taW4ueCAtIDMpLCBNYXRoLmZsb29yKGJvdW5kcy5taW4ueSAtIDMpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihib3VuZHMubWF4LnggLSBib3VuZHMubWluLnggKyA2KSwgTWF0aC5mbG9vcihib3VuZHMubWF4LnkgLSBib3VuZHMubWluLnkgKyA2KSk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2NvbnN0cmFpbnQnOlxuXG4gICAgICAgICAgICAgICAgLy8gcmVuZGVyIGNvbnN0cmFpbnQgc2VsZWN0aW9uc1xuICAgICAgICAgICAgICAgIHZhciBwb2ludCA9IGl0ZW0ucG9pbnRBO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmJvZHlBKVxuICAgICAgICAgICAgICAgICAgICBwb2ludCA9IGl0ZW0ucG9pbnRCO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY29udGV4dC5hcmMocG9pbnQueCwgcG9pbnQueSwgMTAsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZXh0LnNldExpbmVEYXNoKFtdKTtcbiAgICAgICAgICAgIGNvbnRleHQudHJhbnNsYXRlKC0wLjUsIC0wLjUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVuZGVyIHNlbGVjdGlvbiByZWdpb25cbiAgICAgICAgaWYgKGluc3BlY3Rvci5zZWxlY3RTdGFydCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGV4dC50cmFuc2xhdGUoMC41LCAwLjUpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwxNjUsMCwwLjYpJztcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDE2NSwwLDAuMSknO1xuICAgICAgICAgICAgYm91bmRzID0gaW5zcGVjdG9yLnNlbGVjdEJvdW5kcztcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjb250ZXh0LnJlY3QoTWF0aC5mbG9vcihib3VuZHMubWluLngpLCBNYXRoLmZsb29yKGJvdW5kcy5taW4ueSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoYm91bmRzLm1heC54IC0gYm91bmRzLm1pbi54KSwgTWF0aC5mbG9vcihib3VuZHMubWF4LnkgLSBib3VuZHMubWluLnkpKTtcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICBjb250ZXh0LnRyYW5zbGF0ZSgtMC41LCAtMC41KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmhhc0JvdW5kcylcbiAgICAgICAgICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBtZXRob2QgX2NyZWF0ZUNhbnZhc1xuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHt9IHdpZHRoXG4gICAgICogQHBhcmFtIHt9IGhlaWdodFxuICAgICAqIEByZXR1cm4gY2FudmFzXG4gICAgICovXG4gICAgdmFyIF9jcmVhdGVDYW52YXMgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGNhbnZhcy5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfTtcbiAgICAgICAgY2FudmFzLm9uc2VsZWN0c3RhcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuICAgICAgICByZXR1cm4gY2FudmFzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwaXhlbCByYXRpbyBvZiB0aGUgY2FudmFzLlxuICAgICAqIEBtZXRob2QgX2dldFBpeGVsUmF0aW9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNhbnZhc1xuICAgICAqIEByZXR1cm4ge051bWJlcn0gcGl4ZWwgcmF0aW9cbiAgICAgKi9cbiAgICB2YXIgX2dldFBpeGVsUmF0aW8gPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgICAgIGRldmljZVBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxLFxuICAgICAgICAgICAgYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyA9IGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjb250ZXh0Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgY29udGV4dC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgICAgICByZXR1cm4gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVBpeGVsUmF0aW87XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHJlcXVlc3RlZCB0ZXh0dXJlIChhbiBJbWFnZSkgdmlhIGl0cyBwYXRoXG4gICAgICogQG1ldGhvZCBfZ2V0VGV4dHVyZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtyZW5kZXJ9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZVBhdGhcbiAgICAgKiBAcmV0dXJuIHtJbWFnZX0gdGV4dHVyZVxuICAgICAqL1xuICAgIHZhciBfZ2V0VGV4dHVyZSA9IGZ1bmN0aW9uKHJlbmRlciwgaW1hZ2VQYXRoKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IHJlbmRlci50ZXh0dXJlc1tpbWFnZVBhdGhdO1xuXG4gICAgICAgIGlmIChpbWFnZSlcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcblxuICAgICAgICBpbWFnZSA9IHJlbmRlci50ZXh0dXJlc1tpbWFnZVBhdGhdID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltYWdlLnNyYyA9IGltYWdlUGF0aDtcblxuICAgICAgICByZXR1cm4gaW1hZ2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgdGhlIGJhY2tncm91bmQgdG8gdGhlIGNhbnZhcyB1c2luZyBDU1MuXG4gICAgICogQG1ldGhvZCBhcHBseUJhY2tncm91bmRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZFxuICAgICAqL1xuICAgIHZhciBfYXBwbHlCYWNrZ3JvdW5kID0gZnVuY3Rpb24ocmVuZGVyLCBiYWNrZ3JvdW5kKSB7XG4gICAgICAgIHZhciBjc3NCYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcblxuICAgICAgICBpZiAoLyhqcGd8Z2lmfHBuZykkLy50ZXN0KGJhY2tncm91bmQpKVxuICAgICAgICAgICAgY3NzQmFja2dyb3VuZCA9ICd1cmwoJyArIGJhY2tncm91bmQgKyAnKSc7XG5cbiAgICAgICAgcmVuZGVyLmNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kID0gY3NzQmFja2dyb3VuZDtcbiAgICAgICAgcmVuZGVyLmNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IFwiY29udGFpblwiO1xuICAgICAgICByZW5kZXIuY3VycmVudEJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH07XG5cbiAgICAvKlxuICAgICpcbiAgICAqICBFdmVudHMgRG9jdW1lbnRhdGlvblxuICAgICpcbiAgICAqL1xuXG4gICAgLyoqXG4gICAgKiBGaXJlZCBiZWZvcmUgcmVuZGVyaW5nXG4gICAgKlxuICAgICogQGV2ZW50IGJlZm9yZVJlbmRlclxuICAgICogQHBhcmFtIHt9IGV2ZW50IEFuIGV2ZW50IG9iamVjdFxuICAgICogQHBhcmFtIHtudW1iZXJ9IGV2ZW50LnRpbWVzdGFtcCBUaGUgZW5naW5lLnRpbWluZy50aW1lc3RhbXAgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQuc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IG9mIHRoZSBldmVudFxuICAgICogQHBhcmFtIHt9IGV2ZW50Lm5hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAgKi9cblxuICAgIC8qKlxuICAgICogRmlyZWQgYWZ0ZXIgcmVuZGVyaW5nXG4gICAgKlxuICAgICogQGV2ZW50IGFmdGVyUmVuZGVyXG4gICAgKiBAcGFyYW0ge30gZXZlbnQgQW4gZXZlbnQgb2JqZWN0XG4gICAgKiBAcGFyYW0ge251bWJlcn0gZXZlbnQudGltZXN0YW1wIFRoZSBlbmdpbmUudGltaW5nLnRpbWVzdGFtcCBvZiB0aGUgZXZlbnRcbiAgICAqIEBwYXJhbSB7fSBldmVudC5zb3VyY2UgVGhlIHNvdXJjZSBvYmplY3Qgb2YgdGhlIGV2ZW50XG4gICAgKiBAcGFyYW0ge30gZXZlbnQubmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiAgICAqL1xuXG4gICAgLypcbiAgICAqXG4gICAgKiAgUHJvcGVydGllcyBEb2N1bWVudGF0aW9uXG4gICAgKlxuICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGJhY2stcmVmZXJlbmNlIHRvIHRoZSBgTWF0dGVyLlJlbmRlcmAgbW9kdWxlLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGNvbnRyb2xsZXJcbiAgICAgKiBAdHlwZSByZW5kZXJcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgTWF0dGVyLkVuZ2luZWAgaW5zdGFuY2UgdG8gYmUgdXNlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBlbmdpbmVcbiAgICAgKiBAdHlwZSBlbmdpbmVcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBlbGVtZW50IHdoZXJlIHRoZSBjYW52YXMgaXMgdG8gYmUgaW5zZXJ0ZWQgKGlmIGByZW5kZXIuY2FudmFzYCBoYXMgbm90IGJlZW4gc3BlY2lmaWVkKVxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGVsZW1lbnRcbiAgICAgKiBAdHlwZSBIVE1MRWxlbWVudFxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBjYW52YXMgZWxlbWVudCB0byByZW5kZXIgdG8uIElmIG5vdCBzcGVjaWZpZWQsIG9uZSB3aWxsIGJlIGNyZWF0ZWQgaWYgYHJlbmRlci5lbGVtZW50YCBoYXMgYmVlbiBzcGVjaWZpZWQuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgY2FudmFzXG4gICAgICogQHR5cGUgSFRNTENhbnZhc0VsZW1lbnRcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIG9mIHRoZSByZW5kZXJlci5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBvcHRpb25zXG4gICAgICogQHR5cGUge31cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSB0YXJnZXQgd2lkdGggaW4gcGl4ZWxzIG9mIHRoZSBgcmVuZGVyLmNhbnZhc2AgdG8gYmUgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBvcHRpb25zLndpZHRoXG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgODAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGFyZ2V0IGhlaWdodCBpbiBwaXhlbHMgb2YgdGhlIGByZW5kZXIuY2FudmFzYCB0byBiZSBjcmVhdGVkLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IG9wdGlvbnMuaGVpZ2h0XG4gICAgICogQHR5cGUgbnVtYmVyXG4gICAgICogQGRlZmF1bHQgNjAwXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGZsYWcgdGhhdCBzcGVjaWZpZXMgaWYgYHJlbmRlci5ib3VuZHNgIHNob3VsZCBiZSB1c2VkIHdoZW4gcmVuZGVyaW5nLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IG9wdGlvbnMuaGFzQm91bmRzXG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBBIGBCb3VuZHNgIG9iamVjdCB0aGF0IHNwZWNpZmllcyB0aGUgZHJhd2luZyB2aWV3IHJlZ2lvbi4gXG4gICAgICogUmVuZGVyaW5nIHdpbGwgYmUgYXV0b21hdGljYWxseSB0cmFuc2Zvcm1lZCBhbmQgc2NhbGVkIHRvIGZpdCB3aXRoaW4gdGhlIGNhbnZhcyBzaXplIChgcmVuZGVyLm9wdGlvbnMud2lkdGhgIGFuZCBgcmVuZGVyLm9wdGlvbnMuaGVpZ2h0YCkuXG4gICAgICogVGhpcyBhbGxvd3MgZm9yIGNyZWF0aW5nIHZpZXdzIHRoYXQgY2FuIHBhbiBvciB6b29tIGFyb3VuZCB0aGUgc2NlbmUuXG4gICAgICogWW91IG11c3QgYWxzbyBzZXQgYHJlbmRlci5vcHRpb25zLmhhc0JvdW5kc2AgdG8gYHRydWVgIHRvIGVuYWJsZSBib3VuZGVkIHJlbmRlcmluZy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBib3VuZHNcbiAgICAgKiBAdHlwZSBib3VuZHNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSAyZCByZW5kZXJpbmcgY29udGV4dCBmcm9tIHRoZSBgcmVuZGVyLmNhbnZhc2AgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBjb250ZXh0XG4gICAgICogQHR5cGUgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3ByaXRlIHRleHR1cmUgY2FjaGUuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgdGV4dHVyZXNcbiAgICAgKiBAdHlwZSB7fVxuICAgICAqL1xuXG59KSgpO1xuXG59LHtcIi4uL2JvZHkvQ29tcG9zaXRlXCI6MixcIi4uL2NvbGxpc2lvbi9HcmlkXCI6NixcIi4uL2NvcmUvQ29tbW9uXCI6MTQsXCIuLi9jb3JlL0V2ZW50c1wiOjE2LFwiLi4vZ2VvbWV0cnkvQm91bmRzXCI6MjYsXCIuLi9nZW9tZXRyeS9WZWN0b3JcIjoyOH1dLDMyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuKiBUaGUgYE1hdHRlci5SZW5kZXJQaXhpYCBtb2R1bGUgaXMgYW4gZXhhbXBsZSByZW5kZXJlciB1c2luZyBwaXhpLmpzLlxuKiBTZWUgYWxzbyBgTWF0dGVyLlJlbmRlcmAgZm9yIGEgY2FudmFzIGJhc2VkIHJlbmRlcmVyLlxuKlxuKiBAY2xhc3MgUmVuZGVyUGl4aVxuKiBAZGVwcmVjYXRlZCB0aGUgTWF0dGVyLlJlbmRlclBpeGkgbW9kdWxlIHdpbGwgc29vbiBiZSByZW1vdmVkIGZyb20gdGhlIE1hdHRlci5qcyBjb3JlLlxuKiBJdCB3aWxsIGxpa2VseSBiZSBtb3ZlZCB0byBpdHMgb3duIHJlcG9zaXRvcnkgKGJ1dCBtYWludGVuYW5jZSB3aWxsIGJlIGxpbWl0ZWQpLlxuKi9cblxudmFyIFJlbmRlclBpeGkgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJQaXhpO1xuXG52YXIgQm91bmRzID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvQm91bmRzJyk7XG52YXIgQ29tcG9zaXRlID0gX2RlcmVxXygnLi4vYm9keS9Db21wb3NpdGUnKTtcbnZhciBDb21tb24gPSBfZGVyZXFfKCcuLi9jb3JlL0NvbW1vbicpO1xudmFyIEV2ZW50cyA9IF9kZXJlcV8oJy4uL2NvcmUvRXZlbnRzJyk7XG52YXIgVmVjdG9yID0gX2RlcmVxXygnLi4vZ2VvbWV0cnkvVmVjdG9yJyk7XG5cbihmdW5jdGlvbigpIHtcblxuICAgIHZhciBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICAgICAgICBfY2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgX3JlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgZnVuY3Rpb24oY2FsbGJhY2speyB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2soQ29tbW9uLm5vdygpKTsgfSwgMTAwMCAvIDYwKTsgfTtcbiAgIFxuICAgICAgICBfY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWU7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUGl4aS5qcyBXZWJHTCByZW5kZXJlclxuICAgICAqIEBtZXRob2QgY3JlYXRlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtSZW5kZXJQaXhpfSBBIG5ldyByZW5kZXJlclxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgUmVuZGVyUGl4aS5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIENvbW1vbi53YXJuKCdSZW5kZXJQaXhpLmNyZWF0ZTogTWF0dGVyLlJlbmRlclBpeGkgaXMgZGVwcmVjYXRlZCAoc2VlIGRvY3MpJyk7XG5cbiAgICAgICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgY29udHJvbGxlcjogUmVuZGVyUGl4aSxcbiAgICAgICAgICAgIGVuZ2luZTogbnVsbCxcbiAgICAgICAgICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBmcmFtZVJlcXVlc3RJZDogbnVsbCxcbiAgICAgICAgICAgIGNhbnZhczogbnVsbCxcbiAgICAgICAgICAgIHJlbmRlcmVyOiBudWxsLFxuICAgICAgICAgICAgY29udGFpbmVyOiBudWxsLFxuICAgICAgICAgICAgc3ByaXRlQ29udGFpbmVyOiBudWxsLFxuICAgICAgICAgICAgcGl4aU9wdGlvbnM6IG51bGwsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDgwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZhZmFmYScsXG4gICAgICAgICAgICAgICAgd2lyZWZyYW1lQmFja2dyb3VuZDogJyMyMjInLFxuICAgICAgICAgICAgICAgIGhhc0JvdW5kczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3aXJlZnJhbWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNob3dTbGVlcGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzaG93RGVidWc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNob3dCcm9hZHBoYXNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93Qm91bmRzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93VmVsb2NpdHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNob3dDb2xsaXNpb25zOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93QXhlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd1Bvc2l0aW9uczogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2hvd0FuZ2xlSW5kaWNhdG9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93SWRzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzaG93U2hhZG93czogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmVuZGVyID0gQ29tbW9uLmV4dGVuZChkZWZhdWx0cywgb3B0aW9ucyksXG4gICAgICAgICAgICB0cmFuc3BhcmVudCA9ICFyZW5kZXIub3B0aW9ucy53aXJlZnJhbWVzICYmIHJlbmRlci5vcHRpb25zLmJhY2tncm91bmQgPT09ICd0cmFuc3BhcmVudCc7XG5cbiAgICAgICAgLy8gaW5pdCBwaXhpXG4gICAgICAgIHJlbmRlci5waXhpT3B0aW9ucyA9IHJlbmRlci5waXhpT3B0aW9ucyB8fCB7XG4gICAgICAgICAgICB2aWV3OiByZW5kZXIuY2FudmFzLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRyYW5zcGFyZW50LFxuICAgICAgICAgICAgYW50aWFsaWFzOiB0cnVlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmJhY2tncm91bmRcbiAgICAgICAgfTtcblxuICAgICAgICByZW5kZXIubW91c2UgPSBvcHRpb25zLm1vdXNlO1xuICAgICAgICByZW5kZXIuZW5naW5lID0gb3B0aW9ucy5lbmdpbmU7XG4gICAgICAgIHJlbmRlci5yZW5kZXJlciA9IHJlbmRlci5yZW5kZXJlciB8fCBuZXcgUElYSS5XZWJHTFJlbmRlcmVyKHJlbmRlci5vcHRpb25zLndpZHRoLCByZW5kZXIub3B0aW9ucy5oZWlnaHQsIHJlbmRlci5waXhpT3B0aW9ucyk7XG4gICAgICAgIHJlbmRlci5jb250YWluZXIgPSByZW5kZXIuY29udGFpbmVyIHx8IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgICAgICByZW5kZXIuc3ByaXRlQ29udGFpbmVyID0gcmVuZGVyLnNwcml0ZUNvbnRhaW5lciB8fCBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICAgICAgcmVuZGVyLmNhbnZhcyA9IHJlbmRlci5jYW52YXMgfHwgcmVuZGVyLnJlbmRlcmVyLnZpZXc7XG4gICAgICAgIHJlbmRlci5ib3VuZHMgPSByZW5kZXIuYm91bmRzIHx8IHsgXG4gICAgICAgICAgICBtaW46IHtcbiAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAgbWF4OiB7IFxuICAgICAgICAgICAgICAgIHg6IHJlbmRlci5vcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgIHk6IHJlbmRlci5vcHRpb25zLmhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICBFdmVudHMub24ocmVuZGVyLmVuZ2luZSwgJ2JlZm9yZVVwZGF0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgUmVuZGVyUGl4aS5jbGVhcihyZW5kZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjYWNoZXNcbiAgICAgICAgcmVuZGVyLnRleHR1cmVzID0ge307XG4gICAgICAgIHJlbmRlci5zcHJpdGVzID0ge307XG4gICAgICAgIHJlbmRlci5wcmltaXRpdmVzID0ge307XG5cbiAgICAgICAgLy8gdXNlIGEgc3ByaXRlIGJhdGNoIGZvciBwZXJmb3JtYW5jZVxuICAgICAgICByZW5kZXIuY29udGFpbmVyLmFkZENoaWxkKHJlbmRlci5zcHJpdGVDb250YWluZXIpO1xuXG4gICAgICAgIC8vIGluc2VydCBjYW52YXNcbiAgICAgICAgaWYgKENvbW1vbi5pc0VsZW1lbnQocmVuZGVyLmVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZW5kZXIuZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXIuY2FudmFzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIENvbW1vbi53YXJuKCdObyBcInJlbmRlci5lbGVtZW50XCIgcGFzc2VkLCBcInJlbmRlci5jYW52YXNcIiB3YXMgbm90IGluc2VydGVkIGludG8gZG9jdW1lbnQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcmV2ZW50IG1lbnVzIG9uIGNhbnZhc1xuICAgICAgICByZW5kZXIuY2FudmFzLm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuICAgICAgICByZW5kZXIuY2FudmFzLm9uc2VsZWN0c3RhcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuXG4gICAgICAgIHJldHVybiByZW5kZXI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnRpbnVvdXNseSB1cGRhdGVzIHRoZSByZW5kZXIgY2FudmFzIG9uIHRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBldmVudC5cbiAgICAgKiBAbWV0aG9kIHJ1blxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIFJlbmRlclBpeGkucnVuID0gZnVuY3Rpb24ocmVuZGVyKSB7XG4gICAgICAgIChmdW5jdGlvbiBsb29wKHRpbWUpe1xuICAgICAgICAgICAgcmVuZGVyLmZyYW1lUmVxdWVzdElkID0gX3JlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICAgICAgICAgIFJlbmRlclBpeGkud29ybGQocmVuZGVyKTtcbiAgICAgICAgfSkoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW5kcyBleGVjdXRpb24gb2YgYFJlbmRlci5ydW5gIG9uIHRoZSBnaXZlbiBgcmVuZGVyYCwgYnkgY2FuY2VsaW5nIHRoZSBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCBldmVudCBsb29wLlxuICAgICAqIEBtZXRob2Qgc3RvcFxuICAgICAqIEBwYXJhbSB7cmVuZGVyfSByZW5kZXJcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIFJlbmRlclBpeGkuc3RvcCA9IGZ1bmN0aW9uKHJlbmRlcikge1xuICAgICAgICBfY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVuZGVyLmZyYW1lUmVxdWVzdElkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIHRoZSBzY2VuZSBncmFwaFxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcGFyYW0ge1JlbmRlclBpeGl9IHJlbmRlclxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgUmVuZGVyUGl4aS5jbGVhciA9IGZ1bmN0aW9uKHJlbmRlcikge1xuICAgICAgICB2YXIgY29udGFpbmVyID0gcmVuZGVyLmNvbnRhaW5lcixcbiAgICAgICAgICAgIHNwcml0ZUNvbnRhaW5lciA9IHJlbmRlci5zcHJpdGVDb250YWluZXI7XG5cbiAgICAgICAgLy8gY2xlYXIgc3RhZ2UgY29udGFpbmVyXG4gICAgICAgIHdoaWxlIChjb250YWluZXIuY2hpbGRyZW5bMF0pIHsgXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmNoaWxkcmVuWzBdKTsgXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhciBzcHJpdGUgYmF0Y2hcbiAgICAgICAgd2hpbGUgKHNwcml0ZUNvbnRhaW5lci5jaGlsZHJlblswXSkgeyBcbiAgICAgICAgICAgIHNwcml0ZUNvbnRhaW5lci5yZW1vdmVDaGlsZChzcHJpdGVDb250YWluZXIuY2hpbGRyZW5bMF0pOyBcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiZ1Nwcml0ZSA9IHJlbmRlci5zcHJpdGVzWydiZy0wJ107XG5cbiAgICAgICAgLy8gY2xlYXIgY2FjaGVzXG4gICAgICAgIHJlbmRlci50ZXh0dXJlcyA9IHt9O1xuICAgICAgICByZW5kZXIuc3ByaXRlcyA9IHt9O1xuICAgICAgICByZW5kZXIucHJpbWl0aXZlcyA9IHt9O1xuXG4gICAgICAgIC8vIHNldCBiYWNrZ3JvdW5kIHNwcml0ZVxuICAgICAgICByZW5kZXIuc3ByaXRlc1snYmctMCddID0gYmdTcHJpdGU7XG4gICAgICAgIGlmIChiZ1Nwcml0ZSlcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGRDaGlsZEF0KGJnU3ByaXRlLCAwKTtcblxuICAgICAgICAvLyBhZGQgc3ByaXRlIGJhdGNoIGJhY2sgaW50byBjb250YWluZXJcbiAgICAgICAgcmVuZGVyLmNvbnRhaW5lci5hZGRDaGlsZChyZW5kZXIuc3ByaXRlQ29udGFpbmVyKTtcblxuICAgICAgICAvLyByZXNldCBiYWNrZ3JvdW5kIHN0YXRlXG4gICAgICAgIHJlbmRlci5jdXJyZW50QmFja2dyb3VuZCA9IG51bGw7XG5cbiAgICAgICAgLy8gcmVzZXQgYm91bmRzIHRyYW5zZm9ybXNcbiAgICAgICAgY29udGFpbmVyLnNjYWxlLnNldCgxLCAxKTtcbiAgICAgICAgY29udGFpbmVyLnBvc2l0aW9uLnNldCgwLCAwKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYmFja2dyb3VuZCBvZiB0aGUgY2FudmFzIFxuICAgICAqIEBtZXRob2Qgc2V0QmFja2dyb3VuZFxuICAgICAqIEBwYXJhbSB7UmVuZGVyUGl4aX0gcmVuZGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJhY2tncm91bmRcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIFJlbmRlclBpeGkuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uKHJlbmRlciwgYmFja2dyb3VuZCkge1xuICAgICAgICBpZiAocmVuZGVyLmN1cnJlbnRCYWNrZ3JvdW5kICE9PSBiYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICB2YXIgaXNDb2xvciA9IGJhY2tncm91bmQuaW5kZXhPZiAmJiBiYWNrZ3JvdW5kLmluZGV4T2YoJyMnKSAhPT0gLTEsXG4gICAgICAgICAgICAgICAgYmdTcHJpdGUgPSByZW5kZXIuc3ByaXRlc1snYmctMCddO1xuXG4gICAgICAgICAgICBpZiAoaXNDb2xvcikge1xuICAgICAgICAgICAgICAgIC8vIGlmIHNvbGlkIGJhY2tncm91bmQgY29sb3JcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSBDb21tb24uY29sb3JUb051bWJlcihiYWNrZ3JvdW5kKTtcbiAgICAgICAgICAgICAgICByZW5kZXIucmVuZGVyZXIuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYmFja2dyb3VuZCBzcHJpdGUgaWYgZXhpc3RpbmdcbiAgICAgICAgICAgICAgICBpZiAoYmdTcHJpdGUpXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlci5jb250YWluZXIucmVtb3ZlQ2hpbGQoYmdTcHJpdGUpOyBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGlzZSBiYWNrZ3JvdW5kIHNwcml0ZSBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICBpZiAoIWJnU3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZXh0dXJlID0gX2dldFRleHR1cmUocmVuZGVyLCBiYWNrZ3JvdW5kKTtcblxuICAgICAgICAgICAgICAgICAgICBiZ1Nwcml0ZSA9IHJlbmRlci5zcHJpdGVzWydiZy0wJ10gPSBuZXcgUElYSS5TcHJpdGUodGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIGJnU3ByaXRlLnBvc2l0aW9uLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICBiZ1Nwcml0ZS5wb3NpdGlvbi55ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyLmNvbnRhaW5lci5hZGRDaGlsZEF0KGJnU3ByaXRlLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlci5jdXJyZW50QmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVzY3JpcHRpb25cbiAgICAgKiBAbWV0aG9kIHdvcmxkXG4gICAgICogQHBhcmFtIHtlbmdpbmV9IGVuZ2luZVxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgUmVuZGVyUGl4aS53b3JsZCA9IGZ1bmN0aW9uKHJlbmRlcikge1xuICAgICAgICB2YXIgZW5naW5lID0gcmVuZGVyLmVuZ2luZSxcbiAgICAgICAgICAgIHdvcmxkID0gZW5naW5lLndvcmxkLFxuICAgICAgICAgICAgcmVuZGVyZXIgPSByZW5kZXIucmVuZGVyZXIsXG4gICAgICAgICAgICBjb250YWluZXIgPSByZW5kZXIuY29udGFpbmVyLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHJlbmRlci5vcHRpb25zLFxuICAgICAgICAgICAgYm9kaWVzID0gQ29tcG9zaXRlLmFsbEJvZGllcyh3b3JsZCksXG4gICAgICAgICAgICBhbGxDb25zdHJhaW50cyA9IENvbXBvc2l0ZS5hbGxDb25zdHJhaW50cyh3b3JsZCksXG4gICAgICAgICAgICBjb25zdHJhaW50cyA9IFtdLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBpZiAob3B0aW9ucy53aXJlZnJhbWVzKSB7XG4gICAgICAgICAgICBSZW5kZXJQaXhpLnNldEJhY2tncm91bmQocmVuZGVyLCBvcHRpb25zLndpcmVmcmFtZUJhY2tncm91bmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUmVuZGVyUGl4aS5zZXRCYWNrZ3JvdW5kKHJlbmRlciwgb3B0aW9ucy5iYWNrZ3JvdW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSBib3VuZHNcbiAgICAgICAgdmFyIGJvdW5kc1dpZHRoID0gcmVuZGVyLmJvdW5kcy5tYXgueCAtIHJlbmRlci5ib3VuZHMubWluLngsXG4gICAgICAgICAgICBib3VuZHNIZWlnaHQgPSByZW5kZXIuYm91bmRzLm1heC55IC0gcmVuZGVyLmJvdW5kcy5taW4ueSxcbiAgICAgICAgICAgIGJvdW5kc1NjYWxlWCA9IGJvdW5kc1dpZHRoIC8gcmVuZGVyLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBib3VuZHNTY2FsZVkgPSBib3VuZHNIZWlnaHQgLyByZW5kZXIub3B0aW9ucy5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaGFzQm91bmRzKSB7XG4gICAgICAgICAgICAvLyBIaWRlIGJvZGllcyB0aGF0IGFyZSBub3QgaW4gdmlld1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBib2R5ID0gYm9kaWVzW2ldO1xuICAgICAgICAgICAgICAgIGJvZHkucmVuZGVyLnNwcml0ZS52aXNpYmxlID0gQm91bmRzLm92ZXJsYXBzKGJvZHkuYm91bmRzLCByZW5kZXIuYm91bmRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmlsdGVyIG91dCBjb25zdHJhaW50cyB0aGF0IGFyZSBub3QgaW4gdmlld1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFsbENvbnN0cmFpbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnN0cmFpbnQgPSBhbGxDb25zdHJhaW50c1tpXSxcbiAgICAgICAgICAgICAgICAgICAgYm9keUEgPSBjb25zdHJhaW50LmJvZHlBLFxuICAgICAgICAgICAgICAgICAgICBib2R5QiA9IGNvbnN0cmFpbnQuYm9keUIsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50QVdvcmxkID0gY29uc3RyYWludC5wb2ludEEsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50QldvcmxkID0gY29uc3RyYWludC5wb2ludEI7XG5cbiAgICAgICAgICAgICAgICBpZiAoYm9keUEpIHBvaW50QVdvcmxkID0gVmVjdG9yLmFkZChib2R5QS5wb3NpdGlvbiwgY29uc3RyYWludC5wb2ludEEpO1xuICAgICAgICAgICAgICAgIGlmIChib2R5QikgcG9pbnRCV29ybGQgPSBWZWN0b3IuYWRkKGJvZHlCLnBvc2l0aW9uLCBjb25zdHJhaW50LnBvaW50Qik7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXBvaW50QVdvcmxkIHx8ICFwb2ludEJXb3JsZClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoQm91bmRzLmNvbnRhaW5zKHJlbmRlci5ib3VuZHMsIHBvaW50QVdvcmxkKSB8fCBCb3VuZHMuY29udGFpbnMocmVuZGVyLmJvdW5kcywgcG9pbnRCV29ybGQpKVxuICAgICAgICAgICAgICAgICAgICBjb25zdHJhaW50cy5wdXNoKGNvbnN0cmFpbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmFuc2Zvcm0gdGhlIHZpZXdcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY2FsZS5zZXQoMSAvIGJvdW5kc1NjYWxlWCwgMSAvIGJvdW5kc1NjYWxlWSk7XG4gICAgICAgICAgICBjb250YWluZXIucG9zaXRpb24uc2V0KC1yZW5kZXIuYm91bmRzLm1pbi54ICogKDEgLyBib3VuZHNTY2FsZVgpLCAtcmVuZGVyLmJvdW5kcy5taW4ueSAqICgxIC8gYm91bmRzU2NhbGVZKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdHJhaW50cyA9IGFsbENvbnN0cmFpbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIFJlbmRlclBpeGkuYm9keShyZW5kZXIsIGJvZGllc1tpXSk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbnN0cmFpbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgUmVuZGVyUGl4aS5jb25zdHJhaW50KHJlbmRlciwgY29uc3RyYWludHNbaV0pO1xuXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihjb250YWluZXIpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIERlc2NyaXB0aW9uXG4gICAgICogQG1ldGhvZCBjb25zdHJhaW50XG4gICAgICogQHBhcmFtIHtlbmdpbmV9IGVuZ2luZVxuICAgICAqIEBwYXJhbSB7Y29uc3RyYWludH0gY29uc3RyYWludFxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgUmVuZGVyUGl4aS5jb25zdHJhaW50ID0gZnVuY3Rpb24ocmVuZGVyLCBjb25zdHJhaW50KSB7XG4gICAgICAgIHZhciBlbmdpbmUgPSByZW5kZXIuZW5naW5lLFxuICAgICAgICAgICAgYm9keUEgPSBjb25zdHJhaW50LmJvZHlBLFxuICAgICAgICAgICAgYm9keUIgPSBjb25zdHJhaW50LmJvZHlCLFxuICAgICAgICAgICAgcG9pbnRBID0gY29uc3RyYWludC5wb2ludEEsXG4gICAgICAgICAgICBwb2ludEIgPSBjb25zdHJhaW50LnBvaW50QixcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IHJlbmRlci5jb250YWluZXIsXG4gICAgICAgICAgICBjb25zdHJhaW50UmVuZGVyID0gY29uc3RyYWludC5yZW5kZXIsXG4gICAgICAgICAgICBwcmltaXRpdmVJZCA9ICdjLScgKyBjb25zdHJhaW50LmlkLFxuICAgICAgICAgICAgcHJpbWl0aXZlID0gcmVuZGVyLnByaW1pdGl2ZXNbcHJpbWl0aXZlSWRdO1xuXG4gICAgICAgIC8vIGluaXRpYWxpc2UgY29uc3RyYWludCBwcmltaXRpdmUgaWYgbm90IGV4aXN0aW5nXG4gICAgICAgIGlmICghcHJpbWl0aXZlKVxuICAgICAgICAgICAgcHJpbWl0aXZlID0gcmVuZGVyLnByaW1pdGl2ZXNbcHJpbWl0aXZlSWRdID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblxuICAgICAgICAvLyBkb24ndCByZW5kZXIgaWYgY29uc3RyYWludCBkb2VzIG5vdCBoYXZlIHR3byBlbmQgcG9pbnRzXG4gICAgICAgIGlmICghY29uc3RyYWludFJlbmRlci52aXNpYmxlIHx8ICFjb25zdHJhaW50LnBvaW50QSB8fCAhY29uc3RyYWludC5wb2ludEIpIHtcbiAgICAgICAgICAgIHByaW1pdGl2ZS5jbGVhcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRvIHNjZW5lIGdyYXBoIGlmIG5vdCBhbHJlYWR5IHRoZXJlXG4gICAgICAgIGlmIChDb21tb24uaW5kZXhPZihjb250YWluZXIuY2hpbGRyZW4sIHByaW1pdGl2ZSkgPT09IC0xKVxuICAgICAgICAgICAgY29udGFpbmVyLmFkZENoaWxkKHByaW1pdGl2ZSk7XG5cbiAgICAgICAgLy8gcmVuZGVyIHRoZSBjb25zdHJhaW50IG9uIGV2ZXJ5IHVwZGF0ZSwgc2luY2UgdGhleSBjYW4gY2hhbmdlIGR5bmFtaWNhbGx5XG4gICAgICAgIHByaW1pdGl2ZS5jbGVhcigpO1xuICAgICAgICBwcmltaXRpdmUuYmVnaW5GaWxsKDAsIDApO1xuICAgICAgICBwcmltaXRpdmUubGluZVN0eWxlKGNvbnN0cmFpbnRSZW5kZXIubGluZVdpZHRoLCBDb21tb24uY29sb3JUb051bWJlcihjb25zdHJhaW50UmVuZGVyLnN0cm9rZVN0eWxlKSwgMSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYm9keUEpIHtcbiAgICAgICAgICAgIHByaW1pdGl2ZS5tb3ZlVG8oYm9keUEucG9zaXRpb24ueCArIHBvaW50QS54LCBib2R5QS5wb3NpdGlvbi55ICsgcG9pbnRBLnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJpbWl0aXZlLm1vdmVUbyhwb2ludEEueCwgcG9pbnRBLnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHlCKSB7XG4gICAgICAgICAgICBwcmltaXRpdmUubGluZVRvKGJvZHlCLnBvc2l0aW9uLnggKyBwb2ludEIueCwgYm9keUIucG9zaXRpb24ueSArIHBvaW50Qi55KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByaW1pdGl2ZS5saW5lVG8ocG9pbnRCLngsIHBvaW50Qi55KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaW1pdGl2ZS5lbmRGaWxsKCk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBEZXNjcmlwdGlvblxuICAgICAqIEBtZXRob2QgYm9keVxuICAgICAqIEBwYXJhbSB7ZW5naW5lfSBlbmdpbmVcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIFJlbmRlclBpeGkuYm9keSA9IGZ1bmN0aW9uKHJlbmRlciwgYm9keSkge1xuICAgICAgICB2YXIgZW5naW5lID0gcmVuZGVyLmVuZ2luZSxcbiAgICAgICAgICAgIGJvZHlSZW5kZXIgPSBib2R5LnJlbmRlcjtcblxuICAgICAgICBpZiAoIWJvZHlSZW5kZXIudmlzaWJsZSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAoYm9keVJlbmRlci5zcHJpdGUgJiYgYm9keVJlbmRlci5zcHJpdGUudGV4dHVyZSkge1xuICAgICAgICAgICAgdmFyIHNwcml0ZUlkID0gJ2ItJyArIGJvZHkuaWQsXG4gICAgICAgICAgICAgICAgc3ByaXRlID0gcmVuZGVyLnNwcml0ZXNbc3ByaXRlSWRdLFxuICAgICAgICAgICAgICAgIHNwcml0ZUNvbnRhaW5lciA9IHJlbmRlci5zcHJpdGVDb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWxpc2UgYm9keSBzcHJpdGUgaWYgbm90IGV4aXN0aW5nXG4gICAgICAgICAgICBpZiAoIXNwcml0ZSlcbiAgICAgICAgICAgICAgICBzcHJpdGUgPSByZW5kZXIuc3ByaXRlc1tzcHJpdGVJZF0gPSBfY3JlYXRlQm9keVNwcml0ZShyZW5kZXIsIGJvZHkpO1xuXG4gICAgICAgICAgICAvLyBhZGQgdG8gc2NlbmUgZ3JhcGggaWYgbm90IGFscmVhZHkgdGhlcmVcbiAgICAgICAgICAgIGlmIChDb21tb24uaW5kZXhPZihzcHJpdGVDb250YWluZXIuY2hpbGRyZW4sIHNwcml0ZSkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHNwcml0ZUNvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYm9keSBzcHJpdGVcbiAgICAgICAgICAgIHNwcml0ZS5wb3NpdGlvbi54ID0gYm9keS5wb3NpdGlvbi54O1xuICAgICAgICAgICAgc3ByaXRlLnBvc2l0aW9uLnkgPSBib2R5LnBvc2l0aW9uLnk7XG4gICAgICAgICAgICBzcHJpdGUucm90YXRpb24gPSBib2R5LmFuZ2xlO1xuICAgICAgICAgICAgc3ByaXRlLnNjYWxlLnggPSBib2R5UmVuZGVyLnNwcml0ZS54U2NhbGUgfHwgMTtcbiAgICAgICAgICAgIHNwcml0ZS5zY2FsZS55ID0gYm9keVJlbmRlci5zcHJpdGUueVNjYWxlIHx8IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJpbWl0aXZlSWQgPSAnYi0nICsgYm9keS5pZCxcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUgPSByZW5kZXIucHJpbWl0aXZlc1twcmltaXRpdmVJZF0sXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gcmVuZGVyLmNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbGlzZSBib2R5IHByaW1pdGl2ZSBpZiBub3QgZXhpc3RpbmdcbiAgICAgICAgICAgIGlmICghcHJpbWl0aXZlKSB7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlID0gcmVuZGVyLnByaW1pdGl2ZXNbcHJpbWl0aXZlSWRdID0gX2NyZWF0ZUJvZHlQcmltaXRpdmUocmVuZGVyLCBib2R5KTtcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuaW5pdGlhbEFuZ2xlID0gYm9keS5hbmdsZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWRkIHRvIHNjZW5lIGdyYXBoIGlmIG5vdCBhbHJlYWR5IHRoZXJlXG4gICAgICAgICAgICBpZiAoQ29tbW9uLmluZGV4T2YoY29udGFpbmVyLmNoaWxkcmVuLCBwcmltaXRpdmUpID09PSAtMSlcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYWRkQ2hpbGQocHJpbWl0aXZlKTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIGJvZHkgcHJpbWl0aXZlXG4gICAgICAgICAgICBwcmltaXRpdmUucG9zaXRpb24ueCA9IGJvZHkucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHByaW1pdGl2ZS5wb3NpdGlvbi55ID0gYm9keS5wb3NpdGlvbi55O1xuICAgICAgICAgICAgcHJpbWl0aXZlLnJvdGF0aW9uID0gYm9keS5hbmdsZSAtIHByaW1pdGl2ZS5pbml0aWFsQW5nbGU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJvZHkgc3ByaXRlXG4gICAgICogQG1ldGhvZCBfY3JlYXRlQm9keVNwcml0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtSZW5kZXJQaXhpfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcmV0dXJuIHtQSVhJLlNwcml0ZX0gc3ByaXRlXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICB2YXIgX2NyZWF0ZUJvZHlTcHJpdGUgPSBmdW5jdGlvbihyZW5kZXIsIGJvZHkpIHtcbiAgICAgICAgdmFyIGJvZHlSZW5kZXIgPSBib2R5LnJlbmRlcixcbiAgICAgICAgICAgIHRleHR1cmVQYXRoID0gYm9keVJlbmRlci5zcHJpdGUudGV4dHVyZSxcbiAgICAgICAgICAgIHRleHR1cmUgPSBfZ2V0VGV4dHVyZShyZW5kZXIsIHRleHR1cmVQYXRoKSxcbiAgICAgICAgICAgIHNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSh0ZXh0dXJlKTtcblxuICAgICAgICBzcHJpdGUuYW5jaG9yLnggPSBib2R5LnJlbmRlci5zcHJpdGUueE9mZnNldDtcbiAgICAgICAgc3ByaXRlLmFuY2hvci55ID0gYm9keS5yZW5kZXIuc3ByaXRlLnlPZmZzZXQ7XG5cbiAgICAgICAgcmV0dXJuIHNwcml0ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJvZHkgcHJpbWl0aXZlXG4gICAgICogQG1ldGhvZCBfY3JlYXRlQm9keVByaW1pdGl2ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtSZW5kZXJQaXhpfSByZW5kZXJcbiAgICAgKiBAcGFyYW0ge2JvZHl9IGJvZHlcbiAgICAgKiBAcmV0dXJuIHtQSVhJLkdyYXBoaWNzfSBncmFwaGljc1xuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgdmFyIF9jcmVhdGVCb2R5UHJpbWl0aXZlID0gZnVuY3Rpb24ocmVuZGVyLCBib2R5KSB7XG4gICAgICAgIHZhciBib2R5UmVuZGVyID0gYm9keS5yZW5kZXIsXG4gICAgICAgICAgICBvcHRpb25zID0gcmVuZGVyLm9wdGlvbnMsXG4gICAgICAgICAgICBwcmltaXRpdmUgPSBuZXcgUElYSS5HcmFwaGljcygpLFxuICAgICAgICAgICAgZmlsbFN0eWxlID0gQ29tbW9uLmNvbG9yVG9OdW1iZXIoYm9keVJlbmRlci5maWxsU3R5bGUpLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGUgPSBDb21tb24uY29sb3JUb051bWJlcihib2R5UmVuZGVyLnN0cm9rZVN0eWxlKSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlSW5kaWNhdG9yID0gQ29tbW9uLmNvbG9yVG9OdW1iZXIoYm9keVJlbmRlci5zdHJva2VTdHlsZSksXG4gICAgICAgICAgICBzdHJva2VTdHlsZVdpcmVmcmFtZSA9IENvbW1vbi5jb2xvclRvTnVtYmVyKCcjYmJiJyksXG4gICAgICAgICAgICBzdHJva2VTdHlsZVdpcmVmcmFtZUluZGljYXRvciA9IENvbW1vbi5jb2xvclRvTnVtYmVyKCcjQ0Q1QzVDJyksXG4gICAgICAgICAgICBwYXJ0O1xuXG4gICAgICAgIHByaW1pdGl2ZS5jbGVhcigpO1xuXG4gICAgICAgIC8vIGhhbmRsZSBjb21wb3VuZCBwYXJ0c1xuICAgICAgICBmb3IgKHZhciBrID0gYm9keS5wYXJ0cy5sZW5ndGggPiAxID8gMSA6IDA7IGsgPCBib2R5LnBhcnRzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBwYXJ0ID0gYm9keS5wYXJ0c1trXTtcblxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuYmVnaW5GaWxsKGZpbGxTdHlsZSwgMSk7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmxpbmVTdHlsZShib2R5UmVuZGVyLmxpbmVXaWR0aCwgc3Ryb2tlU3R5bGUsIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuYmVnaW5GaWxsKDAsIDApO1xuICAgICAgICAgICAgICAgIHByaW1pdGl2ZS5saW5lU3R5bGUoMSwgc3Ryb2tlU3R5bGVXaXJlZnJhbWUsIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcmltaXRpdmUubW92ZVRvKHBhcnQudmVydGljZXNbMF0ueCAtIGJvZHkucG9zaXRpb24ueCwgcGFydC52ZXJ0aWNlc1swXS55IC0gYm9keS5wb3NpdGlvbi55KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBwYXJ0LnZlcnRpY2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmxpbmVUbyhwYXJ0LnZlcnRpY2VzW2pdLnggLSBib2R5LnBvc2l0aW9uLngsIHBhcnQudmVydGljZXNbal0ueSAtIGJvZHkucG9zaXRpb24ueSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByaW1pdGl2ZS5saW5lVG8ocGFydC52ZXJ0aWNlc1swXS54IC0gYm9keS5wb3NpdGlvbi54LCBwYXJ0LnZlcnRpY2VzWzBdLnkgLSBib2R5LnBvc2l0aW9uLnkpO1xuXG4gICAgICAgICAgICBwcmltaXRpdmUuZW5kRmlsbCgpO1xuXG4gICAgICAgICAgICAvLyBhbmdsZSBpbmRpY2F0b3JcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNob3dBbmdsZUluZGljYXRvciB8fCBvcHRpb25zLnNob3dBeGVzKSB7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmJlZ2luRmlsbCgwLCAwKTtcblxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLndpcmVmcmFtZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlLmxpbmVTdHlsZSgxLCBzdHJva2VTdHlsZVdpcmVmcmFtZUluZGljYXRvciwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlLmxpbmVTdHlsZSgxLCBzdHJva2VTdHlsZUluZGljYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLm1vdmVUbyhwYXJ0LnBvc2l0aW9uLnggLSBib2R5LnBvc2l0aW9uLngsIHBhcnQucG9zaXRpb24ueSAtIGJvZHkucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmxpbmVUbygoKHBhcnQudmVydGljZXNbMF0ueCArIHBhcnQudmVydGljZXNbcGFydC52ZXJ0aWNlcy5sZW5ndGgtMV0ueCkgLyAyIC0gYm9keS5wb3NpdGlvbi54KSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKHBhcnQudmVydGljZXNbMF0ueSArIHBhcnQudmVydGljZXNbcGFydC52ZXJ0aWNlcy5sZW5ndGgtMV0ueSkgLyAyIC0gYm9keS5wb3NpdGlvbi55KSk7XG5cbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuZW5kRmlsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgcmVxdWVzdGVkIHRleHR1cmUgKGEgUElYSS5UZXh0dXJlKSB2aWEgaXRzIHBhdGhcbiAgICAgKiBAbWV0aG9kIF9nZXRUZXh0dXJlXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge1JlbmRlclBpeGl9IHJlbmRlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZVBhdGhcbiAgICAgKiBAcmV0dXJuIHtQSVhJLlRleHR1cmV9IHRleHR1cmVcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIHZhciBfZ2V0VGV4dHVyZSA9IGZ1bmN0aW9uKHJlbmRlciwgaW1hZ2VQYXRoKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gcmVuZGVyLnRleHR1cmVzW2ltYWdlUGF0aF07XG5cbiAgICAgICAgaWYgKCF0ZXh0dXJlKVxuICAgICAgICAgICAgdGV4dHVyZSA9IHJlbmRlci50ZXh0dXJlc1tpbWFnZVBhdGhdID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShpbWFnZVBhdGgpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH07XG5cbn0pKCk7XG5cbn0se1wiLi4vYm9keS9Db21wb3NpdGVcIjoyLFwiLi4vY29yZS9Db21tb25cIjoxNCxcIi4uL2NvcmUvRXZlbnRzXCI6MTYsXCIuLi9nZW9tZXRyeS9Cb3VuZHNcIjoyNixcIi4uL2dlb21ldHJ5L1ZlY3RvclwiOjI4fV19LHt9LFszMF0pKDMwKVxufSk7IiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVmljdG9yO1xuXG4vKipcbiAqICMgVmljdG9yIC0gQSBKYXZhU2NyaXB0IDJEIHZlY3RvciBjbGFzcyB3aXRoIG1ldGhvZHMgZm9yIGNvbW1vbiB2ZWN0b3Igb3BlcmF0aW9uc1xuICovXG5cbi8qKlxuICogQ29uc3RydWN0b3IuIFdpbGwgYWxzbyB3b3JrIHdpdGhvdXQgdGhlIGBuZXdgIGtleXdvcmRcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gVmljdG9yKDQyLCAxMzM3KTtcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBWYWx1ZSBvZiB0aGUgeCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0geSBWYWx1ZSBvZiB0aGUgeSBheGlzXG4gKiBAcmV0dXJuIHtWaWN0b3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBWaWN0b3IgKHgsIHkpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFZpY3RvcikpIHtcblx0XHRyZXR1cm4gbmV3IFZpY3Rvcih4LCB5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgWCBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLng7XG5cdCAqICAgICAvLyA9PiA0MlxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy54ID0geCB8fCAwO1xuXG5cdC8qKlxuXHQgKiBUaGUgWSBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLnk7XG5cdCAqICAgICAvLyA9PiAyMVxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy55ID0geSB8fCAwO1xufTtcblxuLyoqXG4gKiAjIFN0YXRpY1xuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBmcm9tIGFuIGFycmF5XG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBWaWN0b3IuZnJvbUFycmF5KFs0MiwgMjFdKTtcbiAqXG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo0MiwgeToyMVxuICpcbiAqIEBuYW1lIFZpY3Rvci5mcm9tQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IHdpdGggdGhlIHggYW5kIHkgdmFsdWVzIGF0IGluZGV4IDAgYW5kIDEgcmVzcGVjdGl2ZWx5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IFRoZSBuZXcgaW5zdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKGFyclswXSB8fCAwLCBhcnJbMV0gfHwgMCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IFZpY3Rvci5mcm9tT2JqZWN0KHsgeDogNDIsIHk6IDIxIH0pO1xuICpcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjQyLCB5OjIxXG4gKlxuICogQG5hbWUgVmljdG9yLmZyb21PYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogT2JqZWN0IHdpdGggdGhlIHZhbHVlcyBmb3IgeCBhbmQgeVxuICogQHJldHVybiB7VmljdG9yfSBUaGUgbmV3IGluc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IuZnJvbU9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0cmV0dXJuIG5ldyBWaWN0b3Iob2JqLnggfHwgMCwgb2JqLnkgfHwgMCk7XG59O1xuXG4vKipcbiAqICMgTWFuaXB1bGF0aW9uXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGFyZSBjaGFpbmFibGUuXG4gKi9cblxuLyoqXG4gKiBBZGRzIGFub3RoZXIgdmVjdG9yJ3MgWCBheGlzIHRvIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLmFkZFgodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6MTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCArPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW5vdGhlciB2ZWN0b3IncyBZIGF4aXMgdG8gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuYWRkWSh2ZWMyKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeTo0MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCB0byBhZGQgdG8gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkWSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy55ICs9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbm90aGVyIHZlY3RvciB0byB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5hZGQodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6NDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54ICs9IHZlYy54O1xuXHR0aGlzLnkgKz0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gYm90aCB2ZWN0b3IgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAzLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCArPSBzY2FsYXI7XG5cdHRoaXMueSArPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhclgoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMywgeTogMlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54ICs9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGdpdmVuIHNjYWxhciB0byB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEsIDIpO1xuICpcbiAqICAgICB2ZWMuYWRkU2NhbGFyWSgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAxLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgKz0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBYIGF4aXMgb2YgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3RYKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjgwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggLT0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIFkgYXhpcyBvZiBhbm90aGVyIHZlY3RvciBmcm9tIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5zdWJ0cmFjdFkodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjIwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RZID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3QodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6ODAsIHk6MjBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgc3VidHJhY3QgZnJvbSB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54IC09IHZlYy54O1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHNjYWxhciBmcm9tIGJvdGggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhcigyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogODAsIHk6IDE4MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBzdWJ0cmFjdFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdFNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54IC09IHNjYWxhcjtcblx0dGhpcy55IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgZ2l2ZW4gc2NhbGFyIGZyb20gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhclgoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDgwLCB5OiAyMDBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBnaXZlbiBzY2FsYXIgZnJvbSB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMjAwKTtcbiAqXG4gKiAgICAgdmVjLnN1YnRyYWN0U2NhbGFyWSgyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMTAwLCB5OiAxODBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSB4IGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlWCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVYID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggLz0gdmVjdG9yLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIHRoZSBZIGF4aXMgYnkgdGhlIHkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5kaXZpZGVZKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgYSBheGlzIHZhbHVlcyBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6MjVcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54IC89IHZlY3Rvci54O1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhciB2YWx1ZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZVNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdFx0dGhpcy55IC89IHNjYWxhcjtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnggPSAwO1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJYKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gVGhlIHNjYWxhciB0byBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy54ID0gMDtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJZKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnkgLz0gc2NhbGFyO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFgoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4Oi0xMDAsIHk6NTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFggPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueCAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFkoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTotNTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFkgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueSAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgYm90aCBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuaW52ZXJ0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDotMTAwLCB5Oi01MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmludmVydFgoKTtcblx0dGhpcy5pbnZlcnRZKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgWCBjb21wb25lbnQgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5WCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5WCA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54ICo9IHZlY3Rvci54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IFkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgKj0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdmFsdWVzIGZyb20gYSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHkodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggKj0gdmVjdG9yLng7XG5cdHRoaXMueSAqPSB2ZWN0b3IueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgYm90aCB2ZWN0b3IgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCAqPSBzY2FsYXI7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5U2NhbGFyWCgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVNjYWxhclkoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIGF4aXMgd2l0aFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemVcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0aWYgKGxlbmd0aCA9PT0gMCkge1xuXHRcdHRoaXMueCA9IDE7XG5cdFx0dGhpcy55ID0gMDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmRpdmlkZShWaWN0b3IobGVuZ3RoLCBsZW5ndGgpKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUubm9ybSA9IFZpY3Rvci5wcm90b3R5cGUubm9ybWFsaXplO1xuXG4vKipcbiAqIElmIHRoZSBhYnNvbHV0ZSB2ZWN0b3IgYXhpcyBpcyBncmVhdGVyIHRoYW4gYG1heGAsIG11bHRpcGxpZXMgdGhlIGF4aXMgYnkgYGZhY3RvcmBcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5saW1pdCg4MCwgMC45KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjkwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1heCBUaGUgbWF4aW11bSB2YWx1ZSBmb3IgYm90aCB4IGFuZCB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBmYWN0b3IgRmFjdG9yIGJ5IHdoaWNoIHRoZSBheGlzIGFyZSB0byBiZSBtdWx0aXBsaWVkIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobWF4LCBmYWN0b3IpIHtcblx0aWYgKE1hdGguYWJzKHRoaXMueCkgPiBtYXgpeyB0aGlzLnggKj0gZmFjdG9yOyB9XG5cdGlmIChNYXRoLmFicyh0aGlzLnkpID4gbWF4KXsgdGhpcy55ICo9IGZhY3RvcjsgfVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyBib3RoIHZlY3RvciBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZShuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NjcsIHk6NzNcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR0aGlzLnJhbmRvbWl6ZVgodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21pemVzIHRoZSB5IGF4aXMgd2l0aCBhIHZhbHVlIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplWChuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTUsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZVggPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dmFyIG1pbiA9IE1hdGgubWluKHRvcExlZnQueCwgYm90dG9tUmlnaHQueCk7XG5cdHZhciBtYXggPSBNYXRoLm1heCh0b3BMZWZ0LngsIGJvdHRvbVJpZ2h0LngpO1xuXHR0aGlzLnggPSByYW5kb20obWluLCBtYXgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyB0aGUgeSBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZVkobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo2NlxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplWSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR2YXIgbWluID0gTWF0aC5taW4odG9wTGVmdC55LCBib3R0b21SaWdodC55KTtcblx0dmFyIG1heCA9IE1hdGgubWF4KHRvcExlZnQueSwgYm90dG9tUmlnaHQueSk7XG5cdHRoaXMueSA9IHJhbmRvbShtaW4sIG1heCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21seSByYW5kb21pemVzIGVpdGhlciBheGlzIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplQW55KG5ldyBWaWN0b3IoNTAsIDYwKSwgbmV3IFZpY3Rvcig3MCwgODApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo3N1xuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplQW55ID0gZnVuY3Rpb24gKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XG5cdGlmICghISBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpKSB7XG5cdFx0dGhpcy5yYW5kb21pemVYKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3VuZHMgYm90aCBheGlzIHRvIGFuIGludGVnZXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLjIsIDUwLjkpO1xuICpcbiAqICAgICB2ZWMudW5mbG9hdCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjUxXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS51bmZsb2F0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XG5cdHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdW5kcyBib3RoIGF4aXMgdG8gYSBjZXJ0YWluIHByZWNpc2lvblxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAuMiwgNTAuOSk7XG4gKlxuICogICAgIHZlYy51bmZsb2F0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NTFcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gUHJlY2lzaW9uIChkZWZhdWx0OiA4KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b0ZpeGVkID0gZnVuY3Rpb24gKHByZWNpc2lvbikge1xuXHRpZiAodHlwZW9mIHByZWNpc2lvbiA9PT0gJ3VuZGVmaW5lZCcpIHsgcHJlY2lzaW9uID0gODsgfVxuXHR0aGlzLnggPSB0aGlzLngudG9GaXhlZChwcmVjaXNpb24pO1xuXHR0aGlzLnkgPSB0aGlzLnkudG9GaXhlZChwcmVjaXNpb24pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBYIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhYID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueCA9ICgxIC0gYW1vdW50KSAqIHRoaXMueCArIGFtb3VudCAqIHZlYy54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBZIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WSh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhZID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueSA9ICgxIC0gYW1vdW50KSAqIHRoaXMueSArIGFtb3VudCAqIHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXggPSBmdW5jdGlvbiAodmVjLCBhbW91bnQpIHtcblx0dGhpcy5taXhYKHZlYywgYW1vdW50KTtcblx0dGhpcy5taXhZKHZlYywgYW1vdW50KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqICMgUHJvZHVjdHNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IHZlYzEuY2xvbmUoKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IEEgY2xvbmUgb2YgdGhlIHZlY3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIG5ldyBWaWN0b3IodGhpcy54LCB0aGlzLnkpO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYW5vdGhlciB2ZWN0b3IncyBYIGNvbXBvbmVudCBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5WCh2ZWMxKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmNvcHlYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbm90aGVyIHZlY3RvcidzIFkgY29tcG9uZW50IGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHlZKHZlYzEpO1xuICpcbiAqICAgICB2ZWMyLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeToyMFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY29weVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueSA9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29waWVzIGFub3RoZXIgdmVjdG9yJ3MgWCBhbmQgWSBjb21wb25lbnRzIGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHkodmVjMSk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwLCB5OjIwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLmNvcHlYKHZlYyk7XG5cdHRoaXMuY29weVkodmVjKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZlY3RvciB0byB6ZXJvICgwLDApXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICpcdFx0IHZhcjEuemVybygpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjAsIHk6MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy54ID0gdGhpcy55ID0gMDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZG90KHZlYzIpO1xuICogICAgIC8vID0+IDIzMDAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEb3QgcHJvZHVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiAodmVjMikge1xuXHRyZXR1cm4gdGhpcy54ICogdmVjMi54ICsgdGhpcy55ICogdmVjMi55O1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uICh2ZWMyKSB7XG5cdHJldHVybiAodGhpcy54ICogdmVjMi55ICkgLSAodGhpcy55ICogdmVjMi54ICk7XG59O1xuXG4vKipcbiAqIFByb2plY3RzIGEgdmVjdG9yIG9udG8gYW5vdGhlciB2ZWN0b3IsIHNldHRpbmcgaXRzZWxmIHRvIHRoZSByZXN1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqXG4gKiAgICAgdmVjLnByb2plY3RPbnRvKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gcHJvamVjdCB0aGlzIHZlY3RvciBvbnRvXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnByb2plY3RPbnRvID0gZnVuY3Rpb24gKHZlYzIpIHtcbiAgICB2YXIgY29lZmYgPSAoICh0aGlzLnggKiB2ZWMyLngpKyh0aGlzLnkgKiB2ZWMyLnkpICkgLyAoKHZlYzIueCp2ZWMyLngpKyh2ZWMyLnkqdmVjMi55KSk7XG4gICAgdGhpcy54ID0gY29lZmYgKiB2ZWMyLng7XG4gICAgdGhpcy55ID0gY29lZmYgKiB2ZWMyLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZURlZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHJhZGlhbjJkZWdyZWVzKHRoaXMuaG9yaXpvbnRhbEFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS52ZXJ0aWNhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLngsIHRoaXMueSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnZlcnRpY2FsQW5nbGVEZWcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiByYWRpYW4yZGVncmVlcyh0aGlzLnZlcnRpY2FsQW5nbGUoKSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGU7XG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlRGVnID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGVEZWc7XG5WaWN0b3IucHJvdG90eXBlLmRpcmVjdGlvbiA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlO1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuXHR2YXIgbnggPSAodGhpcy54ICogTWF0aC5jb3MoYW5nbGUpKSAtICh0aGlzLnkgKiBNYXRoLnNpbihhbmdsZSkpO1xuXHR2YXIgbnkgPSAodGhpcy54ICogTWF0aC5zaW4oYW5nbGUpKSArICh0aGlzLnkgKiBNYXRoLmNvcyhhbmdsZSkpO1xuXG5cdHRoaXMueCA9IG54O1xuXHR0aGlzLnkgPSBueTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlRGVnID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cdGFuZ2xlID0gZGVncmVlczJyYWRpYW4oYW5nbGUpO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGUoYW5nbGUpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUbyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJldHVybiB0aGlzLnJvdGF0ZShyb3RhdGlvbi10aGlzLmFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUb0RlZyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVUbyhyb3RhdGlvbik7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5ID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHZhciBhbmdsZSA9IHRoaXMuYW5nbGUoKSArIHJvdGF0aW9uO1xuXG5cdHJldHVybiB0aGlzLnJvdGF0ZShhbmdsZSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5RGVnID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVCeShyb3RhdGlvbik7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIG9mIHRoZSBYIGF4aXMgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWCh2ZWMyKTtcbiAqICAgICAvLyA9PiAtMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiB0aGlzLnggLSB2ZWMueDtcbn07XG5cbi8qKlxuICogU2FtZSBhcyBgZGlzdGFuY2VYKClgIGJ1dCBhbHdheXMgcmV0dXJucyBhbiBhYnNvbHV0ZSBudW1iZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5hYnNEaXN0YW5jZVgodmVjMik7XG4gKiAgICAgLy8gPT4gMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWCh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2Ugb2YgdGhlIFkgYXhpcyBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IC0xMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VZID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gdGhpcy55IC0gdmVjLnk7XG59O1xuXG4vKipcbiAqIFNhbWUgYXMgYGRpc3RhbmNlWSgpYCBidXQgYWx3YXlzIHJldHVybnMgYW4gYWJzb2x1dGUgbnVtYmVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IDEwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWSh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5kaXN0YW5jZSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDAuNDk4NzU2MjExMjA4OVxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVNxKHZlYykpO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VTcSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VTcSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dmFyIGR4ID0gdGhpcy5kaXN0YW5jZVgodmVjKSxcblx0XHRkeSA9IHRoaXMuZGlzdGFuY2VZKHZlYyk7XG5cblx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb3IgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGgoKTtcbiAqICAgICAvLyA9PiAxMTEuODAzMzk4ODc0OTg5NDhcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IExlbmd0aCAvIE1hZ25pdHVkZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcbn07XG5cbi8qKlxuICogU3F1YXJlZCBsZW5ndGggLyBtYWduaXR1ZGVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGhTcSgpO1xuICogICAgIC8vID0+IDEyNTAwXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBMZW5ndGggLyBNYWduaXR1ZGVcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGVuZ3RoU3EgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IFZpY3Rvci5wcm90b3R5cGUubGVuZ3RoO1xuXG4vKipcbiAqIFJldHVybnMgYSB0cnVlIGlmIHZlY3RvciBpcyAoMCwgMClcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmVjLnplcm8oKTtcbiAqXG4gKiAgICAgLy8gPT4gdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHRydWUgaWYgdGhpcyB2ZWN0b3IgaXMgdGhlIHNhbWUgYXMgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZlYzEuaXNFcXVhbFRvKHZlYzIpO1xuICpcbiAqICAgICAvLyA9PiB0cnVlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaXNFcXVhbFRvID0gZnVuY3Rpb24odmVjMikge1xuXHRyZXR1cm4gdGhpcy54ID09PSB2ZWMyLnggJiYgdGhpcy55ID09PSB2ZWMyLnk7XG59O1xuXG4vKipcbiAqICMgVXRpbGl0eSBNZXRob2RzXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIGFuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MjBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gJ3g6JyArIHRoaXMueCArICcsIHk6JyArIHRoaXMueTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b0FycmF5KCk7XG4gKiAgICAgLy8gPT4gWzEwLCAyMF1cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9PYmplY3QoKTtcbiAqICAgICAvLyA9PiB7IHg6IDEwLCB5OiAyMCB9XG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b09iamVjdCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHsgeDogdGhpcy54LCB5OiB0aGlzLnkgfTtcbn07XG5cblxudmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5mdW5jdGlvbiByYW5kb20gKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG59XG5cbmZ1bmN0aW9uIHJhZGlhbjJkZWdyZWVzIChyYWQpIHtcblx0cmV0dXJuIHJhZCAqIGRlZ3JlZXM7XG59XG5cbmZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFuIChkZWcpIHtcblx0cmV0dXJuIGRlZyAvIGRlZ3JlZXM7XG59XG4iXX0=
