# Global Hack Week: Tiger Data Lab + DataPulse

Working time-series, live-market and vector-search exercises for Global Hack Week: Hacktoberfest, 9–15 October 2026. Lab implemented and verified on 14 October. DataPulse was generated with GitHub Copilot on 10 October and rechecked on 14 October.

## What actually ran

All database exercises use a real free Tiger Data PostgreSQL service with TimescaleDB 2.30.2 and pgvector 0.8.7. An isolated `ghw_lab` schema avoids the application's existing tables.

* `sensor_data`: time-partitioned hypertable, five chunks, 1,156 explicitly simulated readings across four sensor metadata records.
* `sensor_hourly`: genuine Timescale continuous aggregate of hourly sample count, average, minimum and maximum temperature; completed buckets were manually refreshed. Real-time aggregation is enabled for newer raw readings. No recurring refresh policy was created.
* `market_ticks`: 100 actual BTC-USD / ETH-USD ticks captured from Coinbase's public ticker WebSocket, deduplicated by time/product/trade ID. The capture is bounded, stops after 100 accepted events or 45 seconds, and performs no trading. It is not a lossless or always-running market archive.
* `documents`: six fictional place descriptions encoded locally with the real `nomic-embed-text` embedding model through Ollama, each 768 dimensions. Cosine-similarity search uses category and seven-day filters. The query “A peaceful place to walk among trees” ranked Quiet garden walk (0.7548) above Hilltop hiking route (0.5547).
* `evidence/database.json`: dated, credential-free results queried from the live database. The evidence dashboard displays this saved snapshot, rather than pretending to be the Tiger console or a live monitoring service.
* `datapulse/`: the original Copilot-generated static demo. Its fixture has 12 synthetic readings and a separate illustrative chart. Sample generation jitters those readings; the chart's date-range control changes a label rather than querying historical data. Its login is a local form demo, not authentication. No networked IoT devices or production account system are claimed.

## Run

Node.js 24+, an existing Tiger Data service and Ollama are required. No paid service is created by these scripts.

```powershell
npm ci --ignore-scripts
# Set DATABASE_URL privately in this shell, or set TIGER_ENV_FILE to a private .env file.
# Do not commit the file or paste the connection string into submissions.
$env:PGSSLROOTCERT = '<path to the verified Tiger CA certificate>'
npm run setup
ollama pull nomic-embed-text
npm run embed
npm run finance
npm test
npm run evidence
npm start
```

Open http://127.0.0.1:4181/ for the database evidence and http://127.0.0.1:4181/datapulse/ for DataPulse. DataPulse can also run by opening `datapulse/index.html` directly.

`db.mjs` loads DATABASE_URL from the shell or TIGER_ENV_FILE. In the original Roam workspace only, it falls back to the existing private sibling deployment file. Database credentials never enter the dashboard. TLS chain and hostname verification stay enabled. The included public Tiger CA was bootstrapped for the earlier Roam connection using trust on first use; its provenance is not a public CA endorsement. Validate the certificate through your service's official connection instructions before reusing it. Set PGSSLROOTCERT to your verified certificate as needed.

The lab is small (184 kB of table/index storage at verification). There is no retention job, hosted AI service or automatic background ingestion. Stop the local server with Ctrl+C. Provisioning paid resources is outside this lab.

## Verification

Five database tests passed: sensor bounds/metadata, genuine time chunks, continuous aggregate vs raw metrics, finance replay deduplication, and populated model vectors with metadata filtering. DataPulse JavaScript syntax and browser filtering, generation, reset and pagination were checked separately. Browser screenshots are actual running pages.

## AI disclosure and challenge limits

Codex generated the database lab, verification scripts and evidence dashboard. GitHub Copilot generated the original DataPulse app; its authenticated session and original files were inspected, rather than attributing Codex output to Copilot. Codex's public copy corrects the sample-generation toast and documents demo limitations. `nomic-embed-text` is used at runtime for embeddings. Desktop Cursor and Grok Bot work remains the participant's responsibility until actual tool-specific evidence is supplied.

Eight challenge entries were submitted to MLH with participant approval on 14 October: the five database exercises, two Copilot challenges and current Student Pack evidence. The [Copilot build Discussion](https://github.com/Bitshank-2338/ghw-hacktoberfest-lab/discussions/1) is published.

The Tiger CLI owner account was located and official OAuth authorization completed with explicit approval. Its session selects the correct existing project. After a temporary DNS failure recovered, `cli-query.mjs` successfully ran a read-only query through the actual official CLI: two lab hypertables, 1,156 sensor readings and 100 captured market ticks. The dated result is in evidence/cli-query.json. The helper supplies the existing password only in the subprocess environment; it does not persist a database password, weaken TLS checks, change system DNS or modify application data.

## Participant's Cursor builds

The cursor folder preserves two actual tip-calculator builds created in Cursor with Grok 4.7 High Fast and Grok 4.6 High Fast. See [the independent analysis](cursor/analysis.md) for prompts, normal-case checks and observed rounding/overflow limitations. Their original prompts differed, so these original builds alone are not claimed as a controlled same-prompt benchmark.

## References

* [Simulate IoT sensor data — Tiger Data](https://www.tigerdata.com/docs/learn/tutorials/simulate-iot-sensor-data)
* [Simulate an IoT sensor dataset — Tiger Data on DEV](https://dev.to/tigerdata/simulate-an-iot-sensor-dataset-45fj)
* [Understand continuous aggregates — Tiger Data](https://www.tigerdata.com/docs/learn/continuous-aggregates)
* [Refresh continuous aggregate — Tiger Data](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/refresh_continuous_aggregate)
* [Public ticker channel — Coinbase](https://docs.cdp.coinbase.com/exchange/websocket-feed/channels)
* [pgvector — official repository](https://github.com/pgvector/pgvector)

MIT license. No credentials, private Roam posts or uploaded user media are included.
