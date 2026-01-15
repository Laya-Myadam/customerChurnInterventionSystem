from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.models import CustomerContext, InterventionResponse, FeedbackData
from app.services.rl_agent import RLAgent
from app.services.optimizer import optimize_intervention
import random

app = FastAPI(title="Churn Intervention System")

# Allow CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
agent = RLAgent()
GLOBAL_BUDGET = 1000.0  # Reset daily in real system
metrics_history = []  # Store for dashboard


@app.post("/predict", response_model=InterventionResponse)
async def predict_intervention(context: CustomerContext):
    global GLOBAL_BUDGET

    # 1. RL Agent Prediction
    proposed_action, risk_score = agent.predict(context)

    # 2. OR Optimization Check
    is_feasible, cost = optimize_intervention(proposed_action, risk_score, GLOBAL_BUDGET)

    final_action = proposed_action if is_feasible else "No_Action"
    allocated = cost if is_feasible else 0.0

    if is_feasible:
        GLOBAL_BUDGET -= cost

    return InterventionResponse(
        customer_id=context.customer_id,
        recommended_action=final_action,
        risk_score=risk_score,
        budget_allocated=allocated,
        feasibility_status="Feasible" if is_feasible else "Budget_Constrained"
    )


@app.post("/feedback")
async def receive_feedback(data: FeedbackData, background_tasks: BackgroundTasks):
    # Simulate Online Learning in Background
    # We construct a dummy context object here or fetch from DB in real life
    dummy_context = type('obj', (object,), {"tenure_months": 12})
    background_tasks.add_task(agent.update_policy, dummy_context, data.action_taken, data.reward)

    # Update metrics for dashboard
    metrics_history.append({
        "time": len(metrics_history),
        "reward": data.reward,
        "churn_rate": random.uniform(0.1, 0.3) if data.reward < 0 else random.uniform(0.0, 0.1)
    })
    return {"status": "Updated Policy"}


@app.get("/metrics")
async def get_metrics():
    """Endpoint for the Dashboard to pull live stats"""
    return {
        "remaining_budget": GLOBAL_BUDGET,
        "history": metrics_history[-20:]  # Return last 20 points
    }


@app.post("/predict", response_model=InterventionResponse)
async def predict_intervention(context: CustomerContext):
    global GLOBAL_BUDGET

    # --- A/B TESTING LOGIC ---
    # We split traffic:
    # Group A (80%): Standard RL (Maximize Revenue)
    # Group B (20%): Game Theory Minimax (Minimize Risk/Churn)

    ab_test_group = "A" if random.random() < 0.8 else "B"
    strategy = "standard" if ab_test_group == "A" else "game_theory"

    # 1. Prediction with selected strategy
    proposed_action, risk_score = agent.predict(context, strategy=strategy)

    # 2. OR Optimization Check (Same as before)
    is_feasible, cost = optimize_intervention(proposed_action, risk_score, GLOBAL_BUDGET)

    final_action = proposed_action if is_feasible else "NO_ACTION"
    allocated = cost if is_feasible else 0.0

    if is_feasible:
        GLOBAL_BUDGET -= cost

    return InterventionResponse(
        customer_id=context.customer_id,
        recommended_action=final_action,
        risk_score=risk_score,
        budget_allocated=allocated,
        feasibility_status=f"{'Feasible' if is_feasible else 'Blocked'} (Strategy: {strategy})"
    )