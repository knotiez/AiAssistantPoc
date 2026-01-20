package com.ragassistant.repository;

import com.ragassistant.model.entity.UserRole;
import com.ragassistant.model.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * UserRole Repository
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    /**
     * 특정 사용자의 모든 권한 조회
     */
    List<UserRole> findByUserId(Long userId);

    /**
     * 특정 권한을 가진 모든 사용자 조회
     */
    List<UserRole> findByRoleId(Long roleId);

    /**
     * 특정 사용자가 특정 권한을 가지고 있는지 확인
     */
    boolean existsByUserIdAndRoleId(Long userId, Long roleId);
}
