# Vibe Check

"Vibe Check" is a web-based, 3D interactive KYC (Know Your Customer) game inspired by the mechanics of _Papers, Please_. It aims to revolutionize the mundane, frustrating process of identity verification by turning it into an engaging, empathetic, and guided 3D experience.

## The Problem

The current KYC process is unfriendly. It often consists of cold, static web forms that are frustrating to navigate. In places like the Isle of Man, consumers often choose banks like HSBC simply because they can enroll in person with a real human being.

**Vibe Check** bridges this gap. By allowing users to interact with a 3D animated bank manager who verbally and visually guides them through the process, we make digital onboarding intuitive, personal, and surprisingly fun while remaining highly secure.

## What We've Built So Far

### 1. 3D Environment & Characters (Three.js)

- A fully 3D, retro-bureaucratic bank office setting.
- Features warm lighting, an olive-green and wood-brown color palette, and period-appropriate props: a chunky CRT monitor, a classic pink piggy bank, a slanted adding machine/calculator, scattered manilla folders, and a rubber stamp.
- An animated 3D Bank Manager character (plump, friendly, wearing a grey suit and glasses) who reacts to the player's actions with distinct animations (idle breathing, nodding in approval, shaking his head in rejection, and gesturing a welcome).

### 2. Sequential Verification Flow

- Players must submit three documents one by one: Passport → Proof of Address → Selfie.
- The game state machine strictly guides players through this sequential flow.
- The UI features a step progress indicator (1, 2, 3 dots that light up as documents are approved) and dynamically updates to show only the required upload slot.
- If a specific document is rejected (e.g., the Proof of Address), the player is sent back to retry only that specific step.

### 3. "Smart" Vision Verification (Ollama + Qwen2.5-VL)

- Document verification is handled locally using the advanced Qwen2.5-VL vision model via the Ollama API, ensuring maximum privacy (no images are sent to external cloud APIs).
- The model is prompted to verify the layout and structure of the documents:
    - Does the image look like a passport data page?
    - Does it look like an official bill or bank statement?
    - Does the selfie contain a human face?
- This system properly catches invalid uploads while remaining flexible enough not to fail on minor rotation issues.

### 4. Retro UI Aesthetic

- The entire HTML/CSS user interface has been overhauled to match a vintage pixel-art aesthetic.
- Features include thick 4px solid borders, hard drop shadows, warm tan/cream "paper" colors, and a monospaced (JetBrains Mono/Courier) typewriter font.
- Dynamic conversation dialogue boxes map tightly to the 3D manager's animations, guiding the player through the exact requirements of each step.

## Installation

```
npm install
```

```
npm run dev
```


