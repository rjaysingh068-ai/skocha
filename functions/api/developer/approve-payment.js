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
    const agentId = tx.agent_id; // yeh user_id hai
    const coinsToAdd = tx.coins;

    // Get agent profile by user_id
    const agentRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${agentId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const agentData = await agentRes.json();
    if (!agentData || agentData.length === 0) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const currentBalance = agentData[0].coinBalance || 0;
    const newBalance = currentBalance + Number(coinsToAdd);

    // Update coin balance by user_id
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ coinBalance: newBalance })
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error('Coin update failed: ' + errText);
    }

    // Mark transaction as completed
    const txUpdateRes = await fetch(`${supabaseUrl}/rest/v1/transactions?id=eq.${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: 'completed' })
    });

    if (!txUpdateRes.ok) {
      const errText = await txUpdateRes.text();
      throw new Error('Transaction status update failed: ' + errText);
    }

    return Response.json({ success: true, newBalance });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}