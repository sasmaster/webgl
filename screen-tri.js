var gl = null;
var mvp,proj,model, mvpLoc,texLoc,tex;
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
    console.log("we are set");

    /*
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var vertBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuff);
    gl.bufferData(gl.ARRAY_BUFFER,create_plane_vt(),gl.STATIC_DRAW);
 
    const FLOAT_SIZE =  Float32Array.BYTES_PER_ELEMENT;
    const STRIDE = FLOAT_SIZE * 5;

    //vertex attrib
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, FLOAT_SIZE * 3);
*/


    const w = gl.canvas.width;
    const h = gl.canvas.height;

    //math api ref: http://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.2
    proj = mat4.perspective( mat4.create(), 55 * 3.14 / 180, w/h, 1, 2000 );

    model = mat4.create();
    mat4.identity( model );
    mvp = mat4.create();
   
    mat4.scale(model,model,[128,128,1]);

    mat4.translate(model,model,[0,0,-200]);

    gl.useProgram(prog);
   // mvpLoc = gl.getUniformLocation(prog, "mvp");
    texLoc = gl.getUniformLocation(prog,"tex");
    var img = images[0];
    tex = createGLTexture(0,gl.RGB,img.width,img.height,false,false,img);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);

   // mat4.multiply( mvp, proj, model );
  //  gl.uniformMatrix4fv(mvpLoc, false, mvp );


   window.addEventListener('resize',  onResize);

   requestAnimationFrame(render);

}

 

function onResize()
{
    mat4.identity(proj);
   
    const w  =  window.innerWidth;
    const h =   window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    gl.viewport(0,0,w,h);

    
   // proj = mat4.perspective(proj, 33 * 3.14 / 180, w/h, 1, 2000 );
   // mat4.multiply( mvp, proj, model );
   // gl.uniformMatrix4fv(mvpLoc, false, mvp );

}

function render()
{
    gl.clearColor(0.2,0.2,0.2,1);
    gl.clear(gl.COLOR_BUFFER_BIT);


   // mat4.identity( model );
   // mat4.scale(model,model,[100,100,1]);
  //  mat4.rotate(model,model,0.02,[0,0,1]);
   // mat4.translate(model,model,[0,0,-400]);

   

   // mat4.multiply( mvp, proj, model );
  //  gl.uniformMatrix4fv(mvpLoc, false, mvp );


    gl.drawArrays(gl.TRIANGLES,0,3);

    requestAnimationFrame(render);
  
}