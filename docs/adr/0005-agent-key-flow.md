# ADR 0005: Agent Key Reveal Flow

## Context

Each player has a 3-digit **Agent Key** (`emergencyPin`) for identity recovery when rejoining on a new device. The original flow showed a mandatory reveal screen to every joiner, adding friction to the happy path.

## Decision

**Host-only reveal on create:** When the host starts an operation, show `AgentKeyReveal` so they can note their key.

**Non-host join skips reveal:** Joining players still generate and persist a key locally (`storage.save('user_pin')`) and send it to Firestore on join, but proceed directly to the game room without the reveal interstitial.

Recovery flow (`join-recover` mode) still requires the user to enter their saved key when credentials conflict.

## Consequences

- **Positive:** Faster join for guests; host (who manages the room) still sees their key once.
- **Negative:** Non-host players may not memorize their key unless they use recovery later; acceptable for MVP party context.
- **Security note:** 3-digit PIN has only 1000 possibilities (known issue — acceptable for MVP).
