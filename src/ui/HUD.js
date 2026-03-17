/**
 * HUD — manages the heads-up display and result overlays.
 */
export class HUD {
  constructor() {
    this.attemptCountEl = document.getElementById('attempt-count');
    this.introOverlay = document.getElementById('intro-overlay');
    this.startBtn = document.getElementById('start-btn');
    this.reviewingOverlay = document.getElementById('reviewing-overlay');
    this.resultOverlay = document.getElementById('result-overlay');
    this.resultIcon = document.getElementById('result-icon');
    this.resultTitle = document.getElementById('result-title');
    this.resultMessage = document.getElementById('result-message');
    this.resultBtn = document.getElementById('result-btn');

    this._onStart = null;
    this._onResultAction = null;

    this.startBtn.addEventListener('click', () => {
      if (this._onStart) this._onStart();
    });

    this.resultBtn.addEventListener('click', () => {
      if (this._onResultAction) this._onResultAction();
    });
  }

  onStart(cb) {
    this._onStart = cb;
  }

  onResultAction(cb) {
    this._onResultAction = cb;
  }

  hideIntro() {
    this.introOverlay.classList.add('hidden');
  }

  setAttempts(n) {
    this.attemptCountEl.textContent = n;
  }

  showReviewing() {
    this.reviewingOverlay.classList.remove('hidden');
  }

  hideReviewing() {
    this.reviewingOverlay.classList.add('hidden');
  }

  showApproved() {
    this.resultOverlay.classList.remove('hidden');
    this.resultIcon.textContent = '🎉';
    this.resultTitle.textContent = 'KYC APPROVED';
    this.resultTitle.className = 'approved';
    this.resultMessage.textContent = 'Congratulations! Your identity has been verified. Welcome to First National Bank.';
    this.resultBtn.textContent = 'Play Again';
    this.resultBtn.className = 'win';
  }

  showRejected(issues) {
    this.resultOverlay.classList.remove('hidden');
    this.resultIcon.textContent = '❌';
    this.resultTitle.textContent = 'KYC REJECTED';
    this.resultTitle.className = 'rejected';

    let msg = 'Your documents could not be verified. Issues found:\n\n';
    for (const issue of issues) {
      msg += `• ${issue}\n`;
    }
    msg += '\nPlease try again with corrected documents.';
    this.resultMessage.textContent = msg;
    this.resultMessage.style.whiteSpace = 'pre-line';
    this.resultBtn.textContent = 'Try Again';
    this.resultBtn.className = 'retry';
  }

  hideResult() {
    this.resultOverlay.classList.add('hidden');
  }
}
