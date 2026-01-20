package com.ragassistant.repository;

import com.ragassistant.model.entity.RagConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RagConfigRepository extends JpaRepository<RagConfig, Long> {

    /**
     * 활성 설정 조회 (항상 ID=1 사용)
     */
    default RagConfig getActiveConfig() {
        return findById(1L).orElseThrow(
                () -> new RuntimeException("No active configuration found. Please initialize the system."));
    }
}
