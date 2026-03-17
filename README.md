This project was made for Durham HackDay 2026.

# Vibe Check

"Vibe Check" is a web-based, 3D interactive KYC (Know Your Customer) game inspired by the mechanics of _Papers, Please_. It aims to change the mundane, frustrating process of identity verification by turning it into an engaging, 3D experience.

## The Problem

The current KYC process is unfriendly. It often consists of cold, static web forms that are frustrating to navigate.

**Vibe Check** bridges this gap. By allowing users to interact with a 3D animated bank manager who verbally and visually guides them through the process, we make digital onboarding intuitive, personal, and surprisingly fun while remaining highly secure.

## What We've Built So Far

### 1. 3D Environment & Characters (Three.js)

- A fully 3D, retro-bureaucratic bank office setting.
- An animated 3D Bank Manager character who reacts to the player's actions with distinct animations (idle breathing, nodding in approval, shaking his head in rejection, and gesturing a welcome).

### 2. Sequential Verification Flow

- Players must submit three documents one by one: Passport → Proof of Address → Selfie.
- The game state machine strictly guides players through this sequential flow.
- The UI features a step progress indicator.
- If a specific document is rejected (e.g., the Proof of Address), the player is sent back to retry only that specific step.

### 3. "Smart" Vision Verification (Ollama + Qwen2.5-VL)

- Document verification is handled locally using the advanced Qwen2.5-VL vision model via the Ollama API, ensuring maximum privacy (no images are sent to external cloud APIs).
- The model is prompted to verify the layout and structure of the documents:
    - Does the image look like a passport data page?
    - Does it look like an official bill or bank statement?
    - Does the selfie contain a human face?
- This system properly catches invalid uploads while remaining flexible enough not to fail on minor rotation issues.

## Installation

```
npm install
```

```
npm run dev
```
