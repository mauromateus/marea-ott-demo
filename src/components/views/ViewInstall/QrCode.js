import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode'

import buildQrPath from './utils/buildQrPath'

const QUIET_ZONE = 4

// Fixed white tile with black modules: scanners need dark-on-light contrast, even on the dark theme.
const Tile = styled.div`
  width: min(100%, 240px);
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #fff;
  line-height: 0;

  svg { width: 100%; height: auto; }
`

QrCode.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
}

export default function QrCode ({ value, label }) {
  const qr = useMemo(() => {
    try {
      const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' })
      return { size: modules.size, path: buildQrPath(modules) }
    } catch (e) {
      return null
    }
  }, [value])

  if (!qr) {
    return null
  }

  const extent = qr.size + QUIET_ZONE * 2

  return (
    <Tile>
      <svg
        role='img'
        aria-label={label}
        viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${extent} ${extent}`}
        shapeRendering='crispEdges'
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect x={-QUIET_ZONE} y={-QUIET_ZONE} width={extent} height={extent} fill='#fff' />
        <path d={qr.path} fill='#000' />
      </svg>
    </Tile>
  )
}
