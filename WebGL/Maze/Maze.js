"use strict";

var gl;
var positions = [];

// Maze will be of size MxN 
var M = 13;
var N = 13;

var square;
var squares = [];

var here = 0;
var queue = [];

var neighbors = [];

var above;
var below;
var left;
var right;

var chosenNeighbor;
var neighbor;
var count;
var bottom = [];
var upper = [];
var unvisited = [];

var edges = [];
var edge;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );


    // First, initialize the maze with M*N squares.  
    var num = 0;
    for (var i = -7; i <= M-8; i++){
        for (var j = -3; j <= N-4; j++){
    
            point1 = vec2(i/13,(j/13));
            point2 = vec2((i+1)/13,j/13);

            edge = [point1, point2];
            edges.push(edge);

            var point1 = vec2(i/13,(j/13));
            var point2 = vec2(i/13,(j+1)/13);

            edge = [point1, point2];
            edges.push(edge);            

            var point1 = vec2((i+1)/13,(j)/13);
            var point2 = vec2((i+1)/13,(j+1)/13);

            edge = [point1, point2];
            edges.push(edge);

            var point1 = vec2(i/13,(j+1)/13);
            var point2 = vec2((i+1)/13,(j+1)/13);

            edge = [point1, point2];
            edges.push(edge);

            square = [edges[num], edges[num+1], edges[num+2], edges[num+3]];

            num += 4

            squares.push(square);

        }
    }
    
    // keep track of each square that is on the top and on the bottom of the maze
    for (var i = 0; i < squares.length; i += N){
        bottom.push(i);
    }
    for (var i = N-1; i < squares.length; i += N){
        upper.push(i);
    }

    // start at a random location
    here = Math.floor((Math.random()*(squares.length-1)));

    // mark each cell as not visited
    for (var i = 0; i < squares.length; i++){
        unvisited.push(i);
    }
    
    // create the maze
    maze();

    // push vertices into poisitions
    for (var i = 0; i < squares.length; i++){
        for (var j = 0; j < 4; j++){
            if (squares[i][j] != undefined){
                positions.push(squares[i][j][0]);
                positions.push(squares[i][j][1]);
            }
        }
    }    

    // create start and finish
    positions.pop();
    positions.pop();
    positions.shift();
    positions.shift();


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


    window.onresize = function() {
        var min = innerWidth;

        if (innerHeight < min) {
            min = innerHeight;
        }
        if (min < canvas.width || min < canvas.height) {
            gl.viewport(0, canvas.height-min, min, min);
        }
    };

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINES, 0, positions.length);
}

function maze() {
    // push here onto queue and mark it as visited
    queue.push(here);
    delete unvisited[here];

    while (queue.length != 0){
        here = queue.pop();
    
        neighbors = [];
        count = 0;

        // calculate which cells are neighbors
        above = here + 1;
        below = here - 1;
        right = here + N;
        left = here - N;

        // find unvisited neighbors
        if (unvisited.includes(above) && !upper.includes(here)) {
            neighbors.push(above);
            count++;
        }
        if (unvisited.includes(below) && !bottom.includes(here)) {
            neighbors.push(below);
            count++;
        }
        if (unvisited.includes(right)) {
            neighbors.push(right);
            count++;
        }
        if (unvisited.includes(left)) {
            neighbors.push(left);
            count++;
        }

        if (count != 0){
            queue.push(here);

            // choose a random unvisited neighbor
            chosenNeighbor = Math.floor((Math.random()*neighbors.length));
            neighbor = neighbors[chosenNeighbor];
            
            // delete connecting edges
            for (var i = 0; i < 4; i++){
                for (var j = 0; j < 4; j++){
                    if (squares[here][i] != undefined && squares[neighbor][j] != undefined){
                        if (Object.compare(squares[here][i], squares[neighbor][j])){
                            delete squares[here][i];
                            delete squares[neighbor][j];
                        }
                    }
                }
            }
            
            // mark neighbor as visited and push it onto the queue
            delete unvisited[neighbor];
            queue.push(neighbor);
        }

    }

}

Object.compare = function (obj1, obj2) {
	//Loop through properties in object 1
	for (var p in obj1) {
		//Check property exists on both objects
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
 
		switch (typeof (obj1[p])) {
			//Deep compare objects
			case 'object':
				if (!Object.compare(obj1[p], obj2[p])) return false;
				break;
			//Compare function code
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
				break;
			//Compare values
			default:
				if (obj1[p] != obj2[p]) return false;
		}
	}
 
	//Check object 2 for any extra properties
	for (var p in obj2) {
		if (typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
};
