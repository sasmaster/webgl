# webgl

## This repo contains my personal experiments with WebGL API.

Make sure your browser supports WebGL 2.0 as all the samples
use WebGL2.0 context and API.



### Dependencies:

Currently only glMatrix lib for transformations.


### Samples:

simple_vao.js - shows how to draw a quad using VAO (Vertex Array Object)

simple_vao.js - shows how to draw a quad using VAO and indexed buffer (drawElements)

ubo_instanced.js - show how to render 1024 quads using Uniform buffer containing transforms in a single draw call.

texture_mapping.js - shows how to render a mesh with texture mapped onto it.

frame_buffer.js - shows how to render to texture using offscreen fbo.

gauss-blur.js - explores different moethods of gaussian blur image effect (work in progress)


