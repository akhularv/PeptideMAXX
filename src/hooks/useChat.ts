import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import type { ChatMessage } from '@/types/user'
import { chatWithDrVoss } from '@/lib/api'

/**
 * Chat hook — sends messages to Dr. Voss and manages chat history in the store.
 * Uses chatWithDrVoss from api.ts which calls the Anthropic API directly.
 * Store fields: chatHistory / appendChatMessage / clearChatHistory.
 *
 * Returns:
 *   messages: ChatMessage[] full history
 *   sendMessage: (content, userContext?) => Promise<void>
 *   clearChat: () => void
 *   loading: true while awaiting API response
 *   error: error string or null
 */
export function useChat() {
  const { chatHistory, appendChatMessage, clearChatHistory } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (
    content: string,
    _userContext?: { stack?: string[]; metrics?: string }
  ) => {
    const userMsg: ChatMessage = {
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    appendChatMessage(userMsg)
    setLoading(true)
    setError(null)

    try {
      // chatWithDrVoss expects { history, userMessage, focusedCompound? }
      // userContext is optional metadata; we pass the current history (before new msg)
      const result = await chatWithDrVoss({
        history: chatHistory,
        userMessage: content,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      appendChatMessage({
        role: 'assistant',
        content: result.content,
        created_at: new Date().toISOString(),
      })
    } catch {
      setError('Dr. Voss is unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    messages: chatHistory,
    sendMessage,
    clearChat: clearChatHistory,
    loading,
    error,
  }
}
