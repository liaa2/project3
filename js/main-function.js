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

//animation
app.animate = () => {

  app.humanStart();

  app.easyMode();

  app.updateAI();

  if(app.config.doBallUpdate){
     app.updateBall();
  }

  app.stats.update();

  app.matchScoreCheck();

  if (app.particleSystem) {
    app.animateParticles();
  }

  app.renderer.render( app.scene, app.camera );
  requestAnimationFrame(app.animate);
};


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
  }
}


//human turn to hit the ball and start the game
app.humanStart = () => {
  if (app.winner === "AI" && app.withinBounceRange(app.ball, app.paddle) && (app.paddle.position.z - app.ball.position.z) < 3 && app.ball.velocity.z === 0) {
    app.ball.velocity.z = app.paddle.velocity.z * app.config.humanHitVelocityScale ;
    app.winner = "";
    app.justHit = "human";
    // debugger;
    app.pointHasBegun = true;
  }
};

app.setting = () => {
  app.paddleAI.rotation.x = 0;
  app.paddleAI.rotation.y = 0;
  app.justServed = true;
  app.hasBouncedOnOppositeSide = false;
  app.addPoint = true;
  app.bounce = 0;
}

app.newGame = () => {
  // console.log('here');
  document.getElementById("scores").innerHTML = "0 - 0";
  document.getElementById("message").innerHTML = "First to " + app.winningScore + " scores wins!";

  // console.log('reset particles');

  if (app.particleSystem) {
    app.particleSystem.geometry.dispose();
    app.particleSystem.material.dispose();
    app.scene.remove(app.particleSystem);
  }

  app.cheering.pause();

  if( app.winner === "AI" ){
    // human starts
    app.ball.position.set(0, 30, 150);
    // app.humanStart();
  } else {
    app.ball.position.set(0, 30, -150);
    app.ball.velocity.set(0, 0, 1.3);
    app.winner = "";
  }

  app.setting();
  // app.paddleAI.rotation.x = 0;
  // app.paddleAI.rotation.y = 0;
  app.paddle.rotation.x = 0;
  app.paddle.rotation.y = 0;
  const scale = app.planeWidth/100;
  app.paddle.scale.set(scale, scale, scale);
  app.paddleAI.scale.set(scale, scale, scale);

  // app.bounce = 0;
  app.aiScore = 0;
  app.humanScore = 0;
  // app.justHit = "AI";
  // app.justServed = true;
  // app.hasBouncedOnOppositeSide = false;
  // app.addPoint = true;
  app.activeParticle = true;
}


//Next Point
app.restartRound  = () =>  {
  document.getElementById("message").innerHTML = " "
  // app.bounce = 0;

  //start at random x position
  // app.ball.position.set(0, 30, -150);
  // app.paddleAI.rotation.x = 0;
  // app.paddleAI.rotation.y = 0;

  app.setting();
  app.paddleAI.position.y = 30;

  // AI is serving
  // if (app.nextTurn === "AI") {
    app.ball.position.set(Math.random()*101-50, 30, -app.planeLength/2);
    app.paddleAI.position.x = app.ball.position.x;
    // app.ball.velocity.set(0, 0, 1);

    app.aiPaddleSound.play();

    app.ball.velocity.set(0, 0, 1.3);
    // app.ball.velocity.set(0, 0, 2);

    app.justHit = "AI";  // reset last-hit tracker
    // } else {
    //   // Human is serving
    //   app.paddle.position.set(50, 30, 170);
    //   // app.ball.position.set(0, 30, 135);
    //   app.ball.position.set(0, 30, 150);
    //   // app.ball.velocity.x = 0;
    //   // app.ball.velocity.z = 0;
    //
    //   if (app.withinBounceRange(app.ball, app.paddle) && (app.paddle.position.z - app.ball.position.z) < 3) {
    //     app.ball.velocity.z = app.paddle.velocity.z * app.config.humanHitVelocityScale;
    //     app.justHit = "human";
    //     app.pointHasBegun = true;
    //     console.warn('SERVE DETECTED from inside restartRound()');
    //   }

    // TODO: this code needs to run all the time (until serve is finished),
    // NOT just once inside this restartRound() function
    // if (app.withinBounceRange(app.ball, app.paddle) && (app.paddle.position.z - app.ball.position.z) < 4) {
    //   // Ball is served! (hit)
    //   app.humanPaddleSound.play();
    //   app.ball.velocity.z = app.paddle.velocity.z * app.config.humanHitVelocityScale;
    //   app.justHit = "human";
    //   app.pointHasBegun = true;
    //   console.warn('SERVE DETECTED from inside restartRound()');
    // }
    // }
  //initial serve
  // app.justServed = true;
  // app.hasBouncedOnOppositeSide = false;
  // app.addPoint = true;
};

//Ping pong ball moves
app.updateBall = () => {
  const pos = app.ball.position;
  const paddle = app.paddle.position;

  app.guiControls.rollDebug = app.nextTurn;

  // apply gravity
  app.ball.velocity.y -= app.guiControls.gravity;
  // apply velocity to position
  app.ball.position.x += app.ball.velocity.x * app.guiControls.ballVelocityScale;
  app.ball.position.z += app.ball.velocity.z * app.guiControls.ballVelocityScale;
  app.ball.position.y += app.ball.velocity.y;

  // clamp Y, no sinking through table
  app.ball.position.y = Math.max(2, app.ball.position.y);

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

//easy mode to help user find ball position (x axis and y axis)
app.easyMode = () => {
  if (app.guiControls.easyMode && app.ball.velocity.z > 0 ) {
    app.paddle.position.x = app.ball.position.x
    app.paddle.position.y = app.ball.position.y
  }
}


//create, animate and add particle System to the scene
app.createParticleSystem = () => {

  const particles = new THREE.Geometry();

  const dist = app.guiControls.particleDistribution

  for (var i = 0; i < app.guiControls.numParticles; i++) {

    const particle = new THREE.Vector3(
      THREE.Math.randInt(-dist, dist),
      THREE.Math.randInt(-dist, dist),
      // 100,
      // THREE.Math.randInt(-dist, dist),
      -300
    )

    particle.vx = 0;
    particle.vy = 0;
    particle.vz = 0;


    particles.vertices.push(particle)
  }// for


  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 500,
    // map: THREE.ImageUtils.loadTexture('img/snowflake.png'),
    map: THREE.ImageUtils.loadTexture('img/cracker.gif'),
    blending: THREE.NormalBlending,
    transparent: true,
    alphaTest: 0.5
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);




  return particleSystem;
}

app.animateParticles = () => {
  const particles = app.particleSystem.geometry.vertices;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    // particle.y -= app.controls.bouncingSpeed;
    //
    // if (particle.y < -app.controls.particleDistribution){
    //   particle.y = app.controls.particleDistribution;
    // }

    const distSquared = (particle.x * particle.x)
                      + (particle.y * particle.y)
                      + (particle.z * particle.z);


    if (distSquared > 6.0) {
      const force = (10.0/distSquared) * -0.02;
      particle.vx += force * particle.x;
      particle.vy += force * particle.y;
      particle.vz += force * particle.z;
    }



     particle.x += particle.vx * app.guiControls.particleVelocityScale;
     particle.y += particle.vy * app.guiControls.particleVelocityScale;
     particle.z += particle.vz * app.guiControls.particleVelocityScale;
  }

  // app.particleSystem.rotation.y -= app.controls.rotationSpeed;
  app.particleSystem.geometry.verticesNeedUpdate = true;
}

app.showParticleSystem = () => {
  if (app.winner && app.activeParticle) {
    // console.log("show Particle System");
    app.particleSystem = app.createParticleSystem();
    app.scene.add(app.particleSystem);
    app.activeParticle = false;
  }
};


//check winning condition
app.matchScoreCheck = () => {
  let paddle;
  // if either one reaches 5 points
  if (app.aiScore >= app.winningScore) {
    app.winner = "AI";
    app.nextTurn = "human";
    app.aiScore = app.winningScore;
    paddle = app.paddleAI;
    app.ball.velocity.set(0,0,0);
    app.ball.position.set(0,2,-app.planeLength/2)
    // write to the banner
    document.getElementById("scores").innerHTML = "AI wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    //audience cheering
    app.cheering.play();
    // make paddle rotates
    app.step++;
    paddle.position.z = -170;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

    //particle system
    app.showParticleSystem();
    // app.particleSystem = app.createParticleSystem();
    // app.scene.add(app.particleSystem);
    // console.log('WINNER: AI');

  } else if (app.humanScore >= app.winningScore) {
    app.winner = "human";
    app.nextTurn = "AI";
    app.humanScore = app.winningScore;
    paddle = app.paddle;
    app.ball.velocity.set(0,0,0);
    app.ball.position.set(0, 2, app.planeLength/2)
    // write to the banner
    document.getElementById("scores").innerHTML = "Human wins!";
    document.getElementById("message").innerHTML = "Press enter to play again";
    app.cheering.play();
    // make paddle bounce up and down
    app.step++;
    paddle.rotation.y = Math.sin(app.step * 0.1) * 15;
    // enlarge and squish paddle
    paddle.scale.z = 2 + Math.abs(Math.sin(app.step * 0.1)) * 3;
    paddle.scale.x = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;
    paddle.scale.y = 2 + Math.abs(Math.sin(app.step * 0.05)) * 3;

    app.showParticleSystem();
    // app.particleSystem = app.createParticleSystem();
    // app.scene.add(app.particleSystem);
    // console.log('WINNER: AI');
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


//update scores helper method
app.updateScores = () => {
  app.justHit === "AI"? app.humanScore ++ : app.aiScore ++ ;
  document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore;
  // console.log('updateScores()');

  setTimeout(app.restartRound, 1000);
}


app.calculateTableBounce = (ball, lastHitBy) => {

  // Table bounce
  //if hit the table, change y axis direction so the ball would go up
  if( ball.position.y <= 2 && ball.velocity.y < 0 ){
    ball.velocity.y *= -1;

    //toggle the sound based on ball on which side
    if (Math.abs(ball.position.x) <= app.planeWidth/2 && Math.abs(ball.position.z) <= app.planeLength/2 && ball.position.y >= 0) {
      ball.position.z <= 0 ?
      app.aiSide.play() : app.humanSide.play()
    }

    // Check if bounce is legal
    // ball has crossed the net by the person
    if (app.hasCrossedNet(ball, lastHitBy)) {
      //if ball has bounced on the other side
      if(app.hasBouncedOnOppositeSide){
        //if opponent miss the ball
        if (Math.abs(app.ball.position.z) > app.planeLength/2) {
          document.getElementById("message").innerHTML = "Nice shot, " + lastHitBy + "!"

          ball.velocity.x *= 0.2;
          ball.velocity.z *= 0.2;

          // app.ball.velocity.x = 0;
          // app.ball.velocity.y = 0;
          // app.ball.velocity.z = 0;
          if (app.addPoint) {
            lastHitBy === "AI"? app.aiScore ++ : app.humanScore ++;
            document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore;
            app.addPoint = false;
          }
          // debugger;
          setTimeout(app.restartRound, 1000);
        }
        //ball hasn't bounce on the other side - first time bounce on the other side
      } else {
        app.hasBouncedOnOppositeSide = true;
      };

      // if ball has bounced on your own side before crossing net
    } else {
      //if app.justServed is false - it's not the first serve
      if( !app.justServed
        //if app.pointHasBegun is false - this is not human's first serve
        && app.pointHasBegun === false
        // && app.nextTurn === "AI"
      ){
        //the ball also didn't cross the net
        //illegal bounce
        console.log(`illegal bounce by ${lastHitBy}`);
        document.getElementById("message").innerHTML = "illegal bounce by " + lastHitBy;

        ball.velocity.x *= 0.2;
        ball.velocity.z *= 0.2;


        // console.log('addPoint', app.addPoint);
        if (app.addPoint) {
          app.updateScores(lastHitBy);
          app.addPoint = false;
        }

      }
      //change the point has begun to false after human first serve to activate the illegal bounce condition
      app.pointHasBegun = false;
    } //end else of hasCrossedNet

  } else {
    // No bounce

    if (app.hasCrossedNet(ball, lastHitBy) && (Math.abs(app.ball.position.z) > app.planeLength/2+10 || Math.abs(app.ball.position.x) > app.planeWidth/2+10) && !app.hasBouncedOnOppositeSide && Math.abs(ball.velocity.z) > 0) {
      // console.log("DIDN'T bounce at all");
      // ball.velocity.x *= 0.2;
      // ball.velocity.z *= 0.2;

      app.ball.velocity.x = 0;
      // app.ball.velocity.y = 0;
      app.ball.velocity.z = 0;

      app.paddleAI.position.x = ball.position.x - 50;
      app.paddleAI.position.y = ball.position.y - 50;
      console.log(`${lastHitBy} out`);
      document.getElementById("message").innerHTML = lastHitBy + " out!"

      if (app.addPoint) {
        app.updateScores(lastHitBy);
        app.addPoint = false;
      }
    }
  }
};


app.calculateBallOutOfBounds = (ball) => {
  //if user missed the ball
  // ***********the codes below duplicates with calculateTableBounce method*****************
  // if (ball.position.z >=200 & ball.velocity.z > 0){
  //   console.log("You lose 1 point");
  //   //stop ball
  //   ball.velocity.x = 0;
  //   ball.velocity.z = 0;
  //   document.getElementById("message").innerHTML = "You lose 1 point";
  //
  //   //update score board
  //   app.aiScore ++;
  //   document.getElementById("scores").innerHTML = app.aiScore + " - " + app.humanScore
  //   // debugger;
  //   setTimeout(app.restartRound, 2000);
  // }

  /* ALSO NEED TO CHECK:
     - if ball is too far off the side of the table (only when sideWalls are off)
     - if ball has bounced more than once
     - if ball has bounced on your own side before crossing net (see calculateTableBounce method above)
     - if ball has hit net
  */

  //if ball is too far off the side of the table (only when sideWalls are off)
  // if (ball.position.x >= 200 || ball.position.x <= - 200){
  //   console.log("too far off the side");
  //   document.getElementById("message").innerHTML = "too far off the side"
  //   setTimeout(app.restartRound, 2000);
  // }

  // if ball has hit net
  if ( Math.abs(ball.position.x) <= app.planeWidth/2
    && Math.abs(ball.position.y) <= app.net.position.y
    && Math.abs(ball.position.z) <= 2.5
    // these conditions avoid the ball 'jitter' of being
    // bounced back and forth within the net range
    &&  ((app.justHit === 'human' && ball.velocity.z < 0 )
        ||
        (app.justHit === 'AI' && ball.velocity.z > 0 ))
    ){
    console.log(`${app.justHit} hit the net!`);
    document.getElementById("message").innerHTML = app.justHit + " hit the net!"
    // ball.velocity.set(0, 0, 0);
    ball.velocity.z *= -1;
    ball.velocity.multiplyScalar(0.3);


    if (app.addPoint) {
      app.updateScores(app.justHit);
      app.addPoint = false;
    };
  }

  // if ball is too high
  if (ball.position.y > 80 && Math.abs(ball.position.z) === app.planeLength/2) {
    console.log("ball is too high, can't catch it");
    document.getElementById("message").innerHTML = "ball is too high, can't catch it"
    setTimeout(app.restartRound, 1000);
  }

};


app.calculatePaddlehit = (ball, paddle, paddleAI) => {
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

      //play the sound
      ball.position.y > 0? app.humanPaddleSound.play(): app.humanPaddleSound.pause();

      app.justHit = "human"; // toggle the value for who just hit
      //to check if the ball has crossed the net
      app.hasBouncedOnOppositeSide = false;
      ball.velocity.z += paddle.velocity.z * app.config.humanHitVelocityScale;

      // Do the one-off AI decisions
      // console.log('UPDATE AI MOVE');



  // human just hit - now AI's turn
  } else if (ball.velocity.z < 0
    && paddleAI.position.z - ball.position.z > -4
    && app.withinBounceRange(ball, paddleAI) ){

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
        - 20, 100,
        -Math.PI/4, Math.PI/4
      )
      // DONE: fine tune this to be more accurate
      // paddleAI.rotation.y = (Math.random())*(-Math.PI/2) + Math.PI/4
      // paddleAI.rotation.y = THREE.Math.randFloat(Math.PI/15, -Math.PI/15);

      if (app.ball.position.x >= 0 &&  app.ball.position.x < app.planeWidth/2 + 100) {
        paddleAI.rotation.y = THREE.Math.mapLinear(
          ball.position.x,
          0, app.planeWidth/2,
          0, - Math.PI/6
        )
        paddleAI.rotation.y = THREE.Math.clamp(paddleAI.rotation.y, 0, - Math.PI/6);
      } else if (app.ball.position.x < 0 && app.ball.position.x > -app.planeWidth/2 - 100) {
        paddleAI.rotation.y = THREE.Math.mapLinear(
          ball.position.x,
          -app.planeWidth/2, 0,
          Math.PI/6, 0
        )
        paddleAI.rotation.y = THREE.Math.clamp(paddleAI.rotation.y, Math.PI/6, 0);
      };

      // ball.velocity.multiplyScalar(-1)
      ball.velocity.reflect( normalizedNormal );
      ball.velocity.z = THREE.Math.mapLinear(
        paddleAI.rotation.x,
        -Math.PI/12, Math.PI/8,
        1.8, 2.2
      )

      // ball.velocity.z = 3;
      //calculate paddle.rotation.x angle based on y position, then calculate bounce back speed based on angle
      // .multiplyScalar(app.guiControls.bouncingSpeed);
      app.aiPaddleSound.play();
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
