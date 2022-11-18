/**
 * This sample shows a hack which performs a full screen render pass
 * by drawing a triangle instead of a quad in NDC space.
 */
var gl = null;
var texLoc,tex;
var images =[];
var canvas = null;
function init()
{
   var image = new Image();
   image.src = "assets/lena_color_512.png";
   image.addEventListener('load',function(){
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
        "out vec2 v_uv;",
        "void main()",
        "{",
        "    float x = -1.0 + float((gl_VertexID & 1) << 2);",
        "    float y = -1.0 + float((gl_VertexID & 2) << 1);",
        "    v_uv.x = (x + 1.0) * 0.5;",
        "    v_uv.y = (1.0 - y) * 0.5;",
        "    gl_Position = vec4(x, y, 0.0, 1.0);",
        "}"
    ].join('\n');

    const fragMb = [
        "#version 300 es",
        "precision highp float;",
        "precision highp int;",
        "uniform sampler2D tex;",
        "in vec2 v_uv;",
        "out vec4 oColor;",
        "void main(){",
        "oColor = texture(tex, v_uv);",   
        "}"
    ].join('\n');

    var prog = createProgram(gl, vert, fragMb);
    if (!prog == null) {
        console.error("failed to create shader prog");
        return;
    }

    gl.useProgram(prog);

    texLoc = gl.getUniformLocation(prog,"tex");
    var img = images[0];
    tex = createGLTexture(0,gl.RGB,gl.RGB8,img.width,img.height,gl.CLAMP_TO_EDGE,false,false,img);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);

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