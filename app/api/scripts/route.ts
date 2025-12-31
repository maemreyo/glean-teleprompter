import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'updated_at'
  const order = searchParams.get('order') || 'desc'

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('scripts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order === 'asc' })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    scripts: data || [],
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('scripts')
    .insert({
      user_id: user.id,
      title: body.title || 'Untitled',
      content: body.content || '',
      bg_url: body.bg_url,
      music_url: body.music_url,
      settings: body.settings || {},
      is_public: body.is_public || false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}