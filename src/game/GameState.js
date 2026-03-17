/**
 * GameState — state machine for the KYC game flow.
 *
 * States:
 *   INTRO → DOCUMENT_SUBMISSION → REVIEWING_STEP → STEP_APPROVED → (next step or APPROVED)
 *                                                → STEP_REJECTED → DOCUMENT_SUBMISSION (same step)
 *
 * Documents are submitted one at a time in order:
 *   Step 0: Passport
 *   Step 1: Proof of Address
 *   Step 2: Selfie
 */

const DOC_STEPS = ['passport', 'proof_of_address', 'selfie'];

const DOC_LABELS = {
  passport: 'Passport',
  proof_of_address: 'Proof of Address',
  selfie: 'Selfie',
};

const DOC_ICONS = {
  passport: '🛂',
  proof_of_address: '🏠',
  selfie: '🤳',
};

export class GameState {
  constructor() {
    this.state = 'INTRO';
    this.attempts = 1;
    this.currentStep = 0; // 0, 1, or 2
    this.documents = {
      passport: null,
      proof_of_address: null,
      selfie: null,
    };
    this.stepResults = [null, null, null]; // per-step verification result
    this.verificationResults = null;
    this._listeners = {};
  }

  static get DOC_STEPS() { return DOC_STEPS; }
  static get DOC_LABELS() { return DOC_LABELS; }
  static get DOC_ICONS() { return DOC_ICONS; }

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
    this.currentStep = 0;
    this.transition('DOCUMENT_SUBMISSION');
  }

  getCurrentDocType() {
    return DOC_STEPS[this.currentStep];
  }

  getCurrentDocLabel() {
    return DOC_LABELS[this.getCurrentDocType()];
  }

  getCurrentDocIcon() {
    return DOC_ICONS[this.getCurrentDocType()];
  }

  setDocument(type, file) {
    this.documents[type] = file;
    this._emit('documentUpdated', { type, file });
  }

  removeDocument(type) {
    this.documents[type] = null;
    this._emit('documentUpdated', { type, file: null });
  }

  currentDocumentUploaded() {
    return this.documents[this.getCurrentDocType()] !== null;
  }

  /** Submit only the current step's document for review. */
  submitCurrentDocument() {
    if (!this.currentDocumentUploaded()) return false;
    this.transition('REVIEWING_STEP');
    return true;
  }

  /** Called after verification of the current step's document. */
  setStepResult(result) {
    this.stepResults[this.currentStep] = result;

    if (result.valid) {
      this.transition('STEP_APPROVED', result);
    } else {
      this.transition('STEP_REJECTED', result);
    }
  }

  /** Move to the next document step, or APPROVED if all done. */
  advanceStep() {
    if (this.currentStep < DOC_STEPS.length - 1) {
      this.currentStep++;
      this.transition('DOCUMENT_SUBMISSION');
    } else {
      // All 3 approved — collate results
      this.verificationResults = this.stepResults;
      this.transition('APPROVED', this.stepResults);
    }
  }

  /** Retry the current step (clear that doc, re-show submission). */
  retryCurrentStep() {
    this.attempts++;
    const docType = this.getCurrentDocType();
    this.documents[docType] = null;
    this.stepResults[this.currentStep] = null;
    this.transition('DOCUMENT_SUBMISSION');
  }

  /** Full reset for "Play Again". */
  reset() {
    this.state = 'INTRO';
    this.attempts = 1;
    this.currentStep = 0;
    this.documents = { passport: null, proof_of_address: null, selfie: null };
    this.stepResults = [null, null, null];
    this.verificationResults = null;
  }
}
