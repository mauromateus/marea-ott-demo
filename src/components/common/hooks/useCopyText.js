import { useCallback, useRef, useState } from 'react'

import { translate } from 'core/Translation'

const selectNode = (node) => {
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

// Literal keys on purpose: the dictionary test scans source for them. Each kind has its own text because of grammatical gender.
const MESSAGES = {
  link: { done: 'common.copy.link.done', failed: 'common.copy.link.failed' },
  report: { done: 'common.copy.report.done', failed: 'common.copy.report.failed' }
}

/**
 * Copies text; if the Clipboard API is unavailable or rejected, selects the node that shows it so the
 * user can copy by hand (common on plain http or in embedded webviews). Attach `ref` to that node.
 * @param {string} text
 * @param {'link'|'report'} kind picks the confirmation texts
 */
export default function useCopyText (text, kind = 'link') {
  const ref = useRef(null)
  const [message, setMessage] = useState('')
  const { done, failed } = MESSAGES[kind]

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage(translate(done))
      return
    } catch (e) {
      // fall through to the legacy path
    }

    if (ref.current) {
      selectNode(ref.current)
      try {
        if (document.execCommand('copy')) {
          setMessage(translate(done))
          return
        }
      } catch (e) {
        // selection stays; the user copies manually
      }
    }
    setMessage(translate(failed))
  }, [text, done, failed])

  return { ref, copy, message }
}
