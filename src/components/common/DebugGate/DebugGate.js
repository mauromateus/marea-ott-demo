import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import useDebugMode from 'components/common/hooks/useDebugMode'

DebugGate.propTypes = {
  children: PropTypes.node
}

/** Renders its children only in debug mode; otherwise sends the visitor home (the router applies the basename). */
export default function DebugGate ({ children }) {
  return useDebugMode() ? children : <Redirect to='/' />
}
