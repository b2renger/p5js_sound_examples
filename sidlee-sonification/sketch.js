/*
Object {date: "2015-02-18T16:47:07.811Z", value: 1, unit: "goal", _id: "red"}
Object {date: "2015-02-18T16:43:18.710Z", value: 1, unit: "goal", _id: "blue"}
Object {date: "2015-02-18T16:44:08.562Z", value: 1, unit: "u", app: "InDesign", user: "Antoine"…}
Object {date: "2015-02-18T16:54:05.668Z", value: 64, unit: "count", _id: "devices"}
*/


var client = new SidLeeClient('https://sidlee.herokuapp.com/', update_values);

var eventValue, eventID, eventUnit, eventDate;

var soundValue, lightValue, degreesValue, wattValue, stairsValue, lightswitchValue, visitsValue, 
fridgeValue, waterValue, doorValue, likesValue, babyValue, coffeeValue, devicesValue, faxValue, flushValue, 
printerValue;

var fridgeSound, stairsSound, waterSound, doorSound, cofeeSound, faxSound, flushSound, printerSound;
var tracerSound, babySound;
var lightSwitchSound;

var visitsSound;
var connectedSound, unconnectedSound;
var likeSound;
var ctrlZSound;

var officeSound;
var electricSound;
var filter;

var lastHour=-1;

var col1=0;
var col=255;
var odd = true;

var mute = false;

function preload(){
	soundFormats('ogg'); 

	fridgeSound = loadSound('sounds/118435__localtalkradio__fridgeopen_sel.ogg');
	stairsSound = loadSound('sounds/85561__maj061785__running-up-stairs.ogg');
	waterSound = loadSound('sounds/80758__noisecollector__office-watercoolermono.ogg');
	doorSound = loadSound('sounds/153437__kyodon__main-door.ogg');
	cofeeSound = loadSound('sounds/234245__rivernile7__coffee-machine.ogg');
	faxSound = loadSound('sounds/64463__robinhood76__00707-fax-printing-1.ogg');
	flushSound = loadSound('sounds/209537__jackjames-tomknevitt__toilet-flush.ogg');
	printerSound = loadSound('sounds/182894__toiletrolltube__printer-1-16-1-11.ogg');
	tracerSound = loadSound('sounds/pen_plotter.ogg');
	babySound= loadSound('sounds/baby.wav');

	lightSwitchSound =  loadSound('sounds/201663__ashleyxxpiano__light-switches.ogg');

	connectedSound =  loadSound('sounds/232210_timbre_connected.ogg');
	unconnectedSound =  loadSound('sounds/232210_timbre_unconnected.ogg');
	visitsSound = loadSound('sounds/spawn.wav');
	ctrlZSound = loadSound('sounds/glitch.wav');
	likeSound = loadSound('sounds/claps.ogg');

	officeSound = loadSound('sounds/259632__stevious42__office-background-1.ogg');
	electricSound = loadSound('sounds/187931__mrauralization__electric-humming-sound.wav');

	

}

function setup() {
  createCanvas(320, 240);
  textSize(14);
  //textFont("gothamhtf-lightcondensed");
  smooth();
  frameRate(25);

  filter = new p5.BandPass();
  officeSound.disconnect();
  officeSound.connect(filter);

  electricSound.disconnect();
  electricSound.connect(filter);

  officeSound.loop();
  electricSound.loop();

  
  fft = new p5.FFT();
  

}

function draw() {

	background(col1);
	fill(col);
	stroke(col);
	text("SID LEE   immersive experience",10,20);

	var vol = int(map(soundValue,30,80,50,100));
	officeSound.setVolume(vol/100,0.15,0);

	var volE = constrain(int(map(wattValue,10000,100000,20,100)),20,100);
	electricSound.setVolume(volE/100,0.15,0);
	// println(volE);

  var filterFreq = int(map(lightValue,0,40,800,2000));
  filter.freq(filterFreq);
  filter.res(2);

	
	var date = new Date();

	if (date.getHours() != lastHour){
		lastHour = date.getHours();
		
		if (lastHour == 0){

		}
		else if (lastHour == 8){

		}

	}

	
  	
  

  if (odd){
    stroke(col);
  fill(col);
  strokeWeight(1);
    var waveform = fft.waveform();  // analyze the waveform
    for (var i = 0; i < waveform.length; i++){
   	  var x = map(i, 0, waveform.length, 0, width);
   	  var y = map(waveform[i], 0, 256, height, 0);
   	  point(x, y);
    }
  }
  else{
    stroke(col);
  fill(col);
  strokeWeight(1);
    var spectrum = fft.analyze();
    for (var i = 0; i < spectrum.length; i++) {
      var x = map(i, 0, spectrum.length, 0, width);
      var h = -height + map(spectrum[i], 0, 255, height-5, 0);
      rect(x, height, width/spectrum.length, h);
    }
  }


  rect(width-15,10,7,10);
  quad(width-22,7,width-15,10,width-15,20,width-22,23);

  if (mute){
    push();
    noFill();
    stroke(255,0,0);
    strokeWeight(2);
    ellipse(width-15,15,15,15);

    translate(width-15,15);
    rotate(-PI/4);
    line(-15/2,0,15/2,0);
    pop();
    masterVolume(0);
  }
  else{
    masterVolume(.75);
  }
  
  	

}

function mousePressed(){

  if(dist(mouseX,mouseY,width-15,15)<15){
    mute = !mute;
  }
}


function update_values(data){
   
   	var datas = JSON.stringify(data);
   	datas = JSON.parse(datas);
	
	eventDate = datas.date;
	eventID = datas._id;
	eventValue = datas.value;
	eventUnit = datas.unit;

   	if (datas._id == "sound"){
   		soundValue = datas.value;
   	}
   	else if (datas._id == "light"){
   		lightValue = datas.value;
   	}
   	else if (datas._id == "degrees"){
   		degreesValue = datas.value;
   	}
   	else if (datas._id == "watt"){
   		wattValue = datas.value;
   	}

   	else if (datas._id == "stairs"){
   		stairsSound.play();
   	}
   	else if (datas._id == "lightswitch"){
   		lightSwitchSound.play();
   		lightSwitchSound.setVolume(0.05,0.15,0);
   		if (odd){
   			odd = false;
   			col = 0;
   			col1 =255;
   		}
   		else{
   			odd = true;
   			col = 255;
   			col1 =0;
   		}
   	}
   	else if (datas._id == "fridge"){
   		fridgeSound.play();
   	}
   	else if (datas._id == "water"){
   		waterSound.play();
   	}
   	else if (datas._id == "door"){
   		doorSound.play();
   	}
   	else if (datas._id == "coffee"){
   		cofeeSound.play();
   	}
   	else if (datas._id == "fax"){
   		faxSound.play();
   	}
   	else if (datas._id == "flush"){
   		flushSound.play();
   	}
   	else if (datas._id == "printer"){
   		printerSound.play();
   	}
   	else if (datas._id == "baby"){
   		babyValue = datas.value;
   		babySound.play();
   	}
   	else if (datas._id == "tracer"){
   		tracerSound.play();
   	}


   	else if (datas._id == "visits"){
   		visitsValue = datas.value;
   		visitsSound.play();
   	}
   	else if (datas._id == "likes"){
   		likesValue = datas.value;
   		likeSound.play();
   	}	
   	else if (datas._id == "devices"){
   		if(devicesValue>datas.value){
   			unconnectedSound.play();
   			unconnectedSound.setVolume(0.5,0.05,0);
   		}
   		else if (devicesValue<datas.value){
   			connectedSound.play();
   			connectedSound.setVolume(0.5,0.05,0);
   		}

   		devicesValue = datas.value;
   	}
   	// those are the CTRL+Z
   	else { 
   		ctrlZSound.play();
   		
   	}
	
}

