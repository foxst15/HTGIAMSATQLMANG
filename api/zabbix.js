export default async function handler(req, res) {
  // Cấu hình CORS cho Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Bỏ qua request OPTIONS (Preflight của trình duyệt)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận method POST' });
  }

  // Vercel lấy biến môi trường
  const ZABBIX_URL = process.env.ZABBIX_API_URL;
  const ZABBIX_TOKEN = process.env.ZABBIX_API_TOKEN;

  if (!ZABBIX_URL || !ZABBIX_TOKEN) {
    return res.status(500).json({ error: 'Chưa cấu hình biến môi trường ZABBIX_API_URL hoặc ZABBIX_API_TOKEN trên Vercel.' });
  }

  try {
    const { method, params } = req.body;
    
    // Đóng gói data theo chuẩn JSON-RPC của Zabbix
    const payload = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      auth: ZABBIX_TOKEN,
      id: Date.now(),
    };

    // Gọi lên máy chủ Zabbix
    const response = await fetch(ZABBIX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json-rpc' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
