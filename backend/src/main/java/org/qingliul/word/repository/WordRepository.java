package org.qingliul.word.repository;

import org.qingliul.word.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByWord(String word);
    List<Word> findByLevel(String level);
    boolean existsByWordAndLevel(String word, String level);
}