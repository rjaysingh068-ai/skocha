export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const agentId = new URL(context.request.url).searchParams.get('agentId');
    if (!agentId) {
      return Response.json({ error: 'agentId required' }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${agentId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await res.json();
    if (!data || data.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = data[0];
    return Response.json({
      id: profile.id,
      email: profile.email,
      coinBalance: profile.coinBalance || 0,
      isDeveloper: profile.role === 'developer',
      createdAt: profile.created_at,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}