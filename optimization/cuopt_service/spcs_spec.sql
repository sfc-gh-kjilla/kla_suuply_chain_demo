-- =============================================================
-- SPCS Deployment: cuOpt GPU Routing Service
-- =============================================================
-- Prerequisites:
--   1. Image repository exists: KLA_SUPPLY_CHAIN.APP.IMAGES
--   2. GPU compute pool provisioned
-- =============================================================

-- Step 1: Create image repository (if not exists)
CREATE IMAGE REPOSITORY IF NOT EXISTS KLA_SUPPLY_CHAIN.APP.IMAGES;

-- Step 2: Create GPU compute pool
CREATE COMPUTE POOL IF NOT EXISTS KLA_GPU_POOL
    MIN_NODES = 1
    MAX_NODES = 1
    INSTANCE_FAMILY = GPU_NV_S
    AUTO_RESUME = TRUE
    AUTO_SUSPEND_SECS = 600;

-- Step 3: Build & push Docker image (run from local machine)
-- docker build -t <registry>/kla_supply_chain/app/images/cuopt-service:latest ./cuopt_service/
-- docker push <registry>/kla_supply_chain/app/images/cuopt-service:latest

-- Step 4: Create the SPCS service
CREATE SERVICE IF NOT EXISTS KLA_SUPPLY_CHAIN.APP.CUOPT_ROUTING_SERVICE
    IN COMPUTE POOL KLA_GPU_POOL
    FROM SPECIFICATION $$
    spec:
      containers:
        - name: cuopt
          image: /KLA_SUPPLY_CHAIN/APP/IMAGES/cuopt-service:latest
          resources:
            requests:
              nvidia.com/gpu: 1
            limits:
              nvidia.com/gpu: 1
              memory: 8Gi
          env:
            NVIDIA_VISIBLE_DEVICES: all
      endpoints:
        - name: cuopt-api
          port: 8080
          public: false
    $$
    MIN_INSTANCES = 1
    MAX_INSTANCES = 1;

-- Step 5: Grant usage
-- GRANT USAGE ON SERVICE KLA_SUPPLY_CHAIN.APP.CUOPT_ROUTING_SERVICE TO ROLE <your_role>;

-- Step 6: Get service URL for notebook
-- SHOW ENDPOINTS IN SERVICE KLA_SUPPLY_CHAIN.APP.CUOPT_ROUTING_SERVICE;
