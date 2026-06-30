export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const url = new URL(context.request.url);
    const devId = url.searchParams.get('devId');

    // Verify developer
    const devRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${devId}&role=eq.developer`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const devData = await devRes.json();
    if (!devData || devData.length === 0) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all profiles
    const profilesRes = await fetch(`${supabaseUrl}/rest/v1/profiles?order=created_at.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const profiles = await profilesRes.json();

    // Fetch all transactions
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?order=created_at.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const transactions = await txRes.json();

    // Fetch ads count
    const adsRes = await fetch(`${supabaseUrl}/rest/v1/ads?status=eq.active&select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });
    const adsData = await adsRes.json();

    // Map profiles
    const mappedProfiles = profiles.map(p => ({
      ...p,
      coinBalance: p.coinBalance || p.coin_balance || 0,
      isDeveloper: p.role === 'developer',
      createdAt: p.created_at
    }));

    // Build email lookup from profiles
    const emailMap = {};
    profiles.forEach(p => {
      emailMap[p.user_id] = p.email;
    });

    // Map transactions — id explicitly + email from profiles
    const mappedTx = transactions.map(tx => ({
      ...tx,
      id: tx.id,
      agentId: tx.agent_id,
      agentEmail: emailMap[tx.agent_id] || tx.agent_id,
      utrNumber: tx.utr_number,
      coins: tx.coins,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.created_at
    }));

    return Response.json({
      profiles: mappedProfiles,
      transactions: mappedTx,
      adsCount: Array.isArray(adsData) ? adsData.length : 0
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}