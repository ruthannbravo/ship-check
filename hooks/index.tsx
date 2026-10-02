// Ship Guard entry: the guard itself (ship-guard.mjs) plus a band that shows
// above the prompt while going live is unlocked,
// with how long the unlock has left.
import { atom, read } from 'claude-code'
import type { Register } from 'claude-code'
import { register as registerGuard } from './ship-guard.mjs'

const UNLOCK_MS = 2 * 60 * 60 * 1000
const passedAt = atom({ plugin: 'ship-check', key: 'passedAt' } as const, 0)

export const register: Register = (on, options) => {
  registerGuard(on, options)

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const left = (await read($, passedAt)) + UNLOCK_MS - Date.now()
    if (e.props.hasSurvey || left <= 0) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const mins = Math.ceil(left / 60000)
    const time = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`

    return (
      <Box>
        <Text color="green">✅ Ship Check passed</Text>
        <Text dimColor> · going live is unlocked for {time}</Text>
      </Box>
    )
  })
}
