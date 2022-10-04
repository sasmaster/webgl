function createShader(gl, source, type)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource)
{
    var program = gl.createProgram();
    var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    gl.attachShader(program, vshader);
    gl.deleteShader(vshader);
    gl.attachShader(program, fshader);
    gl.deleteShader(fshader);
    gl.linkProgram(program);

    var log = gl.getProgramInfoLog(program);
    if (log) {
        console.log(log);
    }

    log = gl.getShaderInfoLog(vshader);
    if (log) {
        console.log(log);
    }

    log = gl.getShaderInfoLog(fshader);
    if (log) {
        console.log(log);
    }

    return program;
};

function createGLTexture(gl, format, w, h,filterType, flip, genMipmaps, data)
 {

    var texture = gl.createTexture();
   // gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,filterType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,filterType);


    var intFormat = gl.RGB8;
    if (format == gl.RGBA) {
        intFormat = gl.RGBA8;
    }

    if (genMipmaps === true) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texStorage2D(gl.TEXTURE_2D, 1, intFormat, w, h);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texStorage2D(gl.TEXTURE_2D, 1, intFormat, w, h);
    }

    if (data != null) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, format, gl.UNSIGNED_BYTE, data);
    }

    if (genMipmaps === true) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    return texture;

}

function updateGLTexture(gl,texture, format, genMipmaps, data)
 {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texSubImage2D(
        gl.TEXTURE_2D, 0, 0, 0, format,
        gl.UNSIGNED_BYTE, data);

    if (genMipmaps === true)
    {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

 }

function createFrameBuffer(gl,w, h, depth, tex)
{
    var fboObj = {};
    var fbo = 0;
    fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    if (tex != null)
    {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        fboObj.texRT = tex;

    } else //create and attach render buffer 
    {
        var colBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, colBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, w, w);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colBuffer);
        fboObj.buffRT = colBuffer;
    }

    if (depth === true) {
        //TODO: attach depth buffer
        var depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        fboObj.buffDepth = depthBuffer;
    }

    //check for completeness:
    var statis = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (statis != gl.FRAMEBUFFER_COMPLETE)
     {
        console.error("failed to create valid frame buffer");
        return null;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    console.log(fbo);

    fboObj.fbo = fbo;
    return fboObj;
}