# Mindful Tracker Prototype

A habit tracking prototype that prioritizes emotional resilience over daily perfection — replacing streak-based feedback with pattern-based metrics designed to reduce anxiety and dropout.

---

## Motivation

Most habit trackers (Streaks, Habitica, Duolingo) rely on streak mechanics that work — until they don't. Breaking a streak often triggers the **"what-the-hell effect"** (Polivy & Herman, 1985): guilt leads to avoidance, which leads to dropout.

> "I loved seeing my 47-day streak… until I broke it. Then I felt like a failure and stopped using the app entirely."

**Research question:** Can we design a habit tracker that encourages consistency _without_ creating anxiety or fragility?

---

## Core Concept: Habit Internalization Index (HII)

The HII replaces streak length with three independent metrics:

### 1. Consistency

```
Consistency = (completed_days / total_days) × 100
```

Percentage of days a habit was logged within the selected period (week / month / quarter / year).

### 2. Recovery Speed

```
Recovery Speed = mean(days_between_lapse_and_resume)
```

Average number of days it takes to resume a habit after a missed streak. Lower = faster recovery.

### 3. Stability

```
Stability = (1 − CV_weekly) × 100
CV_weekly = σ_weekly / μ_weekly
```

Measures how consistent weekly activity levels are over time. Lower variance = higher stability.

### HII Levels

| Level        | Consistency |
| ------------ | ----------- |
| Emerging     | < 50%       |
| Stable       | 50–79%      |
| Internalized | ≥ 80%       |

> **Note:** HII thresholds are heuristic, not empirically validated. They are designed for interpretability. Future work should derive optimal boundaries from longitudinal data.

---

## Design Principles

1. **Replace streaks with pattern-based metrics** — trends over daily perfection
2. **Trigger reflection, not punishment** — introspective prompts when lapses occur
3. **Use identity-affirming language** — frame feedback as "who you are becoming"
4. **Apply graceful degradation in visuals** — neutral color gradients, no red/green binary feedback

The redesigned failure loop:

```
Miss → Reflection → Insight → Recovery → Stabilization
```

---

## Features

### Feedback System

- HII metrics display (Consistency, Recovery Speed, Stability) with contextual tooltips
- Period switcher: Week / Month / Quarter / Year
- Status badge: Emerging / Stable / Internalized

### Reflection System

- Pattern-triggered modal: appears when `missedStreak ≥ 2` or weekly variance exceeds threshold
- Structured inputs: reason selection (Time constraint, Low energy, etc.) + open suggestion field
- Recurring barriers panel: surfaces patterns only when a reason appears 3+ times (e.g., _"Low energy appeared 5 times this quarter"_)

### Visualization System

- **Heatmap:** Calendar mode (ISO-week aligned) and Rolling mode (last 90 days)
- **Trend chart:** Daily values with multi-day moving average
- **Color scheme:**
  - Start habits: `#4a7c6f` (slate-blue)
  - Stop habits: `#b87d5c` (amber)
  - No red/green binary coloring

---

## Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Framework  | React 19 + TypeScript |
| UI Library | Mantine UI v8         |
| Charts     | Recharts              |
| Styling    | styled-components     |

> **Note:** Desktop only — not optimized for mobile.

---

## Theoretical Grounding

- **Identity-Based Habits** — Lally et al. (2010); Clear (2018): behavior change comes from identity shifts, not outcome chasing
- **Self-Determination Theory** — Deci & Ryan (2000): intrinsic motivation requires autonomy, competence, and relatedness
- **All-or-Nothing Thinking** — Beck (1979): binary success/failure signals trigger extreme cognitive patterns that increase dropout

---

## Limitations

- Small, informal evaluation
- Desktop-only implementation
- HII components are equally weighted (no user-adjustable weighting)
- HII is not grounded in a validated psychological scale
- Cultural assumptions: guilt-framing may reflect individualist norms

---

## Future Work

- Empirical validation and threshold optimization for HII levels
- User-adjustable metric weighting
- Cross-cultural testing of guilt-reduction strategies
- Social features emphasizing collaboration over competition
