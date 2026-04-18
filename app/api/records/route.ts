import { NextRequest, NextResponse } from "next/server";
import {
  getAllRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from "@/lib/db";

export async function GET() {
  try {
    const records = getAllRecords();
    return NextResponse.json(records);
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content } = body ?? {};

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    const record = createRecord(String(title), String(content));
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content } = body ?? {};

    if (!id || !title || !content) {
      return NextResponse.json({ error: "id, title and content are required" }, { status: 400 });
    }

    const existing = getRecord(Number(id));
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const record = updateRecord(Number(id), String(title), String(content));
    return NextResponse.json(record);
  } catch (err) {
    console.error("[PUT /api/records]", err);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    const deleted = deleteRecord(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/records]", err);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
