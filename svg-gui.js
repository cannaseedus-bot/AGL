// svg-gui.js
class SVGGenerator {
  constructor() {
    this.components = new Map();
    this.themes = {
      nexus: {
        primary: '#00f3ff',
        secondary: '#a855f7',
        background: '#0a0a0f',
        text: '#f8fafc',
        accent: '#10b981',
      },
      dark: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#1e293b',
        text: '#e2e8f0',
        accent: '#10b981',
      },
      light: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        background: '#f8fafc',
        text: '#1e293b',
        accent: '#059669',
      },
    };
  }

  createComponent(type, props = {}) {
    const generators = {
      button: this.generateButton,
      card: this.generateCard,
      input: this.generateInput,
      table: this.generateTable,
      chart: this.generateChart,
      nav: this.generateNav,
      modal: this.generateModal,
    };

    const generator = generators[type] || this.generateCard;
    return generator.call(this, props);
  }

  generateButton(props) {
    const {
      label = 'Button',
      color = 'primary',
      size = 'medium',
      rounded = true,
    } = props;

    const colors = this.themes.nexus;
    const buttonColor =
      color === 'primary'
        ? colors.primary
        : color === 'secondary'
          ? colors.secondary
          : color;

    const sizes = {
      small: { width: 80, height: 32, fontSize: 12 },
      medium: { width: 120, height: 40, fontSize: 14 },
      large: { width: 160, height: 48, fontSize: 16 },
    };

    const { width, height, fontSize } = sizes[size] || sizes.medium;
    const borderRadius = rounded ? 8 : 0;

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${buttonColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.lightenColor(buttonColor, 20)};stop-opacity:1" />
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${buttonColor}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect x="0" y="0"
        width="${width}"
        height="${height}"
        rx="${borderRadius}"
        ry="${borderRadius}"
        fill="url(#btnGrad)"
        filter="url(#shadow)"
        style="cursor: pointer;"/>

  <text x="${width / 2}" y="${height / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="${colors.text}"
        style="user-select: none;">
    ${label}
  </text>

  <!-- Hover effect -->
  <rect x="0" y="0"
        width="${width}"
        height="${height}"
        rx="${borderRadius}"
        ry="${borderRadius}"
        fill="white"
        fill-opacity="0"
        style="cursor: pointer; transition: fill-opacity 0.2s;"/>

  <style>
    rect:hover { fill-opacity: 0.1; }
  </style>
</svg>`;
  }

  generateCard(props) {
    const {
      title = 'Card Title',
      content = 'Card content goes here.',
      width = 300,
      height = 200,
      color = 'secondary',
    } = props;

    const colors = this.themes.nexus;
    const cardColor =
      color === 'primary'
        ? colors.primary
        : color === 'secondary'
          ? colors.secondary
          : color;

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(colors.background, 10)};stop-opacity:1" />
    </linearGradient>

    <filter id="cardShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="black" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Card background -->
  <rect x="0" y="0"
        width="${width}"
        height="${height}"
        rx="12"
        ry="12"
        fill="url(#cardGrad)"
        filter="url(#cardShadow)"
        stroke="${cardColor}"
        stroke-width="1"
        stroke-opacity="0.3"/>

  <!-- Header accent -->
  <rect x="0" y="0"
        width="${width}"
        height="4"
        fill="${cardColor}"/>

  <!-- Title -->
  <text x="20" y="40"
        font-family="Inter, system-ui, sans-serif"
        font-size="18"
        font-weight="700"
        fill="${colors.text}">
    ${title}
  </text>

  <!-- Content -->
  <foreignObject x="20" y="60" width="${width - 40}" height="${height - 80}">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="font-family: Inter, system-ui, sans-serif;
                font-size: 14px;
                color: ${colors.text};
                line-height: 1.5;
                opacity: 0.8;">
      ${content}
    </div>
  </foreignObject>
</svg>`;
  }

  generateDashboard(config) {
    const { title = 'Dashboard', components = [], theme = 'nexus' } = config;
    const colors = this.themes[theme] || this.themes.nexus;

    // Calculate layout
    const gridCols = 3;
    const spacing = 20;
    const cardWidth = 300;
    const cardHeight = 200;

    const totalWidth = gridCols * cardWidth + (gridCols + 1) * spacing;
    const rows = Math.ceil(components.length / gridCols);
    const totalHeight = rows * cardHeight + (rows + 1) * spacing + 80;

    let svg = `
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(colors.background, 5)};stop-opacity:1" />
    </linearGradient>

    <style>
      .dashboard-title {
        font-family: Inter, system-ui, sans-serif;
        font-size: 32px;
        font-weight: 800;
        fill: ${colors.text};
      }

      .card {
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        transition: transform 0.2s;
      }

      .card:hover {
        transform: translateY(-2px);
      }
    </style>
  </defs>

  <!-- Background -->
  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="url(#bgGrad)"/>

  <!-- Title -->
  <text x="${spacing}" y="60" class="dashboard-title">${title}</text>

  <!-- Components grid -->`;

    // Add each component
    components.forEach((component, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);

      const x = spacing + col * (cardWidth + spacing);
      const y = 100 + row * (cardHeight + spacing);

      const componentSVG = this.createComponent(component.type, {
        ...component,
        width: cardWidth,
        height: cardHeight,
      });

      // Extract just the inner content (remove outer SVG tag)
      const innerContent = componentSVG
        .replace(/<svg[^>]*>/, '')
        .replace(/<\/svg>/, '');

      svg += `
  <g transform="translate(${x}, ${y})" class="card">
    ${innerContent}
  </g>`;
    });

    svg += `
</svg>`;

    return svg;
  }

  // Utility functions
  lightenColor(color, percent) {
    // Lighten color for gradients
    // Implementation depends on color format
    return color;
  }

  darkenColor(color, percent) {
    // Darken color for gradients
    // Implementation depends on color format
    return color;
  }

  // Generate interactive SVG with JavaScript
  generateInteractiveComponent(type, props) {
    const baseSVG = this.createComponent(type, props);

    // Add interactivity
    return baseSVG.replace(
      '</svg>',
      `
  <script type="application/ecmascript">
    <![CDATA[
      // Interactive functionality
      document.addEventListener('DOMContentLoaded', function() {
        const svg = document.querySelector('svg');

        // Add click handlers
        const buttons = svg.querySelectorAll('[data-action]');
        buttons.forEach(btn => {
          btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleAction(action);
          });
        });

        function handleAction(action) {
          // Dispatch custom event
          const event = new CustomEvent('svg-action', {
            detail: { action }
          });
          svg.dispatchEvent(event);
        }
      });
    ]]>
  </script>
</svg>`
    );
  }
}

export { SVGGenerator };
