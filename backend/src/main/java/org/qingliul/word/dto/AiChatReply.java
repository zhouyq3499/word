package org.qingliul.word.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiChatReply {
    private boolean success;
    private String reply;
}