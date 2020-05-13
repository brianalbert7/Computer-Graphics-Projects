"use strict";

var gl;
var positions =[];

var numIterations = 4;

var level = numIterations;


window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Initialize our data for the Koch Snowflake
    //

    // First, initialize the snowflake with three positions.

    var vertices = [
        vec2(0, 0),
        vec2(0.4, 0.6),
        vec2(0.8, 0)
    ];

    // And, add our initial positions into our array of points    
    positions.push(vertices[0]);
    positions.push(vertices[1]);
    positions.push(vertices[2]);
    positions.push(vertices[0]);

    // Compute new positions
    while (level > 0) {
    
        var j = 0;
        while (j < positions.length - 1) {

            var pt1 = positions[j];
            var pt2 = positions[j+1];


            var u = subtract(pt2, pt1);
            var v = vec2(pt1[1] - pt2[1], pt2[0] - pt1[0]);

            var p = add(pt1, mult((1/3), u));
            var q = add((add(pt1, mult((1/2), u))), mult(Math.sqrt(3)/6, v));
            var r = add(pt1, mult((2/3), u));            
            
        
            positions.splice(j+1,0,p,q,r);
            
            j = j + 4;

        }
        level = level - 1;
    }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINE_LOOP, 0, positions.length);
}
