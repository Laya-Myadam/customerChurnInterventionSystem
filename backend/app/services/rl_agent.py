import numpy as np
import random


class RLAgent:
    def __init__(self, n_actions=5, epsilon=0.1):
        self.epsilon = epsilon
        # Actions available to the agent
        self.actions = ["NO_ACTION", "DISCOUNT_10", "UPGRADE_PLAN", "PRIORITY_SUPPORT", "LOYALTY_GIFT"]
        self.n_actions = len(self.actions)

        # Q-Table: Maps State -> Action -> Expected Reward
        self.q_table = {}

        # Regret Table for Minimax (Tracks 'Loss' instead of 'Reward')
        self.regret_table = {}

    def get_state_key(self, context):
        # Discretize continuous variables into a state key
        usage_level = "High" if context.data_usage_gb > 50 else "Low"
        tenure_level = "New" if context.tenure_months < 12 else "Loyal"
        return f"{usage_level}_{tenure_level}_{context.contract_type}"

    def predict(self, context, strategy="standard"):
        state = self.get_state_key(context)

        # Initialize state if new
        if state not in self.q_table:
            self.q_table[state] = np.zeros(self.n_actions)
            self.regret_table[state] = np.zeros(self.n_actions)  # Initialize regret as 0

        # --- STRATEGY 1: Standard RL (Epsilon-Greedy) ---
        if strategy == "standard":
            if random.random() < self.epsilon:
                return self.actions[random.randint(0, self.n_actions - 1)], 0.5
            else:
                action_idx = np.argmax(self.q_table[state])
                risk_score = 1.0 - (self.q_table[state][action_idx])  # Inverse of expected reward
                return self.actions[action_idx], risk_score

        # --- STRATEGY 2: Game Theory (Minimax) ---
        # "Minimax Regret": Choose the action that minimizes the maximum possible loss.
        # Useful for high-risk VIPs where losing them is catastrophic.
        elif strategy == "game_theory":
            # We look at our 'Regret Table' (running average of losses per action)
            # and pick the action with the LOWEST maximum regret.

            # Simple Minimax implementation:
            # We assume 'Churn' is the opponent trying to maximize our loss.
            # We choose the action where the worst recorded outcome is least bad.
            action_idx = np.argmin(self.regret_table[state])

            # Risk is higher here because we are being defensive
            risk_score = 0.8
            return self.actions[action_idx], risk_score

        return "NO_ACTION", 0.0

    def update_policy(self, context, action_name, reward):
        state = self.get_state_key(context)
        if state not in self.q_table:
            self.q_table[state] = np.zeros(self.n_actions)
            self.regret_table[state] = np.zeros(self.n_actions)

        try:
            action_idx = self.actions.index(action_name)
            alpha = 0.1  # Learning rate

            # 1. Update Standard Q-Table (Maximize Reward)
            old_val = self.q_table[state][action_idx]
            self.q_table[state][action_idx] = old_val + alpha * (reward - old_val)

            # 2. Update Regret Table (Minimize Loss)
            # If reward is negative (Churn), Regret is High (e.g., 1.0).
            # If reward is positive (Retain), Regret is Low (e.g., 0.0).
            loss = 1.0 if reward < 0 else 0.0
            old_regret = self.regret_table[state][action_idx]
            self.regret_table[state][action_idx] = old_regret + alpha * (loss - old_regret)

        except ValueError:
            pass