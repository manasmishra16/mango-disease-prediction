"""
Economic Module (Phase 5).

Translates disease detection + yield prediction into actionable farmer decisions.

Components:
- Disease loss lookup table (literature-based)
- Revenue formula with market pricing
- Decision logic (market vs pulp factory)
- Treatment recommendation engine
- Input cost model
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional


# ──────────────────────────────────────────────
# Disease Loss Table (Literature-Based)
# ──────────────────────────────────────────────

# Yield loss factors by disease and severity level
# Sources: various Indian agricultural research papers
DISEASE_LOSS_TABLE = {
    'Anthracnose':    {'low': 0.10, 'medium': 0.20, 'high': 0.30},
    'Bacterial Canker': {'low': 0.12, 'medium': 0.22, 'high': 0.35},
    'Cutting Weevil': {'low': 0.08, 'medium': 0.18, 'high': 0.28},
    'Die Back':       {'low': 0.15, 'medium': 0.30, 'high': 0.45},
    'Gall Midge':     {'low': 0.15, 'medium': 0.25, 'high': 0.35},
    'Healthy':        {'low': 0.00, 'medium': 0.00, 'high': 0.00},
    'Powdery Mildew': {'low': 0.05, 'medium': 0.10, 'high': 0.15},
    'Sooty Mould':    {'low': 0.05, 'medium': 0.12, 'high': 0.20},
}


# ──────────────────────────────────────────────
# Market Pricing (APMC Karnataka)
# ──────────────────────────────────────────────

# Price per ton (INR) by variety
MARKET_PRICE = {
    'Banganapalli': 35000,  # ~₹35/kg premium
    'Raspuri':      28000,  # ~₹28/kg mid-range
    'Totapuri':     18000,  # ~₹18/kg (mostly pulp)
}

# Pulp factory price (flat rate per ton, regardless of variety)
PULP_PRICE_PER_TON = 12000  # ₹12/kg

# Seasonal multiplier: early season fetches premium
SEASONAL_MULTIPLIER = {
    'early':  1.25,   # March-April (premium)
    'peak':   1.00,   # May-June (normal)
    'late':   0.80,   # July-August (discount)
}


# ──────────────────────────────────────────────
# Input Cost Model
# ──────────────────────────────────────────────

# Base cost per hectare (INR): labor + irrigation + fertilizer
BASE_COST_PER_HA = 45000

# Pesticide/fungicide cost by disease
TREATMENT_COST = {
    'Anthracnose':      {'chemical': 'Carbendazim 50% WP', 'dosage': '1g/L', 'cost_per_ha': 3500},
    'Bacterial Canker':  {'chemical': 'Streptocycline + Copper Oxychloride', 'dosage': '0.5g/L + 3g/L', 'cost_per_ha': 4200},
    'Cutting Weevil':   {'chemical': 'Chlorpyrifos 20% EC', 'dosage': '2ml/L', 'cost_per_ha': 2800},
    'Die Back':         {'chemical': 'Copper Oxychloride 50% WP', 'dosage': '3g/L', 'cost_per_ha': 3200},
    'Gall Midge':       {'chemical': 'Dimethoate 30% EC', 'dosage': '2ml/L', 'cost_per_ha': 3000},
    'Healthy':          {'chemical': 'None required', 'dosage': 'N/A', 'cost_per_ha': 0},
    'Powdery Mildew':   {'chemical': 'Wettable Sulphur 80% WP', 'dosage': '2g/L', 'cost_per_ha': 2500},
    'Sooty Mould':      {'chemical': 'Starch spray + Monocrotophos', 'dosage': '2%+1.5ml/L', 'cost_per_ha': 2200},
}

# Quality grades
QUALITY_GRADES = {
    'A': {'min_severity': 0.0, 'max_severity': 0.5, 'description': 'Export quality'},
    'B': {'min_severity': 0.5, 'max_severity': 1.5, 'description': 'Local market'},
    'C': {'min_severity': 1.5, 'max_severity': 2.5, 'description': 'Processing/pulp'},
    'D': {'min_severity': 2.5, 'max_severity': 3.0, 'description': 'Reject/compost'},
}


# ──────────────────────────────────────────────
# Core Functions
# ──────────────────────────────────────────────

@dataclass
class EconomicReport:
    """Complete economic assessment for a mango farm unit."""
    disease: str
    severity: float
    severity_level: str
    quality_grade: str
    yield_predicted: float        # t/ha
    yield_after_loss: float       # t/ha
    loss_factor: float
    variety: str
    season: str
    market_price_per_ton: float   # INR
    pulp_price_per_ton: float     # INR
    revenue_market: float         # INR
    revenue_pulp: float           # INR
    input_cost: float             # INR
    treatment_cost: float         # INR
    total_cost: float             # INR
    net_revenue_market: float     # INR
    net_revenue_pulp: float       # INR
    recommendation: str           # 'market' or 'pulp'
    treatment: dict               # Treatment details


def severity_to_level(severity: float) -> str:
    """Convert numeric severity (0-3) to categorical level."""
    if severity < 1.0:
        return 'low'
    elif severity < 2.0:
        return 'medium'
    else:
        return 'high'


def severity_to_grade(severity: float) -> str:
    """Convert severity to quality grade."""
    for grade, spec in QUALITY_GRADES.items():
        if spec['min_severity'] <= severity < spec['max_severity']:
            return grade
    return 'D'


def get_loss_factor(disease: str, severity: float) -> float:
    """
    Get yield loss factor for a disease at given severity.
    Interpolates between severity levels for smooth output.
    """
    if disease not in DISEASE_LOSS_TABLE:
        return 0.0

    levels = DISEASE_LOSS_TABLE[disease]
    # Linear interpolation across severity 0-3
    if severity < 1.0:
        return levels['low'] * (severity / 1.0)
    elif severity < 2.0:
        t = (severity - 1.0)
        return levels['low'] + t * (levels['medium'] - levels['low'])
    else:
        t = (severity - 2.0)
        return levels['medium'] + t * (levels['high'] - levels['medium'])


def compute_revenue(yield_tons: float, price_per_ton: float,
                    season: str = 'peak') -> float:
    """Compute gross revenue with seasonal multiplier."""
    multiplier = SEASONAL_MULTIPLIER.get(season, 1.0)
    return yield_tons * price_per_ton * multiplier


def compute_input_cost(disease: str, severity: float,
                       hectares: float = 1.0) -> tuple:
    """
    Compute total input cost.
    Returns (base_cost, treatment_cost, total_cost) per hectare.
    """
    base = BASE_COST_PER_HA * hectares
    treatment_info = TREATMENT_COST.get(disease, TREATMENT_COST['Healthy'])

    # Scale treatment cost by severity
    sev_level = severity_to_level(severity)
    spray_rounds = {'low': 1, 'medium': 2, 'high': 3}[sev_level]
    treatment = treatment_info['cost_per_ha'] * spray_rounds * hectares

    return base, treatment, base + treatment


def generate_report(
    disease: str,
    severity: float,
    yield_predicted: float,
    variety: str = 'Banganapalli',
    season: str = 'peak',
    hectares: float = 1.0,
) -> EconomicReport:
    """
    Generate complete economic report for a farm unit.

    Args:
        disease: detected disease name
        severity: severity score (0-3)
        yield_predicted: predicted yield in t/ha
        variety: mango variety
        season: 'early', 'peak', or 'late'
        hectares: farm area

    Returns:
        EconomicReport with all computed values
    """
    sev_level = severity_to_level(severity)
    grade = severity_to_grade(severity)
    loss = get_loss_factor(disease, severity)

    yield_after = yield_predicted * (1 - loss) * hectares

    market_price = MARKET_PRICE.get(variety, 25000)
    rev_market = compute_revenue(yield_after, market_price, season)
    rev_pulp = compute_revenue(yield_after, PULP_PRICE_PER_TON, season)

    base_cost, treat_cost, total_cost = compute_input_cost(disease, severity, hectares)

    net_market = rev_market - total_cost
    net_pulp = rev_pulp - total_cost

    # Decision logic
    if grade in ('A', 'B') and net_market > net_pulp:
        recommendation = 'market'
    else:
        recommendation = 'pulp'

    treatment = TREATMENT_COST.get(disease, TREATMENT_COST['Healthy']).copy()
    treatment['spray_rounds'] = {'low': 1, 'medium': 2, 'high': 3}[sev_level]

    return EconomicReport(
        disease=disease,
        severity=severity,
        severity_level=sev_level,
        quality_grade=grade,
        yield_predicted=yield_predicted,
        yield_after_loss=yield_after,
        loss_factor=loss,
        variety=variety,
        season=season,
        market_price_per_ton=market_price,
        pulp_price_per_ton=PULP_PRICE_PER_TON,
        revenue_market=rev_market,
        revenue_pulp=rev_pulp,
        input_cost=base_cost,
        treatment_cost=treat_cost,
        total_cost=total_cost,
        net_revenue_market=net_market,
        net_revenue_pulp=net_pulp,
        recommendation=recommendation,
        treatment=treatment,
    )


def batch_reports(predictions: list) -> list:
    """
    Generate reports for multiple predictions.

    Args:
        predictions: list of dicts with keys:
            disease, severity, yield_predicted, variety, season

    Returns:
        list of EconomicReport
    """
    return [generate_report(**p) for p in predictions]
