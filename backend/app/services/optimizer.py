import pulp


def optimize_intervention(action, risk_score, current_budget):
    """
    Returns True if the action is feasible within budget constraints.
    Uses Linear Programming.
    """
    # Define Costs
    costs = {
        "No_Action": 0,
        "10%_Discount": 15,  # $15 cost
        "Free_Upgrade": 5,  # $5 cost (internal cost)
        "Priority_Support": 25  # $25 cost (labor)
    }

    action_cost = costs.get(action, 0)

    # 1. Setup LP Problem
    prob = pulp.LpProblem("Budget_Check", pulp.LpMaximize)

    # 2. Decision Variable (Binary: 1 = do it, 0 = don't)
    x = pulp.LpVariable("Execute_Action", cat="Binary")

    # 3. Objective: Maximize Risk Reduction (simplified LTV proxy)
    # We assume doing the action reduces risk by a factor
    prob += x * risk_score

    # 4. Constraint: Cost <= Budget
    prob += x * action_cost <= current_budget

    # 5. Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    is_feasible = (pulp.value(x) == 1.0)
    return is_feasible, action_cost