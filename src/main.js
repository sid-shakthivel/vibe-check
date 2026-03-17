import { SceneManager } from './scene/SceneManager.js';
import { BankEnvironment } from './scene/BankEnvironment.js';
import { BankManager } from './scene/BankManager.js';
import { GameState } from './game/GameState.js';
import { DocumentVerifier } from './game/DocumentVerifier.js';
import { DialogueBox } from './ui/DialogueBox.js';
import { DocumentPanel } from './ui/DocumentPanel.js';
import { HUD } from './ui/HUD.js';
import { AudioManager } from './audio/AudioManager.js';
import './styles/main.css';

// ─── Initialize ────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const sceneManager = new SceneManager(canvas);
const bankEnv = new BankEnvironment(sceneManager.scene);
const bankManager = new BankManager(sceneManager.scene);
const gameState = new GameState();
const verifier = new DocumentVerifier();
const audioManager = new AudioManager();
const dialogueBox = new DialogueBox(audioManager);
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
    console.log(
        `Ollama vision model: ${available ? 'AVAILABLE (' + verifier._ollamaModel + ')' : 'not found, using game logic'}`,
    );
});

// ─── Step-specific dialogue ────────────────────────────────────────

const STEP_INTRO_DIALOGUE = {
    passport: [
        "Let's start with your Passport.",
        'Please upload a clear photo of your passport for identity verification.',
    ],
    proof_of_address: [
        'Great, your passport looks good so far.',
        "Now I'll need a Proof of Address — a utility bill, bank statement, or similar document.",
        "Please upload it when you're ready.",
    ],
    selfie: [
        'Excellent! Almost done.',
        "Finally, I'll need a clear Selfie of yourself for facial recognition matching.",
        'Make sure your face is clearly visible and well-lit.',
    ],
};

const STEP_RETRY_DIALOGUE = {
    passport: [
        "I'm afraid there were issues with your passport.",
        'Please upload a corrected passport photo.',
    ],
    proof_of_address: [
        'There were problems with your proof of address.',
        'Please upload a new proof of address document.',
    ],
    selfie: [
        "Your selfie didn't pass verification.",
        'Please take and upload a new selfie.',
    ],
};

// ─── Game Flow ─────────────────────────────────────────────────────

hud.onStart(async () => {
    audioManager.init(); // Initialize audio context on first user interaction
    hud.hideIntro();
    bankManager.setAnimation('welcome');

    await dialogueBox.showDialogue([
        'Good morning. Welcome to First National Bank.',
        "I'm the branch manager. I'll be handling your KYC verification today.",
        "To open your account, I'll need three documents from you — one at a time:",
        '1. Your Passport — for identity verification.',
        '2. A Proof of Address — a utility bill or bank statement.',
        '3. A clear Selfie — for facial recognition matching.',
        "Let's get started.",
    ]);

    gameState.startGame();
});

// Listen for state changes and drive the UI
gameState.on('stateChange', async ({ from, to, data }) => {
    switch (to) {
        case 'DOCUMENT_SUBMISSION': {
            const docType = gameState.getCurrentDocType();
            hud.setAttempts(gameState.attempts);

            // Show contextual dialogue
            if (from === 'STEP_REJECTED') {
                bankManager.setAnimation('idle');
                await dialogueBox.showDialogue(STEP_RETRY_DIALOGUE[docType]);
            } else if (from !== 'INTRO') {
                // Advancing from a previous approved step
                bankManager.setAnimation('idle');
                await dialogueBox.showDialogue(STEP_INTRO_DIALOGUE[docType]);
            } else {
                // First step (coming from INTRO via startGame)
                await dialogueBox.showDialogue(STEP_INTRO_DIALOGUE[docType]);
            }

            docPanel.show();
            break;
        }

        case 'REVIEWING_STEP': {
            docPanel.hide();
            hud.hideDramaticRejection(); // Safety: make sure old rejection stamp is gone
            audioManager.playStamp(); // Dramatic thud when submitting
            bankManager.setAnimation('writing');

            const docLabel = gameState.getCurrentDocLabel();
            await dialogueBox.showDialogue([
                `Thank you. Let me review your ${docLabel}...`,
            ]);

            // Show reviewing overlay AFTER dialogue is dismissed (overlay has higher z-index)
            hud.showReviewing();

            // Verify the single document
            try {
                const docType = gameState.getCurrentDocType();
                const file = gameState.documents[docType];
                const referenceFile =
                    docType === 'selfie'
                        ? gameState.documents['passport']
                        : null;
                const result = await verifier.verifySingle(
                    docType,
                    file,
                    referenceFile,
                );
                hud.hideReviewing();
                gameState.setStepResult(result);
            } catch (err) {
                console.error('Verification error:', err);
                hud.hideReviewing();
                gameState.setStepResult({
                    type: gameState.getCurrentDocType(),
                    valid: false,
                    issues: ['Verification system error'],
                });
            }
            break;
        }

        case 'STEP_APPROVED': {
            hud.hideDramaticRejection(); // Safety
            bankManager.setAnimation('nod');
            audioManager.playSuccess(); // Pleasant chime

            const docLabel = gameState.getCurrentDocLabel();
            const isLastStep =
                gameState.currentStep >= GameState.DOC_STEPS.length - 1;

            // Briefly show the approved result on the panel
            docPanel.show();
            docPanel.showStepResult(data);

            if (isLastStep) {
                await dialogueBox.showDialogue([
                    `Your ${docLabel} has been verified. ✓`,
                    'All three documents have been approved!',
                    'Your KYC process is now complete. Welcome aboard!',
                ]);
                docPanel.hide();
                hud.showApproved();
            } else {
                await dialogueBox.showDialogue([
                    `Your ${docLabel} has been verified successfully. ✓`,
                    "Let's move on to the next document.",
                ]);
                docPanel.hide();
                gameState.advanceStep();
            }
            break;
        }

        case 'STEP_REJECTED': {
            bankManager.setAnimation('shake');
            audioManager.playError(); // Buzzer sound

            const docLabel = gameState.getCurrentDocLabel();
            const issues = data.issues.map((i) => `• ${docLabel}: ${i}`);

            // SLAM the dramatic rejection stamp on screen
            hud.showDramaticRejection();

            // Show rejection on the panel
            docPanel.show();
            docPanel.showStepResult(data);

            // Wait a moment for dramatic effect before dialogue
            await new Promise((resolve) => setTimeout(resolve, 1500));

            await dialogueBox.showDialogue([
                `I'm sorry, but there are issues with your ${docLabel}.`,
                ...issues,
                'Please correct this and resubmit.',
            ]);

            docPanel.hide();
            hud.showRejected(issues);
            break;
        }

        case 'APPROVED':
            // Handled inline in STEP_APPROVED for the last step
            break;
    }
});

// Result overlay actions (retry / play again)
hud.onResultAction(() => {
    hud.hideResult();
    hud.hideDramaticRejection();
    if (gameState.state === 'STEP_REJECTED') {
        gameState.retryCurrentStep();
    } else {
        // Play again — full reset
        gameState.reset();
        hud.setAttempts(1);
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
