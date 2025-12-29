package org.qingliul.word.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class DictionaryResponse {
    private String word;
    private List<Phonetic> phonetics;
    private List<Meaning> meanings;

    @Data
    public static class Phonetic {
        private String text;
        private String audio;
    }

    @Data
    public static class Meaning {
        private String partOfSpeech;
        private List<Definition> definitions;
    }

    @Data
    public static class Definition {
        private String definition;
    }
}