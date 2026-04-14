import os
import snowflake.connector

conn = snowflake.connector.connect(
    connection_name=os.getenv("SNOWFLAKE_CONNECTION_NAME") or "mydemo"
)
cur = conn.cursor()
cur.execute("USE DATABASE KLA_SUPPLY_CHAIN")
cur.execute("USE SCHEMA APP")

cur.execute("DELETE FROM WAREHOUSE_INVENTORY")
cur.execute("""
INSERT INTO WAREHOUSE_INVENTORY VALUES
('WH-TUCSON',    'Tucson',    'USA', '994-023', 3, 1, 0, 2, 'B-2024-A', 12.50),
('WH-SANJOSE',   'San Jose',  'USA', '994-023', 0, 2, 4, 3, 'B-2024-A',  8.75),
('WH-SINGAPORE', 'Singapore', 'SGP', '994-023', 2, 0, 0, 2, 'B-2024-B', 15.00),
('WH-DRESDEN',   'Dresden',   'DEU', '994-023', 1, 1, 0, 2, 'B-2024-C', 11.25)
""")

cur.execute("DELETE FROM ESCALATION_DEMANDS")
cur.execute("""
INSERT INTO ESCALATION_DEMANDS VALUES
('ESC-2026-4281', 'Samsung',  'Pyeongtaek',  36.99,  127.11, '994-023', 'SEV1',  -72, 4200000,  50000),
('ESC-2026-4305', 'Renesas',  'Hitachinaka',  36.40,  140.53, '994-023', 'SEV1',  -24, 1800000,  50000),
('ESC-2026-4198', 'TSMC',     'Taichung',     24.15,  120.67, '994-023', 'SEV2', -120, 2400000,  25000),
('ESC-2026-4312', 'SK Hynix', 'Icheon',       37.28,  127.44, '994-023', 'SEV2',    0, 1200000,  25000),
('ESC-2026-4287', 'Intel',    'Chandler',     33.308,-111.843,'994-023', 'SEV3',   24,  600000,  10000)
""")

cur.execute("DELETE FROM TARIFF_RATES")
cur.execute("""
INSERT INTO TARIFF_RATES VALUES
('USA', 'KOR', 0.08,  NULL,              2, 4500),
('SGP', 'KOR', 0.00,  'ASEAN-Korea FTA', 1, 1800),
('DEU', 'KOR', 0.032, 'EU-Korea FTA',    2, 3200),
('USA', 'JPN', 0.05,  NULL,              2, 4200),
('SGP', 'JPN', 0.00,  'CPTPP',           1, 2100),
('DEU', 'JPN', 0.038, 'EU-Japan EPA',    2, 3400),
('USA', 'TWN', 0.06,  NULL,              2, 4800),
('SGP', 'TWN', 0.00,  'ASEAN-Taiwan',    1, 1900),
('DEU', 'TWN', 0.035, NULL,              2, 3500),
('USA', 'USA', 0.00,  'Domestic',        1,  400),
('SGP', 'SGP', 0.00,  'Domestic',        0,  200),
('DEU', 'DEU', 0.00,  'Domestic',        0,  250),
('USA', 'BEL', 0.04,  NULL,              2, 3800),
('SGP', 'BEL', 0.025, NULL,              2, 4100),
('DEU', 'BEL', 0.00,  'EU Single Market',1,  350)
""")

conn.commit()
cur.close()
conn.close()
print("Seed data loaded successfully.")
