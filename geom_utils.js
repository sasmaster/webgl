/**
 * Creates a buffer with vertex + texture coords attributes
 */
 function create_unit_quad_v() {

    return new Float32Array([
        //x   y     z      u   v
        0.5, 0.5, 0.0, 1.0, 0.0,
        -0.5, 0.5, 0.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 0.0, 1.0,
        0.5, -0.5, 0.0, 1.0, 1.0
    ]);
}

/**
 * Creates a buffer with vertex + texture coords attributes
 */
function create_plane_vt() {

    return new Float32Array([
        //x   y     z      u   v
        0.5, 0.5, 0.0, 1.0, 0.0,
        -0.5, 0.5, 0.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 0.0, 1.0,
        0.5, -0.5, 0.0, 1.0, 1.0
    ]);
}

function create_cube_vt() {
    return new Float32Array(

        [

            //  https://stackoverflow.com/questions/28375338/cube-using-single-gl-triangle-strip
            //  http://www.cs.umd.edu/gvil/papers/av_ts.pdf
            //but this one makes it impossible to get correct uv map
            /*
                     -1.0, 1.0, 1.0,     
                     1.0, 1.0, 1.0,      
                     -1.0, -1.0, 1.0,    
                     1.0, -1.0, 1.0,     
                     1.0, -1.0, -1.0,    
                     1.0, 1.0, 1.0,     
                     1.0, 1.0, -1.0,    
                     -1.0, 1.0, 1.0,      
                     -1.0, 1.0, -1.0,    
                     -1.0, -1.0, 1.0,    
                     -1.0, -1.0, -1.0,    
                     1.0, -1.0, -1.0,    
                     -1.0, 1.0, -1.0,    
                     1.0, 1.0, -1.0     
                     */


            // Front face
            -1.0, -1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, 0.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0, 0.0, 0.0,
            -1.0, 1.0, -1.0, 0.0, 1.0,
            1.0, 1.0, -1.0, 1.0, 1.0,
            1.0, -1.0, -1.0, 1.0, 0.0,

            // Top face
            -1.0, 1.0, -1.0, 0.0, 0.0,
            -1.0, 1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, -1.0, 1.0, 0.0,

            // Bottom face
            -1.0, -1.0, -1.0, 0.0, 0.0,
            1.0, -1.0, -1.0, 1.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0, 0.0, 1.0,

            // Right face
            1.0, -1.0, -1.0, 0.0, 0.0,
            1.0, 1.0, -1.0, 1.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, -1.0, 1.0, 0.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0, 0.0, 0.0,
            -1.0, -1.0, 1.0, 0.0, 1.0,
            -1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0, 1.0, 0.0

        ]
    );
}

function create_cube_indices() {
    return new Uint16Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ]);
}