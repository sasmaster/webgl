//inspiration:
//https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/draw_instanced_ubo.html#L89-L117
//
//https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html


/*
 Instanced rendering + UBO test

*/

var gl = null;
var mvp,proj,model, mvpLoc;

function init() {
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);


     gl = canvas.getContext('webgl2', { antialias: false });
    var isWebGL2 = !!gl;
    if (isWebGL2 === false) {
        console.error("WebGL2 context not supported");
        return;
    }

    const quad_geom = new Float32Array( [

         0.5, 0.5,  0.0,
        -0.5, 0.5,  0.0,
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0
    ]);

    const quad_indices = new Int8Array([0, 1, 2, 0, 2, 3]);


    const vert = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "layout(location = 0) in vec3 pos;",
        "uniform mat4 mvp;",
        "void main(){",
        "gl_Position = mvp * vec4(pos,1.0);",

        "}"
    ].join('\n');

    const frag = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",

        "out vec4 oColor;",
        "void main(){",
        "oColor = vec4(1,0,0,1);",
        "}"
    ].join('\n');

    var prog = createProgram(gl, vert, frag);
    if (!prog == null) {
        console.error("failed to create shader prog");
        return;
    }
    console.log("we are ok");

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var vertBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuff);
    gl.bufferData(gl.ARRAY_BUFFER,quad_geom,gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var indexBuff = gl.createBuffer();
    
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    proj = mat4.perspective( mat4.create(), 33 * 3.14 / 180, w/h, 1, 2000 );

    model = mat4.create();
    mat4.identity( model );
    mvp = mat4.create();
   
    mat4.scale(model,model,[100,100,1]);

    mat4.translate(model,model,[0,0,-400]);

    gl.useProgram(prog);
    mvpLoc = gl.getUniformLocation(prog, "mvp");
    mat4.multiply( mvp, proj, model );
    gl.uniformMatrix4fv(mvpLoc, false, mvp );


   window.addEventListener('resize',  onResize);

   requestAnimationFrame(render);
}

function onResize()
{
    mat4.identity(proj);
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    proj = mat4.perspective(proj, 33 * 3.14 / 180, w/h, 1, 2000 );
    mat4.multiply( mvp, proj, model );
    gl.uniformMatrix4fv(mvpLoc, false, mvp );

}

function render()
{
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);


    gl.drawArrays(gl.TRIANGLE_FAN,0,4);

    requestAnimationFrame(render);
  
}

