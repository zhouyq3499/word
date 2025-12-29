package org.qingliul.word.repository;

import org.springframework.data.repository.query.Param;
import org.qingliul.word.model.WordRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface WordRecordRepository extends JpaRepository<WordRecord, Long> {

    // 旧方法（不带 userId）——你可以保留或删除
    @Query(value = "SELECT DISTINCT r.word_id FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE w.level = :level " +
            "AND DATE(r.create_time) >= DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)",
            nativeQuery = true)
    List<Long> findRecentLearnedWordIdsByLevel(@Param("level") String level);

    @Query(value = "SELECT COUNT(DISTINCT r.word_id) FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE w.level = :level",
            nativeQuery = true)
    Long countLearnedWordsByLevel(@Param("level") String level);

    // ✅ 正确的方法（带 userId）
    @Query(value = "SELECT DISTINCT r.word_id FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE w.level = :level " +
            "AND r.user_id = :userId " +
            "AND DATE(r.create_time) >= DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)",
            nativeQuery = true)
    List<Long> findRecentLearnedWordIdsByUserAndLevel(
            @Param("userId") Long userId,
            @Param("level") String level
    );

    @Query(value = "SELECT COUNT(DISTINCT r.word_id) FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE w.level = :level " +
            "AND r.user_id = :userId",
            nativeQuery = true)
    Long countLearnedWordsByUserAndLevel(
            @Param("userId") Long userId,
            @Param("level") String level
    );

    @Query(value = "SELECT DISTINCT r.word_id FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE r.user_id = :userId " +
            "AND w.level = :level " +
            "AND DATE(r.create_time) = CURRENT_DATE",
            nativeQuery = true)
    List<Long> findTodayLearnedWordIdsByUserAndLevel(
            @Param("userId") Long userId,
            @Param("level") String level
    );

    // 统计用户今日学习的单词数量
    @Query(value = "SELECT COUNT(DISTINCT r.word_id) FROM word_record r " +
            "WHERE r.user_id = :userId " +
            "AND DATE(r.create_time) = CURDATE()",
            nativeQuery = true)
    Long countTodayLearnedWordsByUser(@Param("userId") Long userId);

    // 统计用户学习的唯一单词总数（跨所有等级）
    @Query(value = "SELECT COUNT(DISTINCT r.word_id) FROM word_record r " +
            "WHERE r.user_id = :userId",
            nativeQuery = true)
    Long countDistinctWordIdsByUser(@Param("userId") Long userId);
    @Query(value = "SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct " +
            "FROM word_record " +
            "WHERE user_id = :userId",
            nativeQuery = true)
    Map<String, Object> calculateAccuracy(@Param("userId") Long userId);

    // 按等级计算准确率
    @Query(value = "SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct " +
            "FROM word_record r " +
            "JOIN word w ON r.word_id = w.id " +
            "WHERE r.user_id = :userId AND w.level = :level",
            nativeQuery = true)
    Map<String, Object> calculateAccuracyByLevel(
            @Param("userId") Long userId,
            @Param("level") String level
    );
}