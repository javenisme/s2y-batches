/* ============================================
   Navigation Bar Component
   ============================================ */

const Navbar = {
  currentPage: '',
  
  items: [
    { 
      id: 'batchcodes', 
      label: 'Batch Codes', 
      href: 'batchCodes.html',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>'
    },
    { 
      id: 'map', 
      label: 'Risk Map', 
      href: 'ZipcodeRiskMap.html',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    },
    { 
      id: 'api', 
      label: 'API Docs', 
      href: 'api-docs.html',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M8 15l4 3 4-3"/></svg>'
    }
  ],
  
  init(options = {}) {
    this.currentPage = options.currentPage || '';
    this.container = options.container || document.body;
    this.theme = options.theme || '';
    
    this.render();
    this.bindEvents();
  },
  
  render() {
    const navbar = document.createElement('nav');
    navbar.className = `navbar ${this.theme}`;
    navbar.innerHTML = `
      <a href="index.html" class="navbar-brand">
        <span class="navbar-logo">S2Y</span>
        <span class="sm-hidden">S2Y Batches</span>
      </a>
      
      <button class="navbar-toggle" aria-label="Toggle menu">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      
      <div class="navbar-menu">
        ${this.items.map(item => `
          <a href="${item.href}" 
             class="navbar-item ${this.currentPage === item.id ? 'active' : ''}"
             data-page="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
      
      <div class="navbar-actions">
        <a href="https://github.com/javenisme/s2y-batches" 
           class="navbar-github" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>
    `;
    
    this.container.insertBefore(navbar, this.container.firstChild);
  },
  
  bindEvents() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('open');
        }
      });
      
      // Close menu on route change
      window.addEventListener('hashchange', () => {
        menu.classList.remove('open');
      });
    }
  }
};

// Export for use in other files
window.Navbar = Navbar;
