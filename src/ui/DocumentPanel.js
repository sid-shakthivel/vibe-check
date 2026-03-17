/**
 * DocumentPanel — manages the document upload side panel.
 */
export class DocumentPanel {
  constructor(gameState) {
    this.gameState = gameState;
    this.el = document.getElementById('document-panel');
    this.submitBtn = document.getElementById('submit-docs-btn');
    this.slots = document.querySelectorAll('.doc-slot');

    this._setupListeners();
  }

  _setupListeners() {
    // File input change handlers
    this.slots.forEach(slot => {
      const docType = slot.dataset.doc;
      const input = slot.querySelector('.doc-input');
      const preview = slot.querySelector('.doc-preview');
      const uploadBtn = slot.querySelector('.doc-upload-btn');

      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.gameState.setDocument(docType, file);
          slot.classList.add('uploaded');
          uploadBtn.textContent = 'Change';

          // Show preview
          preview.classList.remove('hidden');
          preview.innerHTML = '';
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          preview.appendChild(img);

          this._updateSubmitButton();
        }
      });
    });

    // Submit button
    this.submitBtn.addEventListener('click', () => {
      if (this.gameState.allDocumentsUploaded()) {
        this.gameState.submitDocuments();
      }
    });
  }

  _updateSubmitButton() {
    if (this.gameState.allDocumentsUploaded()) {
      this.submitBtn.classList.remove('hidden');
    }
  }

  show() {
    this.el.classList.remove('hidden');
    this.submitBtn.classList.add('hidden');
    this._resetSlots();
  }

  hide() {
    this.el.classList.add('hidden');
  }

  _resetSlots() {
    this.slots.forEach(slot => {
      slot.classList.remove('uploaded', 'rejected');
      const preview = slot.querySelector('.doc-preview');
      const uploadBtn = slot.querySelector('.doc-upload-btn');
      const status = slot.querySelector('.doc-status');
      const input = slot.querySelector('.doc-input');
      preview.classList.add('hidden');
      preview.innerHTML = '';
      uploadBtn.textContent = 'Upload';
      status.textContent = '';
      status.className = 'doc-status';
      input.value = '';
    });
  }

  showResults(results) {
    for (const result of results) {
      const slot = document.querySelector(`.doc-slot[data-doc="${result.type}"]`);
      if (!slot) continue;
      const status = slot.querySelector('.doc-status');

      if (result.valid) {
        slot.classList.remove('rejected');
        slot.classList.add('uploaded');
        status.textContent = '✓ APPROVED';
        status.className = 'doc-status approved';
      } else {
        slot.classList.remove('uploaded');
        slot.classList.add('rejected');
        status.textContent = '✗ ' + (result.issues[0] || 'REJECTED');
        status.className = 'doc-status rejected';
      }
    }
  }
}
