
var app = app || {};

accX = 10;
accY = -3;
damping = 0.7;

app.planeWidth = 200;
app.planeLength = 300;
app.gravity = 1
app.paddleWidth = 12 * app.planeWidth/100;
app.wallZ = 0; // - 150
// app.fingers = [];
app.step = 0;
app.guiControls = {
  bouncingSpeed: 0.05,
  rollDebug: '',
  ballVelocityScale: 1.0,
  gravity: 0.1
}



app.init = () => {
  console.log("loaded");

  app.gui = new dat.GUI();
  app.gui.add(app.guiControls, "bouncingSpeed", 0, 1);
  app.gui.add(app.guiControls, "ballVelocityScale", -2, 2);
  app.gui.add(app.guiControls, "gravity", 0, 0.5);
  app.gui.add(app.guiControls, "rollDebug").listen();

  //set up 3D
  app.scene = new THREE.Scene()

  app.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  app.camera.position.set( 0, 80, 200 );
  // camera.up = new THREE.Vector3(0,1,0);
  // camera.lookAt( scene.position );

  app.renderer = new THREE.WebGLRenderer({ antialias: true})

  //rotate camera
  app.controls = new THREE.OrbitControls( app.camera, app.renderer.domElement );


  app.renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( app.renderer.domElement )


  //Stats
  app.stats = app.addStats();

  //table - just plane
  app.plane = app.createPlane();
  app.scene.add(app.plane);

  //ball
  app.ball = app.createBall();
  app.scene.add(app.ball);

  // Light - ambientLight
  app.ambientLight = app.createAmbientlight();
  app.scene.add(app.ambientLight);

  //Light - pointLight
  app.pointLight = app.createPointlight();
  app.scene.add(app.pointLight);

  //helper - (0,0,0) coordinates
  app.helper = app.createHelper();
  app.scene.add(app.helper);

  // var helper = new THREE.AxisHelper( 10 );
  // var helper = new THREE.AxesHelper( 10 );
  // scene.add( helper );

  //A loader for loading objects in JSON format. This uses the FileLoader internally for loading files.
  //instantiate a loader
  app.loader = new THREE.JSONLoader();
  // python -m http.server
  app.loader.load(
    //resource URl
    '../paddle.js',
    loadPaddle
  )

  //Paddle
  // var x,y,z;
  function loadPaddle(geometry, materials){
    console.log('HERE');
    var scale = app.planeWidth/100;
    app.paddle = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
    app.paddle.scale.set(scale, scale, scale);
    app.paddle.position.set(0,30,120);
    // paddle.position.set(x,y,z);
    // paddle.rotation.y = 0.5 * Math.PI;
    // paddle.rotation.x = -0.5 * Math.PI;
    app.paddle.rotation.y = 0;
    // paddle.rotation.z = -0.5*Math.PI;
    app.scene.add( app.paddle );


    const surfaceGeometry = new THREE.CircleGeometry(app.paddleWidth/4, 20);
    const surfaceMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
    const surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
    app.paddle.add( surface );

    // const paddleHelper = new THREE.FaceNormalsHelper(surface, 5, 0xFF0000, 2);
    // app.scene.add( paddleHelper );

    // don't start animating until the paddle is loaded
    app.animate();
    // renderer.render( scene, camera )
  }
  // app.animate();


  //Leap Motion Controller
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
      hand = frame.hands[0]
      handMesh = hand.data('riggedHand.mesh');
      // handMesh.position.set(0, 30, 150 )
      handMesh.scenePosition(hand.palmPosition, app.paddle.position);
      app.paddle.position.z += 150;

      //link hand roll with paddle rotation along y axis
      // if (frame.hands[0].roll()>=0) {
      //   app.paddle.rotation.y  += Math.abs((frame.hands[0].roll()))
      // } else {
      //   app.paddle.rotation.y -= Math.abs((frame.hands[0].roll()))
      // }

      // using roll():

      let angle = THREE.Math.mapLinear(
        frame.hands[0].roll(),   //value to map
        -2, 2,   //min & max input range
        Math.PI/4, -Math.PI/4  //min & max output
      );
      // app.guiControls.rollDebug = frame.hands[0].pitch() ;
      // let angle = THREE.Math.mapLinear(
      //   frame.hands[0].pitch(),   //value to map
      //   -1, 1,   //min & max input range
      //   Math.PI/4, -Math.PI/4  //min & max output
      // );

      angle = THREE.Math.clamp(angle, -Math.PI/4, Math.PI/4);
      // app.guiControls.rollDebug = angle;
      app.paddle.rotation.y = angle

      // app.paddle.children[0].geometry.normalsNeedUpdate = true;
      // app.paddle.geometry.normalsNeedUpdate = true;
      // app.paddle.updateMatrixWorld(true);

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
    // positionScale: 1.5,
    // offset: new THREE.Vector3(1000, 3090000, 120000),
    // materialOptions: {
    //   wireframe: true
    // }

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
