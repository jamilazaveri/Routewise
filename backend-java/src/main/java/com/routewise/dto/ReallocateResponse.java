package com.routewise.dto;

import java.math.BigDecimal;
import java.util.Map;

public class ReallocateResponse {

    private Map<String, BigDecimal> newShares;
    private Map<String, BigDecimal> categoryBudgets;
    private BigDecimal totalBudgetMax;
    private String explanation;

    public ReallocateResponse() {}

    public ReallocateResponse(Map<String, BigDecimal> newShares, Map<String, BigDecimal> categoryBudgets, BigDecimal totalBudgetMax, String explanation) {
        this.newShares = newShares;
        this.categoryBudgets = categoryBudgets;
        this.totalBudgetMax = totalBudgetMax;
        this.explanation = explanation;
    }

    public Map<String, BigDecimal> getNewShares() { return newShares; }
    public void setNewShares(Map<String, BigDecimal> newShares) { this.newShares = newShares; }

    public Map<String, BigDecimal> getCategoryBudgets() { return categoryBudgets; }
    public void setCategoryBudgets(Map<String, BigDecimal> categoryBudgets) { this.categoryBudgets = categoryBudgets; }

    public BigDecimal getTotalBudgetMax() { return totalBudgetMax; }
    public void setTotalBudgetMax(BigDecimal totalBudgetMax) { this.totalBudgetMax = totalBudgetMax; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
