function Spring(x,y,m,d,k){ // mass, damping, k, 
  this.positionX = x ;
  this.tempPosX = x;
  this.restPosX = x;
  this.positionY = y ;
  this.tempPosY = y;
  this.restPosY = y;

  this.velX = 0;
  this.velY = 0;

  this.accel = 0;
  this.force = 0;
  

  this.mass = m;
  this.k = k;
  this.damp = d;

  this.radius = 100;

  this.isOver = false;
  this.move = false;
}


Spring.prototype.update = function(){
  if (this.move){
    this.restPosY = mouseY;
    //this.tempPosX = mouseX;
  }

  this.force = -this.k * (this.tempPosY - this.restPosY);
  this.accel = this.force/ this.mass;
  this.velY = this.damp * (this.velY + this.accel);
  this.tempPosY = this.tempPosY + this.velY;

  /*
  this.force = -this.k * (this.tempPosX - this.restPosX);
  this.accel = this.force/ this.mass;
  this.velX = this.damp * (this.velX + this.accel);
  this.tempPosX = this.tempPosX + this.velX;
  */
  
  if ((this.over() || this.move)){
    this.isOver = true ;
  }
  else {
    this.isOver = false;
  } 
}

Spring.prototype.over = function() {
  if(dist(this.tempPosX, this.tempPosY, mouseX, mouseY) < this.radius/2){
    return true;  
  }
  else {
    return false;
  } 
}

Spring.prototype.display =function(){
  if (this.isOver) { 
      fill(153); 
    } else { 
      fill(255); 
    } 
  ellipse(this.tempPosX, this.tempPosY, this.radius, this.radius);
}

Spring.prototype.pressed =function(){
  if (this.isOver) { 
      this.move = true; 
    } else { 
      this.move = false; 
    }    
}

Spring.prototype.released=function() {
  this.move = false;
  this.restPosX = this.positionX;
  this.restPosY = this.positionY;
}

Spring.prototype.set_mass=function(m){
  this.mass = m;
}

Spring.prototype.set_damping=function(d){
  this.damp = d;
}

Spring.prototype.set_k=function(k){
  this.k = k;
}

//////////////////////////////////////////////////////////////////////////////////////////
// audio specific methods
Spring.prototype.audio = function(){
  this.osc = new p5.SinOsc();
  this.osc.amp (0.5);

  this.freq = midiToFreq(60);
  this.osc.freq(this.freq);
  this.osc.start();
}

Spring.prototype.set_note = function(f){
  this.freq = midiToFreq(f);
  this.osc.freq(this.freq);
}

Spring.prototype.audio_update = function(){
  var newamp = constrain(map(abs(this.positionY - this.tempPosY),0,height/2,0,1),0,0.15);
  this.osc.amp(newamp,0.025,0);
}

/////////////////////////////////////////////////////////////////////////////////////////////
// gui specific methods
Spring.prototype.gui = function(gx,gy,label){ //guiPositionX, guiPositionY
  this.tinput = createInput();
  this.tinput.position(gx,gy);
  this.tinput.size(30,21);
  this.tinput.value('');

  this.button = createButton(label);
  this.button.position(gx+30,gy);
  this.button.mousePressed(this.change_note);
}


Spring.prototype.change_note = function(){
  this.set_note(this.tinput.value());
}






