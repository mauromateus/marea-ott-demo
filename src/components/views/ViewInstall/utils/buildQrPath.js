// One SVG path for the whole QR code: a unit square per dark module (modules come from qrcode's create()).
export default function buildQrPath (modules) {
  let path = ''
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) {
        path += `M${col} ${row}h1v1h-1z`
      }
    }
  }
  return path
}
