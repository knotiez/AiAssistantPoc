package com.ragassistant.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "rag_setting_option")
public class RagSettingOption extends BaseEntity { // BaseEntity 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setting_category_id", nullable = false)
    private RagSettingCategory category;

    @Column(nullable = false, unique = true, length = 50)
    private String optionKey;

    @Column(nullable = false, length = 100)
    private String optionName;

    @Column(nullable = false, length = 20)
    private String optionType;

    @Column(nullable = false)
    private Boolean isActive = false;

    @Column
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RagSettingParam> params = new ArrayList<>();
}