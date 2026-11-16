# Project design Agent Skills

This repository includes three **project-scoped** Agent Skills in `.agents/skills/`:

- `frontend-design-direction` — ECC, https://github.com/affaan-m/ecc/tree/main/skills/frontend-design-direction
- `frontend-design` — Anthropic, https://github.com/anthropics/skills/tree/main/skills/frontend-design
- `ui-ux-pro-max` — Next Level Builder, https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The files are copied from public GitHub sources, including relevant licenses. UI/UX Pro Max includes its search/design scripts, datasets, references and stack data; its development test suite is not included. This installation does not install any global ChatGPT plugin or alter a ChatGPT account's Skills list. The skills become available to coding agents that discover repository-local `.agents/skills` folders when the repository is checked out.

## Usage (compatible agents)

Open this repository in a tool that supports Agent Skills. Ask the agent to use `frontend-design-direction`, `frontend-design`, and `ui-ux-pro-max` for design tasks.

To query UI/UX Pro Max data from the repository root:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "education speaking practice accessible mobile UI" --design-system -p "IELTS Speaking"
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "responsive layout mobile forms" --stack html-tailwind
```

The GitHub Pages website itself does **not** execute these skills in the student's browser. Skills inform a coding agent's future design work, not live site functionality. They do not grant access to Canva, ChatGPT plugin tools, external accounts, or website deployment by themselves.

## Project-specific constraints

For future changes to this IELTS speaking site, preserve student progress, recording/submission functionality and the existing gentle lavender visual direction. Support touch interaction (including HarmonyOS), accessible typography, clear labels, and keyboard navigation. Do not replace official exam questions or existing vocabulary materials without verifying source accuracy. Run checks before shipping.