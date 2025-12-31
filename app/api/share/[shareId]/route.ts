import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient()
  const { shareId } = await params

  const { data: script, error } = await supabase
    .from('scripts')
    .select(`
      *,
      author:user_id(email, display_name, avatar_url)
    `)
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single()

  if (error || !script) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    share_id: shareId,
    script: {
      id: script.id,
      title: script.title,
      content: script.content,
      bg_url: script.bg_url,
      music_url: script.music_url,
      settings: script.settings
    },
    author: {
      display_name: script.author?.display_name,
      avatar_url: script.author?.avatar_url
    },
    shared_at: script.updated_at
  })
}