
var app = app || {};

// let reduction = 0.3

app.planeWidth = 200;
app.planeLength = 300;
app.paddleWidth = 12 * app.planeWidth/100;
// app.wallZ = 0; // - 150
// app.fingers = [];
// app.step = 0;
app.guiControls = {
  // bouncingSpeed: 0.05,
  bouncingSpeed: 1.2,
  rollDebug: '',
  ballVelocityScale: 1.5,
  gravity: 0.03,
  sideWalls: false,
  cheat: false,
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
app.pointHasBegun = false;

app.justHit = 'AI';
app.justServed = true;
app.bounce = 0;
//to check if the ball has bounced on the other side
app.hasBouncedOnOppositeSide = false;
app.activeParticle = true;
app.addPoint = true;

app.config = {
  doBallUpdate: true,
  aiXAngleOffset: -0.05,  // upward tilt bias
  humanHitVelocityScale: 0.002
}


//audio setting
app.humanPaddleSound = new Audio("../audio/paddle1.mp3");
app.aiPaddleSound = new Audio("../audio/paddle2.mp3");
app.humanSide = new Audio("../audio/pong1.mp3");
app.aiSide = new Audio("../audio/pong2.mp3");
app.cheering = new Audio("../audio/cheering.mp3");


app.init = () => {
  console.log("loaded");

  app.gui = new dat.GUI();
  // app.gui.add(app.guiControls, "bouncingSpeed", 0, 1);
  app.gui.add(app.guiControls, "bouncingSpeed", 0, 2);
  app.gui.add(app.guiControls, "ballVelocityScale", 0, 3);
  app.gui.add(app.guiControls, "gravity", 0, 0.05);
  app.gui.add(app.guiControls, "particleVelocityScale", -2, 2);
  app.gui.add(app.guiControls, "sideWalls");
  app.gui.add(app.guiControls, "cheat");
  app.gui.add(app.guiControls, "rollDebug").listen();
  app.gui.add(app, "justHit").listen();
  app.gui.add(app, "justServed").listen();
  app.gui.add(app.guiControls, "hasCrossed").listen();
  // app.gui.add(app.config, "aiXAngleOffset", -0.1, 0.1);// .listen();

  //set up 3D
  app.scene = new THREE.Scene()
  // app.scene.background = new THREE.Color( 0xffffff );

  app.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  app.camera.position.set( 0, 80, 280 );
  // camera.up = new THREE.Vector3(0,1,0);
  // camera.lookAt( scene.position );

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
  // app.spotLightR = app.createSpotlight(200, 100, 0, 0xffffff);
  // app.scene.add(app.spotLightR);

  // app.particleSystem = app.createParticleSystem();
  // app.scene.add(app.particleSystem);

  // app.pointLight2 = app.createPointlight2();
  // app.scene.add(app.pointLight2);

  //helper - (0,0,0) coordinates
  // app.helper = app.createHelper();
  // app.scene.add(app.helper);

  // var helper = new THREE.AxisHelper( 10 );
  // var helper = new THREE.AxesHelper( 10 );
  // scene.add( helper );

  //A loader for loading objects in JSON format. This uses the FileLoader internally for loading files.

  // app.loaderAI = new THREE.JSONLoader();
  // app.loaderAI.load(
  //   //resource URl
  //   '../paddle.js',
  //   loadPaddleAI
  // );

  //instantiate a loader
  app.loader = new THREE.JSONLoader();
  // python -m http.server
  app.loader.load(
    //resource URl
    '../paddle.js',
    loadPaddleAI
  );

  app.loader.load(
    //resource URl
    '../paddle.js',
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
  // var x,y,z;
  function loadPaddle(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddle = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddle.scale.set(scale, scale, scale);
    // app.paddle.position.set(0,30,120);
    app.paddle.position.set(0,30,160);
    app.paddle.velocity = new THREE.Vector3(0,0,0);
    // paddle.position.set(x,y,z);
    // paddle.rotation.y = 0.5 * Math.PI;
    // paddle.rotation.x = -0.5 * Math.PI;
    app.paddle.rotation.y = 0;
    // paddle.rotation.z = -0.5*Math.PI;
    app.scene.add( app.paddle );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    // const surfaceGeometry = new THREE.CircleBufferGeometry(app.paddleWidth/4, 8);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    app.surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.surface.visible = false;
    // surface.geometry.computeFaceNormals();
    app.paddle.add( app.surface );
    // app.scene.add(app.surface);
    // app.paddle.children[0].position = app.paddle.position;

    // app.paddle.children[0].geometry.normalsNeedUpdate = true;
    //get the global position of surface (child object)

    // app.paddle.updateMatrixWorld();

    // app.vector = new THREE.Vector3();
    // // app.surface.position = app.vector
    // app.vector.setFromMatrixPosition(app.surface.matrixWorld);
    // // app.surface.position.setFromMatrixPosition(app.surface.matrixWorld);
    // app.normalizedPosition = app.vector.setFromMatrixPosition(app.surface.matrixWorld).clone().normalize();

    // console.log("normalized position: ", app.normalizedPosition);
    // console.log( "Original Position: " , app.vector.setFromMatrixPosition(app.surface.matrixWorld));

    // var normalMatrix = new THREE.Matrix3().getNormalMatrix(app.paddle.matrixWorld);
    // var newNoraml = normal.clone().applyMartrix3(normalMatrix).normalize();


    // app.paddleHelper = new THREE.FaceNormalsHelper(app.surface, 5, 0xFF0000, 2);
    // app.scene.add( app.paddleHelper );



    // const normal = surfaceGeometry.computeFaceNormals();
    // console.log(normal);

    // console.log(app.paddle.position.setFromMatrixPosition(surface.matmatrixWorld));

    // app.normal = new THREE.Vector3();
    // for (var i = 0; i < app.surface.geometry.faces.length; i++) {
    //   let coordinate = app.surface.geometry.faces[i].normal
    //   app.normal.add(coordinate);
    // }
    // console.log(app.normal);

    // const paddleHelper = new THREE.VertexNormalsHelper(surface, 5, 0xFF0000, 2);
    // app.scene.add( paddleHelper );



    // don't start animating until the paddle is loaded
    app.animate();
    // renderer.render( scene, camera )
  }
  // app.animate();



  //=======================mouse pad mode================================

  // document.addEventListener("mousemove", e => {
  //   // console.log("e.page: ", e.pageX, e.pageY, e);
  //
  //   if( e.shiftKey ){
  //     const yAngle = THREE.Math.mapLinear(
  //       e.pageX,
  //       0, window.innerWidth,
  //       Math.PI/4, -Math.PI/4
  //     );
  //     app.paddle.rotation.y = yAngle;
  //
  //     const xAngle = THREE.Math.mapLinear(
  //       e.pageY,
  //       0, window.innerHeight,
  //       Math.PI/4, -Math.PI/4
  //     );
  //     app.paddle.rotation.x = xAngle;
  //     return; // don't change the position with the code below
  //   }
  //
  //
  //   app.paddle.position.x = THREE.Math.mapLinear(
  //     e.pageX,
  //     0, window.innerWidth,
  //     -100, 100
  //   );
  //   app.paddle.position.y = THREE.Math.mapLinear(
  //     e.pageY,
  //     0, window.innerHeight,
  //     60, 10
  //   );
  //
  //   // app.paddle.position.y = THREE.Math.mapLinear(e.pagey, 90, 1000, )
  // });


  //===================Leap Motion Controller mode===========================
  //initiate animationFrame & gestures
  app.options = {
    frameEventName: 'animationFrame',
    enableGestures: true,
  };

  app.controller = Leap.loop(app.options, function(frame){
    // console.log(frame);
    // console.log(frame.hands);

    //converts coordinates from Leap Space to THREE scene space
    if (frame.hands[0]){

       app.paddle.geometry.normalsNeedUpdate = true;

      // console.log(frame.hands[0].roll());
      const hand = frame.hands[0];
      handMesh = hand.data('riggedHand.mesh');
      // handMesh.position.set(0, 30, 150 )

      // Leap::Vector handSpeed = hand.palmVelocity(); -> The rate of change of the palm position in millimeters/second.
      handMesh.scenePosition(hand.palmPosition, app.paddle.position);
      app.paddle.position.z += 150;
      app.paddle.position.x *= 3.5;

      app.paddle.velocity = new THREE.Vector3(
        hand.palmVelocity[0],
        hand.palmVelocity[1],
        hand.palmVelocity[2]
      );

      //using pitch() - hand rotation along x axis:
      if (app.paddle.position.y > 40) {
        let xAngleLM = THREE.Math.mapLinear(
          frame.hands[0].pitch(),
          -2, 2,
          // -Math.PI/4, Math.PI/4
          -Math.PI/3, Math.PI/4
        );
        // If this vector's x, y or z value is greater than/less than the max/min vector's x, y or z value, it is replaced by the corresponding value.
        xAngleLM = THREE.Math.clamp(xAngleLM, -Math.PI/3, Math.PI/4);
        app.paddle.rotation.x = xAngleLM;
      } else {
        let xAngleLM = THREE.Math.mapLinear(
          frame.hands[0].pitch(),
          -2, 2,
          // -Math.PI/4, Math.PI/4
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
      // app.guiControls.rollDebug = frame.hands[0].pitch() ;
      // let angle = THREE.Math.mapLinear(
      //   frame.hands[0].pitch(),   //value to map
      //   -1, 1,   //min & max input range
      //   Math.PI/4, -Math.PI/4  //min & max output
      // );

      yAngleLM = THREE.Math.clamp(yAngleLM, -Math.PI/3, Math.PI/3);
      // app.guiControls.rollDebug = angle;
      app.paddle.rotation.y = yAngleLM

      // app.paddle.children[0].geometry.normalsNeedUpdate = true;
      // app.paddle.geometry.normalsNeedUpdate = true;
      // app.paddle.updateMatrixWorld(true);
      // app.paddle.updateMatrixWorld();
      // app.surface.position.setFromMatrixPosition(app.surface.matrixWorld);
      // console.log(app.normalizedPosition);
      // console.log(app.vector.setFromMatrixPosition(app.surface.matrixWorld));

    }
  })//controller

  app.controller.use('transform', { scale: app.planeWidth/1000 })
  .use("riggedHand", {
    // boneLabels: function(boneMesh, leapHand){
    //   return boneMesh.name
    // }
    // parent: scene,
    // renderer: renderer,
    // camera: camera,
    // renderFn: () => renderer.render(scene, camera),
    // scale: 0.001,
    // positionScale: 2,
    // offset: new THREE.Vector3(1000, 3090000, 120000),
    // materialOptions: {
    //   wireframe: true
  })

  app.controller.connect();

  // start off the animation loop

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

document.addEventListener('keydown', ev => {
  console.log(ev.keyCode, ev.key);
  switch(ev.key){
    case ' ':
      app.config.doBallUpdate = !app.config.doBallUpdate;
      console.log(`Ball movement ${ app.config.doBallUpdate ? 'unpaused' : 'paused'}.`)
      break;
    case 'Enter':
      // app.restartGame();
      app.newGame();
      break;
    case "Tab":
      app.aiScore = app.winningScore;
      break;
  }
});
