package org.qingliul.word.controller;

import org.qingliul.word.dto.AiChatReply;
import org.qingliul.word.dto.AiChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    @Value("${deepseek.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    public AiChatReply chat(@RequestBody AiChatRequest req) {
        try {
            String url = "https://api.deepseek.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", "deepseek-chat",
                    "messages", List.of(
                            Map.of("role", "system", "content", "你是一个专业的英语学习助手，专门帮助用户学习英语，包括解释单词、分析句子结构、练习口语、提供学习建议等。请用中文回复，但涉及到英语内容时保持英文原样。"),
                            Map.of("role", "user", "content", req.getMessage())
                    ),
                    "max_tokens", 1000,
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);

            if (resp.getStatusCode() != HttpStatus.OK || resp.getBody() == null) {
                return new AiChatReply(false, "AI 服务返回异常");
            }

            List choices = (List) resp.getBody().get("choices");
            if (choices == null || choices.isEmpty()) return new AiChatReply(false, "AI 返回为空");

            Map first = (Map) choices.get(0);
            Map msg = (Map) first.get("message");
            String reply = (String) msg.get("content");

            return new AiChatReply(true, reply.trim());
        } catch (Exception e) {
            return new AiChatReply(false, "调用失败：" + e.getMessage());
        }
    }
}