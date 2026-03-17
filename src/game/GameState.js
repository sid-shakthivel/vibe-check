/**
 * GameState — state machine for the KYC game flow.
 *
 * States:
 *   INTRO → DOCUMENT_SUBMISSION → REVIEWING → APPROVED / REJECTED
 *
 * On REJECTED, the player can retry (goes back to DOCUMENT_SUBMISSION).
 */
export class GameState {
  constructor() {
    this.state = 'INTRO';
    this.attempts = 1;
    this.documents = {
      passport: null,       // File object
      proof_of_address: null,
      selfie: null,
    };
    this.verificationResults = null; // set after review
    this._listeners = {};
  }

  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  }

  _emit(event, data) {
    if (this._listeners[event]) {
      for (const cb of this._listeners[event]) cb(data);
    }
  }

  transition(newState, data) {
    const prev = this.state;
    this.state = newState;
    this._emit('stateChange', { from: prev, to: newState, data });
  }

  startGame() {
    this.transition('DOCUMENT_SUBMISSION');
  }

  setDocument(type, file) {
    this.documents[type] = file;
    this._emit('documentUpdated', { type, file });
  }

  removeDocument(type) {
    this.documents[type] = null;
    this._emit('documentUpdated', { type, file: null });
  }

  allDocumentsUploaded() {
    return (
      this.documents.passport !== null &&
      this.documents.proof_of_address !== null &&
      this.documents.selfie !== null
    );
  }

  submitDocuments() {
    if (!this.allDocumentsUploaded()) return false;
    this.transition('REVIEWING');
    return true;
  }

  setVerificationResults(results) {
    this.verificationResults = results;
    const allApproved = results.every(r => r.valid);
    if (allApproved) {
      this.transition('APPROVED', results);
    } else {
      this.transition('REJECTED', results);
    }
  }

  retry() {
    this.attempts++;
    this.documents = { passport: null, proof_of_address: null, selfie: null };
    this.verificationResults = null;
    this.transition('DOCUMENT_SUBMISSION');
  }
}
