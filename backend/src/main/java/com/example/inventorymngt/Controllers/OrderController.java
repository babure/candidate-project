package com.example.inventorymngt.Controllers;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.entity.OrderEntity;
import com.example.inventorymngt.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderEntity place(@RequestBody CreateOrderRequest request) {
        return orderService.placeOrder(request);
    }

    @GetMapping
    public List<OrderEntity> list(@RequestParam(required = false) Integer userId) {
        return orderService.listOrders(userId);
    }

    @GetMapping("/{id}")
    public OrderEntity get(@PathVariable Long id) {
        return orderService.getOrder(id);
    }
}
