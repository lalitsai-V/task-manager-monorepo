import { NextResponse } from 'next/server'
import { createClient, getUser } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as any
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const supabase = await createClient()

    const filename = `${user.id}/${Date.now()}_${file.name}`
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'attachments'

    const arrayBuffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage.from(bucket).upload(filename, new Uint8Array(arrayBuffer), {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename)

    return NextResponse.json({ url: publicData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
