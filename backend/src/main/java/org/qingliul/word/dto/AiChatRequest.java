package org.qingliul.word.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class AiChatRequest {
    @NotBlank(message = "消息不能为空")
    private String message;
}