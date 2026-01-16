package com.ragassistant.repository;

import com.ragassistant.model.ConfigHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfigHistoryRepository extends JpaRepository<ConfigHistory, Long> {

    /**
     * 특정 설정의 변경 이력 조회 (최신순)
     */
    List<ConfigHistory> findByConfigIdOrderByChangedAtDesc(Long configId);

    /**
     * 특정 필드의 변경 이력 조회
     */
    List<ConfigHistory> findByConfigIdAndFieldNameOrderByChangedAtDesc(Long configId, String fieldName);
}
