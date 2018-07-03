 var app = app || {};


app.AI = {
  doneAdjustments: true
};
// app.human = {
//   justHit: false
// };



// app.updateJustHit = () => {
//   app.justHit = app.justHit === 'AI' ? 'human' : 'AI';
//   app.guiControls.rollDebug = app.justHit;
// }

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

  var textureLoader = new THREE.TextureLoader(); //.load('img/net1.jpg');
  textureLoader.load('img/net22.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(15, 1);
    netMaterial.map = texture;
  });


  var net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.y = 6;
  return net;
}

app.createLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.set(0,0.2,0)
  line.rotation.x = -0.5 * Math.PI;
  return line;
}

app.createUpLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeWidth);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var upLine = new THREE.Mesh(lineGeometry, lineMaterial);
  upLine.position.set(0,0.2,-app.planeLength/2+0.5);
  upLine.rotation.z = -0.5 * Math.PI;
  upLine.rotation.x = 0.5 * Math.PI;
  return upLine;
}

app.createDownLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeWidth);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var downLine = new THREE.Mesh(lineGeometry, lineMaterial);
  downLine.position.set(0,0.2,app.planeLength/2-0.5)
  downLine.rotation.z = -0.5 * Math.PI;
  downLine.rotation.x = 0.5 * Math.PI;
  return downLine;
}

app.createLeftLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
  leftLine.position.set(-app.planeWidth/2+0.5,0.2,0)
  leftLine.rotation.x = -0.5 * Math.PI;
  return leftLine;
}

app.createRightLine = () => {
  var lineGeometry = new THREE.PlaneGeometry( 1, app.planeLength);
  var lineMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
  } );
  var rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
  rightLine.position.set(app.planeWidth/2-0.5,0.2,0)
  rightLine.rotation.x = -0.5 * Math.PI;
  return rightLine;
}

//create ping pong ball
app.createBall = () => {
  var geometry = new THREE.SphereGeometry( 2, 30, 30)
  var material = new THREE.MeshStandardMaterial( { color: 0xffd046 })
  var sphere = new THREE.Mesh( geometry, material )
  sphere.castShadow = true;
  sphere.position.set(0, 30, -120); //-140);
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
// app.createHelper = () => {
//   var helper = new THREE.AxesHelper( 10 );
//   return helper
// }




//animation
app.animate = () => {
  // app.paddleHelper.update();
  app.cheat();

  app.updateAI();

  if(app.config.doBallUpdate){
     app.updateBall();
   }

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
    app.paddleAI.position.y = app.ball.position.y;

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
app.restartGame  = () =>  {

  // app.aiBounce = 0;
  // app.humanBounce = 0;
  app.bounce = 0;

  //start at random x position
  app.ball.position.set(0, 30, -150);
  // app.ball.position.set(Math.random()*201-100, 30, -app.planeLength/2);
  app.paddleAI.position.x = app.ball.position.x;
  app.paddleAI.position.y = 30;
  app.paddleAI.rotation.x = 0;
  app.paddleAI.rotation.y = 0;
  // app.ball.velocity.set(0, 0, 1);
  app.ball.velocity.set(0, 0, 1.3);
  // app.ball.velocity.set(0, 0, 2);

  app.justHit = "AI";  // reset last-hit tracker
  //initial serve
  app.justServed = true;
  app.hasBouncedOnOppositeSide = false;

};

//Ping pong ball moves
app.updateBall = () => {
  const pos = app.ball.position;
  const paddle = app.paddle.position;

  // apply gravity
  app.ball.velocity.y -= app.guiControls.gravity;
  // apply velocity to position
  app.ball.position.x += app.ball.velocity.x * app.guiControls.ballVelocityScale;
  app.ball.position.z += app.ball.velocity.z * app.guiControls.ballVelocityScale;
  app.ball.position.y += app.ball.velocity.y;
  // // apply velocity ( not using this because we want gravity to be separate to the ball velocity scaling )
  // app.ball.position.addScaledVector(
  //   app.ball.velocity,
  //   app.guiControls.ballVelocityScale
  // );

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
  //   app.restartGame();
  // }

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

  app.calculateBallOutOfBounds(app.ball);

  app.calculatePaddlehit(app.ball, app.paddle, app.paddleAI);


  app.guiControls.hasCrossed = app.hasCrossedNet(app.ball, app.justHit);

  app.calculateTableBounce(app.ball, app.justHit);

  // bounce off invisible walls on sides of table
  if( app.guiControls.sideWalls && Math.abs(pos.x) > app.planeWidth/2 ){
    app.ball.velocity.x *= -1;
  }

  if( app.justServed && app.ball.position.z >= 0 ){
    app.justServed = false;
  }

  // else if (pos.z < app.paddleAI.position.z) {
  //   console.log("You won 1 point");
  //   app.restartGame();
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
  //   app.restartGame();
  // }
};

///CHEATING!!!!!!!!!!!!!!---->>>>>>>>>><<<<<<<<<<<-------!!!!!!!!!!!!
app.cheat = () => {
  if (app.guiControls.cheat && app.ball.velocity.z > 0 ) {
    app.paddle.position.x = app.ball.position.x
    app.paddle.position.y = app.ball.position.y
  }
}

// app.bounceMonitor = (ball) => {
//   if (ball.position.z < 0) {
//     app.aiBounce ++;
//     console.log("aiBounce: ", app.aiBounce);
//   } else {
//     app.humanBounce ++;
//     console.log("human bounce: ", app.humanBounce);
//   }
// }


app.calculateTableBounce = (ball, lastHitBy) => {

    // Table bounce
    //if hit the table, change y axis direction so the ball would go up
    if( ball.position.y <= 2 && ball.velocity.y < 0 ){
      ball.velocity.y *= -1;
      // bounceMonitor(ball);
      // bounce++;

      // Check if bounce legal

      if (app.hasCrossedNet(ball, lastHitBy)) {

        // ball is on opponent's side
        if(app.hasBouncedOnOppositeSide){
          // lost! second bounced
          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;
          setTimeout(app.restartGame, 1500);
        } else {
          app.hasBouncedOnOppositeSide = true;
        }

      } else {
        // ball is on our side
        if (!app.justServed ) {
          //if app.justServed is false - it's not first serve
          //the ball also didn't cross the net
          //illegal bounce
          console.log(`illegal bounce by ${lastHitBy}`);
          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;
          setTimeout(app.restartGame, 1500);
        }
      }

    }


    // if (app.hasCrossedNet(ball, lastHitBy) === false && app.justServed === false) {
    //   //if app.justServed is true - it's not first serve - illegal bounce
    //   console.log(`illegal bounce by ${lastHitBy}`);
    //   app.restartGame();
    // }


};


app.calculateBallOutOfBounds = (ball) => {
  //if user missed the ball
  if (ball.position.z >=200){
    console.log("You lose 1 point");
    app.restartGame();
  }

  /* ALSO NEED TO CHECK:
     - if ball is too far off the side of the table (only when sideWalls are off)
     - if ball has bounced more than once
     - if ball has bounced on your own side before crossing net
     - if ball has hit net
  */
  //if ball is too far off the side of the table (only when sideWalls are off)
  if (ball.position.x >= 200 || ball.position.x <= - 200){
    console.log("too far off the side");
    app.restartGame();
  }

  // if ball has hit net
  if ( Math.abs(ball.position.x) < app.planeWidth/2
    && Math.abs(ball.position.y) < app.net.position.y - 2
    && Math.abs(ball.position.z) < 2
    // these conditions avoid the ball 'jitter' of being
    // bounced back and forth within the net range
    &&  ((app.justHit === 'human' && ball.velocity.z < 0 )
        ||
        (app.justHit === 'AI' && ball.velocity.z > 0 ))
    ){
    console.log("hit the net!");
    // ball.velocity.set(0, 0, 0);
    ball.velocity.z *= -1;
    ball.velocity.multiplyScalar(0.3);
    setTimeout(app.restartGame, 2000);
    // app.restartGame();
    // ball.velocity.y -= 0.5;
    // if (ball.position.y < 2){
    //   ball.velocity.set(0, 0, 0);
    // }
  }

  // if ball is too high
  if (ball.position.y > 80 && Math.abs(ball.position.z) === app.planeLength/2) {
    console.log("ball is too high, can't catch it");
    setTimeout(app.restartGame, 2000);
  }

  // if ball has bounced on your own side before crossing net
  // if (!app.justServed ) {
  //   if ((app.justHit === 'human' && app.bounce ===2) ||
  //       (app.justHit === 'AI' && app.bounce ===2)) {
  //         console.log(`${app.justHit} bounced more than once`);
  //         ball.velocity.set(0,0,0);
  //         setTimeout(app.restartGame, 2000);
  //   }
  //   // if (ball.position.y <= 2 && ball.position.z < 0) {
  //   //   app.aiBounce++;
  //   //   if (app.humanBounce === 0 && app.aiBounce === 2) {
  //   //     console.log("AI bounced more than once!");
  //   //     app.restartGame();
  //   //   }
  //   // } else if (ball.position.y <= 2 && ball.position.z > 0) {
  //   //   app.humanBounce++;
  //   //   if (app.aiBounce === 0 && app.humanBounce ===2) {
  //   //     console.log("Human bounced more than once");
  //   //     app.restartGame();
  //   //   }
  //   //
  //   // }
  // }
};

app.calculatePaddlehit = (ball, paddle, paddleAI) => {

  if(paddle.velocity){
    app.guiControls.rollDebug = app.paddle.velocity.x;
  }

  // check human player
  if( app.justHit === 'AI'
      && ball.velocity.z > 0
      && (paddle.position.z - ball.position.z) < 4 // TODO: more accurate
      && app.withinBounceRange(ball, paddle) ){

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
      let normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      console.log('reflecting!');

      ball.velocity.reflect( normalizedNormal )
      // .multiplyScalar(app.guiControls.bouncingSpeed);
      app.justHit = "human"; // toggle the value for who just hit
      app.hasBouncedOnOppositeSide = false;
      ball.velocity.z += paddle.velocity.z * 0.005;

      // Do the one-off AI decisions
      console.log('UPDATE AI MOVE');
      paddleAI.rotation.x = THREE.Math.randFloat(-Math.PI/15, Math.PI/15);
      paddleAI.rotation.y = THREE.Math.randFloat(Math.PI/15, -Math.PI/15);
      // paddleAI.rotation.y = (Math.random())*(-Math.PI/2) + Math.PI/4


  // check AI player
  } else if (ball.velocity.z < 0
    && paddleAI.position.z - ball.position.z > -4
    && app.withinBounceRange(ball, paddleAI) ){
    // if (pos.x >= paddleAI.x - app.paddleWidth/2
    //   && pos.x <= paddleAI.x + app.paddleWidth/2
    //   && pos.y >= paddleAI.y - app.paddleWidth/2
    //   && pos.y <= paddleAI.y + app.paddleWidth/2) {

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surfaceAI.matrixWorld );
      let normalizedNormal = app.surfaceAI.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      console.log('reflecting back!');

      // ball.velocity.multiplyScalar(-1)
      ball.velocity.reflect( normalizedNormal )
      // .multiplyScalar(app.guiControls.bouncingSpeed);
      app.justHit = "AI" // toggle the value for who just hit
      app.hasBouncedOnOppositeSide = false;
      // console.log(app.justHit);

    // }
  }

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

app.hasCrossedNet = (ball, lastHitBy) => {
  if (lastHitBy === "human") {
    return ball.position.z < 0;
  } else {
    return ball.position.z > 0;
  }

  // return lastHitBy === "human" ? ball.position.z < 0 : ball.position.z > 0;
};
