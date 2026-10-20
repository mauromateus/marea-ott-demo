import { useCallback, useRef, useState } from 'react'

const selectNode = (node) => {
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * Copies text; if the Clipboard API is unavailable or rejected, selects the node that shows it so the
 * user can copy by hand (common on plain http or in embedded webviews). Attach `ref` to that node.
 */
export default function useCopyText (text, noun = 'text') {
  const ref = useRef(null)
  const [message, setMessage] = useState('')
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`${Noun} copied to the clipboard.`)
      return
    } catch (e) {
      // fall through to the legacy path
    }

    if (ref.current) {
      selectNode(ref.current)
      try {
        if (document.execCommand('copy')) {
          setMessage(`${Noun} copied to the clipboard.`)
          return
        }
      } catch (e) {
        // selection stays; the user copies manually
      }
    }
    setMessage(`Clipboard unavailable: the ${noun} is selected, copy it manually.`)
  }, [text, noun, Noun])

  return { ref, copy, message }
}
