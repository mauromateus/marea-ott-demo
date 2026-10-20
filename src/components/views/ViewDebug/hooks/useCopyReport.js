import { useCallback, useRef, useState } from 'react'

const selectNode = (node) => {
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * Copies the report; if the Clipboard API is unavailable or rejected, selects the text so the
 * user can copy it by hand (common on plain http or in embedded webviews).
 */
export default function useCopyReport (text) {
  const reportRef = useRef(null)
  const [message, setMessage] = useState('')

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Report copied to the clipboard.')
      return
    } catch (e) {
      // fall through to the legacy path
    }

    if (reportRef.current) {
      selectNode(reportRef.current)
      try {
        if (document.execCommand('copy')) {
          setMessage('Report copied to the clipboard.')
          return
        }
      } catch (e) {
        // selection stays; the user copies manually
      }
    }
    setMessage('Clipboard unavailable: the report is selected, copy it manually.')
  }, [text])

  return { reportRef, copy, message }
}
