$(document).ready(function(){

  console.log("p5 is loaded");
  var app = {};
  app.fingers = []

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var options = {
    frameEventName: 'animationFrame',
    enableGestures: true
  };

  Leap.loop(options, function(frame){
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
    frame.gestures.forEach(function(gesture){
      if (gesture.type != "swipe") {
        return;
      }

      var startPosition = frame.interactionBox.normalizePoint(gesture.startPosition);
      var endPosition = frame.interactionBox.normalizePoint(gesture.position);

      var startX = ctx.canvas.width*startPosition[0];
      // var startY = ctx.canvas.height*startPosition[0];
      var startY = ctx.canvas.width*(1-startPosition[0]);

      var endX = ctx.canvas.width*endPosition[0];
      var endY = ctx.canvas.width*(1-endPosition[1]);


      //Begin a path
      ctx.beginPath();
      //move to position (startX, startY);
      ctx.moveTo(startX, startY);
      //Create a line to position (endX, endY);
      ctx.lineTo(endX, endY);
      //The stroke() method actually draws the path you have defined with all those moveTo() and lineTo() methods. The default color is black.
      ctx.stroke();
    })

  })

  // Leap.loop({frameEventName: 'animationFrame'}, function(frame){
  //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   frame.pointables.forEach(function(pointable){
  //     var position = pointable.stabilizedTipPosition;
  //     var normalized = frame.interactionBox.normalizePoint(position);
  //     var x = normalized[0]*ctx.canvas.width;
  //     var y = (1-normalized[1])*ctx.canvas.height;
  //     ctx.beginPath();
  //     ctx.rect(x, y, 20, 20);
  //     ctx.fill();
  //   })
  // });//2D canvas drawing loop
})

//
// Leap.loop(function(frame){
//
//   if(frame.pointables.length > 0){
//      //Get a pointable and normalize the tip position
//      // var pointable = frame.pointables[1];
//      app.pinch = frame.hands[0].pinchStrength;
//
//      for (var i = 0; i < frame.pointables.length; i++) {
//        var position = frame.pointables[i].tipPosition
//        var interactionBox = frame.interactionBox;
//        var normalizedPosition = interactionBox.normalizePoint(position, true);
//        app.fingers[i] = {
//          x: normalizedPosition[0],
//          y: normalizedPosition[1],
//          z: normalizedPosition[2],
//          extended: frame.hands[0].fingers[i].extended
//        };
//      }
//   }
//   // console.log(app.fingers);
// });




// var particles = [];
//
// app.controls = {
//   velocityScale: 0.5,
//   gravity: 0.0,
//   lifeDecrement: 0.0
// };
//
// window.onload = function(){
//   app.gui = new dat.GUI();
//   app.gui.add(app.controls, 'velocityScale', -1, 1);
//   app.gui.add(app.controls, 'gravity', -1, 1);
//   app.gui.add(app.controls, 'lifeDecrement', 0, 0.1);
// }

// var setup = function(){
//
//   createCanvas(windowWidth, windowHeight);// same as window.innerWidth. etc
//   background(0);
//   colorMode(HSB, 255);
//   // fill(255,0,0);//set the fill colour for shapes
//   // stroke(0, 255, 255)//border colour
//   noStroke()//no border
// }

// var drawFingers = function(){
//
//   const finger = app.fingers[1];
//   // console.log(finger, app.pinch);
//
//   if( app.pinch >0.65 ){
//     const size = app.pinch * 20;
//      fill(finger.z * 255, 255, 255);
//      ellipse(
//        finger.x * windowWidth,
//        (1.0 - finger.y) * windowHeight,
//        size, size
//      );
//   }
// }
//
// var draw = function(){
//
//   if(keyIsDown(CONTROL)){
//     background(0) //clear the patten after it shows
//   }
//   const x = mouseX;
//   const y = mouseY;
//
//   const vx = mouseX - pwinMouseX
//   const vy = mouseY - pwinMouseY -4;
//   // console.log({vx, vy});
//
//   const mouseVel = Math.sqrt(vx*vx + vy*vy); //pythagoras
//
//
//   drawFingers();
//
//
//   if(mouseIsPressed || keyIsDown(SHIFT)){
//     const size = mouseVel;
//     const hue = frameCount % 255;
//     particles.push({x, y, vx, vy, size, hue, mouseVel, life: 1.0});
//   }
//   updateParticles();
// }
//
// var updateParticles = function(){
//   const outputParticles = [];
//
//   for (var i = 0; i < particles.length; i++) {
//     const p = particles[i];
//
//     p.x += p.vx*app.controls.velocityScale;//upate position by adding velocity
//     p.y += p.vy*app.controls.velocityScale;
//
//     // p.life -=0.01; //opacity
//     p.life -=app.controls.lifeDecrement; //opacity
//
//     if (p.life > 0) {
//       outputParticles.push(p)
//     }
//
//     if(p.x >= windowWidth || p.x <= 0){
//       p.vx *= -0.7 //flip the velocity, i.e. change the sign from pos ->neg or neg -> pos
//     }
//
//     if(p.y >= windowHeight || p.y <=0){
//       p.vy *=-0.7  //flip the velocity, i.e. change the sign from pos ->neg or neg -> pos
//     }
//     p.vy += app.controls.gravity;
//
//     fill(p.hue, 255, 255, p.life*255)
//     ellipse(p.x, p.y, p.size, p.size);
//   }
//
//   particles = outputParticles;
// }
//
// var keyPressed = function(event){
//   console.log(event);
//   switch (event.keyCode) {
//     case 32:
//       background(0);
//       break;
//   }
// }
