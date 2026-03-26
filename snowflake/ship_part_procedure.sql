CREATE OR REPLACE PROCEDURE KLA_SUPPLY_CHAIN.APP.SHIP_PART(
    PART_ID_IN VARCHAR,
    SCANNER_ID_IN VARCHAR,
    ALERT_ID_IN NUMBER,
    WAREHOUSE_LOCATION_IN VARCHAR,
    SHIPPING_METHOD_IN VARCHAR
)
RETURNS VARIANT
LANGUAGE JAVASCRIPT
EXECUTE AS CALLER
AS
$$
try {
    var checkInventory = snowflake.createStatement({
        sqlText: `SELECT QUANTITY_AVAILABLE FROM KLA_SUPPLY_CHAIN.APP.PARTS_INVENTORY
                  WHERE PART_ID = ? AND WAREHOUSE_LOCATION = ?`,
        binds: [PART_ID_IN, WAREHOUSE_LOCATION_IN]
    });
    var invResult = checkInventory.execute();
    
    if (!invResult.next() || invResult.getColumnValue(1) < 1) {
        return {success: false, error: "Part not available at specified warehouse"};
    }
    
    var getScanner = snowflake.createStatement({
        sqlText: `SELECT FAB_NAME FROM KLA_SUPPLY_CHAIN.APP.SCANNERS WHERE SCANNER_ID = ?`,
        binds: [SCANNER_ID_IN]
    });
    var scannerResult = getScanner.execute();
    scannerResult.next();
    var destFab = scannerResult.getColumnValue(1);
    
    var shippingCosts = {
        "Next Day Air": 4500.00,
        "Priority Ground": 1200.00,
        "Standard Ground": 650.00
    };
    var shippingCost = shippingCosts[SHIPPING_METHOD_IN] || 2000.00;
    
    var etaDays = {
        "Next Day Air": 1,
        "Priority Ground": 3,
        "Standard Ground": 5
    };
    var today = new Date();
    var eta = new Date(today.setDate(today.getDate() + (etaDays[SHIPPING_METHOD_IN] || 2)));
    var etaStr = eta.toISOString().split('T')[0];
    
    var trackingNum = "KLA-" + new Date().toISOString().slice(0,10).replace(/-/g,'') + "-" + Math.floor(Math.random() * 90000 + 10000);
    
    var updateInv = snowflake.createStatement({
        sqlText: `UPDATE KLA_SUPPLY_CHAIN.APP.PARTS_INVENTORY
                  SET QUANTITY_AVAILABLE = QUANTITY_AVAILABLE - 1,
                      QUANTITY_RESERVED = QUANTITY_RESERVED + 1
                  WHERE PART_ID = ? AND WAREHOUSE_LOCATION = ?`,
        binds: [PART_ID_IN, WAREHOUSE_LOCATION_IN]
    });
    updateInv.execute();
    
    var insertOrder = snowflake.createStatement({
        sqlText: `INSERT INTO KLA_SUPPLY_CHAIN.APP.SHIPMENT_ORDERS 
                  (PART_ID, SCANNER_ID, ALERT_ID, SOURCE_WAREHOUSE, DESTINATION_FAB,
                   SHIPPING_METHOD, ESTIMATED_ARRIVAL, SHIPPING_COST, STATUS, TRACKING_NUMBER)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SHIPPED', ?)`,
        binds: [PART_ID_IN, SCANNER_ID_IN, ALERT_ID_IN, WAREHOUSE_LOCATION_IN, destFab,
                SHIPPING_METHOD_IN, etaStr, shippingCost, trackingNum]
    });
    insertOrder.execute();
    
    var getOrderId = snowflake.createStatement({
        sqlText: `SELECT MAX(ORDER_ID) FROM KLA_SUPPLY_CHAIN.APP.SHIPMENT_ORDERS`
    });
    var orderResult = getOrderId.execute();
    orderResult.next();
    var orderId = orderResult.getColumnValue(1);
    
    return {
        success: true,
        order_id: orderId,
        tracking_number: trackingNum,
        estimated_arrival: etaStr,
        shipping_cost: shippingCost,
        destination: destFab,
        message: "Shipment order created. Part " + PART_ID_IN + " shipped from " + WAREHOUSE_LOCATION_IN + " via " + SHIPPING_METHOD_IN
    };
} catch (err) {
    return {success: false, error: err.message};
}
$$;
