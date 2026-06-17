import { SolarisCanvasManager } from './canvas-model.js';
import { SolarisTerminal } from './terminal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Force page to start at the top
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // 1. Initialize Interactive Terminal Console
  const terminal = new SolarisTerminal('terminal-body', 'terminal-input', 'terminal-history');

  // 2. Initialize Scroll-driven 3D Model Canvas
  const canvasManager = new SolarisCanvasManager('model-canvas', 'canvas-wrapper');

  // 3. Page Loading Screen Fade-out
  const loader = document.getElementById('loader-overlay');
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (loader) {
        loader.classList.add('fade-out');
      }
    }, 1200); // 1.2s aesthetic loading simulation
  });

  // 4. Scroll-Driven Animation Tracker
  const scrollContainer = document.getElementById('scroll-flow-container');
  const scrollPanels = document.querySelectorAll('.scroll-panel');

  const handleScroll = () => {
    if (!scrollContainer || !canvasManager) return;

    const rect = scrollContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Scrolled height inside container limits
    const totalHeight = rect.height - viewportHeight;
    const scrolled = -rect.top;
    
    // Map to percentage (0.0 to 1.0)
    let percent = scrolled / totalHeight;
    percent = Math.max(0, Math.min(1, percent));
    
    // Update Canvas Scroll Position
    canvasManager.updateScroll(percent);

    // Active State Management for scroll panels
    // 4 sections split across the total scroll distance (0.0 to 1.0)
    scrollPanels.forEach((panel, index) => {
      const start = index * 0.25;
      const end = (index + 1) * 0.25;
      
      if (percent >= start && percent < end) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  };

  // Listen to scroll events (passive listener for mobile scroll optimization)
  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial frame trigger
  handleScroll();

  // 5. Team Section Telemetry Gauge Animations (Intersection Observer)
  const teamSection = document.getElementById('team-section');
  const gaugeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.gauge-fill');
        fills.forEach((fill) => {
          const widthVal = fill.getAttribute('data-fill');
          fill.style.width = widthVal || '0%';
        });
        // Disconnect after animating once for efficiency
        gaugeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  if (teamSection) {
    gaugeObserver.observe(teamSection);
  }

  // 6. Smooth Scroll Button for Call-To-Action (System Online)
  const startBtn = document.getElementById('start-btn');
  if (startBtn && scrollContainer) {
    startBtn.addEventListener('click', () => {
      scrollContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
