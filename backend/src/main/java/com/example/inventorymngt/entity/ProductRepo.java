package com.example.inventorymngt.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepo extends JpaRepository<ProductEntitiy, Long> {

    @Query("""
            SELECT DISTINCT p.category FROM ProductEntitiy p
            WHERE p.category IS NOT NULL AND p.category <> ''
            """)
    List<String> findDistinctCategories();
}
