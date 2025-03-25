import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { reverseString } from './string-utils/reverse.ts'

Deno.serve(async (req) => {
  const { text } = await req.json()
  const data = {
    reversedText: reverseString(text)
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
})
