package com.example.inventorymngt.service;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.entity.OrderEntity;
import com.example.inventorymngt.entity.OrderRepo;
import com.example.inventorymngt.entity.OrderStatus;
import com.example.inventorymngt.entity.ProductEntitiy;
import com.example.inventorymngt.entity.ProductRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

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

        ProductEntitiy product = productRepo.findById(request.getProductId())
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

        BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice() == null ? 0.0 : product.getPrice())
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
        order.setUnitPrice(unitPrice.doubleValue());
        order.setTotalAmount(totalAmount.doubleValue());

        return orderRepo.save(order);
    }

    @Transactional
    public OrderEntity cancelOrder(Long id) {
        OrderEntity order = getOrder(id);
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only orders with status CREATED can be cancelled"
            );
        }

        order.setStatus(OrderStatus.CANCELLED);

        if (order.getProductId() != null) {
            productRepo.findById(order.getProductId()).ifPresent(product -> {
                int stock = product.getStock() == null ? 0 : product.getStock();
                int qty = order.getQuantity() == null ? 0 : order.getQuantity();
                product.setStock(stock + qty);
                productRepo.save(product);
            });
        }

        return orderRepo.save(order);
    }

    public List<OrderEntity> listOrders(Integer userId) {
        if (userId != null) {
            return orderRepo.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return orderRepo.findAll();
    }

    public OrderEntity getOrder(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }
}
