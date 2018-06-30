

/*
 Instanced rendering + UBO test

*/
var canvas = null;
var gl = null;
var mvp,proj,model,transformLoc,viewportSizeLoc, transformUBO;
var transformBuffer;

const NUM_INSTANCES = 1024;//maximum
function init() {
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

    const quad_geom = new Float32Array( [

         0.5, 0.5,  0.0,
        -0.5, 0.5,  0.0,
        -0.5, -0.5, 0.0,
         0.5, -0.5, 0.0
    ]);

    const quad_indices = new Int8Array([0, 1, 2, 0, 2, 3]);


    const vert = [
        "#version 300 es",
        "#define MAX_TRANSFORMS 1024",
        "precision highp float; ",
        "precision highp int;",
        "layout(std140) uniform Transform {",
        "mat4 mvp[MAX_TRANSFORMS];",
        "}transform;",
        "layout(location = 0) in vec3 pos;",
        "void main(){",
        "gl_Position = transform.mvp[gl_InstanceID] * vec4(pos,1.0);",
        "}"
    ].join('\n');

    const frag = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform vec2 viewportSize;",
        "out vec4 oColor;",
        "void main(){",
        "vec2 texel = gl_FragCoord.xy / viewportSize;",
        "oColor = vec4(texel.st,(texel.s),1);",
        "}"
    ].join('\n');

    var prog = createProgram(gl, vert, frag);
    if (!prog == null) {
        console.error("failed to create shader prog");
        return;
    }
   
   
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var vertBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuff);
    gl.bufferData(gl.ARRAY_BUFFER,quad_geom,gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var indexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quad_indices, gl.STATIC_DRAW);


    //Transform UBO:
    //get location and bind
    transformLoc = gl.getUniformLocation(prog,'Transform');
    gl.uniformBlockBinding(prog,transformLoc,0);

    viewportSizeLoc = gl.getUniformLocation(prog, "viewportSize");
  

    transformUBO =gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER,transformUBO);


   

    
    const w = gl.canvas.width;
    const h = gl.canvas.height;

    //math api ref: http://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.2
    proj = mat4.perspective( mat4.create(), 33 * 3.14 / 180, w/h, 1, 5000 );

    model = mat4.create();
    mat4.identity( model );
    mvp = mat4.create();
   
   


    transformBuffer = new Float32Array(NUM_INSTANCES * 16);

    updateUBO(transformBuffer);
    

    gl.bufferData(gl.UNIFORM_BUFFER,transformBuffer,gl.DYNAMIC_DRAW);
//gl.bindBuffer(gl.UNIFORM_BUFFER,null); keep it bound for updates

    gl.bindBufferBase(gl.UNIFORM_BUFFER,0,transformUBO);



    gl.useProgram(prog);
   
    gl.uniform2fv(viewportSizeLoc,[window.innerWidth,window.innerHeight]);
  


   window.addEventListener('resize',  onResize);

   requestAnimationFrame(render);
}

function updateUBO(buffer)
{
    var offset = 0;
    for (let index = 0; index < NUM_INSTANCES; index++) {
        
       var x = Math.random() * 800 - 400;
       var y = Math.random() * 800 - 400;

        mat4.identity( model );
      
        mat4.translate(model,model,[x,y,-2500]);
        mat4.scale(model,model,[20,20,1]);
        mat4.multiply( mvp, proj, model );
        buffer.set(mvp,offset);

        offset+=16;
    }
}

function onResize()
{
    mat4.identity(proj);
   
    const w  =  window.innerWidth;
    const h =   window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    gl.viewport(0,0,w,h);

    gl.uniform2fv(viewportSizeLoc,[w,h]);


    proj = mat4.perspective(proj, 33 * 3.14 / 180, w/h, 1, 5000 );
   
}

function render()
{
    updateUBO(transformBuffer);//update matrices

    gl.bufferSubData(gl.UNIFORM_BUFFER,0,transformBuffer);

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

   // gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_BYTE,0);
   gl.drawElementsInstanced(gl.TRIANGLES,6,gl.UNSIGNED_BYTE,0,NUM_INSTANCES);
   requestAnimationFrame(render);
  
}

