/**
 * Pixel Nova SOLARIS Command Console Terminal Controller
 * Simulates a space-engineering server node command line interface.
 */

const COMMAND_LIST = {
  help: 'Display all available Solaris terminal commands.',
  about: 'Access core logs regarding Pixel Nova operations.',
  team: 'Read bio-telemetry reports of Pixel Nova crew members.',
  projects: 'View ongoing and deployed engineering modules.',
  contact: 'Initialize contact transmission frequencies.',
  matrix: 'Overclock core CPU: Initiates neural matrix stream.',
  clear: 'Flush the console terminal history cache.'
};

const TEAM_BIOS = {
  anirudh: `
========================================
CREW FILE: ANIRUDH NAIR
ROLE: Frontend Developer
TELEMETRY:
 - System Architecture: [██████████] 95%
 - Creative Computing:  [██████████] 92%
 - GDG Competitions:    [██████████] 90%
BIOGRAPHY:
 Creative technologist focused on fusing code and visual arts.
 Winner of multiple college developer hackathons.
 Leading full-stack deployments and canvas render nodes.
========================================`,
  aditya: `
========================================
CREW FILE: ADITYA NAIR
ROLE: UI/UX & Canvas, PPT Specialist
TELEMETRY:
 - UI Core Systems:     [██████████] 93%
 - Interactive Styling: [██████████] 95%
 - Asset Optimization:  [████████░░] 80%
BIOGRAPHY:
 Space-grade visual designer and modular frontend engineer.
 Dedicated to sub-pixel perfection and clean styling architectures.
 Currently structuring the Amogha Foundation campaign dashboard.
========================================`,
  devjith: `
========================================
CREW FILE: DEVJITH KURUP
ROLE: Backend Developer
TELEMETRY:
 - DB / Core Networks:  [██████████] 92%
 - Server Logic Engine: [██████████] 90%
 - API Routing Node:    [██████████] 88%
BIOGRAPHY:
 System developer optimized for latency-critical database layers.
 Structuring microservice pipelines and secure web services.
 Architecting data logic nodes for Amogha Foundation projects.
========================================`
};

export class SolarisTerminal {
  constructor(terminalId, inputId, historyId) {
    this.body = document.getElementById(terminalId);
    this.input = document.getElementById(inputId);
    this.history = document.getElementById(historyId);
    this.matrixActive = false;
    this.matrixCanvas = null;
    this.matrixInterval = null;
    
    if (!this.body || !this.input || !this.history) return;
    
    this.init();
  }

  init() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        this.input.value = '';
        this.executeCommand(cmd);
      }
    });

    // Automatically focus input on terminal wrapper click
    this.body.addEventListener('click', () => {
      if (!this.matrixActive) {
        this.input.focus();
      } else {
        this.stopMatrix();
      }
    });

    // Write initial boot diagnostics
    this.writeWelcomeMessage();
  }

  writeWelcomeMessage() {
    this.writeLine("Initializing Solaris Terminal connection v1.1.0...", 'text-muted');
    setTimeout(() => {
      this.writeLine("Connecting to Pixel Nova Core Network... SUCCESS.", 'text-success');
      this.writeLine("Type 'help' to fetch operational system commands.", 'gold');
    }, 500);
  }

  writeLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    this.history.appendChild(line);
    this.body.scrollTop = this.body.scrollHeight;
  }

  writeRawHTML(html, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = html;
    this.history.appendChild(line);
    this.body.scrollTop = this.body.scrollHeight;
  }

  executeCommand(rawCmd) {
    if (this.matrixActive) {
      this.stopMatrix();
      return;
    }

    const cleanCmd = rawCmd.toLowerCase().trim();
    if (!cleanCmd) return;

    this.writeLine(`guest@pixelnova:~$ ${rawCmd}`, 'text-primary');

    switch (cleanCmd) {
      case 'help':
        this.printHelp();
        break;
      case 'about':
        this.printAbout();
        break;
      case 'team':
        this.printTeam();
        break;
      case 'projects':
        this.printProjects();
        break;
      case 'contact':
        this.printContact();
        break;
      case 'matrix':
        this.startMatrix();
        break;
      case 'clear':
        this.history.innerHTML = '';
        break;
      default:
        // Try looking up a specific crew bio (e.g. "team anirudh")
        if (cleanCmd.startsWith('team ')) {
          const subName = cleanCmd.replace('team ', '').trim();
          if (TEAM_BIOS[subName]) {
            this.writeLine(TEAM_BIOS[subName], 'gold');
          } else {
            this.writeLine(`Solaris Error: Crew member '${subName}' not recognized. Try 'team'.`, 'danger');
          }
        } else {
          this.writeLine(`Solaris Error: Command '${rawCmd}' not found. Type 'help' for support.`, 'danger');
        }
    }
  }

  printHelp() {
    this.writeLine("\n--- Available Commands ---", 'gold');
    for (const [cmd, desc] of Object.entries(COMMAND_LIST)) {
      const paddedCmd = cmd.padEnd(12, ' ');
      this.writeLine(`${paddedCmd} - ${desc}`, 'text-secondary');
    }
    this.writeLine("---------------------------\n", 'gold');
  }

  printAbout() {
    this.writeLine("\n--- ARCHIVE LOG: PIXEL NOVA ---", 'gold');
    this.writeLine(
      "Pixel Nova is a space-engineering developer cell composing 3 specialists who design and build high-performance web systems. Operating out of the Google Developer Groups (GDG) ecosystem in college, we build interfaces, interactive canvas renders, and scalable APIs.",
      'text-secondary'
    );
    this.writeLine("Our coordinates: Google Developer Groups node, University Campus.", 'text-secondary');
    this.writeLine("Current Deployment: Amogha Foundation core portal module.", 'text-secondary');
    this.writeLine("-------------------------------\n", 'gold');
  }

  printTeam() {
    this.writeLine("\n--- CREW TELEMETRY: PIXEL NOVA ---", 'gold');
    this.writeLine("Specialist 01: Anirudh Nair   - Frontend Developer", 'text-secondary');
    this.writeLine("Specialist 02: Aditya Nair     - UI/UX & Canvas, PPT Specialist", 'text-secondary');
    this.writeLine("Specialist 03: Devjith Kurup   - Backend Developer", 'text-secondary');
    this.writeLine("\n* Note: Type 'team [name]' (e.g., 'team anirudh') for individual reports.\n", 'gold');
  }

  printProjects() {
    this.writeLine("\n--- COMPLETED & ACTIVE MODULES ---", 'gold');
    this.writeLine("01. ZESTAY [STABLE]", 'text-success');
    this.writeLine("   - Description: Shared-living platform matching students and professionals with verified PG accommodations and compatible roommates.", 'text-secondary');
    this.writeLine("   - Technology: React, Node.js, Express, MongoDB.", 'text-secondary');
    this.writeLine("   - Achievements: Won the GDG College Hackathon.", 'text-secondary');
    
    this.writeLine("02. AMOGHA FOUNDATION WEBSITE [UNDER CONSTRUCTION]", 'gold');
    this.writeLine("   - Description: Modern full-stack platform for social initiatives.", 'text-secondary');
    this.writeLine("   - Technology: Responsive Web Suite, Campaign telemetry dashboard.", 'text-secondary');
    
    this.writeLine("03. GDG HACKATHON MISSIONS [COMPLETED]", 'text-success');
    this.writeLine("   - Achieved 1st place in localized college hackathons organized by GDG.", 'text-secondary');
    this.writeLine("----------------------------------\n", 'gold');
  }

  printContact() {
    this.writeLine("\n--- TRANSMISSION FREQUENCIES ---", 'gold');
    this.writeRawHTML(`Email Connection: <a href="mailto:hire.pixelnova@gmail.com" class="footer-link" style="color:var(--gold); text-decoration: underline;">hire.pixelnova@gmail.com</a>`, 'text-secondary');
    this.writeLine("GitHub Repository: https://github.com/Pixel-Nova-v1-1", 'text-secondary');
    this.writeLine("Ready to integrate new projects. System standing by.", 'text-success');
    this.writeLine("--------------------------------\n", 'gold');
  }

  startMatrix() {
    this.matrixActive = true;
    this.input.disabled = true;
    this.input.placeholder = 'Press anywhere to exit matrix override...';
    
    // Create canvas overlay
    this.matrixCanvas = document.createElement('canvas');
    this.matrixCanvas.style.position = 'absolute';
    this.matrixCanvas.style.top = '0';
    this.matrixCanvas.style.left = '0';
    this.matrixCanvas.style.width = '100%';
    this.matrixCanvas.style.height = '100%';
    this.matrixCanvas.style.background = 'rgba(7, 8, 10, 0.9)';
    this.matrixCanvas.style.zIndex = '10';
    this.body.appendChild(this.matrixCanvas);
    
    const canvas = this.matrixCanvas;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.body.clientWidth * dpr;
    canvas.height = this.body.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const w = this.body.clientWidth;
    const h = this.body.clientHeight;
    
    // Matrix characters - Japanese Katakana + Latin numerals
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890SOLARISPIXELNOVA";
    const charArr = chars.split("");
    
    const fontSize = 10;
    const columns = Math.floor(w / fontSize) + 1;
    const drops = Array(columns).fill(1);
    
    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(7, 8, 10, 0.05)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.fillStyle = `rgba(${CONFIG.procedural.colors.gold}, 0.75)`;
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(text, x, y);
        
        // Randomly reset drops to create rain variance
        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    this.matrixInterval = setInterval(drawMatrix, 33);
  }

  stopMatrix() {
    if (!this.matrixActive) return;
    
    clearInterval(this.matrixInterval);
    if (this.matrixCanvas) {
      this.matrixCanvas.remove();
    }
    
    this.matrixActive = false;
    this.input.disabled = false;
    this.input.placeholder = 'guest@pixelnova:~$';
    this.input.focus();
    
    this.writeLine("CPU Core Matrix Overclock aborted. System stabilized.", 'gold');
  }
}
