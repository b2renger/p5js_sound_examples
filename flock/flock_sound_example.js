var flock;

var text;

function setup() {
  createCanvas(windowWidth,windowHeight);
  
  flock = new Flock();
  // Add an initial set of boids into the system
  for (var i = 0; i < 5; i++) {
    var b = new Boid(width/2,height/2);
    flock.addBoid(b);
  }

  // for our gui
  sp = new simulationParameters();
  gui = new dat.GUI();
  initGui();
}

function draw() {
  background(51);
  flock.run();
  flock.update_audio();
}


// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

Flock.prototype.removeBoid = function() {
  this.boids.pop();
}



// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x,y) {
  this.acceleration = createVector(0,0);
  this.velocity = createVector(random(-1,1),random(1));
  this.position = createVector(x,y);
  this.r = 3.0;
  this.maxspeed = 4;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force

  // this is new !
  this.boid_sound_engine(); // initialize the sound engine
}


Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  var theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x,this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r*2);
  vertex(-this.r, this.r*2);
  vertex(this.r, this.r*2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width +this.r/2;
  if (this.position.y < -this.r)  this.position.y = height+this.r/2;
  if (this.position.x > width +this.r) this.position.x = -this.r/2;
  if (this.position.y > windowHeight+this.r) this.position.y = -this.r/2;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 25.0;
  var steer = createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0,0);
  }
}

////////////////////////////////////////////////////////////////////////////////////
// Sound Engine for each boid
// and setter functions 
Boid.prototype.boid_sound_engine = function(){
  // a noise source to be modulated
  // we will use the pan function of noise to place our object in a stereo field
  this.noise = new p5.Noise();
  this.noise.disconnect();
  this.noise.amp(0.05,2);
  this.noise.start();

  // an osc to modulate the noise
  // we will be able to adjust the frequency according to the speed of each object
  this.osc = new p5.Oscillator('sine');
  this.osc.disconnect();
  this.osc.amp(1,2,0);
  this.osc.freq(random(5,15));
  this.osc.start();

  // let's do the modulation !
  this.noise.amp(this.osc,5,5);

  // now we need a filter, we will adjust it's parameters according to our simulation
  // cutoff, and quality for a simulation of a doppler effect
  this.filter = new p5.BandPass();
  this.filter.disconnect();
  this.filter.set(500,2);
  
  // connect our noise to our filter
  this.noise.connect(this.filter);

  // we will need another low pass filter ... for the head (when a helico flies behind you, your head make for a lp filter)
  this.lp = new p5.LowPass();
  this.lp.freq(2000);

  this.filter.connect(this.lp);
}

// a first function to control the volume of our object :
// it should be loud when close, and down to zero above a certain treshold
// we just need a utility function to set global volume, and we will do the
// maths to find the proper value in the simulation code
Boid.prototype.s_setGain = function(value){
    this.filter.amp(value);
}

Boid.prototype.s_doppler = function(value){
    this.filter.set(value,2);
}

Boid.prototype.s_pan = function(value){
  this.noise.pan(value);
}

Boid.prototype.s_lp = function(value){
    this.lp.freq(value);
}

Boid.prototype.s_adjustSpeed = function(){
    this.osc.freq(map(this.velocity.mag(),0.5,5,5,10));
}

/////////////////////////////////////////////////////////////////////////////////////////
// a function to adjust audio parameters of each boids
//
Flock.prototype.update_audio = function(){
  // take the distance beetween mouse and every object, and adjust amp, filter (doppler effect) and pan
  // we will also take into account the mask effect created by the head with a low pass filter
  for (var i = 0; i < this.boids.length; i++) {
    var distance = dist(width/2,height/2,this.boids[i].position.x, this.boids[i].position.y);

    if (distance < sp.threshold){
      // first we draw a line for each boid we should hear
      stroke(0);
      line(width/2,height/2,this.boids[i].position.x, this.boids[i].position.y);

      // set global volume according to distance
      this.boids[i].s_setGain(map(distance,0,250,1,0));
      // same for the frequency of the filter to simulate doppler effect
      this.boids[i].s_doppler(map(distance,0,250,1000,500));

      // now we need to calculate an angle to deal with the panoramic
      var mouse = createVector(width/2,height/2);
      var temp = mouse.sub(this.boids[i].position);
      var angle = temp.heading();
      var pan_value = map(abs(angle),0,PI,-1,1); // we don't care if the boid is in front or behind us (it's just left / right)
      this.boids[i].s_pan(pan_value);

      // deal with the masking effect of our head adjusting a low pass
      var mask = 0;
       if (angle<0){
        mask = 1000;
       }
       else{
        mask = 2500;
       }
       this.boids[i].s_lp(mask);
       this.boids[i].lp.res((250-distance)/200); // resonance gets stronger when closer !

      // adjust the frequency of the noise modulation to the actual object speed 
      this.boids[i].s_adjustSpeed();
    }
    else{
      this.boids[i].s_setGain(0); // just to be sure ...
    }
   
  }

}



////////////////////////////////////////////////////////////////////////
// GUI
// we need only three elements : 
// - one slider for hearibility treshold, 
// - one button to add a boid, 
// - and one to remove
var initGui = function() {
  var f2 = gui.addFolder('Simulation parameters');
  f2.add(sp, 'threshold',100,500);
  f2.add(sp, 'add_boid');
  f2.add(sp, 'remove_boid');  
}

var simulationParameters = function(){
  this.threshold = 250 ;
  this.add_boid = function (){flock.addBoid(new Boid(random(windowWidth),random(windowHeight)))}
  this.remove_boid = function (){flock.removeBoid();}
}