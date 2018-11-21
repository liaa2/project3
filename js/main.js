 // run server: python -m http.server

var app = app || {};

app.planeWidth = 200;
app.planeLength = 300;
app.paddleWidth = 12 * app.planeWidth/100;
app.guiControls = {
  bouncingSpeed: 1.2,
  rollDebug: '',
  ballVelocityScale: 1.5,
  gravity: 0.03,
  sideWalls: false,
  easyMode: false,
  hasCrossed: false,
  numParticles: 50,
  particleDistribution: 800,
  particleVelocityScale: 1.0
}

app.humanScore = 0;
app.aiScore = 0;
app.winningScore = 5;
app.step = 0;
app.winner = "";
app.nextTurn = "AI";
//only if human turn to serve - check if human has served
app.pointHasBegun = false;

app.justHit = 'AI';
app.justServed = true;
app.bounce = 0;
//to check if the ball has bounced on the other side
app.hasBouncedOnOppositeSide = false;
//to actiave particle once and turn it off
app.activeParticle = true;
app.addPoint = true;

app.config = {
  doBallUpdate: true,
  aiXAngleOffset: -0.05,  // upward tilt bias
  humanHitVelocityScale: 0.002
}


const BASE = 'https://raw.githubusercontent.com/liaa2/Ping-Pong-Nano-Cup/master/';

app.humanPaddleSound = new Audio(`${BASE}audio/paddle1.mp3`);
app.aiPaddleSound = new Audio(`${BASE}audio/paddle2.mp3`);
app.humanSide = new Audio(`${BASE}audio/pong1.mp3`);
app.aiSide = new Audio(`${BASE}audio/pong2.mp3`);
app.cheering = new Audio(`${BASE}audio/cheering.mp3`);


// start to setup lights, objects(load paddles for user and AI), camera etc
app.init = () => {
  console.log("loaded");

  app.gui = new dat.GUI();
  app.gui.add(app.guiControls, "easyMode");

  //set up 3D
  app.scene = new THREE.Scene()

  app.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  app.camera.position.set( 0, 80, 280 );

  app.renderer = new THREE.WebGLRenderer({ antialias: true})
  app.renderer.shadowMap.enabled = true;
  app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //rotate camera
  app.controls = new THREE.OrbitControls( app.camera, app.renderer.domElement );

  app.renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( app.renderer.domElement )


  //Stats
  app.stats = app.addStats();

  //table - just plane
  app.plane = app.createPlane();
  app.scene.add(app.plane);

  app.line = app.createLine();
  app.scene.add(app.line);

  app.upLine = app.createUpLine();
  app.scene.add(app.upLine);

  app.downLine = app.createDownLine();
  app.scene.add(app.downLine);

  app.leftLine = app.createLeftLine();
  app.scene.add(app.leftLine);

  app.rightLine = app.createRightLine();
  app.scene.add(app.rightLine);

  app.net = app.createNet();
  app.scene.add(app.net);

  //ball
  app.ball = app.createBall();
  app.scene.add(app.ball);

  // Light - ambientLight
  app.ambientLight = app.createAmbientlight();
  app.scene.add(app.ambientLight);

  //Light - pointLight
  app.spotLightL = app.createSpotlight(-150, 100, 0, 0xffffff);
  app.scene.add(app.spotLightL);

  //instantiate loader
  app.loader = new THREE.JSONLoader();

  app.loader.load(
    //resource URl AI  
    `${BASE}paddle.js`,
    loadPaddleAI
  );

  app.loader.load(
    //resource URl
    `${BASE}paddle.js`,
    loadPaddle
  )

  //Paddle - AI
  function loadPaddleAI(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddleAI = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddleAI.scale.set(scale, scale, scale);
    app.paddleAI.position.set(0,30,-160);
    app.paddleAI.rotation.y = 0;
    app.scene.add( app.paddleAI );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    app.surfaceAI = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.surfaceAI.visible = false;
    app.paddleAI.add( app.surfaceAI );
    app.paddleAI.updateMatrixWorld();
  };

  //Paddle - user
  function loadPaddle(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddle = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddle.scale.set(scale, scale, scale);
    app.paddle.position.set(0,30,160);
    app.paddle.velocity = new THREE.Vector3(0,0,0);
    app.paddle.rotation.y = 0;
    app.scene.add( app.paddle );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    app.surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.surface.visible = false;
    app.paddle.add( app.surface );

    // don't start animating until the paddle is loaded
    app.animate();
  }


  //=================== Leap Motion Controller ===========================

  //initiate animationFrame & gestures
  app.options = {
    frameEventName: 'animationFrame',
    enableGestures: true,
  };

  // The loop() function sets up the Leap controller and WebSocket connection and invokes the specified callback function on a regular update intervall. Don't need to create my own controller when using this method.
  app.controller = Leap.loop(app.options, function(frame){

    //converts coordinates from Leap Space to THREE scene space
    if (frame.hands[0]){

       app.paddle.geometry.normalsNeedUpdate = true;

      const hand = frame.hands[0];
      handMesh = hand.data('riggedHand.mesh');

      // Leap::Vector handSpeed = hand.palmVelocity(); -> The rate of change of the palm position in millimeters/second.
      handMesh.scenePosition(hand.palmPosition, app.paddle.position);
      app.paddle.position.z += 150;
      app.paddle.position.x *= 3.5;

      app.paddle.velocity = new THREE.Vector3(
        hand.palmVelocity[0],
        hand.palmVelocity[1],
        hand.palmVelocity[2]
      );


      //scale down hand movement and apply them to paddle rotation
      //using pitch() - hand rotation along x axis:
      if (app.paddle.position.y > 40) {
        let xAngleLM = THREE.Math.mapLinear(
          frame.hands[0].pitch(),
          -2, 2,
          -Math.PI/3, Math.PI/4
        );
        // If this vector's x, y or z value is greater than/less than the max/min vector's x, y or z value, it is replaced by the corresponding value.
        xAngleLM = THREE.Math.clamp(xAngleLM, -Math.PI/3, Math.PI/4);
        app.paddle.rotation.x = xAngleLM;
      } else {
        let xAngleLM = THREE.Math.mapLinear(
          frame.hands[0].pitch(),
          -2, 2,
          -Math.PI/4, Math.PI/6
        );
        xAngleLM = THREE.Math.clamp(xAngleLM, -Math.PI/4, Math.PI/6);
        app.paddle.rotation.x = xAngleLM;
      }


      // using roll() - hand rotation along y axis:
      let yAngleLM = THREE.Math.mapLinear(
        frame.hands[0].roll(),   //value to map
        -2, 2,   //min & max input range
        Math.PI/3, -Math.PI/3  //min & max output
      );

      yAngleLM = THREE.Math.clamp(yAngleLM, -Math.PI/3, Math.PI/3);
      app.paddle.rotation.y = yAngleLM
    }
  })//controller

  // Begin using a registered plugin. The plugin is run for animationFrames only.
  // list of plugins: https://developer-archive.leapmotion.com/javascript#plugins
  app.controller.use('transform', { scale: app.planeWidth/1000 })
  .use("riggedHand")

  // Connects this Controller object to the Leap Motion WebSocket server. If the connection succeeds, the controller can begin supplying tracking data
  app.controller.connect();
};

window.onload = app.init;


//resize canvas on resize window automatically
app.onResize = () => {
  app.width = window.innerWidth;
  app.height = window.innerHeight;
  app.camera.aspect = app.width/app.height
  app.camera.updateProjectionMatrix()
  app.renderer.setSize(app.width, app.height)
};

window.addEventListener('resize', app.onResize, false);


//key code mode - shortcut to debug
document.addEventListener('keydown', ev => {
  console.log(ev.keyCode, ev.key);
  switch(ev.key){
    case ' ': //pause the game
      app.config.doBallUpdate = !app.config.doBallUpdate;
      // console.log(`Ball movement ${ app.config.doBallUpdate ? 'unpaused' : 'paused'}.`)
      break;
    case 'Enter': // start the new game
      app.newGame();
      break;
    case "Tab": // jump to human player serve mode
      app.aiScore = app.winningScore;
      app.humanStart();
      break;
  }
});
