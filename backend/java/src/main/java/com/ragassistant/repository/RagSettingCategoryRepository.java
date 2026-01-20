package com.ragassistant.repository;

import com.ragassistant.model.entity.RagSettingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * RAG 설정의 대분류(Category) 데이터
 */
@Repository
public interface RagSettingCategoryRepository extends JpaRepository<RagSettingCategory, Long> {

    /**
     * @param categoryKey
     * @return
     */
    Optional<RagSettingCategory> findByCategoryKey(String categoryKey);

    /**
     * 카테고리 키가 존재하는지 여부를 확인
     * 
     * @param categoryKey
     * @return 존재하면 true, 아니면 false
     */
    boolean existsByCategoryKey(String categoryKey);
}