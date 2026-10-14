import {pool} from './db.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
export async function collect(){
 const result={checkedAt:new Date().toISOString(),service:'roam-staging',schema:'ghw_lab',simulation:'IoT readings are synthetic; market ticks are live Coinbase data; place documents are fictional search examples.'};
 const queries={
  hypertables:"SELECT hypertable_schema,hypertable_name,num_chunks FROM timescaledb_information.hypertables WHERE hypertable_schema='ghw_lab' ORDER BY hypertable_name",
  sensors:'SELECT s.label,s.location,count(*) readings,round(avg(d.temperature)::numeric,2) avg_temp FROM ghw_lab.sensors s JOIN ghw_lab.sensor_data d ON d.sensor_id=s.id GROUP BY s.id ORDER BY s.id',
  aggregate:"SELECT bucket,sensor_id,samples,round(avg_temp::numeric,2) avg_temp,round(min_temp::numeric,2) min_temp,round(max_temp::numeric,2) max_temp FROM ghw_lab.sensor_hourly ORDER BY bucket DESC,sensor_id LIMIT 12",
  aggregateMetadata:"SELECT view_schema,view_name,materialized_only FROM timescaledb_information.continuous_aggregates WHERE view_schema='ghw_lab'",
  finance:"SELECT product,count(*) ticks,min(time) first_tick,max(time) last_tick,min(price) min_price,max(price) max_price FROM ghw_lab.market_ticks GROUP BY product ORDER BY product",
  latestTicks:'SELECT time,product,trade_id,price,bid,ask,received_at,source_url FROM ghw_lab.market_ticks ORDER BY time DESC LIMIT 8',
  vectors:'SELECT id,title,category,vector_dims(embedding) dimensions,embedding_model FROM ghw_lab.documents ORDER BY id',
  search:"SELECT title,category,round((1-(embedding<=>(SELECT embedding FROM ghw_lab.documents WHERE id='walk')))::numeric,4) similarity FROM ghw_lab.documents WHERE category='outdoors' AND created_at>now()-interval '7 days' ORDER BY embedding<=>(SELECT embedding FROM ghw_lab.documents WHERE id='walk') LIMIT 3",
  storage:"SELECT pg_size_pretty(sum(pg_total_relation_size(quote_ident(schemaname)||'.'||quote_ident(tablename)))) lab_size FROM pg_tables WHERE schemaname='ghw_lab'"
 };
 for(const [name,sql] of Object.entries(queries))result[name]=(await pool.query(sql)).rows;
 result.naturalLanguageSearch=JSON.parse(readFileSync(new URL('./evidence/search.json',import.meta.url),'utf8'));
 return result;
}
try{const result=await collect();mkdirSync(new URL('./evidence/',import.meta.url),{recursive:true});writeFileSync(new URL('./evidence/database.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await pool.end();}
