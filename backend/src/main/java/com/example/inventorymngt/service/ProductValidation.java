package com.example.inventorymngt.service;

import com.example.inventorymngt.entity.ProductCategory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

final class ProductValidation {

    static final int NAME_MAX = 255;
    static final int DESCRIPTION_MAX = 2000;
    static final BigDecimal PRICE_MAX = new BigDecimal("99999.99");
    static final int STOCK_MAX = 999_999;
    static final int QUANTITY_MAX = 999;

    private ProductValidation() {
    }

    static void requireName(String name) {
        if (name == null || name.isBlank()) {
            throw badRequest("Name is required");
        }
        if (name.trim().length() > NAME_MAX) {
            throw badRequest("Name must be at most " + NAME_MAX + " characters");
        }
    }

    static void requireCategory(String category) {
        if (category == null || category.isBlank()) {
            throw badRequest("Category is required");
        }
        if (!ProductCategory.isValid(category)) {
            throw badRequest("Category must be one of: " + String.join(", ", ProductCategory.LABELS));
        }
    }

    static void requireDescription(String description) {
        if (description != null && description.length() > DESCRIPTION_MAX) {
            throw badRequest("Description must be at most " + DESCRIPTION_MAX + " characters");
        }
    }

    static double requirePrice(Double price) {
        if (price == null) {
            throw badRequest("Price is required");
        }
        BigDecimal value = BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP);
        if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(PRICE_MAX) > 0) {
            throw badRequest("Price must be between 0.00 and 99,999.99");
        }
        return value.doubleValue();
    }

    static int requireStockAdjustAmount(Integer amount) {
        if (amount == null) {
            throw badRequest("Stock adjustment amount is required");
        }
        return amount;
    }

    static int requireNonNegativeStock(int nextStock) {
        if (nextStock < 0) {
            throw badRequest("Stock must not go below zero");
        }
        if (nextStock > STOCK_MAX) {
            throw badRequest("Stock must be at most " + STOCK_MAX);
        }
        return nextStock;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
