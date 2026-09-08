package com.example.inventorymngt.service;

import com.example.inventorymngt.dto.PageResponse;
import com.example.inventorymngt.dto.StoreProductDto;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class StoreService {

    private final ProductRepo productRepo;

    public StoreService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    /**
     * Stateless catalog query: all filter/sort/page inputs come from the request.
     * No server-side session is used, so instances stay interchangeable behind a load balancer.
     */
    public PageResponse<StoreProductDto> searchProducts(
            String q,
            String category,
            String availability,
            Double minPrice,
            Double maxPrice,
            String sort,
            String dir,
            Integer page,
            Integer pageSize
    ) {
        int pageNumber = Paging.normalizePage(page);
        int size = Paging.normalizePageSize(pageSize);
        Sort springSort = productSort(sort, dir);

        Specification<ProductEntitiy> spec = buildProductSpec(q, category, availability, minPrice, maxPrice);
        Page<ProductEntitiy> result = productRepo.findAll(spec, Paging.of(pageNumber, size, springSort));

        List<StoreProductDto> items = result.getContent().stream().map(this::toDto).toList();
        return new PageResponse<>(items, pageNumber, size, result.getTotalElements());
    }

    public StoreProductDto getProduct(Long id) {
        ProductEntitiy product = productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toDto(product);
    }

    public List<String> listCategories() {
        return productRepo.findDistinctCategories().stream()
                .filter(c -> c != null && !c.isBlank())
                .map(String::trim)
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
    }

    private static Specification<ProductEntitiy> buildProductSpec(
            String q,
            String category,
            String availability,
            Double minPrice,
            Double maxPrice
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), cb.literal(""))), like),
                        cb.like(cb.lower(cb.coalesce(root.get("category"), cb.literal(""))), like)
                ));
            }

            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }

            if (minPrice != null) {
                if (minPrice < 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice must be >= 0");
                }
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                if (maxPrice < 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "maxPrice must be >= 0");
                }
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice must be <= maxPrice");
            }

            if (availability != null && !availability.isBlank() && !"all".equalsIgnoreCase(availability)) {
                if ("in".equalsIgnoreCase(availability)) {
                    predicates.add(cb.greaterThan(root.get("stock"), 0));
                } else if ("out".equalsIgnoreCase(availability)) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("stock"), 0));
                } else {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "availability must be all, in, or out"
                    );
                }
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Sort productSort(String sort, String dir) {
        String field = sort == null || sort.isBlank() ? "name" : sort.trim().toLowerCase(Locale.ROOT);
        Sort.Direction direction = Paging.direction(dir, Sort.Direction.ASC);
        return switch (field) {
            case "name" -> Sort.by(direction, "name").and(Sort.by(Sort.Direction.ASC, "id"));
            case "price" -> Sort.by(direction, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sort must be name or price");
        };
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
