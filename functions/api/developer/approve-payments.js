export async function onRequestPost(context) {
  try {
    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const body = await context.request.json();
    const { devId, transactionId } = body;

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

    // Get transaction details
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?id=eq.${transactionId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const txData = await txRes.json();
    if (!txData || txData.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const tx = txData[0];
    const agentId = tx.agent_id;
    const coinsToAdd = tx.coins;

    // Get agent current balance
    const agentRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${agentId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const agentData = await agentRes.json();
    if (!agentData || agentData.length === 0) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const currentBalance = agentData[0].coinBalance || agentData[0].coin_balance || 0;
    const newBalance = currentBalance + Number(coinsToAdd);

    // Update agent coin balance
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ coinBalance: newBalance })
    });

    // Mark transaction as completed
    await fetch(`${supabaseUrl}/rest/v1/transactions?id=eq.${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: 'completed' })
    });

    return Response.json({ success: true, newBalance });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}