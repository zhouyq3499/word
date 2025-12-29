package org.qingliul.word.model;



import lombok.*;
import javax.persistence.*;

@Entity
@Table(name = "word")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String word;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    private String phonetic;

    @Column(columnDefinition = "TEXT")
    private String definition;

    @Column(columnDefinition = "TEXT")
    private String phrases;

    @Column(columnDefinition = "TEXT")
    private String sentences;

    @Column(columnDefinition = "TEXT")
    private String options;

    private String level;
}