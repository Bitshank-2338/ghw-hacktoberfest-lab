import {pool} from './db.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
export const model='nomic-embed-text';
export async function embed(text){
 const r=await fetch('http://127.0.0.1:11434/api/embed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,input:text}),signal:AbortSignal.timeout(120000)});
 if(!r.ok)throw new Error('Local embedding model unavailable');
 const v=(await r.json()).embeddings?.[0];
 if(!Array.isArray(v)||v.length!==768||v.some(x=>!Number.isFinite(x)))throw new Error('Invalid embedding response');return JSON.stringify(v);
}
const documents=[
 ['walk','Quiet garden walk','A peaceful green garden with walking trails, shade trees and benches for a relaxed outdoor stroll.','outdoors'],
 ['museum','Local history museum','A museum exhibition of archaeological artifacts, local history, culture and heritage.','culture'],
 ['cafe','Coffee and cake','A cafe serving coffee, tea and homemade cake with seating for friends.','food'],
 ['hike','Hilltop hiking route','A strenuous mountain trail with a steep climb, valley views and rocky terrain.','outdoors'],
 ['workshop','Beginner pottery workshop','A hands-on class teaching pottery, clay sculpting and ceramic craft skills.','workshop'],
 ['music','Evening jazz concert','A live music event with jazz performers and an indoor stage.','culture']
];
try{
 for(const [id,title,body,category] of documents){const vector=await embed('search_document: '+title+' '+body);await pool.query('INSERT INTO ghw_lab.documents(id,title,body,category,embedding,embedding_model) VALUES($1,$2,$3,$4,$5::vector,$6) ON CONFLICT(id) DO UPDATE SET embedding=EXCLUDED.embedding,embedding_model=EXCLUDED.embedding_model',[id,title,body,category,vector,model]);}
 const vector=await embed('search_query: A peaceful place to walk among trees');
 const results=await pool.query("SELECT title,category,1-(embedding<=>$1::vector) score FROM ghw_lab.documents WHERE category='outdoors' AND created_at>now()-interval '7 days' ORDER BY embedding<=>$1::vector LIMIT 3",[vector]);
 const result={checkedAt:new Date().toISOString(),model,dimensions:768,query:'A peaceful place to walk among trees',filters:{category:'outdoors',createdAt:'past 7 days'},results:results.rows};
 mkdirSync(new URL('./evidence/',import.meta.url),{recursive:true});writeFileSync(new URL('./evidence/search.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}catch(e){console.error(e.message);process.exitCode=1;}finally{await pool.end();}
