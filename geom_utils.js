/**
 * Creates a buffer with vertex + texture coords attributes
 */
function create_plane_vt()
{

    return new Float32Array([
        //x   y     z      u   v
        0.5,  0.5,  0.0,  1.0,0.0,
       -0.5,  0.5,  0.0,  0.0,0.0,
       -0.5, -0.5,  0.0,  0.0,1.0,
        0.5, -0.5,  0.0,  1.0,1.0
   ]);
}