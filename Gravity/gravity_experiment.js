const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

// Set canvas size and viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// Dropdown for vacuum and air environment
const environmentDropdown = document.getElementById('environment');

// Define constants
const GRAVITY = -9.8;
const AIR_RESISTANCE = 0.1;

// Object properties
let cubePosition = vec3(-1, 5, -10);  // Cube starting position
let cubeVelocity = vec3(0, 0, 0);    // Cube velocity

let spherePosition = vec3(1, 5, -10);  // Sphere starting position
let sphereVelocity = vec3(0, 0, 0);    // Sphere velocity

// Initialize shaders
const program = initShaders(gl, "vertex-shader", "fragment-shader");
gl.useProgram(program);

// Cube vertices
const cubeVertices = new Float32Array([
    -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0, // Front face
    -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0  // Back face
]);

// Cube indices for indexed drawing
const cubeIndices = new Uint16Array([
    0, 1, 2,  0, 2, 3,   // Front face
    4, 5, 6,  4, 6, 7,   // Back face
    3, 2, 6,  3, 6, 5,   // Top face
    0, 1, 7,  0, 7, 4,   // Bottom face
    1, 2, 6,  1, 6, 7,   // Right face
    0, 3, 5,  0, 5, 4    // Left face
]);

// Create buffers for cube
const cubeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

const cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

// Sphere geometry generator (simplified)
function createSphereVertices(latitudeBands, longitudeBands, radius) {
    const vertices = [];
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            vertices.push(radius * x, radius * y, radius * z);
        }
    }
    return new Float32Array(vertices);
}

const sphereVertices = createSphereVertices(20, 20, 1.0);  // Sphere with 20 latitude and longitude bands

// Create buffer for sphere
const sphereBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.STATIC_DRAW);

// Enable depth test
gl.enable(gl.DEPTH_TEST);

// Set clear color
gl.clearColor(0.5, 0.5, 0.5, 1.0);

// Set up projection matrix
const projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
gl.uniformMatrix4fv(projectionMatrixLocation, false, flatten(projectionMatrix));

// Get uniform location for modelViewMatrix
const modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix");

// Physics update function
function updatePhysics(deltaTime, environment) {
    const gravity = GRAVITY;

    // Cube physics
    if (environment === "air") {
        cubeVelocity[1] += (gravity + AIR_RESISTANCE * cubeVelocity[1]) * deltaTime;
    } else {
        cubeVelocity[1] += gravity * deltaTime;
    }
    cubePosition[1] += cubeVelocity[1] * deltaTime;

    // Reset cube if it falls below ground
    if (cubePosition[1] < -5) {
        cubePosition[1] = 5;
        cubeVelocity[1] = 0;
    }

    // Sphere physics
    if (environment === "air") {
        sphereVelocity[1] += (gravity + AIR_RESISTANCE * sphereVelocity[1]) * deltaTime;
    } else {
        sphereVelocity[1] += gravity * deltaTime;
    }
    spherePosition[1] += sphereVelocity[1] * deltaTime;

    // Reset sphere if it falls below ground
    if (spherePosition[1] < -5) {
        spherePosition[1] = 5;
        sphereVelocity[1] = 0;
    }
}

// Rendering function
function render(time) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    const environment = environmentDropdown.value;

    // Update physics
    updatePhysics(deltaTime, environment);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(program, "coordinates"), 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "coordinates"));

    let modelViewMatrix = translate(cubePosition[0], cubePosition[1], cubePosition[2]);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, flatten(modelViewMatrix));

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

    // Draw the sphere
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(program, "coordinates"), 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, "coordinates"));

    modelViewMatrix = translate(spherePosition[0], spherePosition[1], spherePosition[2]);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, sphereVertices.length / 3);

    // Call the render function again on the next frame
    requestAnimationFrame(render);
}

// Start rendering loop
let lastTime = 0;
requestAnimationFrame(render);
