import { GameState } from '../game/GameState.js';

/**
 * DocumentPanel — manages the single-step document upload panel.
 * Shows one document at a time based on the current game step.
 */
export class DocumentPanel {
  constructor(gameState) {
    this.gameState = gameState;
    this.el = document.getElementById('document-panel');
    this.submitBtn = document.getElementById('submit-docs-btn');
    this.slot = document.getElementById('doc-slot-single');
    this.iconEl = document.getElementById('single-doc-icon');
    this.labelEl = document.getElementById('single-doc-label');
    this.titleEl = document.getElementById('doc-panel-title');
    this.input = document.getElementById('input-single-doc');
    this.uploadBtn = document.getElementById('single-upload-btn');
    this.preview = document.getElementById('single-doc-preview');
    this.statusEl = document.getElementById('single-doc-status');
    this.stepDots = document.querySelectorAll('.step-dot');

    this._setupListeners();
  }

  _setupListeners() {
    // File input change
    this.input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const docType = this.gameState.getCurrentDocType();
        this.gameState.setDocument(docType, file);
        this.slot.classList.add('uploaded');
        this.uploadBtn.textContent = 'Change';

        // Show preview
        this.preview.classList.remove('hidden');
        this.preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        this.preview.appendChild(img);

        // Show submit button
        this.submitBtn.classList.remove('hidden');
      }
    });

    // Submit button
    this.submitBtn.addEventListener('click', () => {
      if (this.gameState.currentDocumentUploaded()) {
        this.gameState.submitCurrentDocument();
      }
    });
  }

  /** Show the panel for the current step. */
  show() {
    const step = this.gameState.currentStep;
    const docType = this.gameState.getCurrentDocType();
    const label = this.gameState.getCurrentDocLabel();
    const icon = this.gameState.getCurrentDocIcon();

    // Update the slot content
    this.iconEl.textContent = icon;
    this.labelEl.textContent = label;
    this.titleEl.textContent = `Submit Your ${label}`;
    this.submitBtn.textContent = `Submit ${label}`;
    this.submitBtn.classList.add('hidden');

    // Reset the slot state
    this.slot.classList.remove('uploaded', 'rejected');
    this.preview.classList.add('hidden');
    this.preview.innerHTML = '';
    this.uploadBtn.textContent = 'Upload';
    this.statusEl.textContent = '';
    this.statusEl.className = 'doc-status';
    this.input.value = '';

    // Update step progress indicator
    this._updateStepProgress(step);

    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  /** Show the result on the current slot after verification. */
  showStepResult(result) {
    if (result.valid) {
      this.slot.classList.remove('rejected');
      this.slot.classList.add('uploaded');
      this.statusEl.textContent = '✓ APPROVED';
      this.statusEl.className = 'doc-status approved';
    } else {
      this.slot.classList.remove('uploaded');
      this.slot.classList.add('rejected');
      this.statusEl.textContent = '✗ ' + (result.issues[0] || 'REJECTED');
      this.statusEl.className = 'doc-status rejected';
    }
  }

  _updateStepProgress(activeStep) {
    this.stepDots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i < activeStep) {
        dot.classList.add('completed');
      } else if (i === activeStep) {
        dot.classList.add('active');
      }
    });
  }
}
