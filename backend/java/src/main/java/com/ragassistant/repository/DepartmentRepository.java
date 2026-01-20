package com.ragassistant.repository;

import com.ragassistant.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Department Repository
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * 부서 코드로 조회
     */
    Optional<Department> findByDeptCode(String deptCode);

    /**
     * 활성 상태별 부서 목록 조회 (정렬 순서대로)
     */
    List<Department> findByIsActiveOrderBySortOrder(Boolean isActive);

    /**
     * 모든 부서를 정렬 순서대로 조회
     */
    List<Department> findAllByOrderBySortOrder();
}
