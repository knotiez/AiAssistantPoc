package com.ragassistant.repository;

import com.ragassistant.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 상태별 사용자 목록 조회
     */
    List<User> findByStatus(String status);

    /**
     * 부서별 사용자 목록 조회
     */
    List<User> findByDepartment_DeptId(Long deptId);

    /**
     * 직급별 사용자 목록 조회
     */
    List<User> findByPosition_PositionId(Long positionId);
}
