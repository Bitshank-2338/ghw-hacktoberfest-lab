import pg from 'pg';
import {readFileSync} from 'node:fs';
const envPath=process.env.TIGER_ENV_FILE || new URL('../roam/data/deployment/tiger.env',import.meta.url);
const content=process.env.DATABASE_URL?'DATABASE_URL='+process.env.DATABASE_URL:readFileSync(envPath,'utf8');
const line=content.split(/\r?\n/).find(x=>/^DATABASE_URL=/.test(x));
if(!line)throw new Error('DATABASE_URL missing from private env file');
const url=new URL(line.slice('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g,''));
for(const name of ['sslmode','sslrootcert','sslcert','sslkey'])url.searchParams.delete(name);
export const pool=new pg.Pool({connectionString:url.toString(),max:2,connectionTimeoutMillis:15000,statement_timeout:30000,ssl:{rejectUnauthorized:true,ca:readFileSync(process.env.PGSSLROOTCERT||new URL('./tiger-ca.pem',import.meta.url),'utf8')}});
