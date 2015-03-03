
var springs = [];
var gui,sp;

var major_scale = [0,2,3,5,7,8,10,12];
var minor_scale = [0, 1, 4, 5, 7, 8, 11, 12];
var lydian_dominant = [0, 2, 4, 6, 7, 9, 10, 12];
var harmonic_minor = [0, 2, 3, 5, 7, 8, 11, 12];
var chromatic_blues = [0, 2, 3, 4, 5, 6, 7, 9];
var pentatonic = [0, 2, 4, 7, 9, 12, 14, 16];
var pentatonic_blues = [0, 2, 3, 4, 7, 8, 9, 12];
var whole_tones = [0, 2, 4, 6, 8, 10, 12, 14];
var diminished = [0, 2, 3, 5, 6, 8, 9, 11];

 
function setup() {

  createCanvas(windowWidth, windowHeight);
  frameRate(25);
  smooth(); 
  
  for (var i=0; i<8; i++) {
  	s1 = new Spring( 50+ windowWidth*i/8, windowHeight/2,  20, 0.98, 1.0);
  	s1.audio();
  	s1.set_note(60 + i);
    springs.push(s1);
  }

   scale = new scaleParameters();
   sim =  new simulationParameters();
   gui = new dat.GUI();
   initGui();
}


function draw() {

  background(0);
  fill(255);
  
  for (var i=0; i<springs.length; i++) {
    springs[i].update();
    springs[i].audio_update();
    springs[i].display();

  	springs[i].set_mass(sim.Mass);
  	springs[i].set_damping(sim.Damping);
  	springs[i].set_k(sim.K);
  }  

  change_note();
}


function mousePressed(){
	for (var i=0; i<springs.length; i++) {
    	springs[i].pressed(); 
	} 
}

function mouseReleased(){
  for (var i=0; i<springs.length; i++) {
    	springs[i].released(); 
	} 
}


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

function change_scale(scale2set){
  scale.Spring_0 = scale2set[0]+scale.Base_Note; 
  scale.Spring_1 = scale2set[1]+scale.Base_Note; 
  scale.Spring_2 = scale2set[2]+scale.Base_Note; 
  scale.Spring_3 = scale2set[3]+scale.Base_Note; 
  scale.Spring_4 = scale2set[4]+scale.Base_Note; 
  scale.Spring_5 = scale2set[5]+scale.Base_Note; 
  scale.Spring_6 = scale2set[6]+scale.Base_Note; 
  scale.Spring_7 = scale2set[7]+scale.Base_Note; 
}


var scaleParameters = function() {
  this.Spring_0 = 60;
  this.Spring_1 = 62;
  this.Spring_2 = 63;
  this.Spring_3 = 65;
  this.Spring_4 = 67;
  this.Spring_5 = 68;
  this.Spring_6 = 70;
  this.Spring_7 = 72; 

  this.major = function (){change_scale(major_scale);}
  this.minor = function (){change_scale(minor_scale);}
  this.lydian_dominant = function (){change_scale(lydian_dominant );}
  this.harmonic_minor = function (){change_scale(harmonic_minor);}
  this.chromatic_blues = function (){change_scale(chromatic_blues);}
  this.pentatonic = function (){change_scale(pentatonic);}
  this.pentatonic_blues = function (){change_scale(pentatonic_blues);}
  this.whole_tones = function (){change_scale(whole_tones);}
  this.diminished = function (){change_scale(diminished);}

  this.Base_Note = 60;
};

var simulationParameters = function(){
  this.Mass = 1 ;
  this.Damping = 0.90 ;
  this.K = 0.2;
}

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

  var f3 = gui.addFolder('Scale Presets');
  f3.add(scale, 'Base_Note',0,127);
  f3.add(scale,'major');
  f3.add(scale,'minor');
  f3.add(scale,'lydian_dominant');
  f3.add(scale,'harmonic_minor');
  f3.add(scale,'chromatic_blues');
  f3.add(scale,'pentatonic');
  f3.add(scale,'pentatonic_blues');
  f3.add(scale,'whole_tones');
  f3.add(scale,'diminished'); 
};
    

