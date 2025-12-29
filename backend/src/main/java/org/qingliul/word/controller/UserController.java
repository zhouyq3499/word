package org.qingliul.word.controller;

import lombok.RequiredArgsConstructor;
import org.qingliul.word.model.User;
import org.qingliul.word.repository.WordRecordRepository;
import org.qingliul.word.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")
public class UserController {

    private final UserService userService;
    private final WordRecordRepository wordRecordRepository;

    // 用户注册
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "用户名不能为空");
            return response;
        }

        if (password == null || password.length() < 6) {
            response.put("success", false);
            response.put("message", "密码长度至少6位");
            return response;
        }

        try {
            User user = userService.register(username, password);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "注册成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 用户登录
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String username = request.get("username");
        String password = request.get("password");

        try {
            User user = userService.login(username, password);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "登录成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 获取用户信息
    @GetMapping("/detail/{id}")
    public Map<String, Object> getUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userService.findById(id);
            response.put("success", true);
            response.put("user", user);
            int streak = userService.getStreakDays(id);
            response.put("streakDays", streak);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return response;
    }

    // 更新用户词库等级
    @PutMapping("/{id}/level")
    public Map<String, Object> updateLevel(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();
        String level = request.get("level");

        if (level == null || !level.matches("CET4|CET6|KaoYan")) {
            response.put("success", false);
            response.put("message", "等级参数错误");
            return response;
        }

        try {
            User user = userService.updateLevel(id, level);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "等级更新成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 更新每日目标
    @PutMapping("/{id}/target")
    public Map<String, Object> updateDailyTarget(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {

        Map<String, Object> response = new HashMap<>();
        Integer target = request.get("target");

        if (target == null || target < 1 || target > 100) {
            response.put("success", false);
            response.put("message", "目标参数错误（1-100）");
            return response;
        }

        try {
            User user = userService.updateDailyTarget(id, target);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "目标更新成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 更新用户完整信息
    @PutMapping("/{id}")
    public Map<String, Object> updateUser(
            @PathVariable Long id,
            @RequestBody User userData) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.updateUser(id, userData);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "用户信息更新成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    @GetMapping("/accuracy/{userId}")
    public Map<String, Object> getAccuracy(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();

        try {
            Map<String, Object> stats = wordRecordRepository.calculateAccuracy(userId);
            Long total = ((Number) stats.get("total")).longValue();
            Long correct = ((Number) stats.get("correct")).longValue();

            if (total > 0) {
                int accuracy = (int) Math.round((correct.doubleValue() / total) * 100);
                result.put("accuracy", accuracy);
            } else {
                result.put("accuracy", 0);
            }

            result.put("total", total);
            result.put("correct", correct);
            result.put("success", true);

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }

        return result;
    }
    // 在 UserController.java 中添加
// 更新用户个人简介
    @PutMapping("/{id}/bio")
    public Map<String, Object> updateBio(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();
        String bio = request.get("bio");

        if (bio == null || bio.trim().isEmpty()) {
            bio = "这个人很低调，还没有写简介";
        }

        if (bio.length() > 500) {
            bio = bio.substring(0, 500);
        }

        try {
            User user = userService.updateBio(id, bio);
            response.put("success", true);
            response.put("user", user);
            response.put("message", "个人简介更新成功");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }
    @GetMapping("/accuracy/{userId}/{level}")
    public Map<String, Object> getAccuracyByLevel(
            @PathVariable Long userId,
            @PathVariable String level) {

        Map<String, Object> result = new HashMap<>();

        try {
            Map<String, Object> stats = wordRecordRepository.calculateAccuracyByLevel(userId, level);
            Long total = ((Number) stats.get("total")).longValue();
            Long correct = ((Number) stats.get("correct")).longValue();

            if (total > 0) {
                int accuracy = (int) Math.round((correct.doubleValue() / total) * 100);
                result.put("accuracy", accuracy);
            } else {
                result.put("accuracy", 0);
            }

            result.put("total", total);
            result.put("correct", correct);
            result.put("level", level);
            result.put("success", true);

        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }

        return result;
    }
}