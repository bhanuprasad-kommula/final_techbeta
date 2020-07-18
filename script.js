const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

window.onload = window.onresize = function() {
  const factor = 2;
  const scale = window.devicePixelRatio / factor;
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  ctx.scale(scale * factor, scale * factor);
  
  setup();
  window.requestAnimationFrame(draw);
}

function setup() {
  wind = 0;
  
  snowCount = 0;
  snow = [];
  while (snowCount++ < 500) snow.push(new Particle);
  
  snowCanvas = document.createElement('canvas');
  landCanvas = document.createElement('canvas');
  ctxSnow = snowCanvas.getContext('2d');
  ctxLand = landCanvas.getContext('2d');
  snowCanvas.width = landCanvas.width = canvas.width;
  landCanvas.height = snowCanvas.height = canvas.height;
  snowData = ctxSnow.getImageData(0,0,snowCanvas.width,snowCanvas.height);
  landData = ctxLand.getImageData(0,0,landCanvas.width,landCanvas.height);
  snowBuffer = new ArrayBuffer(snowData.data.length);
  landBuffer = new ArrayBuffer(landData.data.length);
  snowBuf8 = new Uint8ClampedArray(snowBuffer);
  landBuf8 = new Uint8ClampedArray(landBuffer);
  snowRef = new Uint32Array(snowBuffer);
  landRef = new Uint32Array(landBuffer);
  
  ctx.fillStyle = '#1e1f26'; // Codepen color!
}

function draw() {
  window.requestAnimationFrame(draw);
  if (snow.length <= 10) setup();
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (const s of snow) {
    s.update();
    s.draw();
  }
  snowData.data.set(snowBuf8);
  landData.data.set(snowBuf8);
  ctxSnow.putImageData(snowData,0,0);
  ctxLand.putImageData(landData,0,0);
  ctx.drawImage(snowCanvas,0,0);
  ctx.drawImage(landCanvas,0,0)
  
  snow = snow.filter(s => { return !s.dead });
  wind += 0.001;
  wind %= 2*Math.PI;
}

window.onclick = function(event) {
  setup();
}

class Particle {
  constructor() {
    this.color = '0xffFFF0F0';
    this.reset();
    this.y = Math.floor(canvas.height * (2 * Math.random() - 1));
    this.dead = false;
    this.weight = Math.random();
  }
  update() {
    if (this.y == canvas.height-1) this.landHere();
    let move = false;
    if (
      landRef[(this.y+1)*canvas.width+this.x] == this.color &&
      landRef[(this.y+1)*canvas.width+this.x+1] == this.color &&
      landRef[(this.y+1)*canvas.width+this.x-1] == this.color
    ) this.landHere();
    
    if (landRef[(this.y+1)*canvas.width+this.x] != this.color) {
      snowRef[this.y*canvas.width+this.x] = '0x00000000';
      this.y++;
    }
    
    let chance = Math.random();
    if (
      this.weight+chance < Math.cos(wind) &&
      landRef[this.y*canvas.width+this.x+1] != this.color
    ) this.x++;
    
    if (
      this.weight+chance < Math.sin(wind) && 
      landRef[this.y*canvas.width+this.x-1] != this.color
    ) this.x--;
    
    this.x %= canvas.width;
  }
  reset() {
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(-canvas.height * Math.random());
  }
  landHere() {
    landRef[this.y*canvas.width+this.x] = this.color;
    this.reset();
    if (landRef[this.y*canvas.width+this.x] == this.color) this.dead = true;
  }
  draw() {
    let index = this.y*canvas.width+this.x;
    snowRef[index] = this.color;
  }
}