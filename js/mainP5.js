let hands = 0;

var app = {};
app.fingers = []
// app.positions = []


Leap.loop(function(frame){

  // if( frame.hands.length !== hands ){
  //   // debugger;
  //   console.log(frame.hands.length);
  //   hands = frame.hands.length;
  // }
  // if( hands > 0 ){
  //   console.log(frame.hands[0].fingers[1].tipPosition);
  // }

  if(frame.pointables.length > 0){
     //Get a pointable and normalize the tip position
     // var pointable = frame.pointables[1];

     app.pinch = frame.hands[0].pinchStrength;

     for (var i = 0; i < frame.pointables.length; i++) {
       var position = frame.pointables[i].tipPosition
       // app.positions.push(position)

       // if( frame.hands[0].fingers[i].extended ){
         var interactionBox = frame.interactionBox;
         var normalizedPosition = interactionBox.normalizePoint(position, true);
         app.fingers[i] = {
           x: normalizedPosition[0],
           y: normalizedPosition[1],
           z: normalizedPosition[2],
           extended: frame.hands[0].fingers[i].extended
         };

       // }
       // } else {
       //   app.fingers[i] = false;
       // }



     }


     // var interactionBox = frame.interactionBox;
     // var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
     // console.log({ x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] });
     // app.finger = { x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] };
     // app.fingers = [
     //   { x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] },
     //   { x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] },
     //   { x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] },
     //   { x: normalizedPosition[0], y: normalizedPosition[1], z: normalizedPosition[2] },
     // ];

  }
  // console.log(app.fingers);
});



console.log("p5 is loaded");

var particles = [];

app.controls = {
  velocityScale: 0.5,
  gravity: 0.0,
  lifeDecrement: 0.0
};

// app.finger = {};

window.onload = function(){
  app.gui = new dat.GUI();
  app.gui.add(app.controls, 'velocityScale', -1, 1);
  app.gui.add(app.controls, 'gravity', -1, 1);
  app.gui.add(app.controls, 'lifeDecrement', 0, 0.1);
}

var setup = function(){

  createCanvas(windowWidth, windowHeight);// same as window.innerWidth. etc
  background(0);


  colorMode(HSB, 255);

  // fill(255,0,0);//set the fill colour for shapes

  // stroke(0, 255, 255)//border colour
  noStroke()//no border

  //      x, y, width, height
  // ellipse(50,50,100,100);
  // ellipse(100,100,100,100);
  // ellipse(150,150,100,100);


  // line(100, 100,  700, 800);
  //
  // rect(100, 100, 500, 500);
  //
  // triangle(600, 100, 800, 200, 600, 600);
  //
  // ellipse(300,300,100,100);
}

// var drawFingers = function () {
//   if(app.finger.x){
//     const size = 50;
//     fill(app.finger.z * 255, 255, 255);
//     ellipse(
//       app.finger.x * windowWidth,
//       (1.0 - app.finger.y) * windowHeight,
//       50, 50
//     );
//   }
//
// };

// var drawFingers = function(){
//   for (var i = 0; i < app.positions.length; i++) {
//     let finger = app.positions[i]
//     if(finger.x){
//       const size = 50;
//       fill(finger.z * 255, 255, 255);
//       ellipse(
//         finger.x * windowWidth,
//         (1.0 - finger.y) * windowHeight,
//         50, 50
//       );
//     }
//   }
// }

var drawFingers = function(){

  const finger = app.fingers[1];
  // console.log(finger, app.pinch);

  if( app.pinch >0.65 ){
    const size = app.pinch * 20;
     fill(finger.z * 255, 255, 255);
     ellipse(
       finger.x * windowWidth,
       (1.0 - finger.y) * windowHeight,
       size, size
     );
  }

  // console.log(app.fingers, app.pinch);


  // for (var i = 0; i < app.fingers.length; i++) {
  //   let finger = app.fingers[i]
  //   if(finger.extended){
  //     const size = 50;
  //     fill(finger.z * 255, 255, 255);
  //     ellipse(
  //       finger.x * windowWidth,
  //       (1.0 - finger.y) * windowHeight,
  //       50, 50
  //     );
  //   }
  // }
}

var draw = function(){

  if(keyIsDown(CONTROL)){
    background(0) //clear the patten after it shows
  }
  // const x = random(0, windowWidth)
  // const y = random(0, windowHeight)

  // const size=random(10, 100);

  // noFill()
  // stroke(random(0, 255), random(0, 255), random(0, 255))
  // const sizeX=random(100, 100);
  // const sizeY=random(100, 300);
  //     center of the screen
  // ellipse(innerWidth/2, innerHeight/2, 100, 100);
  // ellipse(x, y, size, size);
  const x = mouseX;
  const y = mouseY;

  const vx = mouseX - pwinMouseX
  const vy = mouseY - pwinMouseY -4;
  // console.log({vx, vy});

  const mouseVel = Math.sqrt(vx*vx + vy*vy); //pythagoras


  drawFingers();


  if(mouseIsPressed || keyIsDown(SHIFT)){

    // const size = 40;
    const size = mouseVel;

    // fill(random(0, 255), random(0, 255), random(0, 255))

    //fill(h,s,b)
    // fill(frameCount % 255, 255, 255)

    // const hue = map(mouseX, 0, windowWidth, 0, 255)
    const hue = frameCount % 255;

    particles.push({x, y, vx, vy, size, hue, mouseVel, life: 1.0});

  }

  updateParticles();
}

var updateParticles = function(){
  const outputParticles = [];

  for (var i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.x += p.vx*app.controls.velocityScale;//upate position by adding velocity
    p.y += p.vy*app.controls.velocityScale;

    // p.life -=0.01; //opacity
    p.life -=app.controls.lifeDecrement; //opacity

    if (p.life > 0) {
      outputParticles.push(p)
    }

    if(p.x >= windowWidth || p.x <= 0){
      p.vx *= -0.7 //flip the velocity, i.e. change the sign from pos ->neg or neg -> pos
    }

    if(p.y >= windowHeight || p.y <=0){
      p.vy *=-0.7  //flip the velocity, i.e. change the sign from pos ->neg or neg -> pos
    }
    p.vy += app.controls.gravity;

    fill(p.hue, 255, 255, p.life*255)
    ellipse(p.x, p.y, p.size, p.size);
  }

  particles = outputParticles;
}

var keyPressed = function(event){
  console.log(event);
  switch (event.keyCode) {
    case 32:
      background(0);
      break;
  }
}
