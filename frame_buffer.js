var gl = null;
var mvp, proj, model, mvpLoc, modelLoc, texLoc, tex;
var images = [];
var canvas = null;
var planeVAO = {};
var cubeVAO = {};
var fbo = null;
function init() {
    var image = new Image();
    image.src = "assets/lena_color_512.png";
    image.addEventListener('load', function () {
        console.log("loaded");
        images.push(image);
        run();
    });
}



function run() {

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
        "precision highp float; ",
        "precision highp int;",
        "layout(location = 0) in vec3 pos;",
        "layout(location = 1) in vec2 uv;",
        "uniform mat4 mvp;",
        "out vec2 v_uv;",
        "void main(){",
        "gl_Position = mvp * vec4(pos,1.0);",
        "v_uv = uv;",
        "}"
    ].join('\n');

    const frag = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform sampler2D tex;",

        "in vec2 v_uv;",
        "out vec4 oColor;",
        "void main(){",

        " oColor =  texture(tex,v_uv);// vec4(v_uv.xy,0.0,1.0);",
        "}"
    ].join('\n');

    var prog = createProgram(gl, vert, frag);
    if (!prog == null) {
        console.error("failed to create shader prog");
        return;
    }
    console.log("we are set");

    const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    const STRIDE = FLOAT_SIZE * 5;
    //=================   Create Unit plane ========================
    var vao, buffer;

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, create_plane_vt(), gl.STATIC_DRAW);

    //vertex attrib
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
    //UV attrib
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, FLOAT_SIZE * 3);
    planeVAO.vao = vao;
    planeVAO.buffer = buffer;

    //====================== Create unit cube =====================
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, create_cube_vt(), gl.STATIC_DRAW);

    //vertex attrib
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, FLOAT_SIZE * 3);

    var ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, create_cube_indices(), gl.STATIC_DRAW);


    cubeVAO.vao = vao;
    cubeVAO.buffer = buffer;
    cubeVAO.ibuffer = ibuffer;

    //===============================================================


    const w = gl.canvas.width;
    const h = gl.canvas.height;

    //math api ref: http://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.2
    proj = mat4.perspective(mat4.create(), 55 * 3.14 / 180, w / h, 1, 2000);

    model = mat4.create();
    mat4.identity(model);
    mvp = mat4.create();

    mat4.scale(model, model, [128, 128, 1]);

    mat4.translate(model, model, [0, 0, -200]);

    gl.useProgram(prog);
    mvpLoc = gl.getUniformLocation(prog, "mvp");
    texLoc = gl.getUniformLocation(prog, "tex");
    modelLoc = gl.getUniformLocation(prog, "model");
    var img = images[0];

    tex = createGLTexture(gl, gl.RGB, gl.RGB8, img.width, img.height,gl.CLAMP_TO_EDGE, false, false, img);
    var renderTex = createGLTexture(gl, gl.RGBA,gl.RGBA8, 1280, 720,gl.CLAMP_TO_EDGE, false, false, null);
    //create offscreen FBO:
    fbo = createFrameBuffer(gl, renderTex);
    gl.uniform1i(texLoc, 0);

    mat4.multiply(mvp, proj, model);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    window.addEventListener('resize', onResize);

    requestAnimationFrame(render);

}


 

function onResize()
{
    mat4.identity(proj);

    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    gl.viewport(0, 0, w, h);


    proj = mat4.perspective(proj, 33 * 3.14 / 180, w / h, 1, 2000);
    mat4.multiply(mvp, proj, model);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

}
var rot = 0;
function render() {

    //Pass 1: (Render to texure)
    gl.viewport(0, 0, 1280, 720);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.identity(model);
    mat4.translate(model, model, [0, 0, -600]);

    mat4.rotate(model, model, rot, [0, 0, 1]);
    mat4.rotate(model, model, rot, [0, 1, 0]);
    mat4.rotate(model, model, rot, [0, 0, 1]);
    mat4.scale(model, model, [100, 100, 100]);
    rot += 0.02;
    mat4.multiply(mvp, proj, model);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.bindVertexArray(cubeVAO.vao);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);



    //Pass 2:(render to screen, texture source is fbo render target)
    const w = window.innerWidth;
    const h = window.innerHeight;
    gl.viewport(0, 0, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.identity(model);
    mat4.translate(model, model, [0, 0, -400]);
    mat4.rotate(model, model, rot, [0, 0, 1]);
    mat4.scale(model, model, [120, 100, 1]);

    mat4.multiply(mvp, proj, model);

    gl.bindTexture(gl.TEXTURE_2D, fbo.texRT);


    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.bindVertexArray(planeVAO.vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(render);

}

window.addEventListener('load',init);