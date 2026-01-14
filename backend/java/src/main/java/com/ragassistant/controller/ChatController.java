package com.ragassistant.controller;

import com.ragassistant.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ChatService.ChatResponse ask(@RequestBody ChatRequest request) {
        return chatService.ask(request.getMessage());
    }

    @Data
    public static class ChatRequest {
        private String message;
    }
}
