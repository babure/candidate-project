package com.example.inventorymngt;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.dto.ProductWriteRequest;
import com.example.inventorymngt.entity.OrderEntity;
import com.example.inventorymngt.entity.OrderStatus;
import com.example.inventorymngt.entity.ProductEntity;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.service.OrderService;
import com.example.inventorymngt.service.ProductService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryOrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepo productRepo;

    private Long productId;

    @BeforeEach
    void setUp() {
        productRepo.deleteAll();
        ProductWriteRequest request = new ProductWriteRequest();
        request.setName("Widget");
        request.setCategory("Electronics");
        request.setDescription("Test widget");
        request.setPrice(new BigDecimal("10.00"));
        productId = productService.addProduct(request).getId();
        productService.adjustStock(productId, 1);
    }

    @Test
    void placeOrderDeductsStockAndRejectsInsufficientStock() {
        CreateOrderRequest first = new CreateOrderRequest();
        first.setUserId(1);
        first.setProductId(productId);
        first.setQuantity(1);

        OrderEntity order = orderService.placeOrder(first);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CREATED);
        assertThat(productRepo.findById(productId)).get().extracting(ProductEntity::getStock).isEqualTo(0);

        CreateOrderRequest second = new CreateOrderRequest();
        second.setUserId(1);
        second.setProductId(productId);
        second.setQuantity(1);

        assertThatThrownBy(() -> orderService.placeOrder(second))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    void cancelRestoresStockAndSecondCancelFails() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(1);
        request.setProductId(productId);
        request.setQuantity(1);
        OrderEntity order = orderService.placeOrder(request);

        OrderEntity cancelled = orderService.cancelOrder(order.getId());
        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(productRepo.findById(productId)).get().extracting(ProductEntity::getStock).isEqualTo(1);

        assertThatThrownBy(() -> orderService.cancelOrder(order.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("CREATED");
    }

    @Test
    void deleteBlockedWhenCreatedOrderExists() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(1);
        request.setProductId(productId);
        request.setQuantity(1);
        OrderEntity open = orderService.placeOrder(request);

        assertThatThrownBy(() -> productService.deleteProduct(productId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("CREATED");

        orderService.cancelOrder(open.getId());
        productService.deleteProduct(productId);
        assertThat(productRepo.findById(productId)).isEmpty();
    }

    @Test
    void storeProductJsonDoesNotExposeStock() throws Exception {
        mockMvc.perform(get("/api/store/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inStock").value(true))
                .andExpect(jsonPath("$.stock").doesNotExist());

        String listJson = mockMvc.perform(get("/api/store/products"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode root = objectMapper.readTree(listJson);
        assertThat(root.get("items").get(0).has("stock")).isFalse();
        assertThat(root.get("items").get(0).has("inStock")).isTrue();
    }

    @Test
    void placeOrderReturnsCreated() throws Exception {
        productService.adjustStock(productId, 5);
        String body = """
                {"userId":1,"productId":%d,"quantity":1}
                """.formatted(productId);
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CREATED"));
    }
}
