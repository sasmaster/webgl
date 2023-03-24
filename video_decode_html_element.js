

var gl = null;
var texLoc, tex, colorLoc;

var canvas = null;
var pendingFrame = null;
var startTime = null;
var frameCount = 0;

var decoders = [];

class VideoDecoder {
  #id;
  //#video = null;
  //#videoImage = null;
  //#videoImageContext = null;

  checkReady() {
    //if (playing && timeupdate) 
    {
     // copyVideo = true;
    }
  }

  constructor(w, h, videoPath) {
    ///////////
    // VIDEO //
    ///////////

    // create the video element
    this.video = document.createElement('video');
    // video.id = 'video';
    // video.type = ' video/ogg; codecs="theora, vorbis" ';
    this.video.src = videoPath;// "videos/sintel.ogv";
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.loop = true;

    // Waiting for these 2 events ensures
    // there is data in the video

    this.video.addEventListener(
      "playing",
      () => {
        this.playing = true;
        this.checkReady();
      },
      true
    );

    this.video.addEventListener(
      "timeupdate",
      () => {
        this.timeupdate = true;
        this.checkReady();
      },
      true
    );


    this.video.load(); // must call after setting/changing source
    //video.play();

    // alternative method -- 
    // create DIV in HTML:
    // <video id="myVideo" autoplay style="display:none">
    //		<source src="videos/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
    // </video>
    // and set JS variable:
    // video = document.getElementById( 'myVideo' );

    this.videoImage = document.createElement('canvas');
    this.videoImage.width  = w;
    this.videoImage.height = h;

    this.videoImageContext = this.videoImage.getContext('2d');
    // background color if no video present
    this.videoImageContext.fillStyle = '#000000';
    this.videoImageContext.fillRect(0, 0, this.videoImage.width, this.videoImage.height);

  }

  play()
  {
    this.video.play();
  }

  pause()
  {
    this.video.stop();
  }

  seek()
{

}

  decodeFrame() {

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) 
    {
      this.videoImageContext.drawImage(this.video, 0, 0);
      const frame = this.videoImageContext.getImageData(0, 0, this.videoImage.width, this.videoImage.height);
      const data = frame.data;
      return data;
      //if(this.videoTexture) 
      {
      //  this.videoTexture.needsUpdate = true;
      }
    }
  }

}

function updateVideoTexture(gl, texture, video)
{
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    video
  );
  }
  


  function init() {

    let btn = document.createElement("Button");
    btn.innerHTML = "Forward";
    btn.onclick = function () {
      //alert("Button is clicked");
      forward();
    };
    document.body.appendChild(btn);

    btn = document.createElement("Button");
    btn.innerHTML = "Backward";
    btn.onclick = function () {
      //alert("Button is clicked");
      backward();
    };
    document.body.appendChild(btn);

    const dataUri = "/assets/videoFrames.mp4";
    var decoder = new VideoDecoder(1920,1080,dataUri);
    decoders.push(decoder);

    run();
     
  }

  function forward() {
    //demuxer.demux(sampleCount);
    decoders[0].play();
    render(decoders[0].decodeFrame());
    decoders[0].pause();
    sampleCount++;
  }

  function backward() {
    if (sampleCount <= 0) return;
   // demuxer.demux(sampleCount);
    sampleCount--;
  }

  function run(config) {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);


    gl = canvas.getContext('webgl2', { antialias: false });
    var isWebGL2 = !!gl;
    if (isWebGL2 === false) {
      console.error("WebGL2 context not supported");
      return;
    }

    const vert = [
      "#version 300 es",
      "void main()",
      "{",
      "    float x = -1.0 + float((gl_VertexID & 1) << 2);",
      "    float y = -1.0 + float((gl_VertexID & 2) << 1);",
      "    gl_Position = vec4(x, y, 0.0, 1.0);",
      "}"
    ].join('\n');

    const frag = [
      "#version 300 es",
      "precision highp float; ",
      "precision highp int;",
      "uniform sampler2D tex;",
      "out vec4 oColor;",
      "void main(){",
      "vec2 textureDims = vec2(textureSize(tex,0));//WEBGL 2.0!",
      "vec2 texelSize = 1.0 / textureDims;",
      "vec2 texSizeFragCoords = vec2(gl_FragCoord.xy  * texelSize);",
      "oColor = texture(tex, vec2(texSizeFragCoords.x, 1.0 - texSizeFragCoords.y));",
      "}"
    ].join('\n');

    var prog = createProgram(gl, vert, frag);
    if (!prog == null) {
      console.error("failed to create shader prog");
      return;
    }

    gl.useProgram(prog);

    texLoc = gl.getUniformLocation(prog, "tex");
    //colorLoc = gl.getUniformLocation(prog,"borderColor");

    tex = createGLTexture(gl, gl.RGBA, gl.RGBA8,decoders[0].videoImage.width,decoders[0].videoImage.height,
       gl.CLAMP_TO_EDGE, false, false, null);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    window.addEventListener('resize', onResize);

  }



  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  function render(frame) {
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateGLTexture(gl, tex, gl.RGBA, false, frame);
   
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // requestAnimationFrame(render);

  }

  window.addEventListener('load', init);