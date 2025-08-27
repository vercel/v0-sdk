import { atom } from 'jotai'

// User interface
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

// Generation interface
export interface Generation {
  id: string
  demoUrl: string
  label: string
  projectId?: string
}

// Chat interface
export interface Chat {
  id: string
  prompt: string
  generations: Generation[]
  selectedGeneration: Generation
  history: Array<{
    id: string
    prompt: string
    demoUrl: string
    timestamp: Date
  }>
  isIterating: boolean
}

// History item interface
export interface HistoryItem {
  id: string
  prompt: string
  demoUrl: string
  timestamp: Date
}

// --- ATOMS ---

// User atom
export const userAtom = atom<User | null>(null)

// Current chat atom
export const currentChatAtom = atom<Chat | null>(null)

// UI state atoms
export const isLoadingAtom = atom<boolean>(false)
export const isSubmittingAtom = atom<boolean>(false)
export const isSubmittingFollowUpAtom = atom<boolean>(false)
export const selectedGenerationIndexAtom = atom<number>(0)

// Current prompt atom
export const currentPromptAtom = atom<string>('')

// Show initial screen atom
export const showInitialScreenAtom = atom<boolean>(true)

// --- DERIVED ATOMS ---

// Current selected generation atom (derived from currentChat and selectedGenerationIndex)
export const currentSelectedGenerationAtom = atom<Generation | null>((get) => {
  const currentChat = get(currentChatAtom)
  const selectedIndex = get(selectedGenerationIndexAtom)

  if (!currentChat || !currentChat.generations[selectedIndex]) {
    return null
  }

  return currentChat.generations[selectedIndex]
})

// User initials atom (derived from user)
export const userInitialsAtom = atom<string>((get) => {
  const user = get(userAtom)

  if (!user) return ''

  return user.name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// --- ASYNC ATOMS ---

// User fetch atom
export const fetchUserAtom = atom(null, async (get, set) => {
  try {
    const response = await fetch('/api/user')
    if (response.ok) {
      const userData = await response.json()
      set(userAtom, userData)
    } else {
      // Fallback user
      set(userAtom, {
        id: 'anonymous',
        name: 'User',
        email: 'user@example.com',
      })
    }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    // Fallback user
    set(userAtom, {
      id: 'anonymous',
      name: 'User',
      email: 'user@example.com',
    })
  }
})

// Submit initial prompt atom
export const submitInitialPromptAtom = atom(
  null,
  async (get, set, prompt: string) => {
    if (!prompt.trim()) return

    set(isLoadingAtom, true)
    set(currentPromptAtom, prompt)

    // Immediately show UI with placeholder data
    const tempProjectId = 'temp-' + Date.now()
    const placeholderChat: Chat = {
      id: tempProjectId,
      prompt,
      generations: [
        {
          id: 'temp-a',
          demoUrl: 'about:blank',
          label: 'A',
          projectId: tempProjectId,
        },
        {
          id: 'temp-b',
          demoUrl: 'about:blank',
          label: 'B',
          projectId: tempProjectId,
        },
        {
          id: 'temp-c',
          demoUrl: 'about:blank',
          label: 'C',
          projectId: tempProjectId,
        },
      ],
      selectedGeneration: {
        id: 'temp-a',
        demoUrl: 'about:blank',
        label: 'A',
        projectId: tempProjectId,
      },
      history: [],
      isIterating: false,
    }

    set(currentChatAtom, placeholderChat)
    set(selectedGenerationIndexAtom, 0)
    set(showInitialScreenAtom, false)

    try {
      // Create project first
      const projectResponse = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: prompt }),
      })

      if (!projectResponse.ok) {
        throw new Error('Failed to create project')
      }

      const project = await projectResponse.json()

      // Update URL immediately now that we have projectId
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/projects/${project.id}`)
      }

      // Create 3 chats for the project - update each as it completes
      const chatRequests = [
        { message: prompt, projectId: project.id, index: 0 },
        {
          message: `${prompt} (with a modern style)`,
          projectId: project.id,
          index: 1,
        },
        {
          message: `${prompt} (with a minimalist style)`,
          projectId: project.id,
          index: 2,
        },
      ]

      // Start all chat requests simultaneously
      chatRequests.forEach(async ({ message, projectId, index }) => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, projectId }),
          })

          if (!response.ok) {
            throw new Error(
              `Failed to create chat ${index}: ${response.statusText}`,
            )
          }

          const chat = await response.json()

          // Update the specific generation as soon as it's ready
          set(currentChatAtom, (prevChat) => {
            if (!prevChat) return null

            const updatedGenerations = [...prevChat.generations]
            updatedGenerations[index] = {
              id: chat.id,
              demoUrl: chat.demo,
              label: String.fromCharCode(65 + index), // A, B, C
              projectId: project.id,
            }

            return {
              ...prevChat,
              id: project.id, // Update the chat ID to the real project ID
              generations: updatedGenerations,
              selectedGeneration:
                index === 0
                  ? updatedGenerations[0]
                  : prevChat.selectedGeneration,
            }
          })
        } catch (error) {
          // Could optionally update the specific generation with an error state
        }
      })
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      set(isLoadingAtom, false)
    }
  },
)

// Submit follow-up prompt atom
export const submitFollowUpPromptAtom = atom(
  null,
  async (get, set, userPrompt: string) => {
    const currentChat = get(currentChatAtom)
    const selectedGenerationIndex = get(selectedGenerationIndexAtom)

    if (!currentChat || !userPrompt.trim()) return

    set(isSubmittingFollowUpAtom, true)

    // Immediately switch to history view
    set(currentChatAtom, (prevChat) => {
      if (!prevChat) return null
      return {
        ...prevChat,
        isIterating: true,
      }
    })

    try {
      const selectedGeneration =
        currentChat.generations[selectedGenerationIndex]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          chatId: selectedGeneration.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const updatedChat = await response.json()

      // Update the current chat with new iteration
      set(currentChatAtom, (prevChat) => {
        if (!prevChat) return null

        const newHistory = [
          ...prevChat.history,
          {
            id: updatedChat.id + '-' + Date.now(),
            prompt: userPrompt,
            demoUrl: updatedChat.demo,
            timestamp: new Date(),
          },
        ]

        // Update the selected generation with new demo URL
        const updatedGenerations = prevChat.generations.map((gen, index) =>
          index === selectedGenerationIndex
            ? { ...gen, demoUrl: updatedChat.demo }
            : gen,
        )

        return {
          ...prevChat,
          generations: updatedGenerations,
          selectedGeneration: updatedGenerations[selectedGenerationIndex],
          history: newHistory,
          isIterating: true,
        }
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      set(isSubmittingFollowUpAtom, false)
    }
  },
)
