import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ScrapeLocation {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
  status: 'active' | 'completed' | 'failed';
  timestamp: Date;
}

interface Globe3DProps {
  locations: ScrapeLocation[];
  onLocationClick?: (location: ScrapeLocation) => void;
  className?: string;
}

export default function Globe3D({ locations, onLocationClick, className }: Globe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ScrapeLocation | null>(null);

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  // Create earth geometry and material
  const createEarth = () => {
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create a dark, cyber-style earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x001122,
      shininess: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(1.001, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    
    const earthGroup = new THREE.Group();
    earthGroup.add(earth);
    earthGroup.add(wireframe);
    
    return earthGroup;
  };

  // Create location markers
  const createLocationMarkers = () => {
    const markersGroup = new THREE.Group();
    
    locations.forEach(location => {
      const position = latLngToVector3(location.lat, location.lng, 1.02);
      
      // Create marker geometry
      const markerGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      
      // Set color based on status
      let color = 0x00ff88; // Default green
      if (location.status === 'active') color = 0x00ffff; // Cyan
      else if (location.status === 'failed') color = 0xff0044; // Red
      
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.8
      });
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      marker.userData = location;
      
      // Add pulsing animation
      const pulseGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3
      });
      
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulse.position.copy(position);
      pulse.userData = { isPulse: true, originalScale: 1, location };
      
      markersGroup.add(marker);
      markersGroup.add(pulse);
    });
    
    return markersGroup;
  };

  // Create connection lines between locations
  const createConnectionLines = () => {
    const linesGroup = new THREE.Group();
    
    // Create lines between recent locations
    const recentLocations = locations
      .filter(loc => loc.status === 'active' || loc.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    for (let i = 0; i < recentLocations.length - 1; i++) {
      const start = latLngToVector3(recentLocations[i].lat, recentLocations[i].lng, 1.01);
      const end = latLngToVector3(recentLocations[i + 1].lat, recentLocations[i + 1].lng, 1.01);
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      linesGroup.add(line);
    }
    
    return linesGroup;
  };

  // Animation loop
  const animate = () => {
    animationRef.current = requestAnimationFrame(animate);
    
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    
    // Rotate globe
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
    
    // Animate pulse effects
    sceneRef.current.traverse((child) => {
      if (child.userData.isPulse) {
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.3;
        child.scale.setScalar(scale);
        child.material.opacity = 0.3 - (scale - 1) * 0.2;
      }
    });
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // Handle mouse interactions
  const handleMouseClick = (event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current || !mountRef.current) return;
    
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData && object.userData.id) {
        const location = object.userData as ScrapeLocation;
        setSelectedLocation(location);
        onLocationClick?.(location);
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create globe
    const globe = new THREE.Group();
    globe.add(createEarth());
    globe.add(createLocationMarkers());
    globe.add(createConnectionLines());
    
    scene.add(globe);
    globeRef.current = globe;
    
    // Mount renderer
    mountRef.current.appendChild(renderer.domElement);
    
    // Add mouse controls
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseDown = (event: MouseEvent) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      globe.rotation.y += deltaX * 0.01;
      globe.rotation.x += deltaY * 0.01;
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleMouseUp = () => {
      mouseDown = false;
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleMouseClick);
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [locations]);

  return (
    <div className={`relative ${className || ''}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Location info tooltip */}
      {selectedLocation && (
        <div className="absolute top-4 left-4 bg-shodan-surface/90 backdrop-blur-sm border border-shodan-accent/30 rounded-lg p-4 max-w-xs">
          <h3 className="text-shodan-accent font-semibold mb-2">
            {selectedLocation.city}, {selectedLocation.country}
          </h3>
          <div className="space-y-1 text-sm text-shodan-text/80">
            <p>Status: <span className={`font-medium ${
              selectedLocation.status === 'active' ? 'text-cyan-400' :
              selectedLocation.status === 'completed' ? 'text-green-400' :
              'text-red-400'
            }`}>{selectedLocation.status}</span></p>
            <p>Scrapes: {selectedLocation.count}</p>
            <p>Last Active: {selectedLocation.timestamp.toLocaleString()}</p>
          </div>
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-2 right-2 text-shodan-text/60 hover:text-shodan-text"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}