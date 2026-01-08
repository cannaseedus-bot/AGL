import { tokenizer } from './agl-tokenizer.js';

class AGLAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
  }

  async generateFromDescription(description) {
    const prompt = `
You are an AGL (Atomic Glyph Language) AI assistant. Map the following description to an AGL glyph chain.

Available glyphs:
${Object.entries(tokenizer.glyphs)
  .map(
    ([cat, glyphs]) =>
      `${cat.toUpperCase()}:\n${Object.entries(glyphs)
        .map(([glyph, def]) => `  ${glyph}: ${def.meaning}`)
        .join('\n')}`
  )
  .join('\n\n')}

KUHUL Atomic CSS classes are available for styling.

Description: "${description}"

Output format:
GLYPH_CHAIN: [glyph sequence]
KUHUL_CLASSES: space-separated atomic classes
EXPLANATION: brief explanation of the mapping
`;

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    const glyphMatch = content.match(/GLYPH_CHAIN:\s*(.+)/);
    const kuhulMatch = content.match(/KUHUL_CLASSES:\s*(.+)/);
    const explanationMatch = content.match(/EXPLANATION:\s*(.+)/);

    return {
      glyph_chain: glyphMatch ? glyphMatch[1].trim() : '',
      kuhul_classes: kuhulMatch ? kuhulMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : '',
      raw: content
    };
  }

  async enhanceGlyphChain(glyphChain, context = '') {
    const prompt = `
Optimize this AGL glyph chain for better performance or clarity.

Current chain: ${glyphChain}
Context: ${context}

Suggest improvements or alternative glyph patterns that achieve the same result more efficiently.
`;

    return {
      prompt
    };
  }

  async learnFromExample(input, output) {
    const example = {
      input,
      output,
      timestamp: new Date().toISOString()
    };

    console.log('📚 Learned from example:', example);
    return example;
  }
}

class RuleBasedAGL {
  generateFromDescription(description) {
    return tokenizer.naturalLanguageToGlyphs(description);
  }
}

export { AGLAI, RuleBasedAGL };
