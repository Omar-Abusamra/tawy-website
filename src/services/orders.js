import { invokeSupabaseFunction, isSupabaseConfigured, supabaseRequest } from './supabaseRest';

const ORDER_EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/tawy.co@gmail.com';

const formatMoney = (value) => `LE ${Number(value || 0).toLocaleString()}`;

const formatOrderItems = (items) => (
  items.map((item, index) => {
    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
    return [
      `${index + 1}. ${item.name}`,
      `Brand: ${item.brand || 'TAWY'}`,
      `Size: ${item.size}`,
      item.color ? `Color: ${item.color}` : null,
      `Quantity: ${item.quantity}`,
      item.price > 0 ? `Unit price: ${formatMoney(item.price)}` : 'Unit price: Complimentary',
      `Line total: ${formatMoney(lineTotal)}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n')
);

const createOrderId = () => (
  crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const submitOrderEmail = async ({ orderReference, customer, items, total }) => {
  const formData = new FormData();

  formData.append('_subject', `New COD Order ${orderReference}`);
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');
  formData.append('order_reference', orderReference);
  formData.append('payment_method', 'Cash on delivery');
  formData.append('customer_name', customer.name);
  formData.append('customer_phone', customer.phone);
  formData.append('customer_email', customer.email || 'Not provided');
  formData.append('delivery_city', customer.city);
  formData.append('delivery_address', customer.address);
  formData.append('notes', customer.notes || 'None');
  formData.append('order_items', formatOrderItems(items));
  formData.append('order_total', formatMoney(total));

  const response = await fetch(ORDER_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Unable to submit order');
  }

  return { orderReference };
};

const submitOrderToSupabase = async ({ orderReference, customer, items, total }) => {
  const orderId = createOrderId();

  await supabaseRequest('orders', {
    method: 'POST',
    body: [{
      id: orderId,
      order_reference: orderReference,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || null,
      delivery_city: customer.city,
      delivery_address: customer.address,
      delivery_notes: customer.notes || null,
      payment_method: 'cod',
      payment_status: 'pending',
      status: 'pending',
      total_amount: Number(total || 0),
    }],
  });

  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    product_slug: item.slug,
    product_name: item.name,
    brand: item.brand || 'TAWY',
    selected_size: item.size,
    selected_color: item.color || null,
    quantity: Number(item.quantity || 0),
    unit_price: Number(item.price || 0),
    line_total: Number(item.price || 0) * Number(item.quantity || 0),
  }));

  if (orderItems.length > 0) {
    await supabaseRequest('order_items', {
      method: 'POST',
      body: orderItems,
    });
  }

  return { orderReference };
};

const sendCustomerConfirmationEmail = async ({ orderReference, customer, items, total }) => {
  if (!customer.email) return;

  await invokeSupabaseFunction('send-order-confirmation', {
    orderReference,
    customer,
    items,
    total,
  });
};

export const submitCashOnDeliveryOrder = async ({ customer, items, total }) => {
  const orderReference = `TAWY-${Date.now()}`;

  if (isSupabaseConfigured) {
    try {
      const result = await submitOrderToSupabase({ orderReference, customer, items, total });

      try {
        await submitOrderEmail({ orderReference, customer, items, total });
      } catch (emailError) {
        console.warn('Order was saved, but email notification failed:', emailError);
      }

      try {
        await sendCustomerConfirmationEmail({ orderReference, customer, items, total });
      } catch (confirmationError) {
        console.warn('Order was saved, but customer confirmation email failed:', confirmationError);
      }

      return result;
    } catch (databaseError) {
      console.warn('Supabase order submission failed, using email fallback:', databaseError);
    }
  }

  return submitOrderEmail({ orderReference, customer, items, total });
};
