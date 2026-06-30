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
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions?id=eq.${transactionId}&select=*`, {
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

    // Get agent profile — user_id aur id dono se try karo
    let agentData = null;

    const agentRes1 = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${agentId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const data1 = await agentRes1.json();

    if (data1 && data1.length > 0) {
      agentData = data1;
    } else {
      // Fallback: id se try karo
      const agentRes2 = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${agentId}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const data2 = await agentRes2.json();
      if (data2 && data2.length > 0) {
        agentData = data2;
      }
    }

    if (!agentData || agentData.length === 0) {
      return Response.json({ error: 'Agent not found', debug: { agentId } }, { status: 404 });
    }

    const agent = agentData[0];

    // coin_balance aur coinBalance dono handle karo
    const currentBalance = Number(agent.coin_balance ?? agent.coinBalance ?? 0);
    const newBalance = currentBalance + Number(coinsToAdd);

    // coin_balance update karo (snake_case — Supabase default)
    const updatePayload = {};
    if ('coin_balance' in agent) updatePayload.coin_balance = newBalance;
    if ('coinBalance' in agent) updatePayload.coinBalance = newBalance;

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${agent.user_id || agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error('Coin update failed: ' + errText);
    }

    // Transaction status completed karo
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