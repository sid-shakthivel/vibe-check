/**
 * DialogueBox — manages the RPG-style dialogue box at the bottom of the screen.
 */
export class DialogueBox {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.el = document.getElementById('dialogue-box');
    this.textEl = document.getElementById('dialogue-text');
    this.speakerEl = document.getElementById('dialogue-speaker');
    this.nextBtn = document.getElementById('dialogue-next');

    this._queue = [];
    this._typing = false;
    this._typeTimeout = null;
    this._resolve = null;

    this.nextBtn.addEventListener('click', () => this._onNext());
  }

  /**
   * Show a sequence of dialogue lines. Returns a promise that resolves
   * when the player has clicked through all lines.
   * @param {string[]} lines
   * @param {string} speaker
   */
  async showDialogue(lines, speaker = 'Bank Manager') {
    this.speakerEl.textContent = speaker;
    this.el.classList.remove('hidden');

    for (const line of lines) {
      await this._showLine(line);
    }

    this.el.classList.add('hidden');
  }

  _showLine(text) {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this.textEl.textContent = '';
      this._typeText(text, 0);
    });
  }

  _typeText(text, index) {
    if (index <= text.length) {
      this.textEl.textContent = text.substring(0, index);
      
      // Play typewriter sound every 2 characters for a rapid but not overwhelming effect
      if (this.audioManager && index % 2 === 0) {
        this.audioManager.playTypewriter();
      }

      this._typeTimeout = setTimeout(() => this._typeText(text, index + 1), 25);
      this._typing = true;
      this._fullText = text;
    } else {
      this._typing = false;
    }
  }

  _onNext() {
    if (this._typing) {
      // Skip to full text
      clearTimeout(this._typeTimeout);
      this.textEl.textContent = this._fullText;
      this._typing = false;
    } else if (this._resolve) {
      const r = this._resolve;
      this._resolve = null;
      r();
    }
  }

  hide() {
    this.el.classList.add('hidden');
    clearTimeout(this._typeTimeout);
  }
}
