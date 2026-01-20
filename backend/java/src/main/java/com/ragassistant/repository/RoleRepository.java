package com.ragassistant.repository;

import com.ragassistant.model.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Role Repository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * 권한 코드로 조회
     */
    Optional<Role> findByRoleCode(String roleCode);
}
