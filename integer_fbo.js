var gl = null;
var mvp, proj, model, mvpLoc, mvpLoc1, texLoc, objIdLoc, tex, offscreenFBO, renderTex;
var progMain, progColor;
var images = [];

const CANVAS_W = 640;
const CANVAS_H = 360;
const ObjectId = 2000;
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
    var canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;// window.innerWidth;
    canvas.height = CANVAS_H;// window.innerHeight;
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
        "out  vec4 oColor;",
        "void main(){",
        "oColor =  texture(tex,v_uv);",
        "}"
    ].join('\n');

    const fragIntegerColor = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform sampler2D tex;",
        "uniform uint objectId;",
        "in vec2 v_uv;",
        "out  uvec4 oColorID;",
        "void main(){",
        "oColorID = uvec4(objectId);// texture(tex,v_uv);",
        // "oColorID =  vec4(1.0);// texture(tex,v_uv);",
        "}"
    ].join('\n');

    progMain = createProgram(gl, vert, frag);
    if (!progMain == null) {
        console.error("failed to create shader prog");
        return;
    }
    progColor = createProgram(gl, vert, fragIntegerColor);
    if (!progColor == null) {
        console.error("failed to create shader prog");
        return;
    }
    console.log("we are set");

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var vertBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
    gl.bufferData(gl.ARRAY_BUFFER, create_plane_vt(), gl.STATIC_DRAW);

    const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    const STRIDE = FLOAT_SIZE * 5;

    //vertex attrib
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, FLOAT_SIZE * 3);



    const w = gl.canvas.width;
    const h = gl.canvas.height;

    //math api ref: http://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.2
    proj = mat4.perspective(mat4.create(), 55 * 3.14 / 180, w / h, 1, 2000);

    model = mat4.create();
    mat4.identity(model);
    mvp = mat4.create();

    mat4.scale(model, model, [128, 128, 1]);

    mat4.translate(model, model, [0, 0, -400]);


    mvpLoc = gl.getUniformLocation(progMain, "mvp");
    texLoc = gl.getUniformLocation(progMain, "tex");

    mvpLoc1 = gl.getUniformLocation(progColor, "mvp");
    objIdLoc = gl.getUniformLocation(progColor, "objectId");
    var img = images[0];

    tex = createGLTexture(gl, gl.RGB, gl.RGB8, img.width, img.height, gl.CLAMP_TO_EDGE, false, false, img);
    gl.activeTexture(gl.TEXTURE0);


    // gl.uniform1ui(objIdLoc,0xff0000);

    renderTex = createGLTexture(gl, gl.RED, gl.R16UI, CANVAS_W, CANVAS_H, gl.CLAMP_TO_EDGE, false, false, null);
    //create offscreen FBO:
    offscreenFBO = createFrameBuffer(gl, renderTex);



    //mat4.multiply( mvp, proj, model );
    // gl.uniformMatrix4fv(mvpLoc, false, mvp );


    window.addEventListener('resize', onResize);

    gl.canvas.addEventListener('click', onMouseClick);

    requestAnimationFrame(render);

}
var mouseX = 0;
var mouseY = 0;
var mouseDown = false;
function onMouseClick(event) {
    var rect = gl.canvas.getBoundingClientRect();
 
       mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * gl.canvas.width;
       mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * gl.canvas.height;
   
    mouseDown = true;
}

function onResize() {
    mat4.identity(proj);

    const w = CANVAS_W;//  window.innerWidth;
    const h = CANVAS_H;//  window.innerHeight;

    gl.canvas.width = w;
    gl.canvas.height = h;

    gl.viewport(0, 0, w, h);


    proj = mat4.perspective(proj, 33 * 3.14 / 180, w / h, 1, 2000);
    mat4.multiply(mvp, proj, model);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);

}

function render() {
    const w = gl.canvas.width;
    const h = gl.canvas.height;

    gl.viewport(0, 0, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, offscreenFBO.fbo);

    // INTEGER TEXTURE CANNOT BE CLEARED WITH the fixed pipeline
    //need to use shader pass
    // gl.clearColor(0.0,0.0,0.0,0);
    //  gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(progColor);

  
    mat4.multiply(mvp, proj, model);
    gl.uniformMatrix4fv(mvpLoc1, false, mvp);

    gl.uniform1ui(objIdLoc, 2000);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    if (mouseDown)
    {
        var pixel = new Uint16Array(1);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, offscreenFBO.fbo);
        console.log("reading at location:%f,%f",mouseX,mouseY);
        gl.readPixels(mouseX, mouseY, 1, 1, gl.RED_INTEGER, gl.UNSIGNED_SHORT, pixel)
        if(pixel[0] === ObjectId)
        {
            console.log("Object clicked");
        }else
        {
            console.log("Object missed");
        }
       
        mouseDown = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.4, 0.4, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(progMain);
    gl.uniformMatrix4fv(mvpLoc, false, mvp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLoc, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);




    requestAnimationFrame(render);

}

window.addEventListener('load', init);