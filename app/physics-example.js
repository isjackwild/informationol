//https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation

function handleOrientation(event) {
  var x = event.gamma; // In degree in the range [-90,90]
  var y = event.beta; // In degree in the range [-180,180]
  var z = event.alpha; //??

  //gravity
  document.getElementById("gamma").innerHTML = Math.round(x);
  document.getElementById("beta").innerHTML = Math.round(y);
  document.getElementById("alpha").innerHTML = Math.round(z);
  const scale = 0.02;
  engine.world.gravity.y = y * scale;
  engine.world.gravity.x = x * scale;
  //rotate works, but not that cool
  //game.angle = z * 2 * Math.PI / 360;
}
window.addEventListener('deviceorientation', handleOrientation);
//game objects values
var game = {
  angle: 0, //keeps track of rotations
  width: window.innerWidth, //400, //window.innerWidth-20,//1200,
  height: window.innerHeight, //600, //window.innerHeight-20, //800,
}

// module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Bounds = Matter.Bounds,
  Vertices = Matter.Vertices,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();
var stackA = Composites.stack(0, 0, 7, 4, 0, 0, function(x, y) {
  return Bodies.polygon(x, y, 1 + Math.ceil(Math.random() * 8), 5 + Math.random() * 35, {
    render: {
      restitution: 1,
      fillStyle: randomColor({
        luminosity: 'bright'
      }),
      strokeStyle: 'white'
    }
  });
});
//access stackA elements with:   stackA.bodies[i]   i = 1 through 6x6
var wall = Bodies.rectangle(200, 300, 150, 20, {
  isStatic: true,
  render: {
    fillStyle: '#666',
    strokeStyle: 'white'
  }
});
World.add(engine.world, [stackA, wall]);
var wallSettings = {
  size: 2000,
  isStatic: true,
  render: {
    restitution: 1,
    fillStyle: 'black',
    strokeStyle: 'black'
  }
};
World.add(engine.world, [
  Bodies.rectangle(game.width * 0.5, -wallSettings.size * 0.5, game.width, wallSettings.size, wallSettings), //top
  Bodies.rectangle(game.width * 0.5, game.height + wallSettings.size * 0.5, game.width, wallSettings.size, wallSettings), //bottom
  Bodies.rectangle(-wallSettings.size * 0.5, game.height * 0.5, wallSettings.size, game.height + wallSettings.size, wallSettings), //left
  Bodies.rectangle(game.width + wallSettings.size * 0.5, game.height * 0.5, wallSettings.size, game.height + wallSettings.size, wallSettings) //right
]);

// run the engine
Engine.run(engine);

//render
var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
window.onresize = function(event) {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
};

(function render() {
  var bodies = Composite.allBodies(engine.world);

  window.requestAnimationFrame(render);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //rotate works, but not that cool
/*   ctx.restore();
  ctx.save();
  ctx.translate(game.width * 0.5, game.height * 0.5);
  ctx.rotate(game.angle);
  ctx.translate(-game.width * 0.5, -game.height * 0.5); */

  for (var i = 0; i < bodies.length; i += 1) {
    ctx.beginPath();
    var vertices = bodies[i].vertices;
    //ctx.strokeStyle = bodies[i].render.strokeStyle;
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.fillStyle = bodies[i].render.fillStyle;
    ctx.fill();
  }
})();


  //gets mouse position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };}
//moves the wall block on click
canvas.addEventListener('mousedown', function(evt) {
  Matter.Body.setPosition(wall, getMousePos(canvas, evt))
}, false);