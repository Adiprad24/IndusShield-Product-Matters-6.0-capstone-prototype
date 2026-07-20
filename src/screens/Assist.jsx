import { ArrowRight, Car, HeartPulse, Send, Sparkles, Umbrella } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SEGMENT_COLORS } from '../components/ui/categoryColors'
import { POLICIES, QUICK_PROMPTS, USER, matchAnswer } from '../data/mockData'

const CATEGORY_ICONS = { Health: HeartPulse, Motor: Car, Life: Umbrella }

const TYPING_MS = 900

const OPENING = `Hi ${USER.name.split(' ')[0]}. I can see your ${POLICIES.length} policies and your Baleno's cover. Ask me anything — I'll skip the jargon.`

export default function Assist({ navigate }) {
  const [messages, setMessages] = useState([{ id: 'opening', role: 'assistant', text: OPENING }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [started, setStarted] = useState(false)

  const endRef = useRef(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    // scrollIntoView is absent in test environments; the guard keeps it optional.
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  const send = (text) => {
    const question = text.trim()
    if (!question || typing) return

    setStarted(true)
    setInput('')
    setMessages((list) => [
      ...list,
      { id: `u-${list.length}`, role: 'user', text: question },
    ])
    setTyping(true)

    timers.current.push(
      setTimeout(() => {
        const match = matchAnswer(question)
        setTyping(false)
        setMessages((list) => [
          ...list,
          {
            id: `a-${list.length}`,
            role: 'assistant',
            text: match.answer,
            policyId: match.policyId,
            cta: match.cta,
          },
        ])
      }, TYPING_MS),
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="px-5 pt-5">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
          <Sparkles size={22} strokeWidth={1.75} className="text-gold" />
          Assist
        </h1>
        <p className="mt-1 text-sm text-mute">
          Knows your policies. Answers in plain English.
        </p>
      </header>

      <div className="flex-1 space-y-3 px-5 pt-5 pb-4">
        {messages.map((message) =>
          message.role === 'user' ? (
            <p
              key={message.id}
              className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-maroon px-4 py-2.5 text-sm leading-relaxed text-white"
            >
              {message.text}
            </p>
          ) : (
            <AssistantMessage key={message.id} message={message} navigate={navigate} />
          ),
        )}

        {!started ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="min-h-11 rounded-full border border-black/10 bg-white px-4 text-left text-xs text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        {typing ? <TypingIndicator /> : null}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          send(input)
        }}
        className="sticky bottom-0 border-t border-black/5 bg-white px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your cover…"
            aria-label="Ask Assist a question"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-paper px-4 text-sm text-ink placeholder:text-mute focus:border-maroon focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-maroon text-white active:bg-maroon-deep disabled:bg-ink/15 disabled:text-mute"
          >
            <Send size={18} strokeWidth={1.75} />
          </button>
        </div>
      </form>
    </div>
  )
}

function AssistantMessage({ message, navigate }) {
  const policy = message.policyId
    ? POLICIES.find((item) => item.id === message.policyId)
    : null

  return (
    <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 shadow-sm">
      {policy ? <PolicyChip policy={policy} /> : null}

      <p className="text-sm leading-relaxed text-ink">{message.text}</p>

      {message.cta ? (
        <button
          type="button"
          onClick={() => navigate(message.cta.screen, message.cta.data ?? null)}
          className="mt-3 flex min-h-11 items-center gap-1 text-sm font-medium text-maroon"
        >
          {message.cta.label}
          <ArrowRight size={16} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}

/** Shows which of Rohan's actual policies the answer is reading from. */
function PolicyChip({ policy }) {
  const Icon = CATEGORY_ICONS[policy.category]

  return (
    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1">
      <Icon
        size={12}
        strokeWidth={2}
        style={{ color: SEGMENT_COLORS[policy.category] }}
        className="shrink-0"
      />
      <span className="text-[10px] font-medium text-mute">{policy.name}</span>
    </span>
  )
}

function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Assist is typing"
      className="mr-auto flex w-fit gap-1 rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3.5 shadow-sm"
    >
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-mute"
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </div>
  )
}
