/**
 * This sample shows how to map a texture onto the full screen
 * but only onto the area equal to the mapped texture size.
 * textureSize() and gl_FragCoord comes handy here.Additionally,
 * as WebGL API lacks the GL_CLAMP_TO_BORDER wrap mode,this sample shows
 * how to emulate this behavior in GLSL
 */
var gl = null;
var texLoc,tex,colorLoc;
var images =[];
var canvas = null;
function init()
{
   var image = new Image();
   image.src = "assets/lena_color_512.png";
   image.addEventListener('load',function()
   {
   console.log("loaded");
   images.push(image);
     run();
   });
}



function run()
{
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

    const fragMb = [
        "#version 300 es",
        "precision highp float;",
        "precision highp int;",
        "uniform sampler2D tex;",
        "uniform vec4 borderColor;",
        "out vec4 oColor;",
        "void main(){",
        "vec2 textureDims = vec2(textureSize(tex,0));//WEBGL 2.0!",
        "vec2 texelSize = 1.0 / textureDims;",
        "vec2 texSizeFragCoords = vec2(gl_FragCoord.xy  * texelSize);",
        "oColor = texture(tex, vec2(texSizeFragCoords.x, 1.0 - texSizeFragCoords.y));", 
        "oColor = mix(oColor,borderColor,step(textureDims.x,gl_FragCoord.x));",
        "oColor = mix(oColor,borderColor,step(textureDims.y,gl_FragCoord.y));",   
        "}"
    ].join('\n');

    var prog = createProgram(gl, vert, fragMb);
    if (!prog == null)
    {
        console.error("failed to create shader prog");
        return;
    }
    


    gl.useProgram(prog);

    texLoc = gl.getUniformLocation(prog,"tex");
    colorLoc = gl.getUniformLocation(prog,"borderColor");
    var img = images[0];
    tex = createGLTexture(0,gl.RGB,img.width,img.height,gl.CLAMP_TO_EDGE,false,false,img);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);
    gl.uniform4f(colorLoc,0.2,0.0,1.0,1.0);

   window.addEventListener('resize',  onResize);

   requestAnimationFrame(render);

}

 

function onResize()
{
  
   
    const w  =  window.innerWidth;
    const h =   window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    gl.viewport(0,0,w,h);
}

function render()
{
    gl.clearColor(0.2,0.2,0.2,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES,0,3);

    requestAnimationFrame(render);
  
}