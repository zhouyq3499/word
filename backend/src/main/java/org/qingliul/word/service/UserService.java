package org.qingliul.word.service;

import lombok.RequiredArgsConstructor;
import org.qingliul.word.model.User;
import org.qingliul.word.repository.UserRepository;
import org.qingliul.word.repository.WordRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WordRecordRepository wordRecordRepository;

    // 用户注册
    public User register(String username, String password) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        return userRepository.save(user);
    }

    // 用户登录
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("密码错误");
        }

        // 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }

    // 根据ID查找用户
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    // 更新用户词库等级
    public User updateLevel(Long userId, String level) {
        User user = findById(userId);
        user.setCurrentLevel(level);
        return userRepository.save(user);
    }

    // 更新每日目标
    public User updateDailyTarget(Long userId, Integer target) {
        User user = findById(userId);
        user.setDailyTarget(target);
        return userRepository.save(user);
    }

    // 更新用户信息
    public User updateUser(Long userId, User updatedUser) {
        User user = findById(userId);
        user.setCurrentLevel(updatedUser.getCurrentLevel());
        user.setDailyTarget(updatedUser.getDailyTarget());
        return userRepository.save(user);
    }

    public int getStreakDays(Long userId) {
        List<java.sql.Date> rawDates = wordRecordRepository
                .findDistinctStudyDatesByUser(userId);

        if (rawDates.isEmpty()) return 0;

        Set<LocalDate> studyDates = rawDates.stream()
                .map(java.sql.Date::toLocalDate)
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now();
        int streak = 0;

        // 从今天开始往前数
        LocalDate cursor = today;
        while (studyDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        System.out.println("Today: " + LocalDate.now());
        System.out.println("Study dates: " + studyDates);System.out.println("Today: " + LocalDate.now());
        System.out.println("Study dates: " + studyDates);
        return streak;

    }
    // 在 UserService.java 中添加
// 更新个人简介
    public User updateBio(Long userId, String bio) {
        User user = findById(userId);
        user.setBio(bio);
        return userRepository.save(user);
    }

}

