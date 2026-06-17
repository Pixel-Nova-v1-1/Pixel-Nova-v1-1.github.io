/**
 * Pixel Nova SOLARIS Canvas Animation Controller
 * Handles 3D procedural wireframe deconstruction or preloaded image sequence playback.
 */

export const CONFIG = {
  // Toggle this to true to use your image sequence in assets/sequence
  useImageSequence: false, 

  imageSequence: {
    folder: 'assets/sequence',
    extension: 'png',
    prefix: 'frame_',
    totalFrames: 100,
    digits: 3 // frame_000.png, frame_001.png
  },

  procedural: {
    particleCount: 160,
    connectionDistance: 0.28, // Max distance to draw wireframe line
    baseRotationSpeed: 0.005,
    colors: {
      gold: '245, 158, 11',
      amber: '217, 119, 6',
      dimGold: '245, 158, 11, 0.2',
      glow: 'rgba(255, 176, 0, 0.4)'
    }
  }
};

export class SolarisCanvasManager {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById(containerId);
    
    this.scrollPercent = 0;
    this.rotationY = 0;
    this.rotationX = 0;
    this.time = 0;
    
    // Image Sequence Preloader Cache
    this.images = [];
    this.imagesLoaded = 0;
    this.isPreloaded = false;
    
    // Procedural Particle Array
    this.nodes = [];
    this.rings = [];
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    if (CONFIG.useImageSequence) {
      this.preloadSequence();
    } else {
      this.initProceduralModel();
    }
    
    // Animation loop
    this.tick();
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(this.container.clientWidth, this.container.clientHeight, 800);
    
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    
    this.ctx.scale(dpr, dpr);
    this.width = size;
    this.height = size;
  }

  updateScroll(percent) {
    // Smooth scroll easing
    this.scrollPercent = percent;
  }

  /* --- MODE 1: IMAGE SEQUENCE CONTROLLER --- */
  preloadSequence() {
    const seq = CONFIG.imageSequence;
    const total = seq.totalFrames;
    
    console.log(`Solaris Systems: Preloading ${total} frames...`);
    
    for (let i = 0; i < total; i++) {
      const img = new Image();
      // Format number to padded digits: e.g. 5 -> "005"
      const paddedNum = String(i).padStart(seq.digits, '0');
      img.src = `${seq.folder}/${seq.prefix}${paddedNum}.${seq.extension}`;
      
      img.onload = () => {
        this.imagesLoaded++;
        if (this.imagesLoaded === total) {
          this.isPreloaded = true;
          console.log("Solaris Systems: Scroll sequence preloaded successfully.");
        }
      };
      
      img.onerror = () => {
        // Fallback gracefully to procedural if image sequence is empty or fails
        if (i === 0) {
          console.warn("Solaris Systems: Image sequence frames not found in assets/sequence/. Falling back to Procedural Reactor Mesh.");
          CONFIG.useImageSequence = false;
          this.initProceduralModel();
        }
      };
      
      this.images.push(img);
    }
  }

  drawSequence() {
    if (!this.isPreloaded || this.images.length === 0) {
      // Show loading telemetry while preloading sequence
      const percent = Math.round((this.imagesLoaded / CONFIG.imageSequence.totalFrames) * 100);
      this.drawLoadingHUD(percent);
      return;
    }
    
    const frameIndex = Math.min(
      CONFIG.imageSequence.totalFrames - 1,
      Math.floor(this.scrollPercent * CONFIG.imageSequence.totalFrames)
    );
    
    const img = this.images[frameIndex];
    if (img && img.complete) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      // Calculate centering and cover scale
      const scale = Math.max(this.width / img.width, this.height / img.height) * 0.85;
      const x = (this.width - img.width * scale) / 2;
      const y = (this.height - img.height * scale) / 2;
      
      this.ctx.save();
      this.ctx.globalAlpha = 0.9;
      // Draw shadow glow
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = `rgba(${CONFIG.procedural.colors.gold}, 0.25)`;
      
      this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      this.ctx.restore();
      
      this.drawTelemetryOverlay(frameIndex);
    }
  }

  drawLoadingHUD(percent) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const cx = this.width / 2;
    const cy = this.height / 2;
    
    this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.15)`;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Drawing a glowing sector arc representing preloading progress
    this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.8)`;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 100, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (percent / 100)));
    this.ctx.stroke();
    
    // Telemetry loading text
    this.ctx.font = '12px "Orbitron", monospace';
    this.ctx.fillStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.85)`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText("PRELOADING CORE SENSOR DATA...", cx, cy - 20);
    this.ctx.font = '24px "Orbitron", monospace';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`${percent}%`, cx, cy + 15);
  }

  /* --- MODE 2: PROCEDURAL 3D DECONSTRUCTING REACTOR --- */
  initProceduralModel() {
    const count = CONFIG.procedural.particleCount;
    
    // Create 3D points forming a beautiful Fibonacci Sphere
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenAngle = 2 * Math.PI * (1 - 1 / goldenRatio);
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // goes from 1 to -1
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      // Node structure
      this.nodes.push({
        x: x * 0.9,
        y: y * 0.9,
        z: z * 0.9,
        // Define which "sector layer" the node belongs to for segmented deconstruction
        sector: i % 4, // 4 layers
        size: Math.random() * 2 + 1.5
      });
    }

    // Add glowing orbital rings
    for (let j = 0; j < 3; j++) {
      this.rings.push({
        radius: 0.95 + j * 0.15,
        rotationSpeed: (j + 1) * 0.008,
        axis: j // 0 = X, 1 = Y, 2 = Z
      });
    }
  }

  drawProceduralModel() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const cx = this.width / 2;
    const cy = this.height / 2;
    const scale = this.width * 0.38;
    
    // Deconstruction Factor based on scroll percent
    // At scroll = 0: tightly packed sphere
    // At scroll = 1: exploded pieces flying outwards
    const deconstruction = this.scrollPercent;
    
    // Base rotations
    this.rotationY += CONFIG.procedural.baseRotationSpeed + (deconstruction * 0.012);
    this.rotationX = (this.scrollPercent * Math.PI * 1.5) + (this.time * 0.002);
    
    const cosY = Math.cos(this.rotationY);
    const sinY = Math.sin(this.rotationY);
    const cosX = Math.cos(this.rotationX);
    const sinX = Math.sin(this.rotationX);
    
    // Project 3D nodes to 2D
    const projectedNodes = this.nodes.map((node) => {
      // Deconstruction dispersion vector
      let dispX = 0;
      let dispY = 0;
      let dispZ = 0;
      
      if (deconstruction > 0.05) {
        const factor = (deconstruction - 0.05) * 1.6;
        
        // Deconstruct along sector lines
        if (node.sector === 0) {
          // Sector 0 flies outward along radial vector
          dispX = node.x * factor * 0.85;
          dispY = node.y * factor * 0.85;
          dispZ = node.z * factor * 0.85;
        } else if (node.sector === 1) {
          // Sector 1 slides upwards vertically
          dispY = factor * 0.75;
          dispX = node.x * factor * 0.2;
          dispZ = node.z * factor * 0.2;
        } else if (node.sector === 2) {
          // Sector 2 slides downwards vertically
          dispY = -factor * 0.75;
          dispX = node.x * factor * 0.2;
          dispZ = node.z * factor * 0.2;
        } else {
          // Sector 3 spins and expands outwards horizontally
          const angle = factor * 2;
          dispX = (node.x * Math.cos(angle) - node.z * Math.sin(angle)) * (1 + factor * 0.6) - node.x;
          dispZ = (node.x * Math.sin(angle) + node.z * Math.cos(angle)) * (1 + factor * 0.6) - node.z;
        }
      }
      
      const x = node.x + dispX;
      const y = node.y + dispY;
      const z = node.z + dispZ;
      
      // Rotate around Y axis
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;
      
      // Rotate around X axis
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;
      
      // Project (Perspective Projection)
      const distance = 2.4; // Camera distance
      const projScale = scale / (z2 + distance);
      const px = x1 * projScale + cx;
      const py = y2 * projScale + cy;
      
      return { px, py, pz: z2, node, depth: z2 };
    });

    // Sort by depth (painters algorithm for clean overlapping rendering)
    projectedNodes.sort((a, b) => b.pz - a.pz);
    
    // Draw wireframe connection lines (if deconstruction is not too high)
    const lineAlphaModifier = Math.max(0, 1 - deconstruction * 1.5);
    if (lineAlphaModifier > 0.05) {
      this.ctx.lineWidth = 0.5;
      const maxDist = CONFIG.procedural.connectionDistance;
      
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        
        // Connect nodes to neighboring nodes
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j];
          
          // Compute distance in 3D (using deconstructed coordinates)
          const dx = (n1.node.x - n2.node.x);
          const dy = (n1.node.y - n2.node.y);
          const dz = (n1.node.z - n2.node.z);
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < maxDist) {
            // Lines fade as distance increases, and as deconstruction expands
            const alpha = (1 - dist / maxDist) * 0.25 * lineAlphaModifier * (1 + n1.pz * 0.3);
            this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.gold}, ${alpha})`;
            
            this.ctx.beginPath();
            this.ctx.moveTo(n1.px, n1.py);
            this.ctx.lineTo(n2.px, n2.py);
            this.ctx.stroke();
          }
        }
      }
    }

    // Draw orbital rings
    this.rings.forEach((ring) => {
      const ringAngle = this.time * ring.rotationSpeed + (deconstruction * Math.PI * 0.8);
      const ringCos = Math.cos(ringAngle);
      const ringSin = Math.sin(ringAngle);
      
      this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.gold}, ${0.15 * (1 - deconstruction * 0.5)})`;
      this.ctx.lineWidth = 1;
      
      this.ctx.beginPath();
      // Draw ring as projected ellipse
      for (let theta = 0; theta <= Math.PI * 2 + 0.1; theta += 0.1) {
        let rx = Math.cos(theta) * ring.radius;
        let ry = Math.sin(theta) * ring.radius;
        let rz = 0;
        
        // Apply ring rotation
        let rx1 = rx;
        let ry1 = ry;
        let rz1 = rz;
        
        if (ring.axis === 0) {
          ry1 = ry * ringCos - rz * ringSin;
          rz1 = ry * ringSin + rz * ringCos;
        } else if (ring.axis === 1) {
          rx1 = rx * ringCos - rz * ringSin;
          rz1 = rx * ringSin + rz * ringCos;
        }
        
        // Rotate matching model rotation
        let rx2 = rx1 * cosY - rz1 * sinY;
        let rz2 = rx1 * sinY + rz1 * cosY;
        
        let ry3 = ry1 * cosX - rz2 * sinX;
        let rz3 = ry1 * sinX + rz2 * cosX;
        
        const projScale = scale / (rz3 + 2.4);
        const px = rx2 * projScale + cx;
        const py = ry3 * projScale + cy;
        
        if (theta === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
    });

    // Draw the nodes as glowing dots
    projectedNodes.forEach((p) => {
      const depthAlpha = (p.pz + 1.2) / 2.4; // 0 to 1 based on depth
      const alpha = Math.max(0.15, Math.min(1.0, depthAlpha)) * (1 - deconstruction * 0.4);
      
      this.ctx.save();
      
      // Node glow effects
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `rgba(${CONFIG.procedural.colors.gold}, ${0.6})`;
      this.ctx.fillStyle = `rgba(${CONFIG.procedural.colors.gold}, ${alpha})`;
      
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, p.node.size * (1 + (p.pz * 0.2)), 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      
      // Draw telemetry numbers next to a few outer points on deconstruct
      if (deconstruction > 0.25 && p.node.sector === 1 && Math.abs(p.pz) < 0.2) {
        this.ctx.font = '8px monospace';
        this.ctx.fillStyle = `rgba(${CONFIG.procedural.colors.amber}, ${(deconstruction - 0.25) * 0.75})`;
        this.ctx.fillText(`[N-${Math.round(p.px)}]`, p.px + 8, p.py - 4);
        
        this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.amber}, ${(deconstruction - 0.25) * 0.3})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(p.px, p.py);
        this.ctx.lineTo(p.px + 6, p.py - 3);
        this.ctx.lineTo(p.px + 24, p.py - 3);
        this.ctx.stroke();
      }
    });

    // Draw central energy core (Solaris theme)
    if (deconstruction < 0.9) {
      const coreGlow = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * (1 - deconstruction * 0.8));
      coreGlow.addColorStop(0, '#fff');
      coreGlow.addColorStop(0.2, `rgba(255, 200, 0, ${0.8 * (1 - deconstruction)})`);
      coreGlow.addColorStop(0.6, `rgba(${CONFIG.procedural.colors.amber}, ${0.4 * (1 - deconstruction)})`);
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
      
      this.ctx.fillStyle = coreGlow;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 60 * (1 - deconstruction * 0.8), 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.drawTelemetryOverlay(Math.round(this.scrollPercent * 100));
  }

  /* --- SHARED HUD/TELEMETRY OVERLAY --- */
  drawTelemetryOverlay(frameVal) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    
    this.ctx.save();
    
    // Draw crosshairs
    this.ctx.strokeStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.15)`;
    this.ctx.lineWidth = 0.5;
    
    this.ctx.beginPath();
    // Center ticks
    this.ctx.moveTo(cx - 15, cy); this.ctx.lineTo(cx + 15, cy);
    this.ctx.moveTo(cx, cy - 15); this.ctx.lineTo(cx, cy + 15);
    
    // Corner brackets
    const pad = 40;
    const len = 12;
    // Top-Left
    this.ctx.moveTo(pad, pad + len); this.ctx.lineTo(pad, pad); this.ctx.lineTo(pad + len, pad);
    // Top-Right
    this.ctx.moveTo(this.width - pad, pad + len); this.ctx.lineTo(this.width - pad, pad); this.ctx.lineTo(this.width - pad - len, pad);
    // Bottom-Left
    this.ctx.moveTo(pad, this.height - pad - len); this.ctx.lineTo(pad, this.height - pad); this.ctx.lineTo(pad + len, this.height - pad);
    // Bottom-Right
    this.ctx.moveTo(this.width - pad, this.height - pad - len); this.ctx.lineTo(this.width - pad, this.height - pad); this.ctx.lineTo(this.width - pad - len, this.height - pad);
    this.ctx.stroke();
    
    // Draw HUD text metrics
    this.ctx.font = '9px "Orbitron", monospace';
    this.ctx.fillStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.5)`;
    this.ctx.textAlign = 'left';
    this.ctx.fillText("MODEL TELEMETRY: ACTIVE", pad + 5, pad + 15);
    this.ctx.fillText(`SYS_PHASE: ${Math.min(100, Math.round(this.scrollPercent * 100))}%`, pad + 5, pad + 27);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`RX_INDEX: ${String(frameVal).padStart(3, '0')}`, this.width - pad - 5, pad + 15);
    this.ctx.fillText(CONFIG.useImageSequence ? "MODE: VIDEO_STREAM" : "MODE: PROCEDURAL_3D", this.width - pad - 5, pad + 27);
    
    // Bottom telemetry
    this.ctx.textAlign = 'left';
    this.ctx.fillText("TARGET: DECONSTRUCT_REACTOR_V1.1", pad + 5, this.height - pad - 8);
    this.ctx.textAlign = 'right';
    const statusText = this.scrollPercent > 0.85 ? "DECONSTRUCT COMPLETE" : (this.scrollPercent > 0.15 ? "SEPARATING STRUCT..." : "STANDBY");
    this.ctx.fillStyle = this.scrollPercent > 0.85 ? `rgba(${CONFIG.procedural.colors.gold}, 0.8)` : `rgba(${CONFIG.procedural.colors.gold}, 0.5)`;
    this.ctx.fillText(`SYS_STATUS: ${statusText}`, this.width - pad - 5, this.height - pad - 8);
    
    this.ctx.restore();
  }

  tick() {
    this.time++;
    
    if (CONFIG.useImageSequence) {
      this.drawSequence();
    } else {
      this.drawProceduralModel();
    }
    
    requestAnimationFrame(() => this.tick());
  }
}
