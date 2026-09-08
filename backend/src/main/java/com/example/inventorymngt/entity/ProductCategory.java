package com.example.inventorymngt.entity;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum ProductCategory {
    Electronics,
    Clothing,
    Home_And_Garden("Home & Garden"),
    Sports,
    Books,
    Other;

    private final String label;

    ProductCategory() {
        this.label = name();
    }

    ProductCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static final Set<String> LABELS = Arrays.stream(values())
            .map(ProductCategory::getLabel)
            .collect(Collectors.toUnmodifiableSet());

    public static boolean isValid(String value) {
        return value != null && LABELS.contains(value);
    }
}
