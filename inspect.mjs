import {pool} from './db.mjs';
try{
for(const [label,sql] of Object.entries({extensions:'SELECT extname,extversion FROM pg_extension',schemas:'SELECT schema_name FROM information_schema.schemata',available:"SELECT name,default_version,installed_version FROM pg_available_extensions WHERE name IN ('vector','vectorscale')",hypertables:'SELECT hypertable_schema,hypertable_name,num_chunks FROM timescaledb_information.hypertables'}))console.log(label,JSON.stringify((await pool.query(sql)).rows));
}catch(error){console.error(error.code||'connection-failed',error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[private connection]'));process.exitCode=1;}finally{await pool.end();}
