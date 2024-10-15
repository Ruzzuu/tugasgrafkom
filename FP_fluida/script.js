let scene, camera, renderer, cylinder;
let objects = {}, water;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff); // Background putih
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Membuat tabung silinder (wadah)
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 5, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc, 
        transparent: true, 
        opacity: 0.3, 
        side: THREE.DoubleSide 
    });
    cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    scene.add(cylinder);

    // Membuat air sebagai bentuk kotak di dalam tabung
    createWaterCube();

    // Cahaya untuk tampilan lebih jelas
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    camera.position.z = 10;

    // Membuat objek (Gabus, Telur, Logam)
    objects.cork = createObject(0xffa500, 0.4, 6);   // Gabus
    objects.egg = createObject(0xffff00, 0.2, 5);    // Telur
    objects.metal = createObject(0x0000ff, 0.15, 4); // Logam

    setupColorPickers();
    window.addEventListener('resize', onWindowResize, false);
}

function createObject(color, size, yPosition) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const obj = new THREE.Mesh(geometry, material);
    obj.position.y = yPosition;
    scene.add(obj);
    return obj;
}

// Membuat air dalam bentuk kotak di dalam tabung
function createWaterCube() {
    const waterGeometry = new THREE.BoxGeometry(1.7, 3.8, 2.8); // Kotak berukuran sesuai tabung
    const waterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00aaff, 
        transparent: true, 
        opacity: 0.5 
    });
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -0.2; // Posisi di tengah tabung
    scene.add(water);
}

function setupColorPickers() {
    document.getElementById('colorCork').addEventListener('input', (e) => {
        objects.cork.material.color.set(e.target.value);
    });

    document.getElementById('colorEgg').addEventListener('input', (e) => {
        objects.egg.material.color.set(e.target.value);
    });

    document.getElementById('colorMetal').addEventListener('input', (e) => {
        objects.metal.material.color.set(e.target.value);
    });

    document.getElementById('colorWater').addEventListener('input', (e) => {
        water.material.color.set(e.target.value); // Ubah warna air
    });

    document.getElementById('colorCylinder').addEventListener('input', (e) => {
        cylinder.material.color.set(e.target.value); // Ubah warna tabung
    });
}

document.getElementById('dropCork').addEventListener('click', () => dropObject(objects.cork, 2.0, 0.06));
document.getElementById('dropEgg').addEventListener('click', () => dropObject(objects.egg, 0, 0.08));
document.getElementById('dropMetal').addEventListener('click', () => dropObject(objects.metal, -2.2, 0.1));

function dropObject(obj, targetY, speed) {
    function animate() {
        requestAnimationFrame(animate);
        if (obj.position.y > targetY) {
            obj.position.y -= speed;
        }
        renderer.render(scene, camera);
    }
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Inisialisasi
init();
renderer.render(scene, camera);
