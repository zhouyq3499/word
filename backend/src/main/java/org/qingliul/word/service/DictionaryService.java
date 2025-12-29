package org.qingliul.word.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.qingliul.word.model.DictionaryResponse;
import org.qingliul.word.model.Word;
import org.qingliul.word.repository.WordRepository;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.Resource;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final WordRepository wordRepository;

    public List<Word> listByLevel(String level) {
        return wordRepository.findByLevel(level);
    }

    public void generateOptionsForLevel(String level) {
        List<Word> words = wordRepository.findByLevel(level);
        for (Word w : words) {
            List<String> meanings = words.stream()
                    .filter(x -> !x.getId().equals(w.getId()))
                    .map(Word::getMeaning)
                    .toList();

            if (meanings.size() < 3) continue;

            Collections.shuffle(meanings);
            List<Map<String, Object>> opts = new ArrayList<>();
            opts.add(Map.of("label", w.getMeaning(), "correct", true));
            for (int i = 0; i < 3; i++) {
                opts.add(Map.of("label", meanings.get(i), "correct", false));
            }
            Collections.shuffle(opts);

            try {
                w.setOptions(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(opts));
                wordRepository.save(w);
            } catch (Exception ignored) {}
        }
    }
}