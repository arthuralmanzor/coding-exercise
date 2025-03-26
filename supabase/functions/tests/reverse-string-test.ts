import { assertEquals } from 'https://deno.land/std@0.207.0/assert/mod.ts'
import { reverseString } from '../reverse-string/string-utils/reverse.ts'

Deno.test('reverseString function - should reverse a string', () => {
  assertEquals(reverseString('hello'), 'olleh')
  assertEquals(reverseString('Earmark'), 'kramraE')
  assertEquals(reverseString('12345'), '54321')
  assertEquals(reverseString(''), '')
  assertEquals(reverseString('a'), 'a')
})

Deno.test('reverseString function - should handle special characters', () => {
  assertEquals(reverseString('hello!'), '!olleh')
  assertEquals(reverseString('こんにちは'), 'はちにんこ')
  assertEquals(reverseString('😀🙂🤔'), '🤔🙂😀')
})
