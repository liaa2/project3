 var app = app || {};

/*
TODO:

- AI plays worse:
  - AI should sometimes fail to return ball
    - too high?
    - too fast?
    - ball didn't bounce (so )

- AI plays better:
  - return more balls (better angle, over the net more)

*/




// app.AI = {
//   doneAdjustments: true
// };
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
  plane.receiveShadow = true;

  return plane;
};

//create net
app.createNet = () => {


  var netGeometry = new THREE.PlaneGeometry( app.planeWidth, 12);
  var netMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    side: THREE.DoubleSide,
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
  var ambientLight = new THREE.AmbientLight (0xffffff, 0.4);
  return ambientLight;
}

app.createSpotlight = (x, y, z , color, intensity=1.0) => {
  var spotLight = new THREE.SpotLight(color, intensity); //, 200, Math.PI/8, 1, 0  );
  spotLight.position.set(x,y,z);
  // spotLight.penumbra = 0.2;
  // spotLight.power = 0.5;
  // spotLight.angle = Math.PI/4;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  // var helper = new THREE.SpotLightHelper(spotLight);
  // app.scene.add(helper);
  return spotLight;
}

// app.createSpotlight2 = () => {
//   var pointLight = new THREE.SpotLight(0xffffff, 1);
//   pointLight.position.set(0,-50,-100);
//   return pointLight;
// }

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

  app.matchScoreCheck();

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

app.newGame = () => {
  console.log('here');
  document.getElementById("scores").innerHTML = "0 - 0";
  document.getElementById("message").innerHTML = "First to " + app.winningScore + " scores wins!";
  if( app.winner === "AI" ){
    // human starts
    app.ball.position.set(0, 30, 150);
  } else {
    app.ball.position.set(0, 30, -150);
    app.ball.velocity.set(0, 0, 1.3);
  }
  app.paddleAI.rotation.x = 0;
  app.paddleAI.rotation.y = 0;
  app.paddle.rotation.x = 0;
  app.paddle.rotation.y = 0;
  const scale = app.planeWidth/100;
  app.paddle.scale.set(scale, scale, scale);
  app.paddleAI.scale.set(scale, scale, scale);

  app.winner = "";
  app.bounce = 0;
  app.aiScore = 0;
  app.humanScore = 0;
  // app.justHit = "AI";
  app.justServed = true;
  app.hasBouncedOnOppositeSide = false;
}


//Reset game
app.restartRound  = () =>  {
  document.getElementById("message").innerHTML = " "

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
  //   app.restartRound();
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
  //   app.restartRound();
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
  //   app.restartRound();
  // }
};

///CHEATING!!!!!!!!!!!!!!---->>>>>>>>>><<<<<<<<<<<-------!!!!!!!!!!!!
app.cheat = () => {
  if (app.guiControls.cheat && app.ball.velocity.z > 0 ) {
    app.paddle.position.x = app.ball.position.x
    app.paddle.position.y = app.ball.position.y
  }
}


//counting scores//////////////////////////


app.matchScoreCheck = () => {
  let paddle;
  // if either one reaches 5 points
  if (app.aiScore >= app.winningScore) {
    app.winner = "AI";
    paddle = app.paddleAI;
    app.ball.velocity.x = 0;
    app.ball.velocity.z = 0;
    // write to the banner
    document.getElementById("scores").innerHTML = "AI wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    // make paddle rotates
    app.step++;
    paddle.position.z = -170;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

  } else if (app.humanScore >= app.winningScore) {
    app.winner = "human";
    paddle = app.paddle
    app.ball.velocity.set(0,0,0)
    // write to the banner
    document.getElementById("scores").innerHTML = "Human player wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    // make paddle bounce up and down
    app.step++;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

  }
	// stop the ball
  // if (winner === "AI" || winner === "player") {
  //   app.ball.velocity.set(0,0,0)
  //   // write to the banner
  //   document.getElementById("scores").innerHTML = winner + " wins";
  //   document.getElementById("message").innerHTML = "Press enter to play again";
  //   // make paddle bounce up and down
  //   app.step++;
  //   paddle.position.z = Math.sin(app.step * 0.1) * 15;
  //   // enlarge and squish paddle
  //   paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 5;
  //   paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 5;
  //
  // }
};

app.calculateTableBounce = (ball, lastHitBy) => {

    // Table bounce
    //if hit the table, change y axis direction so the ball would go up
    if( ball.position.y <= 2 && ball.velocity.y < 0 ){
      ball.velocity.y *= -1;
      // bounceMonitor(ball);
      // bounce++;

      // Check if bounce is legal

      if (app.hasCrossedNet(ball, lastHitBy)) {

        // ball is on opponent's side
        if(app.hasBouncedOnOppositeSide){
          // lost! second bounced
          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;
          setTimeout(app.restartRound, 1500);
        } else {
          app.hasBouncedOnOppositeSide = true;
        }
        // if ball has bounced on your own side before crossing net
      } else {
        // ball is on our side
        if (!app.justServed ) {
          //if app.justServed is false - it's not first serve
          //the ball also didn't cross the net
          //illegal bounce
          console.log(`illegal bounce by ${lastHitBy}`);
          document.getElementById("message").innerHTML = "illegal bounce by " + lastHitBy


          lastHitBy === "AI"? app.humanScore ++ : app.aiScore ++ ;
          document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore


          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;
          setTimeout(app.restartRound, 1000);
        }
      };//end of Table bounce

      if (!app.hasBouncedOnOppositeSide && app.hasCrossedNet(ball, lastHitBy)) {
        console.log("DIDN'T bounce at all");
      }
    }

    // if never hit the Table
    // if ( && ) {
    //   // if ball didn't bounce on the table at all after hit
    //   if (app.hasCrossedNet(ball, lastHitBy)) {
    //     console.log("didn't bounce at all");
    //     document.getElementById("message").innerHTML = "didn't bounce at all";
    //     lastHitBy === "AI"? app.humanScore ++ : app.aiScore ++ ;
    //     document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore
    //
    //     ball.velocity.set(0, 0, 0);
    //     setTimeout(app.restartRound, 1000);
    //   }
    // }


    // if (app.hasCrossedNet(ball, lastHitBy) === false && app.justServed === false) {
    //   //if app.justServed is true - it's not first serve - illegal bounce
    //   console.log(`illegal bounce by ${lastHitBy}`);
    //   app.restartRound();
    // }


};


app.calculateBallOutOfBounds = (ball) => {
  //if user missed the ball
  if (ball.position.z >=200 & ball.velocity.z > 0){
    console.log("You lose 1 point");
    //stop ball
    ball.velocity.x = 0;
    ball.velocity.z = 0;
    document.getElementById("message").innerHTML = "You lose 1 point";

    //update score board
    app.aiScore ++;
    document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore
    // debugger;
    setTimeout(app.restartRound, 2000);
  }

  /* ALSO NEED TO CHECK:
     - if ball is too far off the side of the table (only when sideWalls are off)
     - if ball has bounced more than once
     - if ball has bounced on your own side before crossing net (see calculateTableBounce method above)
     - if ball has hit net
  */

  //if ball is too far off the side of the table (only when sideWalls are off)
  if (ball.position.x >= 200 || ball.position.x <= - 200){
    console.log("too far off the side");
    document.getElementById("message").innerHTML = "too far off the side"
    setTimeout(app.restartRound, 2000);
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
    console.log(`${app.justHit} hit the net!`);
    document.getElementById("message").innerHTML = app.justHit + "hit the net!"
    // ball.velocity.set(0, 0, 0);
    ball.velocity.z *= -1;
    ball.velocity.multiplyScalar(0.3);

    app.justHit === 'human'? app.aiScore++ : app.humanScore++ ;
    document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore

    setTimeout(app.restartRound, 1000);
  }

  // if ball is too high
  if (ball.position.y > 80 && Math.abs(ball.position.z) === app.planeLength/2) {
    console.log("ball is too high, can't catch it");
    document.getElementById("message").innerHTML = "ball is too high, can't catch it"
    setTimeout(app.restartRound, 2000);
  }

};


app.calculatePaddlehit = (ball, paddle, paddleAI) => {

  // if(paddle.velocity){
  //   app.guiControls.rollDebug = app.paddle.velocity.x;
  // }

  // check human player
  if( app.justHit === 'AI'
      && ball.velocity.z > 0
      && (paddle.position.z - ball.position.z) < 4 // TODO: more accurate
      && app.withinBounceRange(ball, paddle) ){

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surface.matrixWorld );
      let normalizedNormal = app.surface.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      // console.log('reflecting!');

      ball.velocity.reflect( normalizedNormal )
      // .multiplyScalar(app.guiControls.bouncingSpeed);
      app.justHit = "human"; // toggle the value for who just hit
      //to check if the ball has crossed the net
      app.hasBouncedOnOppositeSide = false;
      ball.velocity.z += paddle.velocity.z * 0.005;

      // Do the one-off AI decisions
      // console.log('UPDATE AI MOVE');



  // human just hit - now AI's turn
  } else if (ball.velocity.z < 0
    && paddleAI.position.z - ball.position.z > -4
    && app.withinBounceRange(ball, paddleAI) ){
    // if (pos.x >= paddleAI.x - app.paddleWidth/2
    //   && pos.x <= paddleAI.x + app.paddleWidth/2
    //   && pos.y >= paddleAI.y - app.paddleWidth/2
    //   && pos.y <= paddleAI.y + app.paddleWidth/2) {

      let normalMatrix = new THREE.Matrix3().getNormalMatrix( app.surfaceAI.matrixWorld );
      let normalizedNormal = app.surfaceAI.geometry.faces[0].normal.clone().applyMatrix3( normalMatrix ).normalize();

      // console.log('reflecting back!');

      // DISABLE X AXIS (height) ANGLE FOR NOW
      // if (paddleAI.position.y > 45) {
      //   paddleAI.rotation.x = THREE.Math.randFloat(-Math.PI/16, Math.PI/12);
      //   app.guiControls.rollDebug = 'higher';
      // } else {
      //   paddleAI.rotation.x = THREE.Math.randFloat(
      //     app.config.aiXAngleOffset - Math.PI/12,
      //     app.config.aiXAngleOffset + Math.PI/16
      //   );
      //   app.guiControls.rollDebug = 'lower';
      //
      // }

      // paddleAI.rotation.x = mapLinear

      paddleAI.rotation.x = THREE.Math.mapLinear(
        ball.position.y,
        6, 80,
        -Math.PI/12, Math.PI/8
      )
      // DONE: fine tune this to be more accurate
      // paddleAI.rotation.y = (Math.random())*(-Math.PI/2) + Math.PI/4
      // paddleAI.rotation.y = THREE.Math.randFloat(Math.PI/15, -Math.PI/15);

      if (app.ball.position.x >= 0 &&  app.ball.position.x < app.planeWidth/2) {
        paddleAI.rotation.y = THREE.Math.mapLinear(
          ball.position.x,
          0, app.planeWidth/2,
          0, - Math.PI/6
        )
      } else if (app.ball.position.x < 0 && app.ball.position.x > -app.planeWidth/2) {
        paddleAI.rotation.y = THREE.Math.mapLinear(
          ball.position.x,
          -app.planeWidth/2, 0,
          Math.PI/6, 0
        )
      };

      // ball.velocity.multiplyScalar(-1)
      ball.velocity.reflect( normalizedNormal );
      ball.velocity.z = THREE.Math.mapLinear(
        paddleAI.rotation.x,
        -Math.PI/12, Math.PI/8,
        1.8, 2.5
      )

      // ball.velocity.z = 3;
      //calculate paddle.rotation.x angle based on y position, then calculate bounce back speed based on angle
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
