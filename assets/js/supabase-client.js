// Loaded after the Supabase UMD script tag. Read-only client: anon key, RLS-restricted.
const SUPABASE_URL = 'https://vuixqisulynzefymwykw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_839RmDSKmdI8HFWVq8n1yw_v3IlgmeB';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchPracticeStatus() {
  const { data, error } = await db.from('practice_status').select('*').eq('id', 1).single();
  if (error) {
    console.error('practice_status fetch failed', error);
    return null;
  }
  return data;
}

async function fetchPublishedPosts(limit) {
  let query = db.from('posts').select('*').eq('published', true).order('published_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error('posts fetch failed', error);
    return [];
  }
  return data || [];
}

async function fetchPostBySlug(slug) {
  const { data, error } = await db.from('posts').select('*').eq('slug', slug).eq('published', true).single();
  if (error) {
    console.error('post fetch failed', error);
    return null;
  }
  return data;
}
