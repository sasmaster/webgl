var gl = null;
var mvp, mvpLocGauss,mvpLocBlit,proj,model, mvpLoc,texLocGauss,texLocBlit,tex,sigmaLoc,dirLoc;
var progGauss,progBlit;
var images =[];
var canvas = null;
var fbo0,fbo1;
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

    const fragCopy = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform sampler2D tex;",
      
        "in vec2 v_uv;",
        "out vec4 oColor;",
        "void main(){",
        "oColor = texture(tex,v_uv);",
        "}"
    ].join('\n');

    //this is a high quality dynamic kernel gauss blur based on
    //https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-40-incremental-computation-gaussian
    const fragGauss = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform sampler2D tex;",
        "uniform vec2 u_dir;",      
        "uniform float u_sigma;",
        "in vec2 v_uv;",
        "out vec4 oColor;",
        "void main(){",

        "vec2 texelSize = 1.0 /  vec2(textureSize(tex,0));",
        "vec4 pixelAccum = vec4(0.0);",
        "vec2 dir = u_dir * texelSize;//horizontal",
        "float sigma = u_sigma;",
        "int radius = int(sigma * 3.0);",
        "float norm = 0.0;",
        "for (int i= -radius; i <= radius; i++) {",
        "  float coeff = exp(-0.5 * float(i) * float(i) / (sigma * sigma));",
		"  pixelAccum += (texture(tex, v_uv + float(i) * dir)) * coeff;",
		"  norm += coeff;",
        "}",
        "pixelAccum *= 1.0/norm; ",
        "oColor = pixelAccum;",
        "}"
    ].join('\n');

    //this one should be faster but there is some quality penalty
    //optimized, leverages GPU linear filering:
    //https://lisyarus.github.io/blog/graphics/2022/04/21/compute-blur.html
    //https://www.rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/ 
    const fragGauss1 = [
        "#version 300 es",
        "precision highp float; ",
        "precision highp int;",
        "uniform sampler2D tex;",
        "uniform vec2 u_dir;",      
        "uniform float u_sigma;",
        "in vec2 v_uv;",
        "out vec4 oColor;",
        "#define PI 3.14159265",
        "#define FASTER",
        " float gauss(float x, float sigma) ",
        " { ",
            "    return  1.0f / (2.0f * PI * sigma * sigma) * exp(-(x * x) / (2.0f * sigma * sigma)); ",
        " } ",

        "void main(){",

        "vec2 texelSize = 1.0 / vec2(textureSize(tex,0));",
        "vec4 pixelAccum = vec4(0.0);",
        "vec2 dir = u_dir * texelSize;",
        "float sigma2 = u_sigma * u_sigma;",
        "int radius = int(u_sigma * 3.0);",
        "float norm = 0.0;",
       
//https://github.com/remibodin/Unity3D-Blur/blob/master/UnityProject/Assets/Blur/GaussianBlur/Shaders/GaussianBlur.cginc   //less code but longer loop
        "for (int i= -radius / 2; i <= radius /2; i+=2) {",
        "#ifdef FASTER",
        "  float coeff0 = exp(-0.5 * float(i) * float(i) / sigma2);", 
        "  float coeff1 = exp(-0.5 * float(i+1 ) * float(i+1 ) / sigma2);", 
        "  float w = coeff0 + coeff1;",
        "  float t = coeff1 / w;",
        "  pixelAccum += w * texture(tex,  v_uv + (float(i) + t ) * dir);",
        "  norm += w;",
        "#else",
        "  vec2 uvOffset = v_uv + ((float(i) + 0.5) * texelSize) * u_dir;",
        "  float weight = gauss(float(i), u_sigma) + gauss(float(i+1), u_sigma);",
        "  pixelAccum += texture(tex,uvOffset) * weight;", 
        "  norm += weight;",
        "#endif",
        "}",
        "pixelAccum *= (1.0/norm); ",
        "oColor = pixelAccum;",
        "}"
    ].join('\n');


     progGauss = createProgram(gl, vert, fragGauss);
    if (!progGauss == null) {
        console.error("failed to create shader prog");
        return;
    }

    progBlit = createProgram(gl, vert, fragCopy);
    if (!progBlit == null) {
        console.error("failed to create shader prog");
        return;
    }
    console.log("we are set");

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



    const w = gl.canvas.width;
    const h = gl.canvas.height;

    //math api ref: http://math.hws.edu/graphicsbook/c7/s1.html#webgl3d.1.2
 
    model = mat4.create();
    mat4.identity( model );
    proj =mat4.create();
    mvp = mat4.create();
   
    mat4.scale(model,model,[256,256,1]);
    mat4.translate(model,model,[0,0,-1000]);
 

    gl.useProgram(progGauss);
    mvpLocGauss   = gl.getUniformLocation(progGauss,"mvp");
    texLocGauss   = gl.getUniformLocation(progGauss,"tex");
    sigmaLoc = gl.getUniformLocation(progGauss,"u_sigma");
    dirLoc   = gl.getUniformLocation(progGauss,"u_dir");

    gl.useProgram(progBlit);
    mvpLocBlit   = gl.getUniformLocation(progBlit,"mvp");
    texLocBlit   = gl.getUniformLocation(progBlit,"tex");

    var img = images[0];
    tex = createGLTexture(gl,gl.RGB,gl.RGB8,img.width,img.height,gl.CLAMP_TO_EDGE,false,false,img);

    var renderTex0 = createGLTexture(gl, gl.RGBA,gl.RGBA8,img.width,img.height,gl.CLAMP_TO_EDGE, false, false, null);
    var renderTex1 = createGLTexture(gl, gl.RGBA,gl.RGBA8,img.width,img.height,gl.CLAMP_TO_EDGE, false, false, null);
    fbo0 = createFrameBuffer(gl, renderTex0);
    fbo1 = createFrameBuffer(gl, renderTex1);
   
   
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
    
    proj = mat4.perspective(proj, 33 * 3.14 / 180, w/h, 1, 2000 );
    mat4.multiply( mvp, proj, model );

}

function render()
{

   const w = gl.canvas.width;
   const h = gl.canvas.height;

   var imgW = images[0].width;
   var imgH = images[0].height;
 
  

   var dir = vec2.create();

 
    //vertical pass:
     
    gl.viewport(0, 0,  imgW, imgH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo0.fbo);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    gl.useProgram(progGauss);
    gl.uniform1f(sigmaLoc,20.0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(texLocGauss, 0);

    mat4.identity(mvp);
    gl.uniformMatrix4fv(mvpLocGauss, false, mvp );

    dir[0] = 1.0;
    dir[1] = 0.0;
    gl.uniform2fv(dirLoc,dir);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
  
    //horizontal pass:
   
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.bindTexture(gl.TEXTURE_2D,fbo0.texRT); 
    
    dir[0] = 0.0;
    dir[1] = 1.0;
    gl.uniform2fv(dirLoc,dir);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
  
    //blit pass: 
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0,  w, h);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(progBlit);

    mat4.identity(proj);
    proj = mat4.perspective(proj, 33 * 3.14 / 180, w/h, 1, 2000 );

    mat4.identity(mvp);
    mat4.multiply( mvp, proj,model);

    gl.bindTexture(gl.TEXTURE_2D,fbo1.texRT); 
    gl.uniform1i(texLocBlit, 0);

    gl.uniformMatrix4fv(mvpLocBlit,false, mvp );
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);

    requestAnimationFrame(render);
  
}

window.addEventListener('load',init);