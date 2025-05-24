const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uhzibbllczmheqroqodl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoemliYmxsY3ptaGVxcm9xb2RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjMxNzAyNywiZXhwIjoyMDYxODkzMDI3fQ.C1NwwgDGbXs2XiBy3eYmr6pDE5M-Dr36dt-CSw6gML4'
);

const VAPID_PUBLIC_KEY = 'BKXJZHeTmU1nQBK1DDH_vtEfplqW0UYW_cz2b-oH3zez_tKPb87MShtwvUX5WBDqNl8Wun9wE9DZqAsCvuh487w';
const VAPID_PRIVATE_KEY = 'Zj6z04u-7Kf_XExm1UMBv074Oue9T82nklJZ5N6S7pM';

webpush.setVapidDetails(
  'mailto:lucanobre1@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function main(type = 'reminder') {
  let payload = {
    title: 'Lembrete EclesIA',
    body: 'Já tirou sua dúvida hoje no Chat Eclesiástico?',
    url: 'https://eclesia.vercel.app/chat'
  };

  if (type === 'verse') {
    try {
      const res = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random', {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJXZWQgQXByIDMwIDIwMjUgMjA6Mzk6MjcgR01UKzAwMDAubHVjYW5vYnJlMUBnbWFpbC5jb20iLCJpYXQiOjE3NDYwNDU1Njd9.aaxZl1VC_2Y5jfxdQYCjgTtH8NdJjdRnJooZ1YtbsY8`,
        },
      });
      const data = await res.json();
      payload = {
        title: 'Versículo do dia',
        body: data.text || 'Confira um versículo hoje!',
        url: 'https://eclesia.vercel.app/bible'
      };
    } catch {
      payload = {
        title: 'Versículo do dia',
        body: 'Confira um versículo hoje!',
        url: 'https://eclesia.vercel.app/bible'
      };
    }
  }

  const { data, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    console.error(error);
    return;
  }

  console.log('Total de subscriptions encontradas:', data.length);

  for (const sub of data) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys
        },
        JSON.stringify(payload)
      );
      console.log('Enviado para', sub.endpoint);
    } catch (err) {
      console.error('Erro ao enviar para', sub.endpoint, err.message);
    }
  }
}

main(process.argv[2]);
