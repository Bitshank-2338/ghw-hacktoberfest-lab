import {pool} from './db.mjs';
// Public market data only. No account, private trading key or order endpoint.
const endpoint='wss://ws-feed.exchange.coinbase.com';
const maxTicks=Number(process.env.MAX_TICKS||100),durationMs=Number(process.env.STREAM_MS||45000);
let socket,received=0,inserted=0,queue=Promise.resolve();
try{
 await new Promise((resolve,reject)=>{
  socket=new WebSocket(endpoint);const timer=setTimeout(()=>{socket.close();resolve();},durationMs);
  socket.addEventListener('open',()=>socket.send(JSON.stringify({type:'subscribe',product_ids:['BTC-USD','ETH-USD'],channels:['ticker']})));
  socket.addEventListener('message',event=>{
   const tick=JSON.parse(event.data);if(tick.type==='error'){clearTimeout(timer);reject(new Error(tick.message));return;}
   if(tick.type!=='ticker'||!tick.time||!tick.trade_id||!['BTC-USD','ETH-USD'].includes(tick.product_id))return;
   received++;
   queue=queue.then(async()=>{
    const result=await pool.query('INSERT INTO ghw_lab.market_ticks(time,product,trade_id,price,size,bid,ask,source_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',[tick.time,tick.product_id,String(tick.trade_id),tick.price,tick.last_size||'0',tick.best_bid||null,tick.best_ask||null,endpoint]);inserted+=result.rowCount;
   });
   if(received>=maxTicks){clearTimeout(timer);socket.close();resolve();}
  });
  socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Public market WebSocket unavailable'));});
  socket.addEventListener('close',()=>{clearTimeout(timer);resolve();});
 });
 await queue;
 console.log(JSON.stringify({source:endpoint,received,inserted,checkedAt:new Date().toISOString()}));
 if(!received)throw new Error('No live market ticks received; do not mark challenge complete');
}catch(e){console.error(e.message);process.exitCode=1;}finally{socket?.close();await pool.end();}
