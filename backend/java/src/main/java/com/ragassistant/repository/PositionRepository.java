package com.ragassistant.repository;

import com.ragassistant.model.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Position Repository
 */
@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    /**
     * 직급 코드로 조회
     */
    Optional<Position> findByPositionCode(String positionCode);

    /**
     * 활성 상태별 직급 목록 조회 (정렬 순서대로)
     */
    List<Position> findByIsActiveOrderBySortOrder(Boolean isActive);

    /**
     * 모든 직급을 정렬 순서대로 조회
     */
    List<Position> findAllByOrderBySortOrder();
}
