export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(`${supabaseUrl}/rest/v1/ads?status=eq.active&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await res.json();
    return Response.json(data);

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const payload = {
      agent_id: body.agent_id || body.agentId,
      category: body.category,
      title: body.title,
      bio: body.bio,
      photos: body.photos,
      attributes: body.attributes,
      type: body.type,
      location: body.location,
      phone: body.phone,
      status: body.status
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}