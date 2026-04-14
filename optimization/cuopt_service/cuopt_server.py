from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="KLA cuOpt Shipment Router")


class RoutingRequest(BaseModel):
    cost_matrix: list[list[float]]
    orders: list[dict]
    vehicles: list[dict]
    time_limit_sec: int = 5


class RoutingResponse(BaseModel):
    status: str
    total_time: float | None = None
    vehicle_count: int | None = None
    routes: list[dict] | None = None
    message: str | None = None


def solve_with_cuopt(req: RoutingRequest) -> RoutingResponse:
    try:
        from cuopt import routing, distance_engine
        import cudf

        cost_matrix_np = np.array(req.cost_matrix, dtype=np.float32)
        n_locations = len(cost_matrix_np)
        n_vehicles = len(req.vehicles)
        n_orders = len(req.orders) * 2

        data_model = routing.DataModel(n_locations, n_vehicles, n_orders)
        data_model.add_cost_matrix(cudf.DataFrame(cost_matrix_np))

        pickup_locs = []
        delivery_locs = []
        pickup_demand = []
        delivery_demand = []
        earliest_pickup = []
        latest_pickup = []
        earliest_delivery = []
        latest_delivery = []
        pickup_service = []
        delivery_service = []

        for order in req.orders:
            pickup_locs.append(order["pickup_loc"])
            delivery_locs.append(order["delivery_loc"])
            demand = order.get("demand", 1)
            pickup_demand.append(demand)
            delivery_demand.append(-demand)
            earliest_pickup.append(order.get("earliest_pickup", 0))
            latest_pickup.append(order.get("latest_pickup", 100))
            earliest_delivery.append(order.get("earliest_delivery", 0))
            latest_delivery.append(order.get("latest_delivery", 100))
            pickup_service.append(order.get("pickup_service_time", 1))
            delivery_service.append(order.get("delivery_service_time", 1))

        order_locations = cudf.Series(pickup_locs + delivery_locs)
        data_model.set_order_locations(order_locations)

        order_demand = cudf.Series(pickup_demand + delivery_demand)
        vehicle_capacities = cudf.Series(
            [v.get("capacity", 2) for v in req.vehicles]
        )
        data_model.add_capacity_dimension("demand", order_demand, vehicle_capacities)

        n_pair = len(req.orders)
        pickup_indices = cudf.Series(list(range(n_pair)))
        delivery_indices = cudf.Series(list(range(n_pair, n_pair * 2)))
        data_model.set_pickup_delivery_pairs(pickup_indices, delivery_indices)

        tw_earliest = cudf.Series(earliest_pickup + earliest_delivery)
        tw_latest = cudf.Series(latest_pickup + latest_delivery)
        service_times = cudf.Series(pickup_service + delivery_service)
        data_model.set_order_time_windows(tw_earliest, tw_latest)
        data_model.set_order_service_times(service_times)

        v_earliest = cudf.Series(
            [v.get("earliest", 0) for v in req.vehicles]
        )
        v_latest = cudf.Series(
            [v.get("latest", 200) for v in req.vehicles]
        )
        data_model.set_vehicle_time_windows(v_earliest, v_latest)

        settings = routing.SolverSettings()
        settings.set_time_limit(req.time_limit_sec)

        solution = routing.Solve(data_model, settings)

        if solution.get_status() == 0:
            route_df = solution.route.to_pandas()
            routes = []
            for vid in route_df["truck_id"].unique():
                vr = route_df[route_df["truck_id"] == vid]
                routes.append({
                    "vehicle_id": int(vid),
                    "stops": vr["route"].tolist(),
                    "arrival_times": vr["arrival_stamp"].tolist()
                    if "arrival_stamp" in vr.columns
                    else [],
                })
            return RoutingResponse(
                status="optimal",
                total_time=float(solution.get_total_objective()),
                vehicle_count=int(solution.get_vehicle_count()),
                routes=routes,
            )
        return RoutingResponse(
            status="infeasible",
            message=f"Solver status: {solution.get_status()}",
        )
    except ImportError:
        return solve_fallback_cpu(req)


def solve_fallback_cpu(req: RoutingRequest) -> RoutingResponse:
    cost_matrix = np.array(req.cost_matrix)
    routes = []
    for vi, vehicle in enumerate(req.vehicles):
        depot = vehicle.get("depot_loc", 0)
        assigned = [
            o
            for o in req.orders
            if o.get("vehicle_hint", vi) == vi
            or not o.get("vehicle_hint")
        ]
        if not assigned:
            continue
        stops = [depot]
        total_time = 0.0
        for order in assigned:
            p = order["pickup_loc"]
            d = order["delivery_loc"]
            total_time += cost_matrix[stops[-1]][p]
            stops.append(p)
            total_time += cost_matrix[p][d]
            stops.append(d)
        total_time += cost_matrix[stops[-1]][depot]
        stops.append(depot)
        routes.append({
            "vehicle_id": vi,
            "stops": stops,
            "total_time": round(total_time, 2),
        })
    return RoutingResponse(
        status="heuristic_cpu",
        total_time=sum(r.get("total_time", 0) for r in routes),
        vehicle_count=len(routes),
        routes=routes,
        message="GPU cuOpt unavailable; used greedy CPU fallback",
    )


@app.get("/health")
def health():
    try:
        import cudf
        return {"status": "healthy", "gpu": True}
    except ImportError:
        return {"status": "healthy", "gpu": False}


@app.post("/solve", response_model=RoutingResponse)
def solve_routing(req: RoutingRequest):
    return solve_with_cuopt(req)
