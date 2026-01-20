package com.ragassistant.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * RAG 설정 카테고리 엔티티
 * 메타데이터, 청킹, 임베딩 등 대분류를 관리
 */
@Entity
@Getter
@Setter
@Table(name = "rag_setting_category")
public class RagSettingCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingCategoryId;

    @Column(nullable = false, unique = true, length = 50)
    private String categoryKey; // 예: "metadata", "chunking"

    @Column(nullable = false, length = 100)
    private String categoryName; // 예: "메타데이터 생성"

    @Column
    private Integer displayOrder; // 화면 표시 순서

    // 양방향 관계: 하나의 카테고리는 여러 옵션을 가짐
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RagSettingOption> options = new ArrayList<>();
}