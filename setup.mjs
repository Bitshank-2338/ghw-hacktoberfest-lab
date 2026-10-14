import {pool} from './db.mjs';
import {readFileSync} from 'node:fs';
try{
await pool.query(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
await pool.query("CALL refresh_continuous_aggregate('ghw_lab.sensor_hourly',now()-interval '25 hours',date_trunc('hour',now()))");
const checks=await pool.query("SELECT sensor_id,count(*) n FROM ghw_lab.sensor_data GROUP BY sensor_id ORDER BY sensor_id");
console.log('Isolated lab ready:',JSON.stringify(checks.rows));
}catch(e){console.error(e.code,e.message);process.exitCode=1;}finally{await pool.end();}
