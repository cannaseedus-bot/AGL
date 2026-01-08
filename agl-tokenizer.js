import fs from 'fs/promises';

class AGLTokenizer {
  constructor() {
    this.tokenizer = null;
    this.kuhulMap = null;
    this.appTemplates = null;
    this.glyphs = null;
  }

  async load(path = './apps.tokenizer.json') {
    const data = await fs.readFile(path, 'utf-8');
    this.tokenizer = JSON.parse(data);
    this.kuhulMap = this.tokenizer.kuhul_atomic_css;
    this.appTemplates = this.tokenizer.apps;
    this.glyphs = this.tokenizer.glyph_alphabet;

    const glyphCount = Object.keys(this.glyphs).reduce(
      (sum, cat) => sum + Object.keys(this.glyphs[cat]).length,
      0
    );
    const kuhulCount = Object.keys(this.kuhulMap).reduce(
      (sum, cat) => sum + Object.keys(this.kuhulMap[cat]).length,
      0
    );
    console.log(`✅ AGL Tokenizer loaded: ${glyphCount} glyphs, ${kuhulCount} KUHUL classes`);
    return this;
  }

  async naturalLanguageToGlyphs(description) {
    const patterns = {
      'calculator|calculate|math': 'calculator',
      'weather|temperature|forecast': 'weather_dashboard',
      'todo|task|list': 'todo_app',
      'table|data|spreadsheet': 'data_table',
      'image|photo|gallery': 'image_gallery',
      'chat|message|conversation': 'chat_app',
      'admin|dashboard|panel': 'admin_panel'
    };

    for (const [pattern, appKey] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(description)) {
        return {
          glyph_chain: this.appTemplates[appKey].glyph_chain,
          kuhul_classes: this.appTemplates[appKey].kuhul_classes,
          template: appKey
        };
      }
    }

    return {
      glyph_chain: this.tokenizer.templates.full_app.structure,
      kuhul_classes: this.tokenizer.templates.full_app.kuhul_base,
      template: 'full_app'
    };
  }

  compileGlyphChain(glyphChain) {
    const tokens = glyphChain.split(' ');
    let jsCode = '';

    for (const token of tokens) {
      if (token.startsWith('[') && token.endsWith(']')) {
        const glyph = token.slice(1, -1);
        const control = this.glyphs.control[`[${glyph}]`];
        if (control) {
          jsCode += `${control.js};\n`;
        }
      } else if (token.includes('(')) {
        const match = token.match(/^([^\(]+)\(([^\)]*)\)$/);
        if (match) {
          const [, glyph, params] = match;
          for (const category of Object.values(this.glyphs)) {
            if (category[glyph]) {
              jsCode += `${category[glyph].js}(${params});\n`;
              break;
            }
          }
        }
      } else {
        for (const category of Object.values(this.glyphs)) {
          if (category[token]) {
            jsCode += `${category[token].js}();\n`;
            break;
          }
        }
      }
    }

    return jsCode;
  }

  generateKuhulCSS(classes) {
    return classes
      .split(' ')
      .map((cls) => {
        for (const category of Object.values(this.kuhulMap)) {
          if (category[cls]) {
            return `.${cls} { ${category[cls]} }`;
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  async createApp(description) {
    const { glyph_chain, kuhul_classes } = await this.naturalLanguageToGlyphs(description);
    const jsCode = this.compileGlyphChain(glyph_chain);
    const cssCode = this.generateKuhulCSS(kuhul_classes);

    const glyphRuntime = Object.entries(this.glyphs)
      .flatMap(([, glyphs]) =>
        Object.entries(glyphs).map(
          ([, def]) => `const ${def.meaning} = ${def.js};`
        )
      )
      .join('\n    ');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AGL App: ${description.substring(0, 50)}</title>
  <style>
    ${cssCode}

    /* Base styles */
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      background: #0a192f;
      color: #e6f1ff;
    }

    .agl-app {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div class="agl-app ${kuhul_classes}">
    <!-- App will be rendered here -->
  </div>

  <script>
    // AGL Runtime
    ${glyphRuntime}

    // Generated App Code
    (async () => {
      ${jsCode}
    })();
  </script>
</body>
</html>
    `;
  }

  async saveApp(name, description, glyphChain, kuhulClasses) {
    const originalSize = glyphChain.length + kuhulClasses.length;
    const compressedSize = glyphChain.split(' ').length * 2 + kuhulClasses.split(' ').length * 2;

    this.tokenizer.apps[name] = {
      glyph_chain: glyphChain,
      kuhul_classes: kuhulClasses,
      description: description,
      tokens: glyphChain.split(' ').length + kuhulClasses.split(' ').length,
      original_size: originalSize,
      compressed_size: compressedSize,
      compression_ratio: 1 - compressedSize / originalSize
    };

    await fs.writeFile('./apps.tokenizer.json', JSON.stringify(this.tokenizer, null, 2));
    console.log(`✅ App "${name}" saved to tokenizer`);
  }
}

export const tokenizer = new AGLTokenizer();
