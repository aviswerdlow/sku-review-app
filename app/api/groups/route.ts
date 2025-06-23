import { NextRequest, NextResponse } from 'next/server'

// In a real app, this would use a database
// For demo purposes, we're using in-memory storage
let groups: any[] = []

export async function GET() {
  return NextResponse.json({ groups })
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  groups = data.groups
  return NextResponse.json({ success: true, count: groups.length })
}

export async function PUT(request: NextRequest) {
  const { id, updates } = await request.json()
  
  const groupIndex = groups.findIndex(g => g.id === id)
  if (groupIndex !== -1) {
    groups[groupIndex] = { ...groups[groupIndex], ...updates }
    return NextResponse.json({ success: true, group: groups[groupIndex] })
  }
  
  return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 })
}