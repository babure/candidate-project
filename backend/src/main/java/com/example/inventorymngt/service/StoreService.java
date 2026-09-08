package com.example.inventorymngt.service;

import com.example.inventorymngt.dto.StoreProductDto;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StoreService {

    private final ProductRepo productRepo;

    public StoreService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<StoreProductDto> listProducts() {
        return productRepo.findAll().stream().map(this::toDto).toList();
    }

    public StoreProductDto getProduct(Long id) {
        ProductEntitiy product = productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toDto(product);
    }

    private StoreProductDto toDto(ProductEntitiy product) {
        int stock = product.getStock() == null ? 0 : product.getStock();
        return new StoreProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                stock > 0
        );
    }
}
