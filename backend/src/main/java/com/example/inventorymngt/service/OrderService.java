package com.example.inventorymngt.service;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.dto.PageResponse;
import com.example.inventorymngt.entity.OrderEntity;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.OrderStatus;
import com.example.inventorymngt.entity.ProductEntity;
import com.example.inventorymngt.entity.ProductRepo;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;

    public OrderService(OrderRepo orderRepo, ProductRepo productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    @Transactional
    public OrderEntity placeOrder(CreateOrderRequest request) {
        if (request.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }
        if (request.getProductId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product ID is required");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }
        if (request.getQuantity() > ProductValidation.QUANTITY_MAX) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be at most " + ProductValidation.QUANTITY_MAX
            );
        }

        ProductEntity product = productRepo.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        int stock = product.getStock() == null ? 0 : product.getStock();
        if (stock < request.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock for the requested quantity"
            );
        }

        product.setStock(stock - request.getQuantity());
        productRepo.save(product);

        BigDecimal unitPrice = (product.getPrice() == null ? BigDecimal.ZERO : product.getPrice())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = unitPrice
                .multiply(BigDecimal.valueOf(request.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        OrderEntity order = new OrderEntity();
        order.setStatus(OrderStatus.CREATED);
        order.setUserId(request.getUserId());
        order.setProductId(product.getId());
        order.setProductName(product.getName());
        order.setQuantity(request.getQuantity());
        order.setUnitPrice(unitPrice);
        order.setTotalAmount(totalAmount);

        return orderRepo.save(order);
    }

    @Transactional
    public OrderEntity cancelOrder(Long id) {
        OrderEntity order = orderRepo.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only orders with status CREATED can be cancelled"
            );
        }

        if (order.getProductId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot cancel order: product reference is missing, stock cannot be restored"
            );
        }

        ProductEntity product = productRepo.findByIdForUpdate(order.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot cancel order: product no longer exists, stock cannot be restored"
                ));

        int stock = product.getStock() == null ? 0 : product.getStock();
        int qty = order.getQuantity() == null ? 0 : order.getQuantity();
        product.setStock(ProductValidation.requireNonNegativeStock(stock + qty));
        productRepo.save(product);

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepo.save(order);
    }

    /**
     * Stateless order listing: filter/sort/page are request parameters only (no session).
     */
    public PageResponse<OrderEntity> searchOrders(
            Integer userId,
            String sort,
            String dir,
            Integer page,
            Integer pageSize
    ) {
        int pageNumber = Paging.normalizePage(page);
        int size = Paging.normalizePageSize(pageSize);
        Sort springSort = orderSort(sort, dir);

        Specification<OrderEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Page<OrderEntity> result = orderRepo.findAll(spec, Paging.of(pageNumber, size, springSort));
        return new PageResponse<>(result.getContent(), pageNumber, size, result.getTotalElements());
    }

    public OrderEntity getOrder(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private static Sort orderSort(String sort, String dir) {
        String field = sort == null || sort.isBlank() ? "date" : sort.trim().toLowerCase(Locale.ROOT);
        Sort.Direction defaultDir = switch (field) {
            case "name", "status" -> Sort.Direction.ASC;
            default -> Sort.Direction.DESC;
        };
        Sort.Direction direction = Paging.direction(dir, defaultDir);
        return switch (field) {
            case "id" -> Sort.by(direction, "id");
            case "name" -> Sort.by(direction, "productName").and(Sort.by(Sort.Direction.DESC, "id"));
            case "status" -> Sort.by(direction, "status").and(Sort.by(Sort.Direction.DESC, "id"));
            case "total" -> Sort.by(direction, "totalAmount").and(Sort.by(Sort.Direction.DESC, "id"));
            case "date" -> Sort.by(direction, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "sort must be id, name, status, total, or date"
            );
        };
    }
}
