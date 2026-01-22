import { NextRequest, NextResponse } from 'next/server';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Stub response for milestone verification
  return NextResponse.json({
    ok: true,
    received: body,
    message: "parse stub working",
  });
}

/**
 * POST /api/seedsim/parse
 *
 * This route accepts a JSON payload and returns a response containing
 * structured data for the SeedSIM Studio. In the future, this route will
 * call the OpenAI API using the server-side API key defined in the
 * environment variable `OPENAI_API_KEY`. To keep the API key secret, do not
 * expose it to the client. Instead, read it from the environment and use it
 * in the server code only. For now, this handler returns a stub response so
 * we can verify the wiring between the client and server.
 */
export async function POST(request: NextRequest) {
  // In a real implementation, you would read the request body like this:
  // const { /* fields */ } = await request.json();
  // Then call OpenAI using the secret API key:
  // const apiKey = process.env.OPENAI_API_KEY;
  // const openaiResponse = await fetch('https://api.openai.com/v1/...', { ... });

  // Stubbed response that matches the expected schema.
  const responsePayload = {
    patch: [],
    assumptions: [],
    warnings: [],
    scenarioNameSuggestion: '',
  };

  return NextResponse.json(responsePayload);
}

/**
 * GET /api/seedsim/parse
 *
 * This handler is provided for convenience so that you can open the API route
 * directly in a browser and see the stubbed response. Because the simulation
 * parser currently only supports POST requests with a JSON body, this GET
 * handler ignores any query parameters and simply returns the same stub
 * response as the POST handler.
 */
export async function GET() {
  const responsePayload = {
    patch: [],
    assumptions: [],
    warnings: [],
    scenarioNameSuggestion: '',
  };
  return NextResponse.json(responsePayload);
}