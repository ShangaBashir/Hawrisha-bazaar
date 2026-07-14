const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. PLACE AN ORDER (Checkout)
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { fullName, phone, secondaryPhone, province, address, notes, cart, subtotal, shippingCost, total, customerEmail, latitude, longitude } = req.body;

    if (!fullName || !phone || !province || !address || !cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required checkout fields.' });
    }

    // Generate unique order number (HW-XXXXXX)
    const orderNumber = 'HW-' + Math.floor(100000 + Math.random() * 900000);

    // Save main order
    let orderResult;
    try {
      [orderResult] = await connection.query(
        `INSERT INTO orders (order_number, full_name, phone, secondary_phone, province, address, notes, subtotal, shipping_cost, total, status, customer_email, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
        [
          orderNumber,
          fullName,
          phone,
          secondaryPhone || null,
          province,
          address,
          notes || '',
          subtotal,
          shippingCost,
          total,
          customerEmail || null,
          latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
          longitude !== undefined && longitude !== null ? parseFloat(longitude) : null
        ]
      );
    } catch (e) {
      // Fallback in case columns do not exist
      [orderResult] = await connection.query(
        `INSERT INTO orders (order_number, full_name, phone, province, address, notes, subtotal, shipping_cost, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [orderNumber, fullName, phone, province, address, notes || '', subtotal, shippingCost, total]
      );
    }

    const orderId = orderResult.insertId;

    // Auto-save address for future use if customerEmail is provided
    if (customerEmail) {
      try {
        const cityName = province;
        const streetAddress = address;
        const latVal = latitude !== undefined && latitude !== null ? parseFloat(latitude) : 0;
        const lngVal = longitude !== undefined && longitude !== null ? parseFloat(longitude) : 0;
        
        // Split full name into first and last name
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || 'Customer';

        // Check if identical address exists for this user email
        const [exists] = await connection.query(
          `SELECT id FROM user_addresses 
           WHERE user_email = ? AND city_name = ? AND street_address = ? AND latitude = ? AND longitude = ?`,
          [customerEmail, cityName.trim(), streetAddress.trim(), latVal, lngVal]
        );

        if (exists.length === 0) {
          await connection.query(
            `INSERT INTO user_addresses (user_email, first_name, last_name, phone, secondary_phone, city_name, street_address, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [customerEmail, firstName, lastName, phone.trim(), secondaryPhone ? secondaryPhone.trim() : null, cityName.trim(), streetAddress.trim(), latVal, lngVal]
          );
        }
      } catch (err) {
        console.error('Error auto-saving user address:', err);
      }
    }

    // Save order items, identifying their store_id dynamically
    for (const item of cart) {
      let storeId = item.store_id || null;
      if (!storeId) {
        const [prod] = await connection.query('SELECT store_id FROM products WHERE id = ?', [item.id]);
        if (prod.length > 0) {
          storeId = prod[0].store_id;
        }
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, store_id, product_name, price, quantity, selected_color, selected_size, selected_style)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id,
          storeId || 0,
          item.name,
          item.price,
          item.quantity,
          item.selectedColor || null,
          item.selectedSize || null,
          item.selectedStyle || null
        ]
      );

      // Deduct product stock quantity
      await connection.query(
        'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, orderNumber, message: 'Order placed successfully!' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// 2. GET ALL ORDERS FOR ADMIN
router.get('/admin', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, s.name AS store_name, p.image_url, c.name AS selected_color_name 
        FROM order_items oi 
        LEFT JOIN stores s ON oi.store_id = s.id 
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN colors c ON oi.selected_color = c.class
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET ORDERS BELONGING TO A VENDOR
router.get('/vendor', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vendor email required.' });
    }

    // Get vendor store ID
    const [users] = await db.query('SELECT store_id FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !users[0].store_id) {
      return res.status(404).json({ success: false, message: 'Vendor store not found.' });
    }
    const storeId = users[0].store_id;

    // Select all items belonging to this vendor's store, joining order info
    const [items] = await db.query(`
      SELECT oi.*, o.order_number, o.full_name, o.phone, o.province, o.address, o.notes, o.status AS order_status, o.created_at AS order_date, o.total AS order_total, o.payment_status AS payment_status, p.image_url, s.name AS store_name, c.name AS selected_color_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN stores s ON oi.store_id = s.id
      LEFT JOIN colors c ON oi.selected_color = c.class
      WHERE oi.store_id = ?
      ORDER BY o.created_at DESC
    `, [storeId]);

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3.5 GET ORDERS BY CUSTOMER EMAIL (for Account page)
router.get('/customer', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Customer email required.' });
    }

    // Try fetching by customer_email column first
    let orders = [];
    try {
      const [rows] = await db.query(
        'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
        [email.toLowerCase()]
      );
      orders = rows;
    } catch (e) {
      // customer_email column may not exist yet
      return res.json({ success: true, orders: [] });
    }

    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.image_url, s.name AS store_name, c.name AS selected_color_name 
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN stores s ON oi.store_id = s.id
         LEFT JOIN colors c ON oi.selected_color = c.class
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. UPDATE ORDER STATUS (For Admin or Vendor)
router.put('/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { status, email, role } = req.body;

    const validStatuses = ['Pending', 'Accepted', 'Delivered', 'Paid', 'Returned', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    // Fetch current order state for transition validation
    const [currentRows] = await connection.query('SELECT status FROM orders WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const currentStatus = currentRows[0].status;

    // --- STRICT TRANSITION RULES ---
    const allowedTransitions = {
      Pending:   ['Accepted', 'Cancelled'],
      Accepted:  ['Delivered', 'Cancelled'],
      Delivered: ['Paid', 'Returned'],
      Paid:      [],  // terminal
      Returned:  [],  // terminal
      Cancelled: [],  // terminal
    };
    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${currentStatus}" to "${status}". Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      });
    }

    if (role === 'vendor' && email) {
      // Vendors may only Accept or Cancel pending orders
      const vendorAllowed = ['Accepted', 'Cancelled'];
      if (!vendorAllowed.includes(status)) {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Vendors may only Accept or Cancel orders.' });
      }

      const [users] = await connection.query('SELECT store_id FROM users WHERE email = ?', [email]);
      if (users.length === 0 || !users[0].store_id) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Vendor store not found.' });
      }
      const storeId = users[0].store_id;

      // Restore stock on cancel
      if (status === 'Cancelled') {
        const [itemsToRestore] = await connection.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND store_id = ? AND status != "Cancelled"',
          [id, storeId]
        );
        for (const item of itemsToRestore) {
          await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      const [result] = await connection.query(
        'UPDATE order_items SET status = ? WHERE order_id = ? AND store_id = ?',
        [status, id, storeId]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'You do not own any products in this order.' });
      }

      await updateGlobalOrderStatus(id, connection);
      await connection.commit();
      return res.json({ success: true, message: `Your store items updated to ${status} successfully` });
    }

    // --- ADMIN PATH ---
    if (status === 'Cancelled') {
      // Restore stock
      const [itemsToRestore] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND status != "Cancelled"', [id]
      );
      for (const item of itemsToRestore) {
        await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      await connection.query('UPDATE order_items SET status = ? WHERE order_id = ?', [status, id]);

    } else if (status === 'Delivered') {
      // Mark delivered — record delivery time, payment stays unpaid until Paid action
      await connection.query(
        'UPDATE orders SET status = ?, delivered_at = NOW() WHERE id = ?', [status, id]
      );
      await connection.query('UPDATE order_items SET status = ? WHERE order_id = ?', [status, id]);

    } else if (status === 'Paid') {
      // Cash collected — mark paid
      await connection.query(
        'UPDATE orders SET status = ?, payment_status = "Paid" WHERE id = ?', [status, id]
      );
      await connection.query('UPDATE order_items SET status = ? WHERE order_id = ?', [status, id]);

    } else if (status === 'Returned') {
      // Returned — restore stock, payment stays unpaid
      const [itemsToRestore] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND status != "Cancelled"', [id]
      );
      for (const item of itemsToRestore) {
        await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      await connection.query(
        'UPDATE orders SET status = ?, payment_status = "Unpaid" WHERE id = ?', [status, id]
      );
      await connection.query('UPDATE order_items SET status = ? WHERE order_id = ?', [status, id]);

    } else {
      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      await connection.query('UPDATE order_items SET status = ? WHERE order_id = ?', [status, id]);
    }

    await connection.commit();
    res.json({ success: true, message: `Order status updated to ${status} successfully` });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});



// 4.5 UPDATE ORDER PAYMENT STATUS
router.put('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    if (!['Paid', 'Unpaid'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status value.' });
    }

    await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    res.json({ success: true, message: `Order payment status updated to ${payment_status} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// 5. GET STATS FOR ADMIN
router.get('/stats/admin', async (req, res) => {
  try {
    const [totalSalesRows] = await db.query('SELECT SUM(total) AS total_sales FROM orders WHERE status = "Paid"');
    const [totalOrdersRows] = await db.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [totalProductsRows] = await db.query('SELECT COUNT(*) AS total_products FROM products');
    const [storesCountRows] = await db.query(`
      SELECT 
        COUNT(*) AS total_stores,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_stores,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_stores,
        SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) AS suspended_stores
      FROM stores
    `);

    res.json({
      success: true,
      stats: {
        totalSales: totalSalesRows[0].total_sales || 0,
        totalOrders: totalOrdersRows[0].total_orders || 0,
        totalProducts: totalProductsRows[0].total_products || 0,
        totalStores: storesCountRows[0].total_stores || 0,
        activeStores: storesCountRows[0].active_stores || 0,
        pendingStores: storesCountRows[0].pending_stores || 0,
        suspendedStores: storesCountRows[0].suspended_stores || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET STATS FOR VENDOR
router.get('/stats/vendor', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vendor email required.' });
    }

    const [users] = await db.query('SELECT store_id FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !users[0].store_id) {
      return res.status(404).json({ success: false, message: 'Vendor store not found.' });
    }
    const storeId = users[0].store_id;

    // Vendor sales sum — count Paid
    const [salesRow] = await db.query(`
      SELECT SUM(oi.price * oi.quantity) AS total_sales, SUM(oi.quantity) AS items_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.store_id = ? AND o.status = 'Paid'
    `, [storeId]);

    // Unique orders count
    const [ordersRow] = await db.query(`
      SELECT COUNT(DISTINCT oi.order_id) AS total_orders
      FROM order_items oi
      WHERE oi.store_id = ?
    `, [storeId]);

    // Products count
    const [productsRow] = await db.query(`
      SELECT COUNT(*) AS total_products
      FROM products
      WHERE store_id = ?
    `, [storeId]);

    // Sales by product chart/data — count Paid
    const [productSales] = await db.query(`
      SELECT oi.product_name, SUM(oi.price * oi.quantity) AS sales, SUM(oi.quantity) AS quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.store_id = ? AND o.status = 'Paid'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY sales DESC
    `, [storeId]);

    res.json({
      success: true,
      stats: {
        totalSales: salesRow[0].total_sales || 0,
        itemsSold: salesRow[0].items_sold || 0,
        totalOrders: ordersRow[0].total_orders || 0,
        totalProducts: productsRow[0].total_products || 0,
        productSales: productSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. CUSTOMER ORDER CANCELLATION
router.post('/:id/customer-cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = orders[0];

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    const [settings] = await db.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = "order_cancellation_limit_minutes"'
    );
    const limitMinutes = settings.length > 0 ? parseInt(settings[0].setting_value, 10) : 15;

    const orderTime = new Date(order.created_at).getTime();
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - orderTime) / (1000 * 60);

    if (elapsedMinutes > limitMinutes) {
      return res.status(400).json({ 
        success: false, 
        message: `The cancellation period of ${limitMinutes} minutes has expired.` 
      });
    }

    const [itemsToRestore] = await db.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND status != "Cancelled"',
      [id]
    );
    for (const item of itemsToRestore) {
      await db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await db.query('UPDATE orders SET status = "Cancelled" WHERE id = ?', [id]);
    await db.query('UPDATE order_items SET status = "Cancelled" WHERE order_id = ?', [id]);

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully.' 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function updateGlobalOrderStatus(orderId, conn) {
  const db_conn = conn || db;
  const [items] = await db_conn.query('SELECT status FROM order_items WHERE order_id = ?', [orderId]);
  if (items.length === 0) return;

  const statuses = items.map(item => item.status || 'Pending');

  let finalStatus = 'Pending';
  if (statuses.every(s => s === 'Cancelled')) {
    finalStatus = 'Cancelled';
  } else if (statuses.every(s => s === 'Paid')) {
    finalStatus = 'Paid';
    await db_conn.query(
      "UPDATE orders SET status = 'Paid', payment_status = 'Paid' WHERE id = ?",
      [orderId]
    );
    return;
  } else if (statuses.every(s => s === 'Returned')) {
    finalStatus = 'Returned';
  } else if (statuses.every(s => s === 'Delivered' || s === 'Paid' || s === 'Returned')) {
    finalStatus = 'Delivered';
  } else if (statuses.every(s => ['Accepted', 'Delivered', 'Paid', 'Returned', 'Cancelled'].includes(s))) {
    finalStatus = 'Accepted';
  }

  await db_conn.query('UPDATE orders SET status = ? WHERE id = ?', [finalStatus, orderId]);
}

module.exports = router;
