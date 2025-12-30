import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const collectionId = searchParams.get('collection_id')
  const tag = searchParams.get('tag')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  let query = supabase
    .from('presets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (collectionId) {
    query = query.eq('collection_id', collectionId)
  }
  
  if (tag) {
    query = query.contains('tags', [tag])
  }
  
  query = query.range(offset, offset + limit - 1)
  
  const { data: presets, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  // Get total count
  const { count } = await supabase
    .from('presets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  return NextResponse.json({ presets: presets || [], total: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { name, description, config, collectionId, tags, isShared } = body
  
  if (!name || !config) {
    return NextResponse.json({ error: 'Name and config are required' }, { status: 400 })
  }
  
  const { data: preset, error } = await supabase
    .from('presets')
    .insert({
      user_id: user.id,
      name,
      description,
      config,
      collection_id: collectionId,
      tags: tags || [],
      is_shared: isShared || false,
      sync_status: 'synced',
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(preset, { status: 201 })
}
