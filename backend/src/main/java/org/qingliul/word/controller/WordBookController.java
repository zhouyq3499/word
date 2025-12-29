package org.qingliul.word.controller;

import lombok.RequiredArgsConstructor;
import org.qingliul.word.model.UserWordBook;
import org.qingliul.word.model.Word;
import org.qingliul.word.repository.UserWordBookRepository;
import org.qingliul.word.repository.WordRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/words/word-book")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")
public class WordBookController {

    private final UserWordBookRepository repo;
    private final WordRepository wordRepo;

    @GetMapping("/{userId}")
    public List<Word> getWordBook(@PathVariable Long userId) {
        List<Long> wordIds = repo.findByUserId(userId).stream()
                .map(UserWordBook::getWordId)
                .toList();
        return wordRepo.findAllById(wordIds);
    }

    @PostMapping("/add")
    public void add(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        Long wordId = body.get("wordId");
        if (!repo.existsByUserIdAndWordId(userId, wordId)) {
            repo.save(new UserWordBook(null, userId, wordId, null));
        }
    }

    @DeleteMapping("/remove")
    public void remove(@RequestBody Map<String, Long> body) {
        repo.deleteByUserIdAndWordId(body.get("userId"), body.get("wordId"));
    }
}