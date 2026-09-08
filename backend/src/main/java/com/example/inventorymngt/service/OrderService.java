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
        if (request.getQuantity() > 999) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at most 999");
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

        double unitPrice = product.getPrice() == null ? 0.0 : product.getPrice();
        double totalAmount = Math.round(unitPrice * request.getQuantity() * 100.0) / 100.0;

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
