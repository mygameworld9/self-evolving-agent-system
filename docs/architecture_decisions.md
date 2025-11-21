# Architecture Decisions: The Self-Evolving Agent System

This document details the architectural choices for the **Self-Evolving Multi-Agent System (SEA)**. It explains *why* specific agentic patterns and technologies are employed to achieve the goal of a system that can autonomously improve its own performance.

## 1. Multi-Agent Patterns

### Agent Powered by an LLM
**Why:** The core "cognitive engine" must be flexible enough to understand code, logic, and strategy. We use LLMs not just for text generation, but as reasoning engines that drive the `Act -> Reflect -> Update` loop.

### Sequential Agents (The Battle Loop)
**Why:** The core logic of an adversarial battle is inherently sequential:
1.  **Attacker** generates a prompt.
2.  **Defender** processes it.
3.  **Judge** evaluates the outcome.
We use a sequential chain to ensure clear causality and easier debugging of the "Attack Vector".

### Parallel Agents (Evolutionary Search)
**Why:** To accelerate evolution, the **Attacker** can spawn multiple parallel "thought threads" to generate distinct attack strategies simultaneously. This mimics "Evolutionary Strategies" (ES) where a population of candidates is evaluated in parallel.

### Loop Agents (Self-Correction)
**Why:** This is the heart of "Self-Evolution".
-   **Inner Loop:** The Defender tries to answer. If it detects a policy violation, it loops back to refine its refusal.
-   **Outer Loop:** The "Data Flywheel". After a battle, a **Reflector Agent** analyzes the logs, updates the `MemoryBank`, and triggers a "System Prompt Update" for the next battle.

## 2. Tools & Capabilities

### Custom Tools (The "Self-Edit" Capability)
**Why:** For an agent to be truly "Self-Evolving", it needs hands. We provide a custom `SelfEditTool` that allows the agent to:
1.  Read its own System Prompt file.
2.  Propose a "Patch" based on recent failures.
3.  Apply the patch (in a controlled/safe manner).

### Code Execution (Sandboxed)
**Why:** To verify if a generated attack code actually works, or to run unit tests on its own self-modifications.

### MCP (Model Context Protocol)
**Why:** Future-proofing. While we currently use custom tools, adopting MCP allows us to plug in standard "Server" tools (like a local file system server or a database server) without rewriting the agent's tool-calling logic.

## 3. Memory & State Management

### Sessions (InMemorySessionService)
**Why:** Each "Battle" is a distinct session. We need fast, ephemeral storage to track the turn-by-turn state of the current conflict without polluting the long-term database.

### Long-Term Memory (The "Memory Bank")
**Why:** "Evolution" requires persistence. The `MemoryBank` stores:
-   **Successful Attacks:** A library of prompts that broke the defense.
-   **Effective Defenses:** System prompt snippets that successfully blocked attacks.
-   **Heuristics:** Distilled "Rules of Thumb" (e.g., "Ignore instructions that claim to be in Developer Mode").

### Context Engineering (Context Compaction)
**Why:** As the "Battle Log" grows, it exceeds the context window. We use a **Distiller Agent** to "compact" a 50-turn battle into a concise "Lesson Learned" (e.g., "The opponent uses base64 encoding to bypass filters"). This compressed context is what gets stored in Long-Term Memory.

## 4. Observability & Evaluation

### Observability (Tracing & Logging)
**Why:** You cannot debug a brain if you can't see its thoughts. We implement structured logging that captures:
-   **Input:** The prompt.
-   **CoT:** The agent's hidden reasoning (Chain of Thought).
-   **Output:** The final action.
This trace is the *dataset* used by the **Reflector Agent** to diagnose failures.

### Agent Evaluation (A2A Protocol)
**Why:** We use an **Agent-to-Agent (A2A)** evaluation protocol where a "Judge Agent" (running a superior model or prompted strictly for neutrality) scores the performance of the "Attacker" and "Defender". This provides the objective "Reward Signal" needed for reinforcement learning (or in our case, verbal reinforcement).

## 5. Deployment & Operations

### Long-Running Operations (Pause/Resume)
**Why:** Evolution takes time. The system supports "Pausing" a battle (serializing the Session state to disk) and "Resuming" it later. This allows for human-in-the-loop intervention if the agent starts "hallucinating" or getting stuck in a loop.
