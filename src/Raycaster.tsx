import * as THREE from 'three';

export class Raycaster {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private requestAnimationFrameId: number | null = null;
  private map: number[][];
  private player: { x: number; y: number; angle: number };
  private FOV: number;
  private numRays: number;
  private raycastScene: THREE.Scene;
  private orthoCamera: THREE.OrthographicCamera;
  private wallPlane: THREE.Mesh;
  private keysPressed: Record<string, boolean> = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.map = [];
    this.player = { x: 0, y: 0, angle: 0 };
    this.FOV = Math.PI / 3;
    this.numRays = this.canvas.width;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.raycastScene = new THREE.Scene();
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.wallPlane = new THREE.Mesh();
  }

  public init(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.map = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ];

    this.player = {
      x: 2.5,
      y: 2.5,
      angle: Math.PI / 4,
    };

    this.FOV = Math.PI / 3;
    this.numRays = this.canvas.width;

    this.raycastScene = new THREE.Scene();
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.orthoCamera.position.z = 5;
    this.createWallPlane();
    this.createWalls();
    this.createFloor();
    this.handleInput();

    this.animate();
  }

  private handleInput(): void {
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keysPressed[event.code] = true;

    // Movement speed and rotation speed
    const moveSpeed = 0.1;
    const rotationSpeed = 0.05;

    if (this.keysPressed['KeyW']) {
      this.player.x += Math.cos(this.player.angle) * moveSpeed;
      this.player.y += Math.sin(this.player.angle) * moveSpeed;
    }
    if (this.keysPressed['KeyS']) {
      this.player.x -= Math.cos(this.player.angle) * moveSpeed;
      this.player.y -= Math.sin(this.player.angle) * moveSpeed;
    }
    if (this.keysPressed['KeyA']) {
      this.player.x -= Math.sin(this.player.angle) * moveSpeed;
      this.player.y += Math.cos(this.player.angle) * moveSpeed;
    }
    if (this.keysPressed['KeyD']) {
      this.player.x += Math.sin(this.player.angle) * moveSpeed;
      this.player.y -= Math.cos(this.player.angle) * moveSpeed;
    }
    if (this.keysPressed['ArrowLeft']) {
      this.player.angle -= rotationSpeed;
    }
    if (this.keysPressed['ArrowRight']) {
      this.player.angle += rotationSpeed;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    delete this.keysPressed[event.code];
  }


  private animate(): void {
    this.requestAnimationFrameId = requestAnimationFrame(() => this.animate());
  
    // Update the camera position and rotation based on the player's position and angle
    this.camera.position.set(this.player.x, 1.5, this.player.y);
    this.camera.rotation.y = -this.player.angle + Math.PI / 2;
    
    this.raycast()
    // Render the scene with the camera
    this.renderer.render(this.raycastScene, this.orthoCamera);
  }

  private raycast(): void {
    const angleStep = this.FOV / this.numRays;
    const distances: number[] = [];
  
    for (let i = 0; i < this.numRays; i++) {
      const rayAngle = this.player.angle - this.FOV / 2 + i * angleStep;
      const distance = this.castRay(rayAngle);
      distances.push(distance);
    }
  
    console.log(distances); // Log the distances to see the results of raycasting
    (this.wallPlane.material as THREE.ShaderMaterial).uniforms.distances.value = distances;
  }  

  private castRay(angle: number): number {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
  
    let x = this.player.x;
    let y = this.player.y;
  
    let distance = 0;
    const maxDistance = Math.max(this.map.length, this.map[0].length);
  
    while (distance < maxDistance) {
      x += dx * 0.05;
      y += dy * 0.05;
      distance += 0.05;
  
      const mapX = Math.floor(x);
      const mapY = Math.floor(y);
  
      if (mapX >= 0 && mapX < this.map.length && mapY >= 0 && mapY < this.map[0].length) {
        if (this.map[mapX][mapY] === 1) {
          break;
        }
      }
    }
  
    return distance;
  }

  private createWalls(): void {
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
  
    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[i].length; j++) {
        if (this.map[i][j] === 1) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i, 0.5, j);
          this.scene.add(wall);
        }
      }
    }
  }

  private createWallPlane(): void {
    const wallPlaneGeometry = new THREE.PlaneGeometry(2, 2);
    const wallPlaneMaterial = new THREE.ShaderMaterial({
      uniforms: {
        distances: { value: new Float32Array(this.numRays) },
        numRays: { value: this.numRays },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float distances[${this.numRays}];
        uniform int numRays;
        varying vec2 vUv;

        void main() {
          int rayIndex = int(float(numRays) * vUv.x);
          float distance = distances[rayIndex];
          float wallHeight = 1.0 / distance;
          float wallY = 0.5 - wallHeight / 2.0;

          if (vUv.y > wallY && vUv.y < wallY + wallHeight) {
            gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
          } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          }
        }
      `,
    });

    this.wallPlane = new THREE.Mesh(wallPlaneGeometry, wallPlaneMaterial);
    this.raycastScene.add(this.wallPlane);
  }


  private createFloor(): void {
    const floorGeometry = new THREE.PlaneGeometry(this.map.length, this.map[0].length);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(this.map.length / 2 - 0.5, 0, this.map[0].length / 2 - 0.5);
    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);
  } 

  public dispose(): void {
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
  }
}


// Create and add walls to the scene: Iterate over the this.map array and create 3D wall objects (e.g., using THREE.BoxGeometry and THREE.Mesh) where there are 1s in the array. Add these wall objects to the scene.

// Create and add a floor to the scene: Create a large plane for the floor using THREE.PlaneGeometry and THREE.Mesh. Add it to the scene.

// Implement raycasting: Update the castRay() function to use Three.js raycasting features, such as THREE.Raycaster. Use this to detect intersections between the rays and the walls.

// Render the walls according to raycasting: In the animate() function, use the results of the raycasting (i.e., the distances to the walls) to render the walls with the correct perspective on the screen. You can use various techniques like ray scaling or setting the walls' scale property.

// Handle user input: Add event listeners for keyboard and mouse input to control the player's movement and rotation. Update the this.player object's position and angle based on the input.

// Collision detection: Implement a collision detection system to prevent the player from walking through walls.