import http from 'http';

const opts = { hostname: 'localhost', port: 11435, path: '/v1/models', method: 'GET' };

const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode);
  const arr = [];
  res.on('data', c => arr.push(c));
  res.on('end', () => console.log('BODY', Buffer.concat(arr).toString('utf8').slice(0,2000)));
});
req.on('error', e => console.error('ERR', e.message));
req.end();
