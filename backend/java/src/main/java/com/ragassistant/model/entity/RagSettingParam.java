package com.ragassistant.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "rag_setting_param")
public class RagSettingParam extends BaseEntity { // BaseEntity 상속

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingParamId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setting_option_id", nullable = false)
    private RagSettingOption option;

    @Column(nullable = false, unique = true, length = 50)
    private String paramKey;

    @Column(nullable = false, length = 100)
    private String paramName;

    @Column(nullable = false, length = 20)
    private String paramType;

    @Column(columnDefinition = "TEXT")
    private String currentValue;

    @Column(columnDefinition = "TEXT")
    private String defaultValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal minValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxValue;

    @Column
    private Integer displayOrder = 0;
}