package com.routewise.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Map;

public class BudgetReallocateRequest {

    @NotBlank(message = "Changed category is required")
    private String changedCategory; // accommodation, food, transport, sightseeing

    @NotNull(message = "New percentage share is required")
    @DecimalMin(value = "5.0", message = "Category share must be at least 5%")
    @DecimalMax(value = "80.0", message = "Category share cannot exceed 80%")
    private BigDecimal newShare;

    @NotNull(message = "Current shares are required")
    private CurrentSharesDto currentShares;

    @NotNull(message = "Total budget max is required")
    @DecimalMin(value = "1000.00", message = "Total budget must be at least ₹1,000")
    private BigDecimal totalBudgetMax;

    public BudgetReallocateRequest() {}

    public String getChangedCategory() { return changedCategory; }
    public void setChangedCategory(String changedCategory) { this.changedCategory = changedCategory; }

    public BigDecimal getNewShare() { return newShare; }
    public void setNewShare(BigDecimal newShare) { this.newShare = newShare; }

    public CurrentSharesDto getCurrentShares() { return currentShares; }
    public void setCurrentShares(CurrentSharesDto currentShares) { this.currentShares = currentShares; }

    public BigDecimal getTotalBudgetMax() { return totalBudgetMax; }
    public void setTotalBudgetMax(BigDecimal totalBudgetMax) { this.totalBudgetMax = totalBudgetMax; }

    public static class CurrentSharesDto {
        private BigDecimal accommodation = new BigDecimal("35.00");
        private BigDecimal food = new BigDecimal("25.00");
        private BigDecimal transport = new BigDecimal("20.00");
        private BigDecimal sightseeing = new BigDecimal("20.00");

        public CurrentSharesDto() {}

        public BigDecimal getAccommodation() { return accommodation; }
        public void setAccommodation(BigDecimal accommodation) { this.accommodation = accommodation; }

        public BigDecimal getFood() { return food; }
        public void setFood(BigDecimal food) { this.food = food; }

        public BigDecimal getTransport() { return transport; }
        public void setTransport(BigDecimal transport) { this.transport = transport; }

        public BigDecimal getSightseeing() { return sightseeing; }
        public void setSightseeing(BigDecimal sightseeing) { this.sightseeing = sightseeing; }
    }
}
