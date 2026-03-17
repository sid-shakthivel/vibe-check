/**
 * DocumentVerifier — verifies uploaded KYC documents.
 *
 * Uses local Ollama API with Qwen2.5-VL for vision analysis.
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

export class DocumentVerifier {
  constructor() {
    this._ollamaModel = 'qwen2.5vl:7b';
  }

  /**
   * Check if Ollama is running locally.
   */
  async checkOllamaAvailability() {
    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verify a single document.
   * @param {string} type - 'passport', 'proof_of_address', or 'selfie'
   * @param {File} file
   * @returns {Promise<{ type: string, valid: boolean, issues: string[] }>}
   */
  async verifySingle(type, file) {
    if (!file) {
      return { type, valid: false, issues: ['No document uploaded'] };
    }

    try {
      const base64 = await this._fileToBase64(file);
      const prompt = this._getVerificationPrompt(type);

      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this._ollamaModel,
          prompt,
          images: [base64],
          stream: false,
          options: { temperature: 0.1 },
        }),
      });

      if (!response.ok) throw new Error('Ollama request failed');
      const data = await response.json();
      return this._parseOllamaResponse(data.response, type);
    } catch (err) {
      console.warn(`Ollama verification failed for ${type}, falling back to game logic`, err);
      // Fallback if Ollama is down (for game flow)
      return this._verifyDocumentGameLogic(type, file);
    }
  }

  /**
   * Verify all three documents (kept for backwards compatibility).
   * @param {{ passport: File, proof_of_address: File, selfie: File }} docs
   * @returns {Promise<Array<{ type: string, valid: boolean, issues: string[] }>>}
   */
  async verifyAll(docs) {
    const results = [];
    for (const [type, file] of Object.entries(docs)) {
      results.push(await this.verifySingle(type, file));
    }
    return results;
  }

  _getVerificationPrompt(type) {
    const prompts = {
      passport: `Analyze this image and determine if it resembles a passport document.
Check for:
1. Does it look like a passport data page (contains a photo, personal details area)?
2. Do not check specific IDs, just the general layout.

Respond in this EXACT JSON format only, no other text or explanation:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific layout problems quickly.`,

      proof_of_address: `Analyze this image and determine if it resembles a proof of address document (like a utility bill, bank statement, or official letter).
Check for:
1. Does it look like an official document containing text, an address block, and perhaps a logo/header?

Respond in this EXACT JSON format only, no other text or explanation:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific layout problems quickly.`,

      selfie: `Analyze this image and determine if it is a valid human selfie for identity verification.
Check for:
1. Does it clearly show a human face?

Respond in this EXACT JSON format only, no other text or explanation:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific problems quickly.`,
    };
    return prompts[type] || prompts.passport;
  }

  _parseOllamaResponse(response, type) {
    console.log(`Ollama Response for ${type}:`, response);

    try {
      // Try to extract JSON from the response (in case Qwen adds markdown blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type,
          valid: Boolean(parsed.valid),
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        };
      }
    } catch {
      // If parsing fails, try keyword detection
    }

    // Fallback: check for positive/negative keywords
    const lower = response.toLowerCase();
    const isValid = lower.includes('"valid": true') || (lower.includes('valid') && !lower.includes('not valid') && !lower.includes('invalid'));
    return {
      type,
      valid: isValid,
      issues: isValid ? [] : ['Document layout could not be verified'],
    };
  }

  async _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg');
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = reject;
      
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── Game Logic Strategy (Fallback) ───────────────────────────────

  async _verifyWithGameLogic(docs) {
    // Simulate processing delay for game feel
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    const results = [];
    for (const [type, file] of Object.entries(docs)) {
      results.push(this._verifyDocumentGameLogic(type, file));
    }
    return results;
  }

  _verifyDocumentGameLogic(type, file) {
    if (!file) {
      return { type, valid: false, issues: ['No document uploaded'] };
    }

    const issues = [];

    // Basic file checks
    if (!file.type.startsWith('image/')) {
      issues.push('Document must be an image file');
    }

    // File size checks (too small = likely not a real doc, too large = suspicious)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < 0.01) {
      issues.push('Document image is too small — may not be readable');
    }
    if (sizeMB > 15) {
      issues.push('Document image file is unusually large');
    }

    // Type-specific heuristic checks
    switch (type) {
      case 'passport':
        if (file.name && !/passport/i.test(file.name) && Math.random() < 0.3) {
          issues.push('Document does not appear to be a passport');
        }
        if (Math.random() < 0.15) {
          issues.push('Passport appears to be expired');
        }
        break;

      case 'proof_of_address':
        if (Math.random() < 0.2) {
          issues.push('Address on document does not match records');
        }
        if (Math.random() < 0.1) {
          issues.push('Document is older than 3 months');
        }
        break;

      case 'selfie':
        if (Math.random() < 0.15) {
          issues.push('Face in selfie does not clearly match passport photo');
        }
        if (Math.random() < 0.1) {
          issues.push('Selfie quality is too low for verification');
        }
        break;
    }

    return {
      type,
      valid: issues.length === 0,
      issues,
    };
  }
}
