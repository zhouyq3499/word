package org.qingliul.word.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "current_level")
    private String currentLevel = "CET4";

    @Column(name = "daily_target")
    private Integer dailyTarget = 15;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    @Column(name = "bio", length = 500)
    private String bio = "这个人很低调，还没有写简介";
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}