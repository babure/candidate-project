package com.example.inventorymngt.config;

import com.example.inventorymngt.dto.CreateOrderRequest;
import com.example.inventorymngt.dto.ProductWriteRequest;
import com.example.inventorymngt.entity.OrderEntity;
import com.example.inventorymngt.entity.ProductRepo;
import com.example.inventorymngt.service.OrderService;
import com.example.inventorymngt.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Loads a small, valid demo catalog and orders when the database is empty.
 * Matches the three dummy OMS users in the frontend (ids 1–3).
 */
@Component
@ConditionalOnProperty(name = "app.demo-seed.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final ProductRepo productRepo;
    private final ProductService productService;
    private final OrderService orderService;

    public DemoDataSeeder(ProductRepo productRepo, ProductService productService, OrderService orderService) {
        this.productRepo = productRepo;
        this.productService = productService;
        this.orderService = orderService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (productRepo.count() > 0) {
            log.info("Demo seed skipped — catalog already has {} product(s)", productRepo.count());
            return;
        }

        log.info("Seeding demo products and orders…");

        Long headphones = addProduct(
                "Aurora Wireless Headphones",
                "Electronics",
                "Over-ear Bluetooth headphones with 30-hour battery life.",
                "129.99",
                25
        );
        Long keyboard = addProduct(
                "Nimbus Mechanical Keyboard",
                "Electronics",
                "Hot-swappable switches with RGB backlight.",
                "89.50",
                40
        );
        Long jacket = addProduct(
                "Trail Softshell Jacket",
                "Clothing",
                "Water-resistant softshell for cool weather hikes.",
                "74.00",
                18
        );
        Long lamp = addProduct(
                "Lumen Desk Lamp",
                "Home & Garden",
                "Adjustable LED desk lamp with warm and cool modes.",
                "39.95",
                0
        );
        Long yoga = addProduct(
                "Summit Yoga Mat",
                "Sports",
                "Non-slip 5mm mat with carrying strap.",
                "28.00",
                50
        );
        Long cookbook = addProduct(
                "MarketNode Kitchen Basics",
                "Books",
                "A practical cookbook for weeknight meals.",
                "22.50",
                12
        );
        Long giftCard = addProduct(
                "Store Credit Bundle",
                "Other",
                "Demo gift-card style product for miscellaneous catalog coverage.",
                "15.00",
                100
        );

        // Alice (1): active + cancelled history
        OrderEntity aliceOpen = place(1, headphones, 1);
        place(1, yoga, 2);
        OrderEntity aliceCancel = place(1, cookbook, 1);
        orderService.cancelOrder(aliceCancel.getId());

        // Bob (2): mix of statuses
        place(2, keyboard, 1);
        OrderEntity bobCancel = place(2, jacket, 1);
        orderService.cancelOrder(bobCancel.getId());

        // Carol (3): at least one open order
        place(3, giftCard, 3);

        log.info(
                "Demo seed complete — {} products (including out-of-stock id={}); sample Alice order id={}",
                productRepo.count(),
                lamp,
                aliceOpen.getId()
        );
    }

    private Long addProduct(String name, String category, String description, String price, int stock) {
        ProductWriteRequest request = new ProductWriteRequest();
        request.setName(name);
        request.setCategory(category);
        request.setDescription(description);
        request.setPrice(new BigDecimal(price));
        Long id = productService.addProduct(request).getId();
        if (stock > 0) {
            productService.adjustStock(id, stock);
        }
        return id;
    }

    private OrderEntity place(int userId, Long productId, int quantity) {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(userId);
        request.setProductId(productId);
        request.setQuantity(quantity);
        return orderService.placeOrder(request);
    }
}
