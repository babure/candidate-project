package com.example.inventorymngt.service;

import com.example.inventorymngt.dto.ProductDto;
import com.example.inventorymngt.dto.ProductWriteRequest;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.OrderStatus;
import com.example.inventorymngt.entity.ProductEntity;
import com.example.inventorymngt.entity.ProductRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    private final OrderRepo orderRepo;

    public ProductService(ProductRepo productRepo, OrderRepo orderRepo) {
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
    }

    public List<ProductDto> getProducts() {
        return productRepo.findAll().stream().map(this::toDto).toList();
    }

    public ProductDto getProduct(Long id) {
        return toDto(requireProduct(id));
    }

    public ProductDto addProduct(ProductWriteRequest request) {
        ProductValidation.requireName(request.getName());
        ProductValidation.requireCategory(request.getCategory());
        ProductValidation.requireDescription(request.getDescription());
        BigDecimal price = ProductValidation.requirePrice(request.getPrice());

        ProductEntity created = new ProductEntity();
        created.setName(request.getName().trim());
        created.setCategory(request.getCategory());
        created.setDescription(request.getDescription());
        created.setPrice(price);
        created.setStock(0);
        return toDto(productRepo.save(created));
    }

    public ProductDto updateProduct(Long id, ProductWriteRequest request) {
        ProductEntity existing = requireProduct(id);
        ProductValidation.requireName(request.getName());
        ProductValidation.requireCategory(request.getCategory());
        ProductValidation.requireDescription(request.getDescription());
        BigDecimal price = ProductValidation.requirePrice(request.getPrice());

        existing.setName(request.getName().trim());
        existing.setDescription(request.getDescription());
        existing.setCategory(request.getCategory());
        existing.setPrice(price);
        return toDto(productRepo.save(existing));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        if (orderRepo.existsByProductIdAndStatus(id, OrderStatus.CREATED)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete product while CREATED orders reference it. Cancel those orders first."
            );
        }
        productRepo.deleteById(id);
    }

    @Transactional
    public ProductDto adjustStock(Long id, Integer amount) {
        ProductEntity product = productRepo.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        int delta = ProductValidation.requireStockAdjustAmount(amount);
        int current = product.getStock() == null ? 0 : product.getStock();
        int next = ProductValidation.requireNonNegativeStock(current + delta);
        product.setStock(next);
        return toDto(productRepo.save(product));
    }

    private ProductEntity requireProduct(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ProductDto toDto(ProductEntity product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStock() == null ? 0 : product.getStock()
        );
    }
}
