import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const file=process.env.TIGER_ENV_FILE||new URL('../roam/data/deployment/tiger.env',import.meta.url);
const line=(process.env.DATABASE_URL?'DATABASE_URL='+process.env.DATABASE_URL:readFileSync(file,'utf8')).split(/\r?\n/).find(x=>x.startsWith('DATABASE_URL='));
if(!line)throw new Error('Missing private connection file');
const url=new URL(line.slice(13).trim().replace(/^['"]|['"]$/g,''));
const sql="SELECT hypertable_schema,hypertable_name,num_chunks FROM timescaledb_information.hypertables WHERE hypertable_schema='ghw_lab'; SELECT count(*) AS sensor_readings FROM ghw_lab.sensor_data; SELECT count(*) AS captured_market_ticks FROM ghw_lab.market_ticks;";
// The existing password goes only to the official CLI subprocess's environment.
// No password flag, command-line connection URI, logging or persistent keyring write.
const result=spawnSync('tiger.exe',['db','query','gzguj1cut1','--read-only','--password-storage=none','--timeout','30s','--analytics=false','--version-check=false','-o','json','-c',sql],{encoding:'utf8',timeout:60000,env:{...process.env,PGPASSWORD:decodeURIComponent(url.password),PGSSLMODE:'verify-full',PGSSLROOTCERT:process.env.PGSSLROOTCERT||fileURLToPath(new URL('./tiger-ca.pem',import.meta.url))}});
if(result.status!==0){console.error(result.stderr||'CLI query failed');process.exitCode=1;}
else{mkdirSync(new URL('./evidence/',import.meta.url),{recursive:true});const record={checkedAt:new Date().toISOString(),command:'tiger db query gzguj1cut1 --read-only --password-storage=none',sql,stdout:result.stdout};writeFileSync(new URL('./evidence/cli-query.json',import.meta.url),JSON.stringify(record,null,2));console.log(result.stdout);}
