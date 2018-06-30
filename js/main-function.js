 var app = app || {};


app.createPlane = () => {
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0x3080C9 });
  // let planeWidth = 150;
  let planeLength = 300;
  var planeGeometry = new THREE.PlaneGeometry(app.planeWidth, planeLength, 30)
  // create the surface
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;

  return plane;
};


app.createBall = () => {
  var geometry = new THREE.SphereGeometry( 2, 30, 30)
  var material = new THREE.MeshStandardMaterial( { color: 0xffd046 })
  var sphere = new THREE.Mesh( geometry, material )
  sphere.castShadow = true;
  sphere.position.set(0, 30, 1); //-140);
  sphere.velocity = new THREE.Vector3(0, 0, 1);

  return sphere;
};

app.createAmbientlight = () => {
  var ambientLight = new THREE.AmbientLight (0xffffff, 0.5);
  return ambientLight;
}

app.createPointlight = () => {
  var pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(25,50,25);
  return pointLight;
}

app.createHelper = () => {
  var helper = new THREE.AxesHelper( 10 );
  return helper
}




//animation
app.animate = () => {
  // console.log("animate");

  // app.sphere.rotation.x += Math.PI/50;
  // app.sphere.rotation.y += Math.PI/50;
  //
  //ball bouncing
  app.step += app.guiControls.bouncingSpeed;
  // console.log(app.step);
  // app.ball.position.x = 20 + (Math.cos(app.step)*10);
  // app.ball.position.y = 6 + (Math.abs(Math.sin(app.step))*10);

  app.updateBall();
  // app.ball.position.y = 6 + app.step

  // paddle.rotation.x = Math.PI/2;

  app.stats.update();

  app.renderer.render( app.scene, app.camera );
  requestAnimationFrame(app.animate);
}

app.addStats = () => {
  const stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);

  return stats;
};


app.resetBall  = () =>  {
  app.ball.position.set(0, 30, 1);
  app.ball.velocity.set(0, 0, 1);

  // app.ball.position.set(0, 30, -app.planeWidth/2);
  // app.ball.position.z = 10 - Math.cos(app.guiControls.bouncingSpeed*20)*35;
  // let z = Math.cos(app.guiControls.bouncingSpeed*20);
  // app.ball.velocity.set(0, 0, z);
};

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

  if( pos.x >= paddle.x - app.paddleWidth/2 &&
      pos.x <= paddle.x + app.paddleWidth/2){

    if( pos.y >= paddle.y - app.paddleWidth/2 &&
        pos.y <= paddle.y + app.paddleWidth/2 &&
        paddle.z - pos.z < 4){

      // if (pos.z - paddle.z < 4){
        // console.log("Hit!");
        // app.ball.velocity.multiplyScalar(-1);
      // }

      //ball bounce back after hitted, add y value as gravity
      // console.log(app.ball.velocity);

      app.ball.velocity.add(new THREE.Vector3(0,1,3)).multiplyScalar(-1);
      // app.ball.velocity.reflect( app.paddle.geometry.faces[0].normal );
    }
  } // ball within x range

  if (pos.y <= 2){
    // app.step += app.guiControls.bouncingSpeed;
    // pos.y = 7 + (Math.abs(Math.sin(1)*35));
    // pos.y = 10 + Math.sin(app.guiControls.bouncingSpeed*20)*35;
    // pos.z = 6 + (Math.abs(Math.cos(1)*35)) + pos.z;
    app.ball.velocity.y *= -1;
  }

  // app.guiControls.rollDebug = pos.y

  if (pos.z <= - app.planeLength/2 || pos.z >=200){
    // app.ball.velocity.multiplyScalar(-1);
    app.resetBall();
  }


  // collision detection:
  //   determines if any of the rays from the cube's origin to each vertex
  //		intersects any face of a mesh in the array of target meshes
  //   for increased collision accuracy, add more vertices to the cube;
  //		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
  // var originPoint = app.ball.position.clone();
  //
  // for (var vertexIndex = 0; vertexIndex < app.ball.geometry.vertices.length; vertexIndex++)
  // {
  //   var localVertex = app.ball.geometry.vertices[vertexIndex].clone();
  //   var globalVertex = localVertex.applyMatrix4( app.ball.matrix );
  //   var directionVector = globalVertex.sub( app.ball.position );
  //
  //   var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
  //   var collisionResults = ray.intersectObject( app.paddle );
  //   // console.log(collisionResults);
  //   if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
  //     console.warn(" Hit ");
  // }

};
