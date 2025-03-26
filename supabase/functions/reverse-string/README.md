# Reverse String Edge Function

This is a simple Supabase Edge Function that reverses a string. It demonstrates how to create, test, and deploy a
Deno-based serverless function within the Supabase ecosystem.

## Functionality

The function takes a JSON payload with a `text` property and returns a JSON object with the `reversedText` property
containing the reversed string.

### Input Format

```json
{
  "text": "string to reverse"
}
```

### Output Format

```json
{
  "reversedText": "esrever ot gnirts"
}
```

## Local Development

### Running the Function Locally

1. Start your Supabase project locally:

   ```bash
   supabase start
   ```

2. Serve the function:

   ```bash
   supabase functions serve reverse-string
   ```

3. Test the function using curl:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/reverse-string' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
     --header 'Content-Type: application/json' \
     --data '{"text":"Hello World"}'
   ```

### Running Tests

Run tests using Deno's built-in test framework:

```bash
cd supabase/functions
deno test tests/reverse-string-test.ts
```

## Deployment

Deploy the function to your Supabase project:

```bash
supabase functions deploy reverse-string
```

After deployment, you can invoke the function using:

##### javascript
```javascript
// Example using JavaScript fetch API
const { data, error } = await fetch('https://your-project-ref.supabase.co/functions/v1/reverse-string', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({ text: 'Hello World' })
}).then((res) => res.json())

console.log(data) // { reversedText: "dlroW olleH" }
```

##### flutter/dart
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> reverseString() async {
  const String supabaseUrl = 'https://your-project-ref.supabase.co/functions/v1/reverse-string';
  const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

  final response = await http.post(
    Uri.parse(supabaseUrl),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $supabaseAnonKey',
    },
    body: jsonEncode({'text': 'Hello World'}),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    print(data); // { reversedText: "dlroW olleH" }
  } else {
    print('Error: ${response.body}');
  }
}
```

## Function Structure

- `index.ts` - Main entry point that handles HTTP requests
- `string-utils/reverse.ts` - Utility function that performs string reversal
- `deno.json` - Import map for Deno dependencies

## Best Practices

- The function is modular, with the core logic separated from the HTTP handling
- Tests are written to validate functionality
