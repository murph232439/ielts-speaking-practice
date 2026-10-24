# Preparation UI regression checks

Requires Node.js 20.19+ and jsdom 30.1.3. Install the test dependency outside the site:

```sh
npm install --prefix /tmp/ielts-qa jsdom@30.1.3
NODE_PATH=/tmp/ielts-qa/node_modules node tests/preparation.test.cjs
```

The test starts its own temporary HTTP server and runs the existing page and scripts in jsdom. It checks all current Part 1/3 questions, optional vocabulary, search, saved preparation notes, and unchanged recording DOM nodes. It also compares the original HTML against commit `2eb9ecee2d2483b86cf18718592169909d187476`, permitting only the new preparation script tag. This protects the existing recording, transcription, grading and email implementation.

For a quick representative check, set `PREP_QUICK=1`. Audio playback is stubbed in this DOM test; it never requests microphone access or submits homework. It does not replace visual browser QA or test mail delivery.
