# Scoring Methodology

## Model intent

The scoring model is deterministic on purpose. The value of the project is not hidden intelligence or fake machine learning. The value is a transparent ranking model that operations teams can inspect and explain.

## Opportunity score

Each opportunity receives a 100-point score built from these weighted factors:

| Factor | Weight | Why it matters |
| --- | ---: | --- |
| Monthly volume | 18% | High-frequency work creates a larger automation surface area. |
| Analyst time load | 18% | Higher current effort increases recoverable hours. |
| Repeatability | 15% | Repeatable work is easier to automate safely. |
| Standardization | 12% | Standardized intake and fulfillment reduce exception handling. |
| Rework pressure | 10% | Rework signals waste that automation can remove. |
| SLA risk | 10% | SLA-sensitive categories create stronger business urgency. |
| Customer impact | 10% | User-facing pain increases the value of a better process. |
| Implementation ease | 5% | Lower delivery difficulty improves time-to-value. |
| Approval ease | 2% | Fewer checkpoints keep more of the flow automated. |

## Normalization rules

- `monthly volume` is capped against an `800 requests/month` benchmark.
- `analyst time load` is capped against an `8,000 minutes/month` benchmark.
- `repeatability`, `standardization`, `rework`, `SLA risk`, `customer impact`, `implementation difficulty`, and `approval complexity` are stored on a 1-5 scale.
- `implementation ease` and `approval ease` are the inverse of the underlying difficulty/complexity scores.

## Formula

```text
score =
  volume_score * 0.18 +
  labor_intensity_score * 0.18 +
  repeatability_score * 0.15 +
  standardization_score * 0.12 +
  rework_score * 0.10 +
  sla_risk_score * 0.10 +
  customer_impact_score * 0.10 +
  implementation_ease_score * 0.05 +
  approval_ease_score * 0.02
```

The final score is shown on a 0-100 scale.

## Value bands

- `Automate now`: score >= 70
- `Validate next`: score >= 56 and < 70
- `Monitor`: score < 56

These are descriptive portfolio bands, not execution-state flags.

## Effort tiers

- `Quick win`: implementation difficulty <= 2 and approval complexity <= 2
- `Foundation build`: everything between the extremes
- `Strategic bet`: implementation difficulty >= 4 or approval complexity >= 4

## ROI model

The savings model is intentionally simple and visible.

### Estimated automation rate

The automation rate blends process fit with a multiplier based on the suggested automation pattern.

Base fit inputs:

- repeatability
- standardization
- implementation difficulty
- approval complexity

Automation-type multipliers:

| Automation type | Multiplier |
| --- | ---: |
| Self-service workflow | 0.95 |
| API workflow | 0.85 |
| Approval-gated provisioning | 0.78 |
| AI-assisted triage | 0.65 |
| Scheduled follow-up | 0.92 |
| System integration | 0.80 |

The final rate is clamped between `25%` and `85%`.

### Savings formulas

```text
monthly_minutes_saved = monthly_volume * avg_handle_time_minutes * estimated_automation_rate
monthly_hours_saved = monthly_minutes_saved / 60
annual_hours_saved = monthly_hours_saved * 12
annual_cost_savings = annual_hours_saved * hourly_rate
```

Current hourly-rate assumption in code:

```text
hourly_rate = $48/hr
```

## Why this model works for the portfolio

- It is easy to explain in an interview.
- It makes tradeoffs visible.
- It avoids fake AI claims.
- It creates a credible decision-support narrative for automation prioritization.
