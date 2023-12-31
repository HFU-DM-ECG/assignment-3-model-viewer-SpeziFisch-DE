import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const toonVertexShader = `
varying vec3 vNormal;

varying vec3 camDirection;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 clipPosition = projectionMatrix * viewPosition;

  vNormal = normalize(normalMatrix * normal);

  vec4 cD = inverse(projectionMatrix) * vec4(0, 0, 1.0, 1.0);
  camDirection  = vec3(cD.x,cD.y,cD.z);

  gl_Position = clipPosition;
}
`;
export const toonFragmentShader = `
#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 camDirection;

void main() {
    float LightxNormal = dot(vNormal, directionalLights[0].direction);
    float lightIntensity = 1.0;

    float CamXNormal = dot(vNormal,camDirection);
    
    if (LightxNormal/2.0+0.5 < 0.97) {
        lightIntensity = 1.0;
        if (LightxNormal/2.0+0.5 < 0.6) {
            lightIntensity = 0.5;
            if (LightxNormal/2.0+0.5 < 0.4) {
                lightIntensity = 0.2; 
                if (LightxNormal/2.0+0.5 < 0.15) {
                    lightIntensity = -0.3;        
                }       
            }
        }
    } else {
        lightIntensity = 3.0;
    }
    vec3 directionalLight = directionalLights[0].color * lightIntensity;
  
    gl_FragColor = vec4(uColor * (ambientLightColor + directionalLight), 1.0);
    if (CamXNormal > -0.5 && CamXNormal < 0.5) {
        gl_FragColor = vec4(uColor * -0.8, 1.0);
    }

}
`;

//Shader
const toonShaderMaterial = new THREE.ShaderMaterial({
    lights: true,
    uniforms: {
        ...THREE.UniformsLib.lights,
        uColor: { value: new THREE.Color('#6495ED') }
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
})




// camera configuration
const FOV = 75;
const near_plane = 0.1;
const far_plane = 1000;

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, near_plane, far_plane);

// time
var time = Date.now() / 1000;

// background
const backgroundLoader = new THREE.TextureLoader();
backgroundLoader.load('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg', function (texture) {
    scene.background = texture;
});

// light
/// light from the sky
const AmbientLight = new THREE.AmbientLight(0xffffff,0.2);
scene.add(AmbientLight);

/// light from the sun
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
directionalLight.color.setHSL(0.9, 1, 0.9);
directionalLight.position.set(-2.5, 10, -2.5);
directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048
scene.add(directionalLight);

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
var dom = renderer.domElement;
document.body.appendChild(dom);

// orbit Controls
let controls;
controls = new OrbitControls(camera, dom);
controls.target.set(0, 3, 0);
controls.update();

// object loading
const monkey = new THREE.Object3D();
const loader = new GLTFLoader();

loader.load('monkey.glb', function (gltf) {
    monkey.add(gltf.scene.children[0]);
    monkey.name = "monkey";
    monkey.children[0].material = toonShaderMaterial;
    scene.add(monkey);
    monkey.position.y = 3;
    monkey.rotateY(2.7);
    console.log(monkey);
}, undefined, function (error) {
    console.error(error);
});

function animate() {
    // time management
    /// scaling to seconds
    const currentTime = Date.now() / 1000;
    time = currentTime;

    // rendering
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();