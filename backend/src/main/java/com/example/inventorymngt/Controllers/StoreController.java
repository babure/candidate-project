package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.dto.PageResponse;
import com.example.inventorymngt.dto.StoreProductDto;
import com.example.inventorymngt.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public PageResponse<StoreProductDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "asc") String dir,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        return storeService.searchProducts(
                q, category, availability, minPrice, maxPrice, sort, dir, page, pageSize
        );
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
