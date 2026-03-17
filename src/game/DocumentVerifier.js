/**
 * DocumentVerifier — verifies uploaded KYC documents.
 *
 * Supports two strategies:
 *   1. Ollama (local vision model) — sends images to local Ollama API
 *   2. Game-logic fallback — heuristic checks + randomized scenarios
 *
 * The verifier first tries Ollama; if unavailable, falls back to game logic.
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

export class DocumentVerifier {
  constructor() {
    this._ollamaAvailable = null; // null = not checked, true/false
    this._ollamaModel = 'llava'; // default vision model
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
      if (!res.ok) {
        this._ollamaAvailable = false;
        return false;
      }
      const data = await res.json();
      // Check if a vision model is available
      const models = data.models || [];
      const visionModels = models.filter(m =>
        m.name.includes('llava') ||
        m.name.includes('llama3.2-vision') ||
        m.name.includes('bakllava') ||
        m.name.includes('moondream')
      );
      if (visionModels.length > 0) {
        this._ollamaModel = visionModels[0].name;
        this._ollamaAvailable = true;
        return true;
      }
      this._ollamaAvailable = false;
      return false;
    } catch {
      this._ollamaAvailable = false;
      return false;
    }
  }

  /**
   * Verify all three documents.
   * @param {{ passport: File, proof_of_address: File, selfie: File }} docs
   * @returns {Promise<Array<{ type: string, valid: boolean, issues: string[] }>>}
   */
  async verifyAll(docs) {
    if (this._ollamaAvailable === null) {
      await this.checkOllamaAvailability();
    }

    if (this._ollamaAvailable) {
      return this._verifyWithOllama(docs);
    } else {
      return this._verifyWithGameLogic(docs);
    }
  }

  // ─── Ollama Strategy ─────────────────────────────────────────────

  async _verifyWithOllama(docs) {
    const results = [];

    for (const [type, file] of Object.entries(docs)) {
      if (!file) {
        results.push({ type, valid: false, issues: ['No document uploaded'] });
        continue;
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
        const analysis = this._parseOllamaResponse(data.response, type);
        results.push(analysis);
      } catch (err) {
        console.warn(`Ollama verification failed for ${type}, falling back to game logic`, err);
        results.push(this._verifyDocumentGameLogic(type, file));
      }
    }

    return results;
  }

  _getVerificationPrompt(type) {
    const prompts = {
      passport: `You are a bank KYC verification officer. Analyze this image and determine if it is a valid passport document. 
Check for:
1. Does it look like a passport (has photo, personal info, document number)?
2. Does it appear to be a real document (not obviously fake/drawn)?
3. Is the image clear and readable?

Respond in this EXACT JSON format only, no other text:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific problems.`,

      proof_of_address: `You are a bank KYC verification officer. Analyze this image and determine if it is a valid proof of address document (utility bill, bank statement, government letter, etc).
Check for:
1. Does it look like an official document with an address?
2. Does it appear to contain a name and address?
3. Is the image clear and readable?

Respond in this EXACT JSON format only, no other text:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific problems.`,

      selfie: `You are a bank KYC verification officer. Analyze this image and determine if it is a valid selfie for identity verification.
Check for:
1. Does it show a clear face of a person?
2. Is the face clearly visible and not obscured?
3. Is the image quality sufficient for identification?

Respond in this EXACT JSON format only, no other text:
{"valid": true/false, "issues": ["issue1", "issue2"]}

If valid, issues should be an empty array. If not valid, list specific problems.`,
    };
    return prompts[type] || prompts.passport;
  }

  _parseOllamaResponse(response, type) {
    try {
      // Try to extract JSON from the response
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
    const isValid = lower.includes('valid') && !lower.includes('not valid') && !lower.includes('invalid');
    return {
      type,
      valid: isValid,
      issues: isValid ? [] : ['Document could not be verified as authentic'],
    };
  }

  async _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── Game Logic Strategy ──────────────────────────────────────────

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
