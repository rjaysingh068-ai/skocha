export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { agentId, utrNumber, amount, coins } = body;

    if (!agentId || !utrNumber || !amount || !coins) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = context.env.VITE_SUPABASE_URL;
    const supabaseKey = context.env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        agent_id: agentId,
        utr_number: utrNumber,
        amount: amount,
        coins: coins,
        status: 'pending'
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    return Response.json({ success: true, message: 'Payment submitted!' });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}