 var app = app || {};


app.AI = {
  doneAdjustments: true
};
// app.human = {
//   justHit: false
// };

app.justHit = 'AI';

app.updateJustHit = () => {
  app.justHit = app.justHit === 'AI' ? 'human' : 'AI';
  app.guiControls.rollDebug = app.justHit;
}

//create table surface
app.createPlane = () => {
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3080C9 });
  // let planeWidth = 150;
  // let planeLength = 300;
  var planeGeometry = new THREE.PlaneGeometry(app.planeWidth, app.planeLength, 30)
  // create the surface
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;

  return plane;
};

//create net
app.createNet = () => {
  var netGeometry = new THREE.PlaneGeometry( app.planeWidth, 12);
  var netMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
    // wireframe: true
  } );
  var net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.y = 6;
  return net;
}

app.createLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 0.6, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.set(0,0.2,0)
  line.rotation.x = -0.5 * Math.PI;
  return line;
}

//create ping pong ball
app.createBall = () => {
  var geometry = new THREE.SphereGeometry( 2, 30, 30)
  var material = new THREE.MeshStandardMaterial( { color: 0xffd046 })
  var sphere = new THREE.Mesh( geometry, material )
  sphere.castShadow = true;
  sphere.position.set(0, 30, 1); //-140);
  sphere.velocity = new THREE.Vector3(0, 0, 1);

  return sphere;
};

//create lights
app.createAmbientlight = () => {
  var ambientLight = new THREE.AmbientLight (0xffffff, 0.5);
  return ambientLight;
}

app.createPointlight = () => {
  var pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(25,50,25);
  return pointLight;
}


//create axes helper
app.createHelper = () => {
  var helper = new THREE.AxesHelper( 10 );
  return helper
}




//animation
app.animate = () => {
  app.paddleHelper.update();

  app.updateAI();

  app.updateBall();

  app.stats.update();

  app.renderer.render( app.scene, app.camera );
  requestAnimationFrame(app.animate);
}


//add Stats
app.addStats = () => {
  const stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);

  return stats;
};


//AI paddle moves
app.updateAI = () => {

  // try to match ball X position as soon as it's moving in direction of AI player
  if (app.ball.velocity.z < 0 ){
    app.paddleAI.position.x = app.ball.position.x;

    // Choose a random rotation when the ball is close enough
    // console.log(app.paddleAI.z, app.ball.position.z, (app.paddleAI.z - app.ball.position.z));

  }
  // else {
  //   app.paddleAI.position.x = 0;
  //   app.paddleAI.rotation.x = 0;
  //   app.paddleAI.rotation.y = 0;
  // }
}


//Reset game
app.resetBall  = () =>  {
  // app.ball.position.set(0, 30, 1);

  //start at random x position
  app.ball.position.set(Math.random()*201-100, 30, -app.planeLength/2);
  // app.ball.velocity.set(0, 0, 1);
  app.ball.velocity.set(0, 0, app.guiControls.bouncingSpeed);
  // app.ball.velocity.set(0, 0, 2);
};

//Ping pong ball moves
app.updateBall = () => {
  const pos = app.ball.position;
  const paddle = app.paddle.position;

  app.ball.velocity.y -= app.guiControls.gravity;

  app.ball.position.addScaledVector(
    app.ball.velocity,
    app.guiControls.ballVelocityScale
  );
  // const dist = app.ball.position.distanceTo( app.paddle.position );
  // app.guiControls.rollDebug = dist;
  // //
  // if ( dist < 1 ) {
  //   // bounce off bat
  //   app.ball.velocity.multiplyScalar(-1);
  // } else if ( app.ball.position.z <= app.wallZ ) {
  //   // bounce off opposite 'wall'
  //   app.ball.velocity.multiplyScalar(-1);
  // } else if(  app.ball.position.z > 200 ){
  //   app.resetBall();
  // }

  // app.withinBounceRange(app.ball, app.paddle)

  if( app.justHit === 'AI'
      && app.ball.velocity.z > 0
      && (paddle.z - pos.z) < 4
      && app.withinBounceRange(app.ball, app.paddle) ){

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
      let normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      console.log('reflecting!');

      app.ball.velocity.reflect( normalizedNormal ).multiplyScalar(app.guiControls.bouncingSpeed);
      app.updateJustHit(); // toggle the value for who just hit

      // Do the one-off AI decisions
      console.log('UPDATE AI MOVE');
      app.paddleAI.rotation.y = THREE.Math.randFloat(Math.PI/8, -Math.PI/8);
      // app.paddleAI.rotation.y = (Math.random())*(-Math.PI/2) + Math.PI/4


  } else if (app.ball.velocity.z < 0
    && app.paddleAI.position.z - pos.z > -4
    && app.withinBounceRange(app.ball, app.paddleAI) ){
    // if (pos.x >= app.paddleAI.x - app.paddleWidth/2
    //   && pos.x <= app.paddleAI.x + app.paddleWidth/2
    //   && pos.y >= app.paddleAI.y - app.paddleWidth/2
    //   && pos.y <= app.paddleAI.y + app.paddleWidth/2) {

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surfaceAI.matrixWorld );
      let normalizedNormal = app.surfaceAI.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      console.log('reflecting back!');

      // app.ball.velocity.multiplyScalar(-1)
      app.ball.velocity.reflect( normalizedNormal ).multiplyScalar(app.guiControls.bouncingSpeed);
      app.updateJustHit(); // toggle the value for who just hit

    // }
  }

  //============ ball collides with user's paddle ====================
  // if( pos.x >= paddle.x - app.paddleWidth/2 &&
  //     pos.x <= paddle.x + app.paddleWidth/2){
  //
  //   if( pos.y >= paddle.y - app.paddleWidth/2 &&
  //       pos.y <= paddle.y + app.paddleWidth/2 &&
  //       paddle.z - pos.z < 4 &&
  //        app.ball.velocity.z > 0 ){
  //
  //     // if (pos.z - paddle.z < 4){
  //       // console.log("Hit!");
  //       // app.ball.velocity.multiplyScalar(-1);
  //     // }
  //
  //     //ball bounce back after hitted, add y value as gravity
  //     // console.log(app.ball.velocity);
  //
  //     // app.ball.velocity.add(new THREE.Vector3(0,1,3)).multiplyScalar(-1);
  //
  //     // app.ball.velocity.reflect(app.normalizedPosition).multiplyScalar(5)
  //
  //     const normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
  //     const normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize()
  //
  //     // app.ball.velocity.reflect( normalizedNormal );
  //     console.log('reflecting');
  //      //.multiplyScalar(1.2);
  //
  //     app.ball.velocity.reflect( normalizedNormal ).multiplyScalar(app.guiControls.bouncingSpeed);
  //
  //     // console.log(app.ball.velocity.reflect(app.normalizedPosition));
  //     // app.ball.velocity.reflect( app.paddle.geometry.faces[0].normal );
  //   }
  // } // ball within x range - inbound



  //if hit the table, change y axis direction so the ball would go up
  if (pos.y <= 2){
    app.ball.velocity.y *= -1;
  }
  // app.guiControls.rollDebug = pos.y


  //if user missed the ball
  if (pos.z >=200){
    console.log("You lose 1 point");
    app.resetBall();
  }
  // else if (pos.z < app.paddleAI.position.z) {
  //   console.log("You won 1 point");
  //   app.resetBall();
  // }

  // out of side of the table
  // if (pos.x > 0 && pos.x - app.planeWidth/2 > 0 || pos.x < 0 && pos.x - app.planeWidth/2 < -100){
  //   console.log("out of range!!");
  // }


  //if user hits pack, opponent's turn:
  // if (pos.z <= 10 - app.planeLength/2) {
  //
  //   const normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
  //   const normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize()
  //
  //   // app.ball.velocity.reflect( normalizedNormal );
  //   console.log('reflecting back');
  //    //.multiplyScalar(1.2);
  //
  //   app.ball.velocity.reflect( normalizedNormal ).multiplyScalar(app.guiControls.bouncingSpeed);
  // }


  // if (pos.z <= - app.planeLength/2 || pos.z >=200){
  //   // app.ball.velocity.multiplyScalar(-1);
  //   app.resetBall();
  // }
};


app.withinBounceRange = (ball, paddle) => {
  return (
    // (ball.velocity.z > 0
    //   &&
    // Math.abs(paddle.position.z - ball.position.z) < 4)
    ball.position.x >= (paddle.position.x - app.paddleWidth/2)
    && ball.position.x <= (paddle.position.x + app.paddleWidth/2)
    && ball.position.y >= (paddle.position.y - app.paddleWidth/2)
    && ball.position.y <= (paddle.position.y + app.paddleWidth/2)
  );
};
