 

 import { MP4Demuxer } from "/deps/mp4demuxer.js";

var gl = null;
var texLoc,tex,colorLoc;

var canvas = null;
var pendingFrame = null;
var startTime = null;
var frameCount = 0;
var demuxer,decoder = null;


function setStatus(type, message)
 {
   console.log(type);
   console.log(message);   
 }

 function onFrameDecoded(frame)
 {
 // Update statistics.
 if (startTime == null) {
    startTime = performance.now();
  } else {
    const elapsed = (performance.now() - startTime) / 1000;
    const fps = ++frameCount / elapsed;
    setStatus("render", `${fps.toFixed(0)} fps`);
  }

  // Schedule the frame to be rendered.
  render(frame);

   // IMPORTANT: Release the frame to avoid stalling the decoder.
   //frame.close();
 }

 function onDecodeError(e)
 {
   setStatus("Decode error",e);
 }

function init()
{
    decoder = new VideoDecoder(
        {
            output:onFrameDecoded,
            error:onDecodeError
        }
    );
    const dataUri = "/assets/videoFrames.mp4";
     // Fetch and demux the media data.
    demuxer = new MP4Demuxer(dataUri, {
    onConfig(config) {
      setStatus("decode", `${config.codec} @ ${config.codedWidth}x${config.codedHeight}`);
      decoder.configure(config);
      run(config);
    },
    onChunk(chunk) {
      decoder.decode(chunk);
    },
    setStatus//make this function available for MP4Demuxer class scope
    });

}


function run(config)
{
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);


    gl = canvas.getContext('webgl2', { antialias: false });
    var isWebGL2 = !!gl;
    if (isWebGL2 === false)
    {
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
    if (!prog == null)
    {
        console.error("failed to create shader prog");
        return;
    }
    
    gl.useProgram(prog);

    texLoc = gl.getUniformLocation(prog,"tex");
    //colorLoc = gl.getUniformLocation(prog,"borderColor");
    
    tex = createGLTexture(gl,gl.RGB,config.codedWidth,config.codedHeight,gl.CLAMP_TO_EDGE,false,false,null);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    window.addEventListener('resize',  onResize);

}

 

function onResize()
{
    const w  =  window.innerWidth;
    const h =   window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0,0,w,h);
}

function render(frame)
{
    gl.clearColor(0.2,0.2,0.2,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateGLTexture(gl,tex,gl.RGB,false,frame);
    frame.close();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLES,0,3);

   // requestAnimationFrame(render);
  
}

window.addEventListener('load',init);