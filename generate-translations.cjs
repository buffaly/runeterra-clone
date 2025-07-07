#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load .env file if exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Define target languages for translation
const LANGUAGES = {
  'th': 'Thai',
  'ja': 'Japanese', 
  'ko': 'Korean',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
  'fr': 'French',
  'de': 'German',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'ru': 'Russian'
};

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    languages: Object.keys(LANGUAGES), // default: all languages
    delay: 1000 // default delay: 1 second
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--languages' && i + 1 < args.length) {
      const selectedLangs = args[i + 1].split(',').map(lang => lang.trim());
      options.languages = selectedLangs.filter(lang => LANGUAGES[lang]);
      i++; // skip next argument
    } else if (arg === '--delay' && i + 1 < args.length) {
      options.delay = parseInt(args[i + 1]) || 1000;
      i++; // skip next argument
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
🌐 Translation Generator Script

Usage:
  node generate-translations.cjs [options]

Options:
  --languages <codes>    Select languages to translate (comma-separated)
                        e.g: --languages th,ja,ko
  --delay <ms>          Set delay between API calls (milliseconds)
                        e.g: --delay 2000
  --help, -h            Show help message

Examples:
  node generate-translations.cjs
  node generate-translations.cjs --languages th,ja
  node generate-translations.cjs --languages th --delay 2000

Supported languages: ${Object.keys(LANGUAGES).join(', ')}
      `);
      process.exit(0);
    }
  }

  return options;
}

class TranslationGenerator {
  constructor(options = {}) {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    if (!this.apiKey) {
      console.error('❌ Please set ANTHROPIC_API_KEY environment variable');
      console.error('   Create .env file or set export ANTHROPIC_API_KEY="your-key"');
      process.exit(1);
    }
    
    this.outputDir = path.join(__dirname, 'src', 'local');
    this.sourceFile = path.join(__dirname, 'src', 'const', 'panelData.tsx');
    this.selectedLanguages = options.languages || Object.keys(LANGUAGES);
    this.delay = options.delay || 1000;
    this.anthropic = null; // Will be created in initializeAnthropic()
    
    console.log(`🎯 Selected languages: ${this.selectedLanguages.map(code => LANGUAGES[code]).join(', ')}`);
    console.log(`⏱️  Delay between API calls: ${this.delay}ms`);
  }

  async init() {
    // Create output folder if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log('📁 Created src/local/ folder');
    }
  }

  async readSourceFile() {
    try {
      const content = fs.readFileSync(this.sourceFile, 'utf8');
      // Extract only the data object from export
      const match = content.match(/export const PANEL_DATA = ({[\s\S]*?});/);
      if (!match) {
        throw new Error('PANEL_DATA object not found in file');
      }
      return match[1];
    } catch (error) {
      console.error('❌ Cannot read source file:', error.message);
      process.exit(1);
    }
  }

  async initializeAnthropic() {
    try {
      // Use dynamic import for @anthropic-ai/sdk
      const { Anthropic } = await import('@anthropic-ai/sdk').catch(() => {
        console.error('❌ Please install @anthropic-ai/sdk: npm install @anthropic-ai/sdk');
        process.exit(1);
      });
      
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
    } catch (error) {
      console.error('❌ Error initializing Anthropic SDK:', error.message);
      throw error;
    }
  }

  async callClaudeAPI(prompt) {
    try {
      console.log('🤖 Calling Claude API...');
      
      if (!this.anthropic) {
        await this.initializeAnthropic();
      }
      
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.3, // Reduce randomness for consistent results
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      if (!message.content || message.content.length === 0) {
        throw new Error('No response received from Claude API');
      }

      // Check content type
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error(`Unexpected content type: ${content.type}`);
      }

      return content.text;
    } catch (error) {
      // Handle errors in detail
      if (error.name === 'APIError') {
        console.error(`❌ API Error (${error.status}): ${error.message}`);
      } else if (error.name === 'RateLimitError') {
        console.error('❌ Rate limit exceeded. Please wait and try again');
      } else if (error.name === 'AuthenticationError') {
        console.error('❌ Authentication failed. Check your API key');
      } else {
        console.error('❌ Error calling API:', error.message);
      }
      throw error;
    }
  }

  createTranslationPrompt(dataObject, targetLanguage) {
    return `Translate this JavaScript object data to ${targetLanguage}:

${dataObject}

Translation rules:
1. Do not change any URLs or image paths
2. For proper nouns (champion names, place names), use phonetic transliteration in the target language instead of semantic translation
3. Only translate descriptive text, labels, titles, subtitles, and descriptions
4. Preserve the original object and array structure completely
5. Return only the usable JavaScript object (no markdown or additional explanations)

Example: "Noxus" in Thai would be "น็อกซัส" (phonetic) not semantic translation
Example: "Cassiopeia" in Thai would be "แคสสิโอเปีย" (phonetic)`;
  }

  async translateToLanguage(dataObject, langCode, langName) {
    console.log(`\n🌐 Translating to ${langName}...`);
    
    try {
      const prompt = this.createTranslationPrompt(dataObject, langName);
      const translatedContent = await this.callClaudeAPI(prompt);
      
      // Remove markdown code blocks if present
      const cleanContent = translatedContent
        .replace(/```javascript\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Create file content for export
      const fileContent = `export const PANEL_DATA_${langCode.toUpperCase().replace('-', '_')} = ${cleanContent};\n`;
      
      // Save file
      const fileName = `panelData.${langCode}.ts`;
      const filePath = path.join(this.outputDir, fileName);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      
      console.log(`✅ Successfully saved ${fileName}`);
      
      return {
        langCode,
        langName,
        fileName,
        constantName: `PANEL_DATA_${langCode.toUpperCase().replace('-', '_')}`
      };
    } catch (error) {
      console.error(`❌ Error translating to ${langName}:`, error.message);
      return null;
    }
  }

  async generateIndexFile(translationResults) {
    console.log('\n📝 Generating index.ts file...');
    
    const validResults = translationResults.filter(result => result !== null);
    
    // Create import statements
    const imports = validResults
      .map(result => `import { ${result.constantName} } from './${result.fileName.replace('.ts', '')}';`)
      .join('\n');
    
    // Create export object
    const exports = validResults
      .map(result => `  '${result.langCode}': ${result.constantName}`)
      .join(',\n');
    
    const indexContent = `${imports}
import { PANEL_DATA as PANEL_DATA_EN } from '../const/panelData';

export const TRANSLATIONS = {
  'en': PANEL_DATA_EN,
${exports}
};

export type SupportedLanguage = ${validResults.map(r => `'${r.langCode}'`).join(' | ')} | 'en';

export function getTranslation(language: SupportedLanguage) {
  return TRANSLATIONS[language];
}
`;

    const indexPath = path.join(this.outputDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    
    console.log('✅ Successfully created index.ts file');
    console.log(`📊 Total languages: ${validResults.length} languages`);
  }

  async generate() {
    console.log('🚀 Starting translation generation...\n');
    
    await this.init();
    const sourceData = await this.readSourceFile();
    
    const translationResults = [];
    
    // Translate one language at a time based on selection
    for (const langCode of this.selectedLanguages) {
      const langName = LANGUAGES[langCode];
      if (!langName) {
        console.warn(`⚠️  Unsupported language: ${langCode}`);
        continue;
      }
      
      const result = await this.translateToLanguage(sourceData, langCode, langName);
      translationResults.push(result);
      
      // Apply delay as configured
      if (this.selectedLanguages.indexOf(langCode) < this.selectedLanguages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    // Generate index file
    await this.generateIndexFile(translationResults);
    
    const successCount = translationResults.filter(r => r !== null).length;
    console.log('\n🎉 Translation generation completed!');
    console.log(`📁 All files saved in: ${this.outputDir}`);
    console.log(`✅ Successfully translated: ${successCount}/${this.selectedLanguages.length} languages`);
  }
}

// Execute when run directly
if (require.main === module) {
  const options = parseArguments();
  
  if (options.languages.length === 0) {
    console.error('❌ No languages selected or selected languages not supported');
    console.error(`   Supported languages: ${Object.keys(LANGUAGES).join(', ')}`);
    process.exit(1);
  }
  
  const generator = new TranslationGenerator(options);
  generator.generate().catch(error => {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  });
}

module.exports = TranslationGenerator; 