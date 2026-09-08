package com.example.inventorymngt.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards React Router paths to index.html when the SPA is packaged in static/.
 * API routes under /api remain handled by REST controllers.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/",
            "/ims",
            "/ims/**",
            "/oms",
            "/oms/**"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
