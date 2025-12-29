package org.qingliul.word.model;



import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
public class WordRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long wordId;

    private Boolean isCorrect;
    @Column(nullable = false)
    private String source;
    private LocalDateTime createTime;

    @Column(nullable = false)
    private Long userId;
    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
    }
}