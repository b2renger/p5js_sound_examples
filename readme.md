# p5.js sound examples with p5.sound
_______________________________________________________

This repo hosts example of code using p5.js and it's sound library p5.sound :
- http://p5js.org/
- http://p5js.org/reference/#/libraries/p5.sound

I also use dat.gui.js for the guis :
- http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage 
- https://code.google.com/p/dat-gui/

Three examples right now :

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
  	s1 = new Spring( 50+ windowWidth*i/8, windowHeight/2,  20, 0.98, 1.0);
  	s1.audio();
  	s1.set_note(60 + i);
    springs.push(s1);
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
### Scales
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

## Flock
____________________________________________________________________________________________________

Flock : http://b2renger.github.io/pages_p5js/flock/index.html

For this example we will try to sonify one of the flocking algorithm of Daniel Shiffman :
http://p5js.org/learn/examples/Simulate_Flocking.php

We will use the same approach as preivously, we will implement an object oriented audio engine and each particle will have its own sound. We will also build a gui with dat.gui.





## Sid Lee
_____________________________________________________________________________________________________
Sid_lee_sonification : http://b2renger.github.io/pages_p5js/sidlee-sonification/index.html

This example will use socket.io to connect to a live API delivering sensor data about Sid Lee's office in Paris.

So you should hear it along this visual : https://sidlee.herokuapp.com/

And here's the api I used : https://github.com/SidLeeParis/sidLeeAgenceConnectee
and also a js fiddle from Xavier Seignard (the guy behind all the arduino stuff and the node server - https://github.com/xseignard) to understand how to use the code : http://jsfiddle.net/07acad0b/4/

