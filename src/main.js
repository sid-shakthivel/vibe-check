import { SceneManager } from './scene/SceneManager.js';
import { BankEnvironment } from './scene/BankEnvironment.js';
import { BankManager } from './scene/BankManager.js';
import { GameState } from './game/GameState.js';
import { DocumentVerifier } from './game/DocumentVerifier.js';
import { DialogueBox } from './ui/DialogueBox.js';
import { DocumentPanel } from './ui/DocumentPanel.js';
import { HUD } from './ui/HUD.js';
import './styles/main.css';

// ─── Initialize ────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const sceneManager = new SceneManager(canvas);
const bankEnv = new BankEnvironment(sceneManager.scene);
const bankManager = new BankManager(sceneManager.scene);
const gameState = new GameState();
const verifier = new DocumentVerifier();
const dialogueBox = new DialogueBox();
const docPanel = new DocumentPanel(gameState);
const hud = new HUD();

// Register animation callback for the bank manager
sceneManager.onAnimate((delta, elapsed) => {
  bankManager.update(delta, elapsed);
});

// Start the render loop immediately so the 3D scene is always visible
sceneManager.start();

// Pre-check Ollama availability
verifier.checkOllamaAvailability().then((available) => {
  console.log(`Ollama vision model: ${available ? 'AVAILABLE (' + verifier._ollamaModel + ')' : 'not found, using game logic'}`);
});

// ─── Game Flow ─────────────────────────────────────────────────────

hud.onStart(async () => {
  hud.hideIntro();
  bankManager.setAnimation('welcome');

  await dialogueBox.showDialogue([
    'Good morning. Welcome to First National Bank.',
    'I\'m the branch manager. I\'ll be handling your KYC verification today.',
    'To open your account, I\'ll need three documents from you:',
    '1. Your Passport — for identity verification.',
    '2. A Proof of Address — a utility bill or bank statement.',
    '3. A clear Selfie — for facial recognition matching.',
    'Please upload each document when you\'re ready. Take your time.',
  ]);

  gameState.startGame();
});

// Listen for state changes and drive the UI
gameState.on('stateChange', async ({ from, to, data }) => {
  switch (to) {
    case 'DOCUMENT_SUBMISSION':
      docPanel.show();
      hud.setAttempts(gameState.attempts);
      if (from === 'REJECTED') {
        bankManager.setAnimation('idle');
        await dialogueBox.showDialogue([
          'Let\'s try again. Please upload corrected documents.',
          'Make sure all documents are clear and valid.',
        ]);
      }
      break;

    case 'REVIEWING':
      docPanel.hide();
      hud.showReviewing();
      bankManager.setAnimation('thinking');

      await dialogueBox.showDialogue([
        'Thank you. Let me review these documents...',
      ]);

      // Perform verification
      try {
        const results = await verifier.verifyAll(gameState.documents);
        hud.hideReviewing();
        gameState.setVerificationResults(results);
      } catch (err) {
        console.error('Verification error:', err);
        hud.hideReviewing();
        gameState.setVerificationResults([
          { type: 'passport', valid: false, issues: ['Verification system error'] },
          { type: 'proof_of_address', valid: false, issues: ['Verification system error'] },
          { type: 'selfie', valid: false, issues: ['Verification system error'] },
        ]);
      }
      break;

    case 'APPROVED':
      bankManager.setAnimation('nod');

      await dialogueBox.showDialogue([
        'Excellent! All your documents have been verified successfully.',
        'Your KYC process is now complete. Welcome aboard!',
      ]);

      hud.showApproved();
      break;

    case 'REJECTED': {
      bankManager.setAnimation('shake');

      // Gather all issues from the results
      const allIssues = data
        .filter(r => !r.valid)
        .flatMap(r => r.issues.map(issue => `${formatDocType(r.type)}: ${issue}`));

      // Show results on the document panel briefly
      docPanel.show();
      docPanel.showResults(data);

      const issueLines = allIssues.map(i => `• ${i}`);
      await dialogueBox.showDialogue([
        'I\'m sorry, but there are issues with your documents.',
        ...issueLines,
        'Please correct these issues and resubmit.',
      ]);

      docPanel.hide();
      hud.showRejected(allIssues);
      break;
    }
  }
});

// Result overlay actions (retry / play again)
hud.onResultAction(() => {
  hud.hideResult();
  if (gameState.state === 'REJECTED') {
    gameState.retry();
  } else {
    // Play again — full reset
    gameState.attempts = 1;
    gameState.documents = { passport: null, proof_of_address: null, selfie: null };
    gameState.verificationResults = null;
    gameState.state = 'INTRO';
    hud.setAttempts(1);

    // Show intro again
    document.getElementById('intro-overlay').classList.remove('hidden');
  }
});

// ─── Helpers ───────────────────────────────────────────────────────

function formatDocType(type) {
  const map = {
    passport: 'Passport',
    proof_of_address: 'Proof of Address',
    selfie: 'Selfie',
  };
  return map[type] || type;
}
