/**
 * DocumentVerifier — verifies uploaded KYC documents.
 *
 * Uses heuristic checks + randomized scenarios for game logic.
 */

export class DocumentVerifier {
  constructor() {
    // No external dependencies needed for pure game logic
  }

  /**
   * Check if Ollama is running locally.
   * Deprecated: Always returns false as we're using game logic exclusively.
   */
  async checkOllamaAvailability() {
    return false;
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

    // Simulate processing delay for game feel
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return this._verifyDocumentGameLogic(type, file);
  }

  /**
   * Verify all three documents (kept for backwards compatibility).
   * @param {{ passport: File, proof_of_address: File, selfie: File }} docs
   * @returns {Promise<Array<{ type: string, valid: boolean, issues: string[] }>>}
   */
  async verifyAll(docs) {
    return this._verifyWithGameLogic(docs);
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
