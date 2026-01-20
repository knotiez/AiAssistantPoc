package com.ragassistant.repository;

import com.ragassistant.model.entity.RagSettingOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * RAG 설정의 중분류(Option) 데이터
 */
@Repository
public interface RagSettingOptionRepository extends JpaRepository<RagSettingOption, Long> {

    /**
     * @param optionKey
     * @return
     */
    Optional<RagSettingOption> findByOptionKey(String optionKey);

    /**
     * 특정 카테고리 ID(settingCategoryId)에 속한 모든 옵션 목록을 조회
     * 대분류를 선택했을 때 하위 옵션들을 불러오는 데 사용
     *
     * @param settingCategoryId 대분류 ID (FK)
     * @return 해당 카테고리에 속한 RagSettingOption 리스트
     */
    List<RagSettingOption> findByCategory_SettingCategoryId(Long settingCategoryId);

    /**
     * 특정 카테고리 키(categoryKey)를 가진 카테고리에 속한 모든 옵션을 조회합니다.
     * 조인을 통해 카테고리 키로 바로 하위 옵션을 찾을 때 유용합니다.
     *
     * @param categoryKey 대분류 키
     * @return 해당 카테고리에 속한 RagSettingOption 리스트
     */
    List<RagSettingOption> findByCategory_CategoryKey(String categoryKey);
}