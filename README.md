# KLA Escalation Command Center

AI-powered field service operations dashboard for KLA's global DUV/EUV semiconductor scanner fleet. Built with React + TypeScript and powered by Snowflake Cortex AI.

## Demo Scenario

A 193nm DUV laser power degradation is detected at Samsung Pyeongtaek. The system autonomously diagnoses the root cause (crystal batch B-2024-X), sources replacement parts across 4 global warehouses, runs trade compliance checks, and manages the escalation through resolution.

## Prerequisites

- **Node.js** >= 18 (tested with v20)
- **npm** >= 9
- **Docker** (only for SPCS deployment)
- **Snowflake account** with Cortex AI enabled (for live agent mode)

## Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/sfc-gh-kjilla/kla_suuply_chain_demo.git
cd kla_suuply_chain_demo/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

The app runs in **demo mode** by default with mock data — no Snowflake connection required.

### Enable Live Cortex Agent (Optional)

To connect to a real Snowflake Cortex Agent:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SNOWFLAKE_ACCOUNT_URL=https://your-account.snowflakecomputing.com
VITE_SNOWFLAKE_PAT=your-personal-access-token
```

Generate a PAT at: Snowsight > Profile > Personal Access Tokens.

## Snowflake Backend Setup

The Snowflake objects live in `KLA_SUPPLY_CHAIN.APP`. To recreate them in your account:

### 1. Create Tables

```sql
CREATE DATABASE IF NOT EXISTS KLA_SUPPLY_CHAIN;
CREATE SCHEMA IF NOT EXISTS KLA_SUPPLY_CHAIN.APP;
```

Run the setup script to create all 16 tables:

```bash
-- See optimization/setup_tables.sql for table DDLs
-- See optimization/seed_data.py for sample data insertion
```

### 2. Create Stored Procedure

```bash
-- See snowflake/ship_part_procedure.sql
```

### 3. Cortex AI Objects

These require Cortex AI features enabled on your account:

- **Semantic View**: `KLA_SCANNER_INTELLIGENCE` — text-to-SQL over scanner data
- **Cortex Search Service**: `TECHNICAL_DOCS_SEARCH` — RAG over 8 technical docs
- **Cortex Agent**: `KLA_DIAGNOSTIC_AGENT` — 3-tool agent (scanner_analyst, tech_docs_search, ship_part)

## SPCS Deployment (Snowpark Container Services)

Deploy the app to Snowflake so it's accessible via a public URL with Snowflake auth.

### 1. Create Image Repository

```sql
USE ROLE ACCOUNTADMIN;
CREATE IMAGE REPOSITORY IF NOT EXISTS KLA_SUPPLY_CHAIN.APP.IMAGE_REPO;
SHOW IMAGE REPOSITORIES IN SCHEMA KLA_SUPPLY_CHAIN.APP;
-- Note the repository_url from the output
```

### 2. Build and Push Docker Image

```bash
cd frontend

# Login to Snowflake registry
snow spcs image-registry login --connection <your_connection>

# Build for linux/amd64
docker build --platform linux/amd64 -t kla-escalation-center:latest .

# Tag and push (replace <registry_url> with your repository_url)
docker tag kla-escalation-center:latest <registry_url>/kla-escalation-center:latest
docker push <registry_url>/kla-escalation-center:latest
```

### 3. Create Compute Pool (if needed)

```sql
CREATE COMPUTE POOL IF NOT EXISTS KLA_COMPUTE_POOL
  MIN_NODES = 1
  MAX_NODES = 1
  INSTANCE_FAMILY = CPU_X64_XS;
```

### 4. Create Service

```sql
CREATE SERVICE KLA_SUPPLY_CHAIN.APP.ESCALATION_CENTER
  IN COMPUTE POOL KLA_COMPUTE_POOL
  FROM SPECIFICATION $$
spec:
  containers:
  - name: app
    image: /kla_supply_chain/app/image_repo/kla-escalation-center:latest
    resources:
      requests:
        memory: 512Mi
        cpu: 250m
      limits:
        memory: 1Gi
        cpu: 500m
    readinessProbe:
      port: 8080
      path: /
  endpoints:
  - name: dashboard
    port: 8080
    public: true
$$
  MIN_INSTANCES = 1
  MAX_INSTANCES = 1;
```

### 5. Check Status and Get URL

```sql
SELECT SYSTEM$GET_SERVICE_STATUS('KLA_SUPPLY_CHAIN.APP.ESCALATION_CENTER');
SHOW ENDPOINTS IN SERVICE KLA_SUPPLY_CHAIN.APP.ESCALATION_CENTER;
```

### 6. Grant Access to Users

```sql
-- Create a role for demo users
CREATE ROLE IF NOT EXISTS KLA_DEMO_ROLE;

-- Grant required privileges
GRANT USAGE ON DATABASE KLA_SUPPLY_CHAIN TO ROLE KLA_DEMO_ROLE;
GRANT USAGE ON SCHEMA KLA_SUPPLY_CHAIN.APP TO ROLE KLA_DEMO_ROLE;
GRANT USAGE ON WAREHOUSE <your_warehouse> TO ROLE KLA_DEMO_ROLE;
GRANT USAGE ON COMPUTE POOL KLA_COMPUTE_POOL TO ROLE KLA_DEMO_ROLE;
GRANT SELECT ON ALL TABLES IN SCHEMA KLA_SUPPLY_CHAIN.APP TO ROLE KLA_DEMO_ROLE;
GRANT SELECT ON FUTURE TABLES IN SCHEMA KLA_SUPPLY_CHAIN.APP TO ROLE KLA_DEMO_ROLE;
GRANT SERVICE ROLE KLA_SUPPLY_CHAIN.APP.ESCALATION_CENTER!ALL_ENDPOINTS_USAGE TO ROLE KLA_DEMO_ROLE;

-- Create a user
CREATE USER <username>
  PASSWORD = '<password>'
  DEFAULT_ROLE = KLA_DEMO_ROLE
  DEFAULT_WAREHOUSE = <your_warehouse>
  DEFAULT_NAMESPACE = KLA_SUPPLY_CHAIN.APP
  MUST_CHANGE_PASSWORD = FALSE;

GRANT ROLE KLA_DEMO_ROLE TO USER <username>;
```

### Updating the Service

After code changes, rebuild and push the image, then:

```sql
ALTER SERVICE KLA_SUPPLY_CHAIN.APP.ESCALATION_CENTER FROM SPECIFICATION $$
-- paste full spec YAML here
$$;
```

## Project Structure

```
├── frontend/               # React + TypeScript app (Vite)
│   ├── src/
│   │   ├── components/     # UI components (18 total)
│   │   ├── context/        # ThemeContext (light/dark mode)
│   │   ├── hooks/          # useAgentChat (Cortex Agent integration)
│   │   ├── services/       # API layer, mock data, Cortex Agent client
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile          # Multi-stage build (Node → nginx)
│   └── nginx.conf          # SPA routing config
├── snowflake/              # Snowflake SQL objects
│   └── ship_part_procedure.sql
├── optimization/           # Inventory optimization scripts
│   ├── setup_tables.sql    # Table DDLs
│   └── seed_data.py        # Sample data
├── screenshots/            # Dashboard screenshots (light mode)
├── outputs/                # Generated PPTX presentation
├── capture_screenshots.js  # Playwright screenshot automation
├── create_pptx.py          # PowerPoint generation script
└── record_demo.js          # Demo video recording script
```

## Theme

The app supports light and dark mode. Toggle via the button in the header. Theme preference is stored in `localStorage` under key `kla-theme`.

KLA brand colors: Purple `#5B2D83` / `#7B3FA0`, Teal `#00A0C8`.

## Key Snowflake Features Demonstrated

| Feature | Usage |
|---------|-------|
| Cortex Agent | 3-tool AI agent for diagnostics, search, and part shipping |
| Cortex Analyst | Text-to-SQL via KLA_SCANNER_INTELLIGENCE semantic view |
| Cortex Search | RAG over technical documentation (snowflake-arctic-embed-m-v1.5) |
| Stored Procedures | SHIP_PART for autonomous part ordering |
| SPCS | Containerized React app hosted on Snowflake |
