package com.ragassistant.model.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * UserRole의 복합 키 (Composite Primary Key)
 * 
 * user_role 테이블은 PK가 (user_id, role_id) 두 개의 조합입니다.
 * JPA에서 복합 키를 사용하려면 이런 별도 클래스가 필요합니다.
 * 
 * @IdClass 방식: UserRole 엔티티에서 @IdClass(UserRoleId.class)로 지정하면
 *          JPA가 이 클래스를 복합 키로 인식합니다.
 */
public class UserRoleId implements Serializable {

    private Long userId;
    private Long roleId;

    // 기본 생성자 (JPA 필수)
    public UserRoleId() {
    }

    public UserRoleId(Long userId, Long roleId) {
        this.userId = userId;
        this.roleId = roleId;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    // equals and hashCode는 복합 키에서 필수입니다
    // JPA가 엔티티를 비교할 때 사용합니다
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserRoleId that = (UserRoleId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(roleId, that.roleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, roleId);
    }
}
