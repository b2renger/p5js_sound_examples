# p5.js sound examples with p5.sound
_______________________________________________________

This repo hosts example of code using p5.js and it's sound library p5.sound :
- http://p5js.org/
- http://p5js.org/reference/#/libraries/p5.sound

I also use dat.gui.js for the guis :
- http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage 
- https://code.google.com/p/dat-gui/

Three examples right now :

##### Table of Contents  
[Springs](#springs)  
[Flock](#flock)  
[Sid Lee sonification](#sidlee)

________________________________________________________________________________________________
<a name="springs"/>
## Springs 
________________________________________________________________________________________________
http://b2renger.github.io/pages_p5js/springs/index.html

This example is the sonification of a spring system simulation. 

### spring class to a row of springs
First we will take a look at the spring class *c_spring.js*, it's adapted from this code :

http://processingjs.org/learning/topic/springs/

to fit the p5.js style. We have also blocked the movement on the X axis, commenting line 38 to 43.

So we now want to create a line of 8 springs :
```javascript
var springs = [];

function setup() {

  createCanvas(windowWidth, windowHeight);

  for (var i=0; i<8; i++) {
  	s1 = new Spring( 50+ windowWidth*i/8, windowHeight/2,  20, 0.98, 1.0); // create the spring
    springs.push(s1); // put it in the springs array.
  }
}

function draw() {

  background(0);
  fill(255);
  
  for (var i=0; i<springs.length; i++) {
    springs[i].update();
    springs[i].display();
  }
}
```
### adding sound
We will implement our audio engine, object oriented style, so each of our spring will have the same sound. We just want to do some basic amplitude modulation. So we need to create an oscillator and control it's volume with the displacement of each spring.

We will agregate this method for our spring class. We simply create a new OScillator, declare a variable to hold its frequency, and start it :

```javascript
Spring.prototype.audio = function(){
  this.osc = new p5.SinOsc(); // create a new oscillator

  this.freq = midiToFreq(60); // create a variable to hold freq
  this.osc.freq(this.freq); // apply freq
  this.osc.start(); // start the oscillator
}
```
Since we are at it we can also create a new method to set the frequency :
```javascript
Spring.prototype.set_note = function(f){
  this.freq = midiToFreq(f);
  this.osc.freq(this.freq);
}
```
Now we want to create a new method to control the volume of our oscillator. We want to calculate the distance beetween the actual position of the spring and its rest position, then map this distance to a usefull range for controlling audio signal, and apply it :
```javascript
Spring.prototype.audio_update = function(){
  var newamp = constrain(map(abs(this.positionY - this.tempPosY),0,height/2,0,1),0,0.15);
  this.osc.amp(newamp,0.025,0);
}
```
Note the use of map() and constrain() to be sure the value stays in a given intervall.
When we apply the new amplitude, we want to use a second parameter to smoothen the changes in the audio level and avoid clicks.

Now in the setup we just need to init sound 
```javascript
for (var i=0; i<8; i++) {
  	s1 = new Spring( 50+ windowWidth*i/8, windowHeight/2,  20, 0.98, 1.0);
  	s1.audio(); // audio constructor
  	s1.set_note(60 + i); // set different frequencies
    springs.push(s1);
}
```
And in the draw to update sound :

```javascript
for (var i=0; i<springs.length; i++) {
    springs[i].update();
    springs[i].audio_update(); // call audio update
    springs[i].display();
}
```

### Using dat.gui
We gave a link to a dat.gui workshop at the top of the page.
http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage 

To sum-up : we create to data-structure to hold our parameters
- one for the frequency of our oscillators :
```javascript
var scaleParameters = function() {
  this.Spring_0 = 60;
  this.Spring_1 = 62;
  this.Spring_2 = 63;
  this.Spring_3 = 65;
  this.Spring_4 = 67;
  this.Spring_5 = 68;
  this.Spring_6 = 70;
  this.Spring_7 = 72; 
}
```
- one for our simulation parameters :
```javascript
var simulationParameters = function(){
  this.Mass = 1 ;
  this.Damping = 0.90 ;
  this.K = 0.2;
}
```
And we init the gui with two seperate folders four our sets of parameters :
```javascript
var initGui = function() {
  var f2 = gui.addFolder('Simulation parameters');
  f2.add(sim, 'Mass',1,50);
  f2.add(sim, 'Damping',0,1);
  f2.add(sim, 'K',0,1);  

  var f1 = gui.addFolder('Tuning (Midi notes)');
  f1.add(scale, 'Spring_0',0,127).listen();
  f1.add(scale, 'Spring_1',0,127).listen();
  f1.add(scale, 'Spring_2',0,127).listen();
  f1.add(scale, 'Spring_3',0,127).listen();
  f1.add(scale, 'Spring_4',0,127).listen();
  f1.add(scale, 'Spring_5',0,127).listen();
  f1.add(scale, 'Spring_6',0,127).listen();
  f1.add(scale, 'Spring_7',0,127).listen();
}
```
Now we write the code to update our object to their new parameters :
- first the simulation parameters we just have to add the following code to the for loop that handles our springs.
```javascript
springs[i].set_mass(sim.Mass);
springs[i].set_damping(sim.Damping);
springs[i].set_k(sim.K);
```
- then a conveniency function to change the frequencies :
```javascript
function change_note(){
 springs[0].set_note(scale.Spring_0);
 springs[1].set_note(scale.Spring_1);
 springs[2].set_note(scale.Spring_2);
 springs[3].set_note(scale.Spring_3);
 springs[4].set_note(scale.Spring_4);
 springs[5].set_note(scale.Spring_5);
 springs[6].set_note(scale.Spring_6);
 springs[7].set_note(scale.Spring_7);
}
```
Don't forget to call it in the draw() loop and you also need to declare and init all those new objects in the setup():
```javascript()
  scale = new scaleParameters();
  sim =  new simulationParameters();
  gui = new dat.GUI();
  initGui();
```

### Musical Scales
Now we want to have several scales to tune our system. We use array to store several scales which are by the way just series of intervalls. If you look up the internet you should find these pretty fast.

```javascript
var major_scale = [0,2,3,5,7,8,10,12];
var minor_scale = [0, 1, 4, 5, 7, 8, 11, 12];
var lydian_dominant = [0, 2, 4, 6, 7, 9, 10, 12];
var harmonic_minor = [0, 2, 3, 5, 7, 8, 11, 12];
var chromatic_blues = [0, 2, 3, 4, 5, 6, 7, 9];
var pentatonic = [0, 2, 4, 7, 9, 12, 14, 16];
var pentatonic_blues = [0, 2, 3, 4, 7, 8, 9, 12];
var whole_tones = [0, 2, 4, 6, 8, 10, 12, 14];
var diminished = [0, 2, 3, 5, 6, 8, 9, 11];
```
____________________________________________________________________________________________________

<a name="flock"/>
## Flock
____________________________________________________________________________________________________

Flock : http://b2renger.github.io/pages_p5js/flock/index.html

For this example we will try to sonify one of the flocking algorithm of Daniel Shiffman :
http://p5js.org/learn/examples/Simulate_Flocking.php

We will use the same approach as preivously, we will implement an object oriented audio engine and each particle will have its own sound. We will also build a gui with dat.gui.

We will work within the boid class first :

We need to proptotype our sound engine : what we want is to prototype a cheap helicopter sound using sound synthesis. When you think about it a helicopter sound wise is nothing more than white noise with amplitude modulation. So if you read the Spring example earlier it's nothing new.

```javascript
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
}

```

the frequency given to the oscillator will enable us to give an impression of speed : a small number will be perceived as slow, whether a big as fast. We will use this later on, as we have the speed of each boid in that flocking algorithm and of course we will map it to our sound.

Now we have to think about what parameters we want to be able to hear : for instance we need to place a listener and we will need to know what is the relative position of each boid to . If you listen to a bunch of cars passing next to you, they will move in your auditory field passing from left to right, from close to far, sometimes slowly and sometimes very fast. If a car is behind you the noise you perceive won't be the same as if you face it.

So having thought a bit about it we want to be able to make some crude spatialisation for our sounds (left, right, in front of you, behind), we will also want to have some kind of doppler effect :

http://en.wikipedia.org/wiki/Doppler_effect

For the spatialisation we will use the pan() method in the next part, for the doppler effect and the mask effect of your head we will use filters and bandpass for doppler et and a low pass for masking :

```javascript
  // now we need a filter, we will adjust it's parameters according to our simulation
  // cutoff, and quality for a simulation of a doppler effect
  this.filter = new p5.BandPass();
  this.filter.disconnect();
  this.filter.set(500,2);
  
  // connect our noise to our filter
  this.noise.connect(this.filter);

  // we will need another low pass filter :for the head 
  this.lp = new p5.LowPass();
  this.lp.freq(2000);

  this.filter.connect(this.lp);

```

we also want to add a few helper functions to set things:
```javascript
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

```

First the speed, because it's easy enough. The veocity of each boid is stored in a variable *this.velocity* so we can calculate its magnitude with the .mag() method. So we basically just have to map it !

```javascript
Boid.prototype.s_adjustSpeed = function(){
    this.osc.freq(map(this.velocity.mag(),0.5,5,5,10));
}
```
Now we need to compute all our parameters taking into account the position of the listener and the position of the boid. Our listener will be the mouse postion facing up-screen. We will use a variable for the audibility threshold *sp.treshold* (it's part of our gui so it's part of a data strucure share by our programm and dat.GUI, sp stands for simulation parameters in the setup). If a boid is nearer than this treshold then we need to compute it's paramters, else its volume is null.

```javascript
Flock.prototype.update_audio = function(){
  // take the distance beetween mouse and every object, and adjust amp, filter (doppler effect) and pan
  // we will also take into account the mask effect created by the head with a low pass filter
  for (var i = 0; i < this.boids.length; i++) {
    var distance = dist(mouseX,mouseY,this.boids[i].position.x, this.boids[i].position.y);

    if (distance < sp.threshold){
      // first we draw a line for each boid we should hear
      stroke(0);
      line(mouseX,mouseY,this.boids[i].position.x, this.boids[i].position.y);

      // set global volume according to distance
      this.boids[i].s_setGain(map(distance,0,250,1,0));
      // same for the frequency of the filter to simulate doppler effect
      this.boids[i].s_doppler(map(distance,0,250,1000,500));

      // now we need to calculate an angle to deal with the panoramic
      var mouse = createVector(mouseX,mouseY);
      var temp = mouse.sub(this.boids[i].position);
      var angle = temp.heading();
      var pan_value = map(abs(angle),0,PI,-1,1); // we don't care if the boid is in front or behind we will do it later
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
```

_____________________________________________________________________________________________________
<a name="sidlee"/>
## Sid Lee
_____________________________________________________________________________________________________
Sid_lee_sonification : http://b2renger.github.io/pages_p5js/sidlee-sonification/index.html

This example will use socket.io to connect to a live API delivering sensor data about Sid Lee's office in Paris.

So you should hear it along this visual : https://sidlee.herokuapp.com/

And here's the api I used : https://github.com/SidLeeParis/sidLeeAgenceConnectee
and also a js fiddle from Xavier (the guy behind all the arduino stuff and the node server - https://github.com/xseignard) to understand how to use the code : http://jsfiddle.net/07acad0b/4/

I need also to give credit to the samples as many sounds come from freesound.org. Thank you to : robinhood76, noisecollector, maj061785, localtalkradio, kyodon, toiletrolltube, mrauralization, ashleyxxpiano, jackjames-tomknevitt, timbre, rivernile7, stevious42.

### Get the data

First notice the two new js files : *sidlee-client.js* and *socket.io.js* those are used in js fiddle above to be able to connect to the api and get some data. So we declare and init a client, that will fire up the *update_values* function at the bottom of the code.

```javascript
var client = new SidLeeClient('https://sidlee.herokuapp.com/', update_values);
```

This *update_values* function is a parser of event, the client will pass data formated in JSON to our function. Each JSON packet as a field named **._id** we will use it to build an if statement to play sounds, adjust parameters etc.

```javascript
function update_values(data){
  var datas = JSON.stringify(data);
  datas = JSON.parse(datas);
  
  var eventID = datas._id; // the id
  var eventDate = datas.date; // we can get the date
  var eventValue = datas.value; // the value
  var eventUnit = datas.unit; //and the unit of the value

  if (eventID == 'sound'){
    // do something if the event caught is identifyied as the sound sensor  
  }
}
```

Earlier I said 'each', but in fact one event has no id : it's about the ctrl+z event produce by the several apps people from sid lee are using. Here's the format of the object passed.

```
Object {date: "2015-02-18T16:44:08.562Z", value: 1, unit: "u", app: "InDesign", user: "Antoine"…}
```
So to catch it we just assume that if a JSON object passed has no *_id* field it's a 'ctrl+z' event.


### making sound

We have a lot of data : fridge door opening, opening of the main door, water stirred from the water dispenser etc. all those event are ponctual they happen once and won't happen again before a certain amount of time. We can use samples for those, when an event is caught the corresponding sound is played !

First we need to preload the samples, it's best :

```javascript
var fridgeSound;

function preload(){
  soundFormats('ogg'); 
  fridgeSound = loadSound('sounds/118435__localtalkradio__fridgeopen_sel.ogg');
}
```

```javascript
function update_values(data){
   
  var datas = JSON.stringify(data);
  datas = JSON.parse(datas);

  if (data._id == 'fridge'){
    fridgeSound.play();
  }
```

But that not all, we also get sensor data about ambient sound level in the office, electric consumption of the whole office, and ambient light level. For the sound level and the electric consumption we will use samples played in loop mode, and we will add a filter which frequency will be mapped to the light level.

```javascript
var officeSound;
var electricSound;
var filter;

var lightValue;
var officeValue;
var wattValue;

function preload(){
  soundFormats('ogg'); 
  officeSound = loadSound('sounds/259632__stevious42__office-background-1.ogg');
  electricSound = loadSound('sounds/187931__mrauralization__electric-humming-sound.wav');
}
```

In the setup() function, we create and connect our filter :

```javascript
  filter = new p5.BandPass();
  officeSound.disconnect();
  officeSound.connect(filter);

  electricSound.disconnect();
  electricSound.connect(filter);

  officeSound.loop();
  electricSound.loop();
```

And we adjust parameters in the draw()

```javascript
  var vol = int(map(soundValue,30,80,50,100));
  officeSound.setVolume(vol/100,0.15,0);

  var volE = constrain(int(map(wattValue,10000,100000,20,100)),20,100);
  electricSound.setVolume(volE/100,0.15,0);

  var filterFreq = int(map(lightValue,0,40,800,2000));
  filter.freq(filterFreq);
  filter.res(2);

```

### the vizualisation

Well it's all here :
- waveform visualisation : http://p5js.org/learn/examples/Sound_Oscillator_Frequency.php
- spectrum visualisation : http://p5js.org/learn/examples/Sound_Frequency_Spectrum.php

We just switch beetween them according to the *lightswitch* data while inverting the colors.




