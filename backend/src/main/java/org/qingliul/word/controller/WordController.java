package org.qingliul.word.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.qingliul.word.model.UserWordBook;
import org.qingliul.word.model.Word;
import org.qingliul.word.model.WordRecord;
import org.qingliul.word.repository.UserWordBookRepository;
import org.qingliul.word.repository.WordRecordRepository;
import org.qingliul.word.repository.WordRepository;
import org.qingliul.word.service.DictionaryService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080") // 前端地址
public class WordController {

    private final WordRepository wordRepository;
    private final WordRecordRepository wordRecordRepository;
    private final DictionaryService dictionaryService;
    private final UserWordBookRepository userWordBookRepository;

    @GetMapping("/list/{level}")
    public List<Word> listByLevel(@PathVariable String level) {
        return dictionaryService.listByLevel(level);
    }

    @PostMapping("/submit")
    public String submit(@RequestBody Map<String, Object> payload) {
        Long wordId = Long.valueOf(payload.get("wordId").toString());
        Boolean isCorrect = (Boolean) payload.get("isCorrect");
        Long userId = Long.valueOf(payload.get("userId").toString());
        String source = (String) payload.get("source"); // ✅ 新增字段

        WordRecord record = new WordRecord();
        record.setWordId(wordId);
        record.setIsCorrect(isCorrect);
        record.setUserId(userId);
        record.setSource(source); // ✅ 设置来源

        wordRecordRepository.save(record);

        if (!isCorrect) {
            if (!userWordBookRepository.existsByUserIdAndWordId(userId, wordId)) {
                userWordBookRepository.save(new UserWordBook(null, userId, wordId, null));
            }
        }

        return "success";
    }

    @GetMapping("/review-list")
    public List<Word> getReviewList(@RequestParam String level, @RequestParam Long userId) {
        List<Long> ids = wordRecordRepository.findRecentLearnedWordIdsByUserAndLevel(userId, level);
        return wordRepository.findAllById(ids);
    }

    @GetMapping("/learned-count/{level}")
    public Long getLearnedCount(@PathVariable String level, @RequestParam Long userId) {
        return wordRecordRepository.countLearnedWordsByUserAndLevel(userId, level);
    }

    @GetMapping("/today-learned")
    public List<Word> getTodayLearned(@RequestParam Long userId,
                                      @RequestParam String level) {
        List<Long> ids = wordRecordRepository
                .findTodayLearnedWordIdsByUserAndLevel(userId, level);
        return wordRepository.findAllById(ids);
    }

    @GetMapping("/stats/{userId}")
    public Map<String, Object> getLearningStats(@PathVariable Long userId) {
        Map<String, Object> stats = new HashMap<>();

        // 统计各等级的已学单词数量
        List<String> levels = Arrays.asList("CET4", "CET6", "KaoYan");
        for (String level : levels) {
            Long count = wordRecordRepository.countLearnedWordsByUserAndLevel(userId, level);
            stats.put(level, count);
        }

        // 统计总词汇量
        Long total = wordRecordRepository.countDistinctWordIdsByUser(userId);
        stats.put("total", total);

        // 统计今日学习数量
        Long todayCount = wordRecordRepository.countTodayLearnedWordsByUser(userId);
        stats.put("todayCount", todayCount);

        return stats;
    }
}