import useCopyText from 'components/common/hooks/useCopyText'

export default function useCopyReport (text) {
  const { ref, copy, message } = useCopyText(text, 'report')
  return { reportRef: ref, copy, message }
}
