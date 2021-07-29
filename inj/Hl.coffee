React = require 'react'
hl = require 'prism-react-renderer'

module.exports = (props) ->
  return React.createElement hl.default, {
    ...hl.defaultProps
    code: props.children
    language: props.lang
  }, ({ className, style, tokens, getLineProps, getTokenProps }) ->
    return React.createElement 'pre', { className, style: {
      ...style
      margin: 0
      padding: '5px'
    } }, [
      tokens.map (line, i) -> React.createElement 'div', {
        ...getLineProps { line, key: i }
      }, [
        line.map (token, key) -> React.createElement 'span', {
          ...getTokenProps { token, key }
        }
      ]
    ]
