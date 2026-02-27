let motions = [];

let colours = [
	'FE4365', 'FC9D9A', 'F9CDAD',
	'C8C8A9', '83AF9B', 'FC913A',
	'F9D423', '435356', '566965',
	'FF7373', 'A9DA88', 'E3AAD6',
	'73A8AF', 'F6BCAD', 'BE4C54',
	'7CD7CF', 'FFA446', 'B5D8EB',
	'E05561', 'F4CE79', '77B29C'
];

function hexToR(h) { return parseInt((h).substring(0, 2), 16) }
function hexToG(h) { return parseInt((h).substring(2, 4), 16) }
function hexToB(h) { return parseInt((h).substring(4, 6), 16) }

let experienceStarted = false;
let globalMasterBPM = 120;
let speedMultipliers = [0.125, 0.25, 0.3333, 0.5, 0.6666, 1, 1.5, 2, 3, 4, 8];
let speedLabels = ["1/8", "1/4", "1/3", "1/2", "2/3", "x1", "x1.5", "x2", "x3", "x4", "x8"];

function setup() {
	noCanvas(); // Using DOM positioning for individual modules
	frameRate(25);

	let startBtn = document.getElementById('start-btn');
	startBtn.addEventListener('click', () => {
		if (getAudioContext().state !== 'running') {
			getAudioContext().resume();
		}
		document.getElementById('start-screen').style.opacity = '0';
		setTimeout(() => {
			document.getElementById('start-screen').style.display = 'none';
			document.getElementById('master-bar').style.opacity = '1';
			document.getElementById('sketch-container').style.opacity = '1';

			experienceStarted = true;

			let masterSlider = document.getElementById('master-bpm-slider');
			let masterVal = document.getElementById('master-bpm-val');
			masterSlider.addEventListener('input', () => { // Track master BPM slider
				globalMasterBPM = parseFloat(masterSlider.value);
				masterVal.innerText = masterSlider.value;
			});

			// Generate 15 responsive modules
			let scale = [0, 2, 4, 7, 9]; // Pentatonic scale
			for (let i = 0; i < 15; i++) {
				let col = color(hexToR(colours[i]), hexToG(colours[i]), hexToB(colours[i]));
				let note = 48 + scale[i % 5] + Math.floor(i / 5) * 12;
				motions.push(new OrgaM(col, note, i));
			}
		}, 800);
	});
}

function draw() {
	if (!experienceStarted) return;

	for (let i = 0; i < motions.length; i++) {
		motions[i].update();
		motions[i].updateAudio();
		motions[i].display();
	}
}

class OrgaM {
	constructor(col, note, index) {
		this.index = index;
		this.motion = index;
		this.scaleFactor = 80;
		this.radius = 20;
		this.col = col;
		this.midiNote = note;

		this.t = 0;
		this.muteEffect = true;

		this.initAudio(note);
		this.buildDOM();
	}

	initAudio(note) {
		this.oscillator = new p5.Oscillator(midiToFreq(note), 'sine');
		this.oscillator.start();
		this.oscillator.amp(0, 0);
	}

	buildDOM() {
		this.modDiv = createDiv('');
		this.modDiv.class('module');
		this.modDiv.parent('sketch-container');

		this.canvasDiv = createDiv('');
		this.canvasDiv.class('module-canvas');
		this.canvasDiv.parent(this.modDiv);

		this.circleEl = createDiv('');
		this.circleEl.style('border-radius', '50%');
		this.circleEl.style('background-color', `rgb(${red(this.col)}, ${green(this.col)}, ${blue(this.col)})`);
		this.circleEl.style('transition', 'width 0.05s linear, height 0.05s linear');
		this.circleEl.parent(this.canvasDiv);

		let controlsDiv = createDiv('');
		this.controlsDiv = controlsDiv;
		controlsDiv.class('controls');
		controlsDiv.parent(this.modDiv);

		let btnGroup = createDiv('');
		btnGroup.class('btn-group');
		btnGroup.parent(controlsDiv);

		this.muteBtn = createButton('Unmute');
		this.muteBtn.class('control-btn mute-btn');
		this.muteBtn.parent(btnGroup);
		this.muteBtn.mousePressed(() => {
			// Mute state toggle
			this.muteEffect = !this.muteEffect;
			if (this.muteEffect) {
				this.muteBtn.html('Unmute');
				this.muteBtn.removeClass('active');
			} else {
				this.muteBtn.html('Muted');
				this.muteBtn.addClass('active');
			}
		});

		let oscTypes = ['sine', 'triangle', 'sawtooth', 'square'];
		this.oscBtns = [];
		for (let i = 0; i < oscTypes.length; i++) {
			let label = oscTypes[i].substring(0, 3);
			let btn = createButton(label);
			btn.class('control-btn');
			if (i === 0) btn.addClass('active');
			btn.parent(btnGroup);
			btn.mousePressed(() => {
				this.oscillator.setType(oscTypes[i]);
				for (let ob of this.oscBtns) ob.removeClass('active');
				btn.addClass('active');
			});
			this.oscBtns.push(btn);
		}

		this.fSliderWrap = this.createSliderWithLabel('Midi Note', 0, 127, this.midiNote, controlsDiv);
		this.sSliderWrap = this.createSliderWithLabel('Speed', 0, speedMultipliers.length - 1, 3, controlsDiv);
		this.vSliderWrap = this.createSliderWithLabel('Volume', 0, 127, 50, controlsDiv);
	}

	createSliderWithLabel(labelText, min, max, val, parent) {
		let wrap = createDiv('');
		wrap.class('slider-group');
		wrap.parent(parent);

		let labelBlock = createDiv('');
		labelBlock.class('labels');
		labelBlock.parent(wrap);
		// We use HTML insertion to add the spans without relying on p5 createElement wrapping
		labelBlock.html(`<span>${labelText}</span><span class="val">${val}</span>`);
		let valSpan = labelBlock.elt.querySelector('.val');

		let slider = createSlider(min, max, val);
		slider.parent(wrap);

		// Older p5 versions lack .input(), so we bind to the native DOM element directly:
		slider.elt.addEventListener('input', () => {
			if (labelText === 'Speed') {
				valSpan.innerHTML = speedLabels[slider.value()];
			} else {
				valSpan.innerHTML = slider.value();
			}
		});

		if (labelText === 'Speed') {
			valSpan.innerHTML = speedLabels[val];
		}

		return { slider: slider, valSpan: valSpan };
	}

	updateAudio() {
		let freq = this.fSliderWrap.slider.value();
		let vol = this.vSliderWrap.slider.value() / 127.0;
		this.oscillator.freq(midiToFreq(freq));

		if (!this.muteEffect) {
			let new_vol = map(this.radius, 20, 20 + this.scaleFactor, 0, 1 * vol / 20);
			this.oscillator.amp(new_vol, 0.015, 0);
		} else {
			this.oscillator.amp(0, 0.15, 0);
		}
	}

	update() {
		let minRadius = 20;
		// 1 BPM = 1 beat per 60s
		// With 25 frames per second, 1 beat = 1500 frames
		// Each beat completes one full TWO_PI cycle.
		let mult = speedMultipliers[this.sSliderWrap.slider.value()];
		let currentBPM = globalMasterBPM * mult;
		this.t += (currentBPM * TWO_PI) / 1500.0;

		if (!this.muteEffect) {
			let sf = this.scaleFactor;
			let m = this.motion;

			if (m == 0) { this.radius = minRadius + abs(sin(this.t) * sf); }
			else if (m == 1) { this.radius = minRadius + abs(cos(this.t) * sf); }
			else if (m == 2) { this.radius = minRadius + abs(sin(this.t) * cos(this.t) * sf); }
			else if (m == 3) { this.radius = minRadius + abs(sin(this.t) * sin(this.t * 1.5) * sf); }
			else if (m == 4) { this.radius = minRadius + abs(sin(tan(cos(this.t) * 1.2)) * sf); }
			else if (m == 5) { this.radius = minRadius + abs(sin(tan(this.t) * 0.05) * sf); }
			else if (m == 6) { this.radius = minRadius + abs(cos(sin(this.t * 3)) * sin(this.t * 0.2) * sf); }
			else if (m == 7) { this.radius = minRadius + abs(sin(pow(8, sin(this.t))) * sf); }
			else if (m == 8) { this.radius = minRadius + abs(sin(exp(cos(this.t * 0.8)) * 2) * sf); }
			else if (m == 9) { this.radius = minRadius + abs(sin(this.t - PI * tan(this.t) * 0.01) * sf); }
			else if (m == 10) { this.radius = minRadius + abs(pow(sin(this.t * PI), 12) * sf); }
			else if (m == 11) { this.radius = minRadius + abs(cos(sin(this.t) * tan(this.t * PI) * PI / 8)) * sf; }
			else if (m == 12) { this.radius = minRadius + abs(sin(tan(this.t) * pow(sin(this.t), 10)) * sf); }
			else if (m == 13) { this.radius = minRadius + abs(cos(sin(this.t * 3) + this.t * 3) * sf); }
			else if (m == 14) { this.radius = minRadius + abs(pow(abs(sin(this.t * 2)) * 0.6, sin(this.t * 2)) * 0.6 * sf); }
		} else {
			this.radius = minRadius;
		}
	}

	display() {
		this.circleEl.style('width', this.radius + 'px');
		this.circleEl.style('height', this.radius + 'px');
	}
}
