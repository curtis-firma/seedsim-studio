import { NextResponse } from "next/server";

const stub = {
  patch: [],
  assumptions: [],
  warnings: [],
  scenarioNameSuggestion: "",
};

export async function POST(_req: Request) {
  return NextResponse.json(stub);
}

export async function GET() {
  return NextResponse.json(stub);
}
