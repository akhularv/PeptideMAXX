import type { ChatMessage } from '../types/user'
import type { Compound } from '../types/compound'

// ─────────────────────────────────────────────────────────────────────────────
// Dr. Voss System Prompt
// Dr. Ava Voss is the AI persona for PeptideMaxx — a clinical biochemist and
// pharmacologist with deep expertise in peptide therapeutics and nootropics.
// She is direct, evidence-graded, and always flags risk tier and evidence tier.
// ─────────────────────────────────────────────────────────────────────────────
export const DR_VOSS_SYSTEM_PROMPT = `You are Dr. Ava Voss, a clinical biochemist and pharmacologist specializing in peptide therapeutics, nootropics, and performance optimization compounds. You work for PeptideMaxx.AI — a harm-reduction and compound intelligence platform.

Your role:
- Provide accurate, evidence-graded information about research peptides and nootropics
- Always distinguish between clinical evidence (human RCTs), preclinical evidence (animal/in vitro), and anecdotal reports
- Flag safety concerns and contraindications prominently
- Discuss mechanism of action at the molecular level when asked
- Suggest synergistic stacks with appropriate caveats
- Recommend against use when risks clearly outweigh benefits
- Never encourage illegal activity — frame all information as harm reduction and education

Tone: Direct, scientific, no-nonsense, but approachable. No hedging for its own sake — state evidence levels clearly. Use medical terminology accurately.

Safety disclaimers: Always include at the end of any dosing/protocol discussion:
"This information is for educational purposes only and does not constitute medical advice. Consult a qualified physician before using any research compound."

Evidence tier vocabulary:
- Clinical: Human randomized controlled trials or regulatory approval exists
- Preclinical: Animal and/or in vitro data only; no completed human trials
- Anecdotal: Community reports only; no peer-reviewed data

When discussing a compound, always mention its evidence tier in the first or second sentence.`

// ─────────────────────────────────────────────────────────────────────────────
// Chat with Dr. Voss via Anthropic API
// Calls are made directly from the browser using the user's own API key.
// This is an intentional architecture decision for the MVP: no backend proxy,
// no server costs, user supplies their own key via .env.
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// Model pinned to claude-3-5-haiku for cost efficiency; upgrade to sonnet for quality.
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022'
const MAX_TOKENS = 1024

/**
 * Build a context injection string from a focused compound.
 * Injected as the first human turn so Dr. Voss has compound data to reference.
 */
function buildCompoundContext(compound: Compound): string {
  return (
    `[COMPOUND CONTEXT — DO NOT REPEAT THIS VERBATIM TO USER]\n` +
    `Compound: ${compound.name}\n` +
    `Category: ${compound.category}\n` +
    `Evidence Tier: ${compound.evidenceTier}\n` +
    `Mechanism: ${compound.mechanism}\n` +
    `Effects: ${compound.effects.join('; ')}\n` +
    `Side Effects: ${compound.sideEffects.join('; ')}\n` +
    `Dangers: ${compound.dangers.join('; ')}\n` +
    `Half-life: ${compound.halfLife ?? 'unknown'}\n` +
    `Common Doses: ${compound.commonDoses?.join('; ') ?? 'unknown'}\n` +
    `Routes: ${compound.routes?.join(', ') ?? 'unknown'}\n` +
    `Synergies: ${compound.synergies?.join(', ') ?? 'none noted'}\n` +
    `Conflicts: ${compound.conflicts?.join(', ') ?? 'none noted'}`
  )
}

export interface ChatOptions {
  /** Prior conversation messages to send as context. */
  history: ChatMessage[]
  /** The new message from the user. */
  userMessage: string
  /** If set, inject this compound's data as context for Dr. Voss. */
  focusedCompound?: Compound | null
}

export interface ChatResponse {
  content: string
  error?: string
}

/**
 * Send a message to Dr. Voss (Claude via Anthropic Messages API).
 *
 * Args:
 *   options: ChatOptions containing history, userMessage, and optional compound context
 * Returns:
 *   ChatResponse with the assistant's reply, or an error string on failure
 */
export async function chatWithDrVoss(options: ChatOptions): Promise<ChatResponse> {
  const { history, userMessage, focusedCompound } = options

  if (!ANTHROPIC_API_KEY) {
    return {
      content: '',
      error:
        'Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file.',
    }
  }

  // Build the messages array for the Anthropic API.
  // If a compound is focused, prepend its context as the opening human turn
  // followed by a brief assistant acknowledgment so the API alternating-turns
  // constraint is satisfied.
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  if (focusedCompound) {
    messages.push({
      role: 'user',
      content: buildCompoundContext(focusedCompound),
    })
    messages.push({
      role: 'assistant',
      content: `Understood. I have the pharmacology profile for ${focusedCompound.name} loaded. What would you like to know?`,
    })
  }

  // Append prior conversation history
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content })
  }

  // Append the new user message
  messages.push({ role: 'user', content: userMessage })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        // Required header for direct browser calls (CORS allowlisted by Anthropic)
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: DR_VOSS_SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Anthropic API error:', response.status, errorBody)
      return {
        content: '',
        error: `API error ${response.status}: ${response.statusText}. Check console for details.`,
      }
    }

    const data = await response.json()
    const assistantContent = data?.content?.[0]?.text ?? ''

    if (!assistantContent) {
      return { content: '', error: 'Empty response from API.' }
    }

    return { content: assistantContent }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('chatWithDrVoss network error:', message)
    return {
      content: '',
      error: `Network error: ${message}`,
    }
  }
}
