const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const formatMoney = (value: number) => `LE ${Number(value || 0).toLocaleString()}`;

const escapeHtml = (value: unknown) => (
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: corsHeaders },
    );
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const configuredFrom = Deno.env.get('RESEND_FROM_EMAIL') || 'orders@tawyco.com';
  const fromEmail = configuredFrom.includes('<')
    ? configuredFrom
    : `TAWY <${configuredFrom.trim()}>`;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return Response.json(
      { error: 'RESEND_API_KEY is not configured' },
      { status: 500, headers: corsHeaders },
    );
  }

  const { orderReference, customer, items = [], total = 0 } = await request.json();

  console.log(`Sending order confirmation for ${orderReference} to ${customer?.email || 'missing email'}`);

  if (!orderReference || !customer?.email || !customer?.name) {
    console.error('Missing order reference or customer email');
    return Response.json(
      { error: 'Missing order reference or customer email' },
      { status: 400, headers: corsHeaders },
    );
  }

  const itemRows = items.map((item: Record<string, unknown>) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <strong>${escapeHtml(item.name)}</strong><br />
        <span style="color: #666;">Size: ${escapeHtml(item.size)}${item.color ? ` / Color: ${escapeHtml(item.color)}` : ''}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">
        ${escapeHtml(item.quantity)}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
        ${formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1f1f1f;">
      <h1 style="letter-spacing: 0.08em;">TAWY</h1>
      <h2>Your order was received</h2>
      <p>Hi ${escapeHtml(customer.name)},</p>
      <p>Thank you for your order. We received your order.</p>
      <p><strong>Order reference:</strong> ${escapeHtml(orderReference)}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px;">Item</th>
            <th style="text-align: center; padding-bottom: 8px;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="font-size: 18px;"><strong>Total:</strong> ${formatMoney(Number(total || 0))}</p>
      <p><strong>Payment method:</strong> Cash on delivery</p>
      <p style="color: #666;">If any detail is wrong, reply to this email or contact us directly.</p>
    </div>
  `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [customer.email],
      subject: `TAWY order confirmation ${orderReference}`,
      html,
    }),
  });

  const resendData = await resendResponse.json();

  if (!resendResponse.ok) {
    console.error('Resend rejected confirmation email', resendData);
    return Response.json(
      { error: resendData?.message || 'Unable to send confirmation email' },
      { status: 502, headers: corsHeaders },
    );
  }

  console.log(`Resend accepted confirmation email ${resendData.id}`);

  return Response.json(
    { ok: true, id: resendData.id },
    { headers: corsHeaders },
  );
});
