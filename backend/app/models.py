from pydantic import BaseModel
from typing import Optional, List

# Input data model for a customer
class CustomerContext(BaseModel):
    customer_id: str
    tenure_months: int
    monthly_charges: float
    total_charges: float
    num_support_tickets: int
    data_usage_gb: float
    payment_method: str  # e.g., "Electronic check", "Mailed check"
    contract_type: str   # e.g., "Month-to-month", "One year"

# Output model for the prediction
class InterventionResponse(BaseModel):
    customer_id: str
    recommended_action: str
    risk_score: float
    budget_allocated: float
    feasibility_status: str # "Feasible" or "Budget_Constrained"

# Feedback model for Online Learning
class FeedbackData(BaseModel):
    customer_id: str
    action_taken: str
    reward: float  # e.g., 1.0 for retained, -1.0 for churned