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

function createGLTexture(gl, format,intFormat, w, h,wrapType, flip, genMipmaps, data)
 {

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,wrapType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,wrapType);


    

    if (genMipmaps === true)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texStorage2D(gl.TEXTURE_2D, 1, intFormat, w, h);
    } else
    {
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

function createFrameBuffer(gl,tex)
{
    var fboObj = {};
    var fbo = 0;
    fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    if (tex != null)
    {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        fboObj.texRT = tex;
    } 

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fboObj.fbo = fbo;
    return fboObj;
}

function createRenderBuffer(gl,format,w,h)
{
        var renderBuff = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuff);
        gl.renderbufferStorage(gl.RENDERBUFFER, format, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        return renderBuff;   
}

function createMultisampledRenderBuffer(gl,format,w,h,numSamples)
{
    const maxSupportedSamples =  gl.getParameter(gl.MAX_SAMPLES);
    if(numSamples > maxSupportedSamples)
    {
        numSamples = maxSupportedSamples;
    }
    var renderBuff = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuff);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER,
       numSamples,
        format, 
        w,
        h);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    return renderBuff;   
}

/**
 * 
 * @param {*} fboObj 
 * @param {*} renderBuff 
 * @param {*} attachment -gl.COLOR_ATTACHMENTi , DEPTH_ATTACHMENT,STENCIL_ATTACHMENT
 */
function bindRenderBuffer(gl,fboObj,renderBuff,attachment)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboObj.fbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, renderBuff);
    fboObj.buffRT = renderBuff;
     //check for completeness:
     var statis = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
     if (statis != gl.FRAMEBUFFER_COMPLETE)
      {
         console.error("failed to create valid frame buffer");
     }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function bindDepthBuffer(gl,fboObj,depthBuff)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboObj.fbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuff);
    fboObj.buffDepth = depthBuff;
     //check for completeness:
     var statis = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
     if (statis != gl.FRAMEBUFFER_COMPLETE)
      {
         console.error("failed to create valid frame buffer");
         return null;
     }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}