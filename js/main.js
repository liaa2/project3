
let camera;
let hand;
let paddle;
let scene;
let renderer;

$(document).ready(function(){

  console.log("loaded");

  var app = {};
  app.fingers = [];


  var step = 0;
  var controls = {
    bouncingSpeed: 0.05
  }

  var gui = new dat.GUI();
  gui.add(controls, "bouncingSpeed", 0, 1);



  //set up 3D
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  camera.position.set( 0, 80, 200 );
  // camera.up = new THREE.Vector3(0,1,0);
  // camera.lookAt( scene.position );

  renderer = new THREE.WebGLRenderer({ antialias: true})

  //rotate camera
  var controls = new THREE.OrbitControls( camera );



  renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( renderer.domElement )
  // camera.position.z = 5

  //resize canvas on resize window automatically
  window.addEventListener('resize', ()=> {
    let width = window.innerWidth
    let height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width/height
    camera.updateProjectionMatrix()
  })


  //table - just plane
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3080C9 });
  let planeWidth = 200;
  let planeLength = 300;
  var planeGeometry = new THREE.PlaneGeometry(planeWidth, planeLength, 30)
  // create the surface
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;

  scene.add(plane);

  //ball
  var geometry = new THREE.SphereGeometry( 0.15, 30, 30)
  var material = new THREE.MeshStandardMaterial( { color: 0xffd046 })

  var sphere = new THREE.Mesh ( geometry, material )
  sphere.castShadow = true;
  scene.add( sphere )
  renderer.render( scene, camera )

  //light
  var ambientLight = new THREE.AmbientLight (0xffffff, 0.5)
  scene.add(ambientLight)

  var pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(25,50,25);
  scene.add(pointLight)

  // var helper = new THREE.AxisHelper( 10 );
  var helper = new THREE.AxesHelper( 10 );
  scene.add( helper );

  //A loader for loading objects in JSON format. This uses the FileLoader internally for loading files.
  //instantiate a loader
  var loader = new THREE.JSONLoader();
  loader.load(
    //resource URl
    '../paddle.js',
    loadPaddle
  )

  //Paddle
  // var x,y,z;
  function loadPaddle(geometry, materials){
  var scale = planeWidth/100
   paddle = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
   paddle.scale.set(scale, scale, scale);
   paddle.position.set(0,30,120);
   // paddle.position.set(x,y,z);
   // paddle.rotation.y = 0.5 * Math.PI;
   // paddle.rotation.x = -0.5 * Math.PI;
   paddle.rotation.y = 0;
   // paddle.rotation.z = -0.5*Math.PI;
   scene.add(paddle);
   // renderer.render( scene, camera )
  }


  function render(){
    //ball's self rotation
    sphere.rotation.x += Math.PI/50;
    sphere.rotation.y += Math.PI/50;

    //ball bouncing
    step += controls.bouncingSpeed;
    sphere.position.x = 20 + (Math.cos(step)*10);
    sphere.position.y = 6 + (Math.abs(Math.sin(step))*10);

    // paddle.rotation.x = Math.PI/2;

    //add scene to the screen
    renderer.render(scene, camera);
  }

  //animation
  function animate(){
    requestAnimationFrame(animate);
    controls.update()
    render();
  }
  animate();


  //Leap Motion Controller
  //initiate animationFrame & gestures
  var options = {
    frameEventName: 'animationFrame',
    enableGestures: true,

  };

  var controller = Leap.loop(options, function(frame){
    // console.log(frame);
    // console.log(frame.hands);

    //converts coordinates from Leap Space to THREE scene space
    if (frame.hands[0]){
      // console.log(frame.hands[0].roll());
      hand = frame.hands[0]
      handMesh = hand.data('riggedHand.mesh');
      // handMesh.position.set(0, 30, 150 )
      handMesh.scenePosition(hand.indexFinger.tipPosition, paddle.position);
      paddle.position.z += 150;
    }


    // if(frame.valid && frame.gestures.length > 0) {
    //   frame.gestures.forEach(function(gesture){
    //     switch(gesture.type){
    //       case "circle":
    //         console.log("circle gesture");
    //         break;
    //       case "keyTap":
    //         console.log("keyTap gesture");
    //         break;
    //       case "screenTap":
    //         console.log("screenTap gesture");
    //         break;
    //       case "swipe":
    //         console.log("swipe gesture");
    //         break;
    //     }//end switch
    //   })//end gestures
    // }//end if
  })//controller

  controller.use('transform', { scale: planeWidth/1000 })
  .use("riggedHand", {
    // boneLabels: function(boneMesh, leapHand){
    //   return boneMesh.name
    // }
    // parent: scene,
    // renderer: renderer,
    // camera: camera,
    // renderFn: () => renderer.render(scene, camera),
    // scale: 0.001,
    // positionScale: 1.5,
    // offset: new THREE.Vector3(1000, 3090000, 120000),
    // materialOptions: {
    //   wireframe: true
    // }

  })

  controller.connect();

  // //another cube with wireframe
  // var geometry = new THREE.BoxGeometry(3,3,3);
  // var material = new THREE.MeshBasicMaterial({
  //   color: "#dadada", wireframe: true, transparent: true
  // })
  // var wireframeCube = new THREE.Mesh (geometry, material)
  // scene.add(wireframeCube)
  //
  //
  // function animate(){
  //   requestAnimationFrame( animate );
  //   // sphere.rotation.x += 0.04;
  //   // sphere.rotation.y += 0.04;
  //   sphere.rotation.x += Math.PI/50;
  //   sphere.rotation.y += Math.PI/50;
  //   wireframeCube.rotation.x -= Math.PI/100;
  //   wireframeCube.rotation.y -= Math.PI/100;
  //   renderer.render(scene, camera)
  // }

  // animate();

  // var canvas = document.getElementById("canvas");
  // var ctx = canvas.getContext("2d");
  //
  // var options = {
  //   frameEventName: 'animationFrame',
  //   enableGestures: true
  // };
  //
  // Leap.loop(options, function(frame){
  //   ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  //   frame.gestures.forEach(function(gesture){
  //     if (gesture.type != "swipe") {
  //       return;
  //     }
  //
  //     var startPosition = frame.interactionBox.normalizePoint(gesture.startPosition);
  //     var endPosition = frame.interactionBox.normalizePoint(gesture.position);
  //
  //     var startX = ctx.canvas.width*startPosition[0];
  //     // var startY = ctx.canvas.height*startPosition[0];
  //     var startY = ctx.canvas.width*(1-startPosition[0]);
  //
  //     var endX = ctx.canvas.width*endPosition[0];
  //     var endY = ctx.canvas.width*(1-endPosition[1]);
  //
  //
  //     //Begin a path
  //     ctx.beginPath();
  //     //move to position (startX, startY);
  //     ctx.moveTo(startX, startY);
  //     //Create a line to position (endX, endY);
  //     ctx.lineTo(endX, endY);
  //     //The stroke() method actually draws the path you have defined with all those moveTo() and lineTo() methods. The default color is black.
  //     ctx.stroke();
  //   })

  // })

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
});//end of jquery

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
