import test from 'node:test';
import assert from 'node:assert/strict';
import {pool} from './db.mjs';
test.after(()=>pool.end());
test('IoT rows have consistent metadata and plausible bounds',async()=>{
 const {rows:[r]}=await pool.query('SELECT count(*) n,count(DISTINCT sensor_id) devices,bool_and(humidity BETWEEN 0 AND 100 AND temperature BETWEEN 15 AND 35) valid FROM ghw_lab.sensor_data');
 assert.ok(Number(r.n)>=1156);assert.equal(Number(r.devices),4);assert.equal(r.valid,true);
});
test('time partitioning created real chunks',async()=>{
 const r=await pool.query("SELECT num_chunks FROM timescaledb_information.hypertables WHERE hypertable_schema='ghw_lab' AND hypertable_name='sensor_data'");assert.equal(r.rowCount,1);assert.ok(r.rows[0].num_chunks>=4);
});
test('continuous aggregate matches raw hourly metrics including current bucket',async()=>{
 const r=await pool.query("SELECT count(*) mismatches FROM (SELECT time_bucket(interval '1 hour',time) bucket,sensor_id,count(*) samples,avg(temperature) avg_temp FROM ghw_lab.sensor_data GROUP BY 1,2) raw FULL JOIN ghw_lab.sensor_hourly agg USING(bucket,sensor_id) WHERE raw.samples IS DISTINCT FROM agg.samples OR abs(raw.avg_temp-agg.avg_temp)>0.00001");assert.equal(Number(r.rows[0].mismatches),0);
});
test('finance data is sourced and deduplication survives replay',async()=>{
 const client=await pool.connect();try{
 await client.query('BEGIN');const {rows:[row]}=await client.query('SELECT * FROM ghw_lab.market_ticks LIMIT 1');assert.ok(row);assert.ok(row.source_url.includes('ws-feed.exchange.coinbase.com'));assert.ok(Number(row.price)>0);
 const r=await client.query('INSERT INTO ghw_lab.market_ticks SELECT * FROM ghw_lab.market_ticks LIMIT 1 ON CONFLICT DO NOTHING');assert.equal(r.rowCount,0);
 }finally{await client.query('ROLLBACK');client.release();}
});
test('all six documents have real model embeddings and metadata',async()=>{
 const {rows:[r]}=await pool.query("SELECT count(*) n,bool_and(vector_dims(embedding)=768 AND embedding_model='nomic-embed-text') valid FROM ghw_lab.documents");assert.equal(Number(r.n),6);assert.equal(r.valid,true);
 const {rows}=await pool.query("SELECT title FROM ghw_lab.documents WHERE category='outdoors' AND created_at>now()-interval '7 days' ORDER BY embedding<=>(SELECT embedding FROM ghw_lab.documents WHERE id='walk')");assert.equal(rows.length,2);assert.equal(rows[0].title,'Quiet garden walk');
});
