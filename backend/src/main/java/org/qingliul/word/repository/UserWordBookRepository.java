package org.qingliul.word.repository;

import org.qingliul.word.model.UserWordBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserWordBookRepository extends JpaRepository<UserWordBook, Long> {
    List<UserWordBook> findByUserId(Long userId);
    boolean existsByUserIdAndWordId(Long userId, Long wordId);
    void deleteByUserIdAndWordId(Long userId, Long wordId);
}