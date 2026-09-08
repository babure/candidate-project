package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.dto.ProductDto;
import com.example.inventorymngt.dto.ProductWriteRequest;
import com.example.inventorymngt.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDto> list() {
        return productService.getProducts();
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PostMapping
    public ResponseEntity<ProductDto> add(@Valid @RequestBody ProductWriteRequest payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.addProduct(payload));
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductWriteRequest payload) {
        return productService.updateProduct(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PatchMapping("/{id}/stock")
    public ProductDto adjustStock(@PathVariable Long id, @RequestParam Integer amount) {
        return productService.adjustStock(id, amount);
    }
}
