import test from 'node:test'
import assert from 'node:assert/strict'
import { cautionsForMatch } from './stats.js'

test('cautionsForMatch returns ordered cards for a match', () => {
  const cautions = [
    { id: '1', match_id: 'm1', card_type: 'red', minute: 88 },
    { id: '2', match_id: 'm1', card_type: 'yellow', minute: 34 },
    { id: '3', match_id: 'm2', card_type: 'yellow', minute: 10 },
  ]

  assert.deepEqual(
    cautionsForMatch(cautions, 'm1').map((c) => c.id),
    ['2', '1']
  )
})
