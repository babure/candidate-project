package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.dto.StoreProductDto;
import com.example.inventorymngt.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping("/products")
    public List<StoreProductDto> list() {
        return storeService.listProducts();
    }

    @GetMapping("/products/{id}")
    public StoreProductDto get(@PathVariable Long id) {
        return storeService.getProduct(id);
    }

    /** Distinct product categories present in the shared catalog DB. */
    @GetMapping("/categories")
    public List<String> categories() {
        return storeService.listCategories();
    }
}
