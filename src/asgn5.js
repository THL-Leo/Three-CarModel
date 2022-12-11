import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js'


function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 5, 20);



    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');


    {
      const planeSize = 40;
  
      const loader = new THREE.TextureLoader();
      const texture = loader.load('resources/texture/road.png');
      texture.encoding = THREE.sRGBEncoding;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
  
      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.receiveShadow = true;
      mesh.rotation.x = Math.PI * -.5;
      mesh.rotation.z = Math.PI * -.5;
      
      scene.add(mesh);
    }

    {
      const loader = new THREE.TextureLoader();
      const texture = loader.load(
        'resources/texture/night.jpg',
        () => {
          const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
          rt.fromEquirectangularTexture(renderer, texture);
          scene.background = rt.texture;
        });
    }
  
    {
      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0xB97A20;  // brownish orange
      const intensity = 0.1;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      // light.castShadow = true;
      const helper = new THREE.HemisphereLightHelper(light);
      scene.add(helper)
      scene.add(light);
    }
  
    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.SpotLight(color, intensity);
      light.castShadow = true;
      light.position.set(-8, 13.5, -10);
      light.target.position.set(-8, 0, -10);
      scene.add(light);
      scene.add(light.target);
      const helper = new THREE.CameraHelper(light.shadow.camera);
      light.shadowDarkness = 0.95;
      light.shadowCameraVisible = true;
      scene.add(helper);
    }

    {
      const color = 0xFCD304;
      const intensity = 0.5;
      const light = new THREE.SpotLight(color, intensity);
      light.castShadow = true;
      light.position.set(8, 13.5, 10);
      light.target.position.set(8, 0, 10);
      scene.add(light);
      scene.add(light.target);
      const helper = new THREE.CameraHelper(light.shadow.camera);
      light.shadowDarkness = 0.95;
      light.shadowCameraVisible = true;
      scene.add(helper);
    }
    

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function addStar(){
      const geometry = new THREE.SphereGeometry(0.25,24,24);
      const material = new THREE.MeshStandardMaterial( { color: 0xffffff})
      const star = new THREE.Mesh(geometry, material);
    
      const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(50));
    
      star.position.set(x,y,z);
      star.castShadow = true;
      star.receiveShadow = true;
      scene.add(star);
    }
    Array(100).fill().forEach(addStar);
    
    const cubes = [];  // just an array we can use to rotate the cubes
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    const texture = loader.load('https://threejs.org/manual/examples/resources/images/wall.jpg');
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.y = 3;
    cube.position.x = -5;
    scene.add(cube);
    

  loadManager.onLoad = () => {
      const mtlLoader = new MTLLoader();
      mtlLoader.load('resources/models/Car.mtl', (mtl) => {
        mtl.preload();
        for (const material of Object.values(mtl.materials)) {
          material.side = THREE.DoubleSide;
        }
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('resources/models/Car.obj', (root) => {
          root.name = 'car'
          root.castShadow = true;
          root.receiveShadow = true;
          scene.add(root);
        });
      });
  };

  {
    const mtlLoader = new MTLLoader();
      mtlLoader.load('resources/models/Lamp.mtl', (mtl) => {
        mtl.preload();
        for (const material of Object.values(mtl.materials)) {
          material.side = THREE.DoubleSide;
        }
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('resources/models/Lamp.obj', (root) => {
          root.name = 'lamp1'
          root.castShadow = true;
          root.receiveShadow = true;
          scene.add(root);
        });
      });
  }

  {
    const mtlLoader = new MTLLoader();
      mtlLoader.load('resources/models/Lamp.mtl', (mtl) => {
        mtl.preload();
        for (const material of Object.values(mtl.materials)) {
          material.side = THREE.DoubleSide;
        }
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('resources/models/Lamp.obj', (root) => {
          root.name = 'lamp2'
          root.castShadow = true;
          root.receiveShadow = true;
          scene.add(root);
        });
      });
  }


  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  class StringToNumberHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return this.obj[this.prop];
    }
    set value(v) {
      this.obj[this.prop] = parseFloat(v);
    }
  }

  const wrapModes = {
    'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
    'RepeatWrapping': THREE.RepeatWrapping,
    'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
  };

  function updateTexture() {
    texture.needsUpdate = true;
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
    function render() {
	    renderer.render( scene, camera );
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
      const car = scene.getObjectByName('car');
      const lamp1 = scene.getObjectByName('lamp1');
      const lamp2 = scene.getObjectByName('lamp2');
      if(lamp1){
        lamp1.position.x = -15;
        lamp1.position.z = -10;
      }
      if(lamp2){
        lamp2.rotation.y = Math.PI * -1;
        lamp2.position.x = 15;
        lamp2.position.z = 10;
      }
      if (car) {
          car.position.y = 0.001;
          car.position.z += 0.05;
          if (car.position.z >= 20){
            car.position.z = -20
        }
      }
      renderer.render(scene, camera);
    }
      requestAnimationFrame(animate);
}


main();
