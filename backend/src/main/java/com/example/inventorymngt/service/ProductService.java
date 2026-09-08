package com.example.inventorymngt.service;

import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<ProductEntitiy> getProducts() {
        return productRepo.findAll();
    }

    public ProductEntitiy getProduct(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public ProductEntitiy addProduct(ProductEntitiy product) {
        ProductValidation.requireName(product.getName());
        ProductValidation.requireCategory(product.getCategory());
        ProductValidation.requireDescription(product.getDescription());
        double price = ProductValidation.requirePrice(product.getPrice());

        ProductEntitiy created = new ProductEntitiy();
        created.setName(product.getName().trim());
        created.setCategory(product.getCategory());
        created.setDescription(product.getDescription());
        created.setPrice(price);
        created.setStock(0);
        return productRepo.save(created);
    }

    public ProductEntitiy updateProduct(Long id, ProductEntitiy product) {
        ProductEntitiy existing = getProduct(id);
        ProductValidation.requireName(product.getName());
        ProductValidation.requireCategory(product.getCategory());
        ProductValidation.requireDescription(product.getDescription());
        double price = ProductValidation.requirePrice(product.getPrice());

        existing.setName(product.getName().trim());
        existing.setDescription(product.getDescription());
        existing.setCategory(product.getCategory());
        existing.setPrice(price);
        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepo.deleteById(id);
    }

    public ProductEntitiy adjustStock(Long id, Integer amount) {
        ProductEntitiy product = getProduct(id);
        int delta = ProductValidation.requireStockAdjustAmount(amount);
        int current = product.getStock() == null ? 0 : product.getStock();
        int next = ProductValidation.requireNonNegativeStock(current + delta);
        product.setStock(next);
        return productRepo.save(product);
    }
}
