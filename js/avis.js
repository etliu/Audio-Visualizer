var CANVAS;
var ctx2;
var WIDTH;
var HEIGHT;
var frequencyData;
var renderFrame;
var datasample;
var analyser;
var barWidth = 1;
var fps = 1000/24
//defining blue and green values for color
var s = "99";

//TODO: add sliders for customizing internal variables, i.e. colors, data sample, etc
//TODO: add music controls and ability to upload own music
//TODO: fix chrome (and maybe safari/IE?) compatibility
//TODO: look into the whole anti-aliasing thing. NOTE: Aliasing only seems to happen with dark backgrounds.

//main loop
function main(){
    //keeps function on time, ensures alignment of audio and visual
    setTimeout(function(){
        //clears canvas for redrawing
        ctx2.clearRect(0, 0, CANVAS.width, CANVAS.height);
        //update frequencyData values
        renderFrame();
        //draw data
        DoubleMirror();
    }, fps);
}

//EXPERIMENTAL: solid circles. Three frequencies.
function SolidCircleDraw() {
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = .8;
    datasample = 16;
    var o = 0;
    
    for ( o = 0; o < datasample; o += 1) {
        ctx2.beginPath();
        ctx2.arc(WIDTH/2, HEIGHT/2, frequencyData[o]*3/2, 0, 2*Math.PI);
        ctx2.fillStyle = "#"+(150+(100/datasample)*o).toString(16)+(150+(100/datasample)*o).toString(16)+(150+(100/datasample)*o).toString(16);
        ctx2.fill();
    }
}

//flat bottom-aligned drawing
function Draw() {
    barWidth = 5
    var i = 0;
    var x = 0;//x defines spacing between bars
    
    for ( i = 0; i < datasample; i += 1) {
        //dynamically changes red color
        //defines color of each rect
        ctx2.fillStyle = "#"+(frequencyData[i]).toString(16)+s+s;
        //draing rectangles, scaling data up by 3
        ctx2.fillRect(x, HEIGHT, barWidth, -frequencyData[i]*3.5);
        //adds space btw lines
        x += (WIDTH/(datasample));
    }
}

//each bar is curved around a semicircular arc on the bottom of the page
function SemiCircle() {
    var m = 0;
    //radius of the arc
    var r1 = WIDTH/2;
    
    //adjusting intensity range
    analyser.maxDecibels = -25;
    analyser.minDecibels = -75;
    
    var semiEnd;
    for( m = 0; m < datasample; m += 1){
        //dynamically changing red color
        ctx2.strokeStyle = "#"+(frequencyData[m]).toString(16)+s+s;
        
        //see drawCircle function
        ctx2.beginPath();
        semiEnd = (frequencyData[m]>=1)?(-Math.PI*(1-(frequencyData[m]/255)) - .0002):(-Math.PI);
        ctx2.arc(WIDTH/2, HEIGHT, r1, -Math.PI - 0001, semiEnd);
        ctx2.stroke();
        
        r1 -= 10;
    }
}

//each bar is curved around a circular arc
function DrawCircle() {
    
    var k = 0;
    //outermost circle radius
    var r2 = 300;
    //modified datasample size for display purposes 
    datasample = 50;
    
    //modified range of decibels for aesthetics--allows some circles to be completed
    analyser.maxDecibels = -25;
    analyser.minDecibels = -75;
    //declaring arc end for circle
    var circleEnd;
    for( k = 0; k < datasample; k += 1){
        //dynamically change red color
        ctx2.strokeStyle = "#"+(frequencyData[k]).toString(16)+s+s;
        
        ctx2.beginPath();
        //turnary statement--fixes frequencyData[i]=0==>complete circle
        circleEnd = (frequencyData[k]>=1)?(Math.PI*2*(frequencyData[k]/255) - Math.PI * 0.5 - .0002):(Math.PI*-0.5);
        //centers center of circle and starts arc at near top of circle
        ctx2.arc(WIDTH/2, HEIGHT/2, r2, Math.PI*1.5-.0001, circleEnd);
        //drawing in the path
        ctx2.stroke();
        
        //reduce radius for next frequency--decided to make bass outermost circle--more "powerful" effect
        r2 -= 5;
    }
}

//aligns each bar orthagonally to a circle
//TODO: find a way to make bars thicker -- Really just get off of your lazy bum and do it omg.
function RadialDraw(){
    
    var n = 0;
    //defining innermost and outermost radii
    var inRad = 50;
    var outRad = 400;
    var wth = 50;
    
    var xEndPt;
    var yEndPt;
    
    for ( n = 0; n < datasample; n += 1){
        //dynaically change red color
        ctx2.strokeStyle = "#"+(frequencyData[n]).toString(16)+s+s;
//        ctx2.fillStyle = "#"+(frequencyData[n]).toString(16)+s+s;
        
        ctx2.beginPath();
        //defining point for line to start at
        ctx2.moveTo(WIDTH/2+inRad*Math.cos(2*n*Math.PI/datasample), HEIGHT/2+inRad*Math.sin(2*n*Math.PI/datasample));
        
        //scales each line between the min and max end points
        //split it up just to make this line more managable
        xEndPt = WIDTH/2+(inRad+outRad*(frequencyData[n]/255))*Math.cos(2*n*Math.PI/datasample);
        yEndPt = HEIGHT/2+(inRad+outRad*(frequencyData[n]/255))*Math.sin(2*n*Math.PI/datasample);
        ctx2.lineTo(xEndPt, yEndPt);
//        ctx2.lineTo(xEndPt + wth, yEndPt + wth);
//        ctx2.fill();
        ctx2.stroke();
    }
}

//centered & symetrical drawing
function DoubleMirror(){
    //see normal draw function
    var j = 0;
    var y = 0;
    
    for ( j = 0; j < datasample; j += 1) {
        ctx2.fillStyle = "#"+(frequencyData[j]).toString(16)+s+s;
        //defining each of the bands of audio
        ctx2.fillRect(WIDTH/2+y, HEIGHT/2, barWidth, frequencyData[j]);//Quadrant 1
        ctx2.fillRect(WIDTH/2+y, HEIGHT/2, barWidth, -frequencyData[j]);//Quadrant 4
        ctx2.fillRect(WIDTH/2-y, HEIGHT/2, barWidth, frequencyData[j]);//Quadrant 3
        ctx2.fillRect(WIDTH/2-y, HEIGHT/2, barWidth, -frequencyData[j]);//Quadrant 2
        //adds space btw lines
        y += (WIDTH/(2*datasample));
    }
}

//initialization/set-up
window.onload = function() {
    //import canvas from document and getting context
    CANVAS = document.getElementById("cv");
    ctx2 = CANVAS.getContext("2d");
    
    //defining width and height of canvas and updating the canvas' own information
    WIDTH = document.body.clientWidth;
    HEIGHT = document.body.clientHeight;
    CANVAS.height = HEIGHT;
    CANVAS.width = WIDTH;
    
    //getting audio from document
    var ctx1 = new (window.AudioContext || window.webkitAudioContext)();
    var audio = document.getElementById('myAudio');
    var audioSrc = ctx1.createMediaElementSource(audio);
    
    //creating analyser and defining properties
    analyser = ctx1.createAnalyser();
    
    //defines amplitude range for display, and scales values in frequencyData accordingly [0,255]
    //Note: analyser automatically applies log scale to data
    analyser.maxDecibels = -10;
    analyser.minDecibels = -80;
    
    //analyser applies a Blackman Window with alpha = 0.16, and then smoothes over time
    /* Blackman window is defined as:
    a0 - a1 * Math.cos(2 * Math.PI * x) + a2 * Math.cos(4 * Math.PI * x)
    where 
    alpha = constant in (0,1) that determines steepness of window
    x = i-th value of buffer window/number of values in buffer
    a0 = 0.5 * (1.0 - alpha)
    a1 = 0.5
    a2 = 0.5 * alpha
    
    in this instance, alpha = .16
    Used to reduce spectral leakage
    */
    
    /* Smoothing over time is defined as:
    arr[i] = arr[i-1] * alpha + arr[i] * (1.0 - alpha)
    where
    alpha = constant in (0,1) that determines amount of smoothing (defined below)
    arr[i] = the current (i-th) value in the array of data
    arr[i-1] = the previous ((i-1)-th) value in the array of data
    */
    
    analyser.smoothingTimeConstant = .8;
    
    //defines domain for the Fast Fourier Transform (fft) --> algorithm for getting frequencies
    //basically determines the number of data points to take from the audio
    analyser.fftSize = 1024
    
    //connecting audio source to analyser and analyser to the audioContext destination
    audioSrc.connect(analyser);
    analyser.connect(ctx1.destination);
    
    //adds ability to pause the music and animation on mouse click
    function addPause(){
        CANVAS.addEventListener("mousedown", function(){
            audio.pause();
            CANVAS.addEventListener("mousedown", function(){
                audio.play();
                addPause();
            })
        });
    }
    addPause();
    
    //storing data from fft
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    
    //number of datapoints to take (a lot of data points, esp on the far right end are useless)
    //also don't want to overwhelm user with data
    datasample = 50;
    
    renderFrame = function () {
        
        //updates values in frequencyData
        analyser.getByteFrequencyData(frequencyData);
    } 
    
    //Plays audio on window load
    audio.play();
};

//Runs main function once every 1/24 seconds
setInterval(main, fps);