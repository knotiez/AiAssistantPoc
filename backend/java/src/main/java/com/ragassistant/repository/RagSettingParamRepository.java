package com.ragassistant.repository;

import com.ragassistant.model.entity.RagSettingParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * RagSettingParam 엔티티를 위한 Repository 인터페이스입니다.
 * RAG 설정의 소분류(Param) 데이터에 대한 DB 접근을 담당합니다.
 * 옵션 선택 시 입력받아야 할 구체적인 값(API Key, Model Name 등)을 정의합니다.
 */
@Repository
public interface RagSettingParamRepository extends JpaRepository<RagSettingParam, Long> {

    /**
     * 파라미터 키(paramKey)와 상위 옵션 ID로 특정 파라미터를 조회합니다.
     * 파라미터 키는 전체에서 유니크하지 않을 수 있으나(예: "model"),
     * 하나의 옵션 안에서는 유일해야 하므로 옵션 ID와 함께 조회합니다.
     *
     * @param paramKey        파라미터 키
     * @param settingOptionId 상위 옵션 ID
     * @return 해당 조건을 만족하는 RagSettingParam 엔티티
     */
    Optional<RagSettingParam> findByParamKeyAndOption_SettingOptionId(String paramKey, Long settingOptionId);

    /**
     * 특정 옵션 ID(settingOptionId)에 속한 모든 파라미터 목록을 조회합니다.
     * 사용자가 특정 옵션(예: OpenAI)을 선택했을 때, 입력해야 할 폼(API Key, Model 등)을 그리기 위해 사용됩니다.
     *
     * @param settingOptionId 상위 옵션 ID (FK)
     * @return 해당 옵션에 필요한 RagSettingParam 리스트
     */
    List<RagSettingParam> findByOption_SettingOptionId(Long settingOptionId);
}