# webgl

## This repo contains my personal experiments with WebGL API.

Make sure your browser supports WebGL 2.0 as all the samples
use WebGL2.0 context and API.



### Dependencies:

Currently only glMatrix lib for transformations.


### Samples:

simple_vao.js - shows how to draw a quad using VAO (Vertex Array Object)

indexed_vao.js - shows how to draw a quad using VAO and indexed buffer (drawElements)

ubo_instanced.js - shows how to render 1024 quads using Uniform buffer containing transforms in a single draw call.

texture_mapping.js - shows how to render a mesh with texture mapped onto it.

frame_buffer.js - shows how to render to texture using offscreen fbo.

frame_buffer_multisampled.js - shows how to setup a multi-sampled(MSAA) offscfeen FBO and blit it to screen.

gauss-blur.js - explores different moethods of gaussian blur image effect (work in progress)

screen-tri.js - good old trick to render full screen pass using a triangle rather than rectangle

texel_size.js - shows how to sample and draw a texture in screen space and only in the area equal texture size in pixels.

video_decode.js - shows how to decode an mp4 video,using Web Codecs extensions (Chrome,Firefox only) and present on a webgl surface.

gauss_blur_optimized_dynamic.js - shows fast (Separated) gaussian blur implementation using a technique by NVIDIA's to calculate coeffieicents in fragment shader






