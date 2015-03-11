// add volume slide for all !

var t = 0;
var step = 0.05;

var motions = [];

var colours = [
		'FE4365', 'FC9D9A', 'F9CDAD',
        'C8C8A9', '83AF9B', 'FC913A',
        'F9D423', '435356', '566965',
        'FF7373', 'A9DA88', 'E3AAD6',
        '73A8AF', 'F6BCAD', 'BE4C54',
        '7CD7CF', 'FFA446', 'B5D8EB',
        'E05561', 'F4CE79', '77B29C'
];

var cssButton = "font-family: 'Orbitron', sans-serif; background:#000000; color:#FFFFFF; font-size:8pt; padding:4px;text-align: center;";

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function setup() {
  createCanvas(windowWidth, windowHeight);
   
  textFont('Orbitron');
  //p5.soundOut.limiter.disconnect(); // disconect the limiter
  //p5.soundOut.input.connect(p5.soundOut.output); // reconnect the audio chain
 
  frameRate(25);

  for (var i = 0 ; i <15 ; i++){
  	var x =  windowWidth * 1/10 + windowWidth * (i % 5) * 1/5;
	var y =  windowHeight * 1/6 + windowHeight * int(i/5) * 1/3;
	var col = color(hexToR(colours[i]),hexToG(colours[i]),hexToB(colours[i]));	
  	motions.push(new orgaM(col,midiToFreq(60),x,y,i));
  }
}

function draw() {	
	background(0);

	for (var i = 0 ; i <15 ; i++){
		motions[i].update();
		motions[i].updateAudio();
		motions[i].display();	
		
		var label = "midi note : " + motions[i].fSlider.value();
		text(label, motions[i].anchorX+25, motions[i].anchorY+55)	;

		label = "speed : " + motions[i].sSlider.value();
		text(label, motions[i].anchorX+25, motions[i].anchorY+80)	;	

		label = "volume : " + motions[i].vSlider.value();
		text(label, motions[i].anchorX+25, motions[i].anchorY+105)	;		
	}
		
}



function orgaM(col,freq,aX,aY,i){
	this.motion = i;
	this.scaleFactor = 80;
	this.radius = 20;
	this.col = col;
	this.anchorX = aX;
	this.anchorY = aY;

	this.initAudio(freq);

	this.freq;
	this.updateSpeed;

	this.t = 0;


	this.muteEffect = true;
	this.mute = createButton('un-mute');
	this.mute.position(aX-135,aY-110);
	this.mute.id(i+'-mute');
	this.mute.style(cssButton);
	this.mute.mousePressed(this.handleEvents);

	this.sine = createButton('sin');
	this.sine.position(aX-135,aY-80);
	this.sine.id(i+'-sin');
	this.sine.style(cssButton);
	this.sine.mousePressed(this.handleEvents);

	this.tri = createButton('tri');
	this.tri.position(aX-135,aY-50);
	this.tri.id(i+'-tri');
	this.tri.style(cssButton);
	this.tri.mousePressed(this.handleEvents);

	this.saw = createButton('saw');
	this.saw.position(aX-135,aY-20);
	this.saw.id(i+'-saw');
	this.saw.style(cssButton);
	this.saw.mousePressed(this.handleEvents);

	this.square = createButton('squ');
	this.square.position(aX-135,aY+10);
	this.square.id(i+'-squ');
	this.square.style(cssButton);
	this.square.mousePressed(this.handleEvents);

	this.fSlider = createSlider(0,127,36);
	this.fSlider.position(aX-135,aY+40);
	//this.fSlider.style(cssButton);
	this.fSlider.size(150,10);

	this.sSlider = createSlider(5,250,50);
	this.sSlider.position(aX-135,aY+65);
	//this.sSlider.style(cssButton);
	this.sSlider.size(150,10);

	this.vSlider = createSlider(0,127,50);
	this.vSlider.position(aX-135,aY+90);
	//this.vSlider.style(cssButton);
	this.vSlider.size(150,10);
}


orgaM.prototype.handleEvents = function(params){
	var tag = params.currentTarget.id; // get the id of the arguments passed
	var element = getElement(tag); // get the element
	var array = splitTokens(tag,'-'); // extract the index to of the motion we want to impact
	var index = array[0];

	if (element.elt.innerHTML == 'un-mute' && motions[index].muteEffect == true ){
		motions[index].muteEffect = false;
		element.html('mute');
	} else if (element.elt.innerHTML == 'mute' && motions[index].muteEffect ==false){
		motions[index].muteEffect = true;
		element.html('un-mute');
	}
	else if (element.elt.innerHTML== 'sin'){
		motions[index].oscillator.setType('sine');
	}
	else if (element.elt.innerHTML== 'tri'){
		motions[index].oscillator.setType('triangle');
	}
	else if (element.elt.innerHTML== 'saw'){
		motions[index].oscillator.setType('sawtooth');
	}
	else if (element.elt.innerHTML== 'squ'){
		motions[index].oscillator.setType('square');
	}
}


orgaM.prototype.initAudio = function(f) {
	this.oscillator = new p5.Oscillator(f,'sine');
	this.oscillator.start();
}

orgaM.prototype.updateAudio = function() {
	this.freq = this.fSlider.value();
	var vol = this.vSlider.value()/127;
	this.oscillator.freq(midiToFreq(this.freq));
	//this.oscillator = this.oscillator.mult(vol);

	if (this.muteEffect == false){
		var new_vol = map(this.radius,20,20+this.scaleFactor,0,1*vol/20);
		this.oscillator.amp(new_vol,0.015,0); // 0.015 is kind of a magic number here
	}
	else {
		this.oscillator.amp(0,0.15,0);
	}
}


orgaM.prototype.display = function() {
	noStroke();
	fill(this.col);
	ellipse(this.anchorX,this.anchorY-25,this.radius,this.radius);	
}

orgaM.prototype.update = function(){
	var minRadius = 20;

	this.t += this.sSlider.value()/1000;

	if (this.muteEffect == false){

	if(this.motion == 0){
		this.radius = minRadius + abs(sin(this.t)*this.scaleFactor);
	}
	else if(this.motion == 1){
		this.radius = minRadius + abs(cos(this.t)*this.scaleFactor);
	}
	else if(this.motion == 2){
		this.radius = minRadius + abs(sin(this.t)*cos(this.t)*this.scaleFactor);
	}
	else if(this.motion == 3){
		this.radius = minRadius + abs(sin(this.t)*sin(this.t*1.5)*this.scaleFactor);
	}
	else if(this.motion == 4){
		this.radius = minRadius + abs(sin(tan(cos(this.t)*1.2))*this.scaleFactor);
	}
	else if(this.motion == 5){
		this.radius = minRadius + abs(sin(tan(this.t)*0.05)*this.scaleFactor);
	}
	else if(this.motion == 6){
		this.radius = minRadius + abs(cos(sin(this.t*3))*sin(this.t*0.2)*this.scaleFactor);
	}
	else if(this.motion == 7){
		this.radius = minRadius + abs(sin(pow(8,sin(this.t)))*this.scaleFactor);
	}
	else if(this.motion == 8){
		this.radius = minRadius + abs(sin(exp(cos(this.t*0.8))*2)*this.scaleFactor);
	}
	else if(this.motion == 9){
		this.radius = minRadius + abs(sin(t-PI*tan(this.t)*0.01)*this.scaleFactor);
	}
	else if(this.motion == 10){
		this.radius = minRadius + abs(pow(sin(this.t*PI),12)*this.scaleFactor);
	}
	else if(this.motion == 11){
		this.radius = minRadius + abs(cos(sin(this.t)*tan(this.t*PI)*PI/8))*this.scaleFactor;
	}
	else if(this.motion == 12){
		this.radius = minRadius + abs(sin(tan(this.t)*pow(sin(this.t),10))*this.scaleFactor);
	}
	else if(this.motion == 13){
		this.radius = minRadius + abs(cos(sin(this.t*3)+this.t*3)*this.scaleFactor);
	}
	else if(this.motion == 14){
		this.radius = minRadius + abs(pow(abs(sin(this.t*2))*0.6,sin(this.t*2))*0.6*this.scaleFactor);
	}
}
else {
	this.radius = minRadius;
}
}



