-- GHW lab only. Never writes Roam's public tables.
CREATE SCHEMA IF NOT EXISTS ghw_lab;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS ghw_lab.sensors(id integer PRIMARY KEY, label text NOT NULL, location text NOT NULL);
INSERT INTO ghw_lab.sensors VALUES(1,'Trail entrance','outdoors'),(2,'Workshop room','indoors'),(3,'Garden corner','outdoors'),(4,'Cafe patio','outdoors') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS ghw_lab.sensor_data(
 time timestamptz NOT NULL,sensor_id integer NOT NULL REFERENCES ghw_lab.sensors(id),
 temperature double precision NOT NULL,humidity double precision NOT NULL,
 PRIMARY KEY(time,sensor_id),CHECK(humidity BETWEEN 0 AND 100));
SELECT create_hypertable('ghw_lab.sensor_data','time',chunk_time_interval=>interval '6 hours',if_not_exists=>true);
-- Deterministic synthetic data, explicitly labelled as simulation in the UI.
INSERT INTO ghw_lab.sensor_data
SELECT t,s.id,22+s.id+3*sin(extract(epoch FROM t)/3600),50+10*cos(extract(epoch FROM t)/2700+s.id)
FROM generate_series(date_trunc('hour',now())-interval '24 hours',date_trunc('hour',now()),interval '5 minutes') t CROSS JOIN ghw_lab.sensors s
ON CONFLICT DO NOTHING;
CREATE MATERIALIZED VIEW IF NOT EXISTS ghw_lab.sensor_hourly
WITH(timescaledb.continuous,timescaledb.materialized_only=false) AS
SELECT time_bucket(interval '1 hour',time) bucket,sensor_id,count(*) samples,
 avg(temperature) avg_temp,min(temperature) min_temp,max(temperature) max_temp,avg(humidity) avg_humidity
FROM ghw_lab.sensor_data GROUP BY bucket,sensor_id WITH NO DATA;
CREATE TABLE IF NOT EXISTS ghw_lab.market_ticks(
 time timestamptz NOT NULL,product text NOT NULL,trade_id bigint NOT NULL,
 price numeric NOT NULL,size numeric NOT NULL,bid numeric,ask numeric,
 received_at timestamptz NOT NULL DEFAULT now(),source_url text NOT NULL,
 PRIMARY KEY(time,product,trade_id));
SELECT create_hypertable('ghw_lab.market_ticks','time',chunk_time_interval=>interval '1 day',if_not_exists=>true);
CREATE TABLE IF NOT EXISTS ghw_lab.documents(
 id text PRIMARY KEY,title text NOT NULL,body text NOT NULL,category text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),embedding vector(768),embedding_model text NOT NULL);
