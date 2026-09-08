package com.example.inventorymngt.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Paging {

    static final int DEFAULT_PAGE = 1;
    static final int DEFAULT_PAGE_SIZE = 20;
    static final int MAX_PAGE_SIZE = 100;

    private Paging() {
    }

    static int normalizePage(Integer page) {
        if (page == null || page < 1) {
            return DEFAULT_PAGE;
        }
        return page;
    }

    static int normalizePageSize(Integer pageSize) {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }

    static Pageable of(int page, int pageSize, Sort sort) {
        // Spring Data pages are 0-based; API pages are 1-based.
        return PageRequest.of(page - 1, pageSize, sort);
    }

    static Sort.Direction direction(String dir, Sort.Direction fallback) {
        if (dir == null || dir.isBlank()) {
            return fallback;
        }
        if ("asc".equalsIgnoreCase(dir)) {
            return Sort.Direction.ASC;
        }
        if ("desc".equalsIgnoreCase(dir)) {
            return Sort.Direction.DESC;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dir must be asc or desc");
    }
}
